// utils/bluetoothPrinter.ts
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="webworker.importscripts" />

interface BluetoothPrinterDevice {
  device: BluetoothDevice;
  server?: BluetoothRemoteGATTServer;
  characteristic?: BluetoothRemoteGATTCharacteristic;
}

class BluetoothThermalPrinter {
  private printerDevice: BluetoothPrinterDevice | null = null;

  async connect(): Promise<void> {
    try {
      // Check if Web Bluetooth is supported
      if (!navigator.bluetooth) {
        throw new Error(
          "Web Bluetooth API tidak didukung di browser ini. Gunakan Chrome atau Edge."
        );
      }

      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "000018f0-0000-1000-8000-00805f9b34fb", // Common thermal printer
          "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Another common service
        ],
      });

      console.log("Printer selected:", device.name);

      // Connect to GATT Server
      const server = await device.gatt?.connect();
      if (!server) throw new Error("Failed to connect to GATT server");

      // Try to get service and characteristic
      let service;
      let characteristic;

      try {
        service = await server.getPrimaryService(
          "000018f0-0000-1000-8000-00805f9b34fb"
        );
        characteristic = await service.getCharacteristic(
          "00002af1-0000-1000-8000-00805f9b34fb"
        );
      } catch {
        // Try alternative service/characteristic
        service = await server.getPrimaryService(
          "49535343-fe7d-4ae5-8fa9-9fafd205e455"
        );
        characteristic = await service.getCharacteristic(
          "49535343-8841-43f4-a8d4-ecbe34729bb3"
        );
      }

      this.printerDevice = {
        device,
        server,
        characteristic,
      };

      // Save device ID for reconnection
      localStorage.setItem("lastPrinterDeviceId", device.id);

      console.log("Connected to printer");
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  }

  async reconnect(): Promise<void> {
    try {
      if (!navigator.bluetooth) return;

      const devices = await navigator.bluetooth.getDevices();
      const lastDeviceId = localStorage.getItem("lastPrinterDeviceId");
      const device = devices.find((d) => d.id === lastDeviceId);

      if (device && device.gatt) {
        const server = await device.gatt.connect();
        let service;
        let characteristic;

        try {
          service = await server.getPrimaryService(
            "000018f0-0000-1000-8000-00805f9b34fb"
          );
          characteristic = await service.getCharacteristic(
            "00002af1-0000-1000-8000-00805f9b34fb"
          );
        } catch {
          service = await server.getPrimaryService(
            "49535343-fe7d-4ae5-8fa9-9fafd205e455"
          );
          characteristic = await service.getCharacteristic(
            "49535343-8841-43f4-a8d4-ecbe34729bb3"
          );
        }

        this.printerDevice = { device, server, characteristic };
      }
    } catch (error) {
      console.error("Reconnection error:", error);
    }
  }

  async printReceipt(receiptElement: HTMLElement): Promise<void> {
    if (!this.printerDevice?.characteristic) {
      throw new Error("Printer not connected");
    }

    try {
      // Initialize printer
      await this.sendCommand([0x1b, 0x40]); // ESC @ - Initialize printer

      // Get receipt data
      const receiptData = this.convertHTMLToESCPOS(receiptElement);

      // Send data in chunks (Bluetooth has packet size limits)
      const chunkSize = 512;
      for (let i = 0; i < receiptData.length; i += chunkSize) {
        const chunk = receiptData.slice(i, i + chunkSize);
        await this.printerDevice.characteristic.writeValue(chunk);
        await this.delay(100); // Delay between chunks
      }

      // Feed and cut paper
      await this.sendCommand([0x0a, 0x0a, 0x0a]); // 3 line feeds
      await this.sendCommand([0x1d, 0x56, 0x00]); // GS V 0 - Cut paper

      console.log("Print complete");
    } catch (error) {
      console.error("Print error:", error);
      throw error;
    }
  }

  private convertHTMLToESCPOS(element: HTMLElement): Uint8Array {
    const commands: number[] = [];

    // Initialize
    commands.push(0x1b, 0x40); // ESC @ - Initialize

    // Center align
    commands.push(0x1b, 0x61, 0x01); // ESC a 1

    // Get elements
    const headerElement = element.querySelector(".receipt-header");
    const itemsElement = element.querySelector(".receipt-items");
    const totalElement = element.querySelector(".receipt-total");
    const footerElement = element.querySelector(".receipt-footer");

    // Print header
    if (headerElement) {
      const storeName = headerElement.querySelector("h2")?.textContent || "";
      // Bold + Double height
      commands.push(0x1b, 0x45, 0x01); // Bold on
      commands.push(0x1d, 0x21, 0x11); // Double size
      commands.push(...this.textToBytes(storeName));
      commands.push(0x1b, 0x45, 0x00); // Bold off
      commands.push(0x1d, 0x21, 0x00); // Normal size
      commands.push(0x0a); // Line feed

      const paragraphs = headerElement.querySelectorAll("p");
      if (paragraphs.length >= 2) {
        commands.push(...this.textToBytes(paragraphs[0].textContent || ""));
        commands.push(0x0a);
        commands.push(...this.textToBytes(paragraphs[1].textContent || ""));
        commands.push(0x0a);
      }

      // Transaction info
      const infoDiv = headerElement.querySelector(".border-t");
      if (infoDiv) {
        commands.push(...this.textToBytes("--------------------------------"));
        commands.push(0x0a);

        // Left align for transaction info
        commands.push(0x1b, 0x61, 0x00); // ESC a 0

        infoDiv.querySelectorAll("p").forEach((p) => {
          commands.push(...this.textToBytes(p.textContent || ""));
          commands.push(0x0a);
        });
      }
    }

    // Items table
    if (itemsElement) {
      commands.push(...this.textToBytes("--------------------------------"));
      commands.push(0x0a);

      // Table header
      const headerLine = this.formatTableRow("Item", "Qty", "Harga", "Jumlah");
      commands.push(...this.textToBytes(headerLine));
      commands.push(0x0a);

      const rows = itemsElement.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length === 4) {
          const item = cells[0].textContent?.trim() || "";
          const qty = cells[1].textContent?.trim() || "";
          const price = cells[2].textContent?.trim() || "";
          const total = cells[3].textContent?.trim() || "";

          const line = this.formatTableRow(item, qty, price, total);
          commands.push(...this.textToBytes(line));
          commands.push(0x0a);
        }
      });
    }

    // Total section
    if (totalElement) {
      commands.push(...this.textToBytes("--------------------------------"));
      commands.push(0x0a);

      totalElement.querySelectorAll(".flex").forEach((flexDiv) => {
        const spans = flexDiv.querySelectorAll("span");
        if (spans.length === 2) {
          const label = spans[0].textContent?.trim() || "";
          const value = spans[1].textContent?.trim() || "";
          const line = this.formatTotalRow(label, value);
          commands.push(...this.textToBytes(line));
          commands.push(0x0a);
        }
      });
    }

    // Footer
    if (footerElement) {
      commands.push(0x1b, 0x61, 0x01); // Center align
      commands.push(0x0a);
      footerElement.querySelectorAll("p").forEach((p) => {
        commands.push(...this.textToBytes(p.textContent || ""));
        commands.push(0x0a);
      });
    }

    return new Uint8Array(commands);
  }

  private formatTableRow(
    item: string,
    qty: string,
    price: string,
    total: string
  ): string {
    const maxWidth = 32; // Thermal printer typically 32 chars for 58mm
    const maxItemLength = 12;

    const truncatedItem =
      item.length > maxItemLength
        ? item.substring(0, maxItemLength - 2) + ".."
        : item.padEnd(maxItemLength);

    return `${truncatedItem} ${qty.padStart(3)} ${price.padStart(
      7
    )} ${total.padStart(7)}`;
  }

  private formatTotalRow(label: string, value: string): string {
    const maxWidth = 32;
    const padding = maxWidth - label.length - value.length;
    return label + " ".repeat(Math.max(padding, 1)) + value;
  }

  private textToBytes(text: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < text.length; i++) {
      bytes.push(text.charCodeAt(i) & 0xff);
    }
    return bytes;
  }

  private async sendCommand(command: number[]): Promise<void> {
    if (this.printerDevice?.characteristic) {
      await this.printerDevice.characteristic.writeValue(
        new Uint8Array(command)
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  disconnect(): void {
    if (this.printerDevice?.server) {
      this.printerDevice.server.disconnect();
      this.printerDevice = null;
    }
  }

  isConnected(): boolean {
    return this.printerDevice?.device?.gatt?.connected || false;
  }

  isSupported(): boolean {
    return "bluetooth" in navigator;
  }
}

export const bluetoothPrinter = new BluetoothThermalPrinter();
