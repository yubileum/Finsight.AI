import React from 'react';
import ReactDOM from 'react-dom/client';

// Error boundary so a render error shows a message instead of a blank page
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App error:', error, info);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#f8fafc',
          color: '#1e293b',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Something went wrong</h1>
          <pre style={{
            background: '#f1f5f9',
            padding: 16,
            borderRadius: 12,
            overflow: 'auto',
            maxWidth: '100%',
            fontSize: 12,
            border: '1px solid #e2e8f0',
          }}>
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-load App so import failures (e.g. pdfjs, genai) show a message instead of blank
const App = React.lazy(() =>
  import('./App')
    .then((m) => ({ default: m.default }))
    .catch((err: Error) => ({
      default: () => (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#f8fafc',
          color: '#1e293b',
        }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Failed to load app</h1>
          <pre style={{
            background: '#f1f5f9',
            padding: 16,
            borderRadius: 12,
            overflow: 'auto',
            maxWidth: '100%',
            fontSize: 12,
            border: '1px solid #e2e8f0',
          }}>
            {err?.message ?? String(err)}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </div>
      ),
    }))
);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppErrorBoundary>
      <React.Suspense fallback={
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: '#f8fafc',
          color: '#64748b',
          fontSize: 18,
          fontWeight: 600,
        }}>
          Loading FinSight…
        </div>
      }>
        <App />
      </React.Suspense>
    </AppErrorBoundary>
  </React.StrictMode>
);
