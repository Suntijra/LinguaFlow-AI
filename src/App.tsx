import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import Landing from './components/Landing';
import Login from './components/Login';
import DocxTranslator from './components/DocxTranslator';
import AsrTranslator from './components/AsrTranslator';
import TopUp from './components/TopUp';
import DeveloperSandbox from './components/DeveloperSandbox';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/translate/docx" element={<DocxTranslator />} />
        <Route path="/translate/asr" element={<AsrTranslator />} />
        <Route 
          path="/topup" 
          element={
            <ProtectedRoute>
              <TopUp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sandbox" 
          element={
            <ProtectedRoute>
              <DeveloperSandbox />
            </ProtectedRoute>
          } 
        />
        <Route path="/dashboard" element={<Navigate to="/translate/docx" />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <HashRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </HashRouter>
  );
}
