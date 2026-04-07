import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function AccessGate({ children, user }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!user) return;

    if (user.role === 'admin' || user.user_type === 'admin' || user.user_type === 'instructor') {
      setStatus('approved');
      return;
    }

    base44.entities.Application.filter({ email: user.email, status: 'accepted' })
      .then((results) => {
        setStatus(results.length > 0 ? 'approved' : 'pending');
      })
      .catch(() => setStatus('pending'));
  }, [user]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Pending</h2>
          <p className="text-slate-600 mb-4">
            Your account is awaiting approval. Once your application is accepted by our admissions team, you'll have full access to your learning area.
          </p>
          <p className="text-sm text-slate-500 mb-4">Signed in as {user.email}</p>
          <button
            onClick={() => base44.auth.logout('/')}
            className="text-sm text-slate-500 underline hover:text-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children;
}