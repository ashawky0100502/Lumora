import { Component } from 'react';

// Without this, ANY uncaught render error anywhere in the tree (a bad
// realtime payload shape, a null field, a third-party lib hiccup...)
// unmounts the *entire* React app, which is why the whole site "goes
// black and disconnects" instead of just the one broken panel.
//
// Wrap any section that talks to Supabase / renders remote data with this
// so a failure there shows a small inline error instead of nuking the app.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep this even in production — it's the only trace you'll have of
    // what actually broke, since the UI itself won't show a stack trace.
    console.error('[ErrorBoundary] caught render error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-[20px] border p-10 text-center"
          style={{ borderColor: 'rgba(212,175,55,0.16)', background: 'var(--glass)', color: 'rgba(246,244,239,0.75)' }}
        >
          <div className="text-[0.95rem]" style={{ color: 'rgba(246,244,239,0.9)' }}>
            Something went wrong loading this section.
          </div>
          <div className="max-w-[520px] text-[0.75rem]" style={{ color: 'rgba(246,244,239,0.45)' }}>
            {this.state.error?.message || 'Unknown error.'}
          </div>
          <button
            type="button"
            onClick={this.handleRetry}
            className="btn-gold mt-2 rounded-full px-5 py-2 text-[0.8rem]"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
