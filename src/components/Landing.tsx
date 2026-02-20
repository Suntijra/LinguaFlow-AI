import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Globe, Mic, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div className="space-y-24 pb-24">
      {/* Hero */}
      <section className="text-center pt-20 px-6">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6"
        >
          {t('landing.title')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-500 max-w-2xl mx-auto mb-10"
        >
          {t('landing.subtitle')}
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link to="/translate/docx" className="px-8 py-4 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all flex items-center gap-2">
            Try Docx Translate <ArrowRight size={18} />
          </Link>
          <Link to="/translate/asr" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-full font-medium hover:bg-slate-50 transition-all flex items-center gap-2">
            Try Voice Translate <Mic size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-12">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <Globe size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Document Translation</h3>
          <p className="text-slate-500">Upload .docx files and get instant translations while preserving the core meaning.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-6">
            <Mic size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">ASR Voice Translation</h3>
          <p className="text-slate-500">Speak naturally. Our AI transcribes and translates your voice in real-time.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
            <Zap size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">B2B API Access</h3>
          <p className="text-slate-500">Developers can integrate our powerful translation engine directly into their apps.</p>
        </div>
      </section>
    </div>
  );
}
