import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function PageNotFound({}) {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        return { user, isAuthenticated: true };
      } catch (error) {
        return { user: null, isAuthenticated: false };
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="text-8xl font-bold text-slate-200 mb-4">
          404
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
        <p className="text-slate-600 mb-6">
          The page "{pageName}" could not be found in this application.
        </p>

        {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-amber-800">Admin Note</p>
            <p className="text-sm text-amber-700">This could mean that the AI hasn't implemented this page yet. Ask it to implement it in the chat.</p>
          </div>
        )}

        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}