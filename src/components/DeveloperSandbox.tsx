import { useAuth } from '../contexts/AuthContext';
import { Copy } from 'lucide-react';

export default function DeveloperSandbox() {
  const { user } = useAuth();

  const copyKey = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      alert('API Key copied!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-slate-900 text-white rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Developer Sandbox (B2B)</h2>
        <p className="text-slate-400 mb-6">Integrate LinguaFlow directly into your applications using our REST API.</p>
        
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <label className="block text-xs font-mono text-slate-400 mb-2 uppercase">Your API Key</label>
          <div className="flex items-center gap-4">
            <code className="flex-1 font-mono text-green-400 break-all">
              {user?.api_key || 'Login to view API Key'}
            </code>
            <button onClick={copyKey} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
              <Copy size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">API Reference</h3>
          
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-3">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">POST</span>
                <code className="text-sm text-slate-700">/api/v1/translate/text</code>
              </div>
              <div className="p-6">
                <p className="text-slate-600 mb-4">Translate raw text programmatically.</p>
                
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Request Body</h4>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "text": "Hello world",
  "targetLang": "Thai"
}`}
                </pre>

                <h4 className="text-sm font-semibold text-slate-900 mt-4 mb-2">Headers</h4>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto">
{`x-api-key: YOUR_API_KEY
Content-Type: application/json`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
