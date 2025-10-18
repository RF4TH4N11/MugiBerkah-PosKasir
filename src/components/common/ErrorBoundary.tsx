import React from "react";

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean; msg?: string; stack?: string };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
      msg: error?.message || String(error),
      stack: error?.stack,
    };
  }
  componentDidCatch(error: any, info: any) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-6 text-sm text-gray-900 dark:text-gray-100">
            <div className="font-semibold mb-2">
              Terjadi error saat memuat halaman.
            </div>
            <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded border overflow-auto whitespace-pre-wrap">
              {this.state.msg}
            </pre>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
