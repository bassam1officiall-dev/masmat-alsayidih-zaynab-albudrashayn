'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center font-cairo">
          <div className="max-w-md w-full bg-white p-8 border border-hair shadow-sm rounded-none">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent-wash text-accent rounded-full flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-sm text-mute mb-6">
              تم تسجيل المشكلة وسيقوم النظام بتحديث الصفحة تلقائياً لتفادي فقدان البيانات.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full bg-accent text-white py-3 px-6 font-semibold hover:bg-accent-dark transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
