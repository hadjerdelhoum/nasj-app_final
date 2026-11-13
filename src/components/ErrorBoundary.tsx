import { Component, type ErrorInfo, type ReactNode } from "react";

/** Last line of defence: an unexpected error shows a friendly screen (with the reason) instead of a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24, textAlign: "center", background: "#fbf6ec", color: "#12485a", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 360 }}>
          <img src="/img/logo/yarn-ball.png" alt="" width={72} height={72} />
          <h1 style={{ fontSize: "1.3rem", margin: "12px 0 6px" }}>Oups, un petit nœud ! · حدثت مشكلة صغيرة</h1>
          <p style={{ margin: "0 0 14px" }}>Touche le bouton pour recommencer. · اضغط للمحاولة مرة أخرى.</p>
          <button type="button" onClick={() => { this.setState({ error: null }); window.location.assign("/"); }}
            style={{ minHeight: 52, padding: "0 28px", border: 0, borderRadius: 999, background: "#17908a", color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}>
            Recommencer · إعادة
          </button>
          <p dir="ltr" style={{ marginTop: 14, fontSize: ".75rem", opacity: 0.6, wordBreak: "break-word" }}>{String(this.state.error.message).slice(0, 160)}</p>
        </div>
      </div>
    );
  }
}
