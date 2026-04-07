import React from 'react';

const UserNotRegisteredError = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Access Restricted</h2>
        <p className="text-slate-600 mb-6">
          You are not registered to use this application. Please contact the app administrator to request access.
        </p>
        <div className="text-left text-sm text-slate-500 space-y-2">
          <p>If you believe this is an error, you can:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Verify you are logged in with the correct account</li>
            <li>Contact the app administrator for access</li>
            <li>Try logging out and back in again</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;