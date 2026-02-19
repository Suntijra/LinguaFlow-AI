import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';
import GuestPaymentModal from './GuestPaymentModal';

export default function DocxTranslator() {
  const { user, refreshUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState('Thai');
  const [result, setResult] = useState<{ original: string; translated: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const isMockApi = true;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleTranslateClick = () => {
    if (!user) {
      setShowPaymentModal(true);
    } else {
      handleTranslate();
    }
  };

  const handleTranslate = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetLang', targetLang);

    if (isMockApi) {
      // Simulate API call delay
      setTimeout(() => {
        const mockOriginalText = `Mocked original text from ${file.name}. This is a placeholder for the actual content of the DOCX file.`;
        const mockTranslatedText = `Mocked translated text to ${targetLang}. This is a placeholder for the translated content.`;
        setResult({
          original: mockOriginalText,
          translated: mockTranslatedText,
        });
        if (user) refreshUser(); // Simulate credit update
        setLoading(false);
      }, 1500); // 1.5 seconds delay
      return;
    }

    try {
      const res = await fetch('/api/translate/docx', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Translation failed');
      }

      setResult(data);
      if (user) refreshUser(); // Update credits
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <GuestPaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handleTranslate}
        serviceName="Docx Translation"
        price={0.50}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Docx Translator</h2>
            <p className="text-slate-500">Upload a .docx file to translate its content.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Language</label>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Thai">Thai</option>
                <option value="English">English</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".docx" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto text-slate-400 mb-4" size={32} />
              <p className="text-slate-600 font-medium">{file ? file.name : 'Drop .docx file here or click to upload'}</p>
              <p className="text-slate-400 text-sm mt-1">Max 10MB</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <button
              onClick={handleTranslateClick}
              disabled={!file || loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : (user ? 'Translate Document' : 'Translate (Pay $0.50)')}
            </button>
            
            {!user && (
              <p className="text-center text-sm text-slate-500">Guest mode: Pay per use</p>
            )}
            {user && (
              <p className="text-center text-sm text-slate-500">Cost: 5 Credits</p>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 min-h-[400px] overflow-y-auto">
            {result ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Original</h3>
                  <p className="text-slate-800 whitespace-pre-wrap">{result.original}</p>
                </div>
                <div className="h-px bg-slate-200 my-4"></div>
                <div>
                  <h3 className="text-sm font-medium text-indigo-600 mb-2 uppercase tracking-wider">Translated</h3>
                  <p className="text-slate-900 whitespace-pre-wrap">{result.translated}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>Translation results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
