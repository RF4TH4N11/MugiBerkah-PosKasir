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

  // Daftar UUID service & characteristic umum untuk printer thermal
  private readonly KNOWN_SERVICES = [
    "000018f0-0000-1000-8000-00805f9b34fb", // Standard thermal
    "49535343-fe7d-4ae5-8fa9-9fafd205e455", // Nordic UART
    "0000ffe0-0000-1000-8000-00805f9b34fb", // Common Chinese printers (Zjiang, etc.)
    "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART alternative
  ];

  private readonly SERVICE_CHAR_MAP: Record<string, string[]> = {
    "000018f0-0000-1000-8000-00805f9b34fb": [
      "00002af1-0000-1000-8000-00805f9b34fb",
    ],
    "49535343-fe7d-4ae5-8fa9-9fafd205e455": [
      "49535343-8841-43f4-a8d4-ecbe34729bb3",
    ],
    "0000ffe0-0000-1000-8000-00805f9b34fb": [
      "0000ffe1-0000-1000-8000-00805f9b34fb",
    ],
    "6e400001-b5a3-f393-e0a9-e50e24dcca9e": [
      "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
    ],
  };

  async connect(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error(
        "Web Bluetooth tidak didukung. Gunakan Chrome di Android atau desktop."
      );
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: this.KNOWN_SERVICES,
      });

      console.log("Perangkat dipilih:", device.name || device.id);

      const server = await device.gatt?.connect();
      if (!server) throw new Error("Gagal terhubung ke GATT server");

      const { service, characteristic } =
        await this.findCompatibleServiceAndChar(server);
      if (!characteristic)
        throw new Error(
          "Tidak ditemukan karakteristik printer yang kompatibel"
        );

      this.printerDevice = { device, server, characteristic };
      localStorage.setItem("lastPrinterDeviceId", device.id);
      console.log("Printer berhasil terhubung");
    } catch (error) {
      console.error("Error saat koneksi:", error);
      throw error;
    }
  }

  async reconnect(): Promise<void> {
    if (!this.isSupported()) return;

    try {
      const lastDeviceId = localStorage.getItem("lastPrinterDeviceId");
      if (!lastDeviceId) return;

      const devices = await navigator.bluetooth.getDevices();
      const device = devices.find((d) => d.id === lastDeviceId && d.gatt);

      if (!device?.gatt) return;

      const server = await device.gatt.connect();
      const { characteristic } = await this.findCompatibleServiceAndChar(
        server
      );

      if (characteristic) {
        this.printerDevice = { device, server, characteristic };
        console.log("Rekoneksi berhasil");
      }
    } catch (error) {
      console.error("Rekoneksi gagal:", error);
    }
  }

  private async findCompatibleServiceAndChar(
    server: BluetoothRemoteGATTServer
  ): Promise<{
    service?: BluetoothRemoteGATTService;
    characteristic?: BluetoothRemoteGATTCharacteristic;
  }> {
    // Coba service yang dikenal satu per satu
    for (const serviceUuid of this.KNOWN_SERVICES) {
      try {
        const service = await server.getPrimaryService(serviceUuid);
        const charUuids = this.SERVICE_CHAR_MAP[serviceUuid] || [];

        for (const charUuid of charUuids) {
          try {
            const characteristic = await service.getCharacteristic(charUuid);
            // Pastikan bisa write
            if (
              characteristic.properties.write ||
              characteristic.properties.writeWithoutResponse
            ) {
              return { service, characteristic };
            }
          } catch {
            // Ignore
          }
        }
      } catch {
        // Service tidak tersedia → lanjut ke berikutnya
      }
    }

    // Fallback: coba semua service & characteristic yang ada
    try {
      const allServices = await server.getPrimaryServices();
      for (const service of allServices) {
        const chars = await service.getCharacteristics();
        for (const char of chars) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            console.warn("Menggunakan fallback characteristic:", char.uuid);
            return { service, characteristic: char };
          }
        }
      }
    } catch (e) {
      console.warn("Fallback scan gagal:", e);
    }

    return {};
  }

  async printReceipt(receiptElement: HTMLElement): Promise<void> {
    if (!this.printerDevice?.characteristic) {
      throw new Error("Printer belum terhubung");
    }

    try {
      await this.sendCommand([0x1b, 0x40]); // Initialize

      const receiptData = this.convertHTMLToESCPOS(receiptElement);
      const chunkSize = 200; // Lebih kecil untuk kestabilan mobile

      for (let i = 0; i < receiptData.length; i += chunkSize) {
        const chunk = receiptData.slice(i, i + chunkSize);
        (await this.printerDevice.characteristic.writeValueWithoutResponse)
          ? this.printerDevice.characteristic.writeValueWithoutResponse(chunk)
          : this.printerDevice.characteristic.writeValue(chunk);
        await this.delay(50);
      }

      await this.sendCommand([0x0a, 0x0a, 0x0a]); // Feed
      await this.sendCommand([0x1d, 0x56, 0x00]); // Cut

      console.log("Cetak selesai");
    } catch (error) {
      console.error("Gagal mencetak:", error);
      throw error;
    }
  }

  private convertHTMLToESCPOS(element: HTMLElement): Uint8Array {
    const commands: number[] = [];
    commands.push(0x1b, 0x40); // Initialize
    commands.push(0x1b, 0x61, 0x01); // Center

    const header = element.querySelector(".receipt-header");
    const items = element.querySelector(".receipt-items");
    const total = element.querySelector(".receipt-total");
    const footer = element.querySelector(".receipt-footer");

    if (header) {
      const name = header.querySelector("h2")?.textContent || "";
      commands.push(0x1b, 0x45, 0x01, 0x1d, 0x21, 0x11);
      commands.push(...this.textToBytes(name));
      commands.push(0x1b, 0x45, 0x00, 0x1d, 0x21, 0x00, 0x0a);

      const ps = header.querySelectorAll("p");
      ps.forEach((p) => {
        commands.push(...this.textToBytes(p.textContent || ""), 0x0a);
      });

      const info = header.querySelector(".border-t");
      if (info) {
        commands.push(...this.textToBytes("-".repeat(32)), 0x0a);
        commands.push(0x1b, 0x61, 0x00); // Left
        info.querySelectorAll("p").forEach((p) => {
          commands.push(...this.textToBytes(p.textContent || ""), 0x0a);
        });
      }
    }

    if (items) {
      commands.push(...this.textToBytes("-".repeat(32)), 0x0a);
      const headerLine = this.formatTableRow("Item", "Qty", "Harga", "Jumlah");
      commands.push(...this.textToBytes(headerLine), 0x0a);

      items.querySelectorAll("tbody tr").forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length === 4) {
          const line = this.formatTableRow(
            cells[0].textContent?.trim() || "",
            cells[1].textContent?.trim() || "",
            cells[2].textContent?.trim() || "",
            cells[3].textContent?.trim() || ""
          );
          commands.push(...this.textToBytes(line), 0x0a);
        }
      });
    }

    if (total) {
      commands.push(...this.textToBytes("-".repeat(32)), 0x0a);
      total.querySelectorAll(".flex").forEach((div) => {
        const spans = div.querySelectorAll("span");
        if (spans.length === 2) {
          const line = this.formatTotalRow(
            spans[0].textContent?.trim() || "",
            spans[1].textContent?.trim() || ""
          );
          commands.push(...this.textToBytes(line), 0x0a);
        }
      });
    }

    if (footer) {
      commands.push(0x1b, 0x61, 0x01, 0x0a);
      footer.querySelectorAll("p").forEach((p) => {
        commands.push(...this.textToBytes(p.textContent || ""), 0x0a);
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
    const maxItem = 12;
    const truncated =
      item.length > maxItem
        ? item.slice(0, maxItem - 2) + ".."
        : item.padEnd(maxItem);
    return `${truncated} ${qty.padStart(3)} ${price.padStart(
      7
    )} ${total.padStart(7)}`;
  }

  private formatTotalRow(label: string, value: string): string {
    const padding = Math.max(1, 32 - label.length - value.length);
    return label + " ".repeat(padding) + value;
  }

  private textToBytes(text: string): number[] {
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(text));
  }

  private async sendCommand(cmd: number[]): Promise<void> {
    if (!this.printerDevice?.characteristic) return;
    const arr = new Uint8Array(cmd);
    if (this.printerDevice.characteristic.writeValueWithoutResponse) {
      await this.printerDevice.characteristic.writeValueWithoutResponse(arr);
    } else {
      await this.printerDevice.characteristic.writeValue(arr);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
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
