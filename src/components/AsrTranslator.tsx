import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Mic, Square, Play, Upload, Loader2, AlertCircle } from 'lucide-react';
import GuestPaymentModal from './GuestPaymentModal';

export default function AsrTranslator() {
  const { user, refreshUser } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [targetLang, setTargetLang] = useState('English');
  const [result, setResult] = useState<{ transcription: string; translation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioBlob(e.target.files[0]);
      setError('');
    }
  };

  const handleProcessClick = () => {
    if (!user) {
      setShowPaymentModal(true);
    } else {
      handleProcess();
    }
  };

  const handleProcess = async () => {
    if (!audioBlob) return;
    setLoading(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('targetLang', targetLang);

    try {
      const res = await fetch('/api/translate/asr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      setResult(data);
      if (user) refreshUser();
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
        onPaymentSuccess={handleProcess}
        serviceName="ASR Voice Translation"
        price={1.00}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
            <Mic size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">ASR Voice Translator</h2>
            <p className="text-slate-500">Record or upload audio (mp3, wav, m4a) to transcribe and translate.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Language</label>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="English">English</option>
                <option value="Thai">Thai</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex gap-4 justify-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-all shadow-lg hover:scale-105"
                  >
                    <Mic size={32} />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-900 transition-all shadow-lg animate-pulse"
                  >
                    <Square size={24} />
                  </button>
                )}
              </div>
              <p className="text-center text-sm text-slate-500">
                {isRecording ? 'Recording... Tap to stop' : 'Tap mic to record'}
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or upload audio file</span>
              </div>
            </div>

            <input 
              type="file" 
              accept="audio/*,.m4a" 
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-rose-50 file:text-rose-700
                hover:file:bg-rose-100
              "
            />

            {audioBlob && (
              <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-slate-600">Audio ready to process</span>
                <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 w-32" />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <button
              onClick={handleProcessClick}
              disabled={!audioBlob || loading}
              className="w-full py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : (user ? 'Process Audio' : 'Process (Pay $1.00)')}
            </button>

            {!user && (
              <p className="text-center text-sm text-slate-500">Guest mode: Pay per use</p>
            )}
            {user && (
              <p className="text-center text-sm text-slate-500">Cost: 10 Credits</p>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 min-h-[400px] overflow-y-auto">
            {result ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">Transcription</h3>
                  <p className="text-slate-800 whitespace-pre-wrap">{result.transcription}</p>
                </div>
                <div className="h-px bg-slate-200 my-4"></div>
                <div>
                  <h3 className="text-sm font-medium text-rose-600 mb-2 uppercase tracking-wider">Translation</h3>
                  <p className="text-slate-900 whitespace-pre-wrap">{result.translation}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Mic size={48} className="mb-4 opacity-20" />
                <p>Transcription results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
