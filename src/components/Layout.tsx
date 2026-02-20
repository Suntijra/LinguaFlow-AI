import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { LogOut, Menu, X, Globe, Languages } from 'lucide-react';
import React, { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Globe size={18} />
            </div>
            LinguaFlow
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/translate/docx" 
              className={`text-sm font-medium transition-colors ${isActive('/translate/docx') ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t('nav.docxTranslate')}
            </Link>
            <Link 
              to="/translate/asr" 
              className={`text-sm font-medium transition-colors ${isActive('/translate/asr') ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t('nav.voiceTranslate')}
            </Link>
            {user && (
              <>
                <Link 
                  to="/topup" 
                  className={`text-sm font-medium transition-colors ${isActive('/topup') ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t('nav.credits')} {user.credits}
                </Link>
                <Link 
                  to="/sandbox" 
                  className={`text-sm font-medium transition-colors ${isActive('/sandbox') ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t('nav.developerApi')}
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              <Languages size={16} />
              {language.toUpperCase()}
            </button>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-900">{user.name || user.email}</span>
                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4 flex flex-col">
              <button
                onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                className="flex items-center gap-2 text-slate-600 font-medium w-full text-left"
              >
                <Languages size={18} />
                Switch to {language === 'en' ? 'Thai' : 'English'}
              </button>
              <div className="h-px bg-slate-100 my-2" />
              <Link to="/translate/docx" onClick={() => setIsMenuOpen(false)}>{t('nav.docxTranslate')}</Link>
              <Link to="/translate/asr" onClick={() => setIsMenuOpen(false)}>{t('nav.voiceTranslate')}</Link>
              {user && (
                <>
                  <Link to="/topup" onClick={() => setIsMenuOpen(false)}>{t('nav.credits')} {user.credits}</Link>
                  <Link to="/sandbox" onClick={() => setIsMenuOpen(false)}>{t('nav.developerApi')}</Link>
                  <button onClick={logout} className="text-left text-red-500">{t('nav.logout')}</button>
                </>
              )}
              {!user && (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-indigo-600 font-medium">{t('nav.signIn')}</Link>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      <main>
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} LinguaFlow AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
