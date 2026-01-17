// src/components/Common/ChunkErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chunk loading error:', error, errorInfo);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h3>Failed to load component</h3>
          <p>This might be due to a network issue or outdated cache.</p>
          <button 
            onClick={this.handleRetry}
            className='prim-but mt-3'
            style={{ padding: '10px 20px' }}
          >
            Refresh Page
          </button>
          <p className='mt-3'>
            <small>If the problem persists, please contact support.</small>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;