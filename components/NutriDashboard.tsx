
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, LogOut, ChevronLeft, Sparkles, Loader2, RefreshCw, Image as ImageIcon, CheckCircle, Clock, History } from 'lucide-react';
import { User, NutritionAnalysis } from '../types';
import { analyzePlate } from '../services/geminiService';
import { saveAnalysis, getUserHistory } from '../services/supabaseService';
import AnalysisReport from './AnalysisReport';

interface NutriDashboardProps {
  user: User;
  onLogout: () => void;
}

const NutriDashboard: React.FC<NutriDashboardProps> = ({ user, onLogout }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "Escaneando alimentos...",
    "Identificando porções...",
    "Calculando densidade calórica...",
    "Quase pronto...",
    "Alta demanda detectada, aguarde...",
    "Refinando detalhes finais...",
    "Finalizando relatório..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % steps.length);
        if (loadingStep > 3) setIsRetrying(true);
      }, 2500);
    } else {
      setLoadingStep(0);
      setIsRetrying(false);
    }
    return () => clearInterval(interval);
  }, [loading, loadingStep]);

  const loadHistory = async () => {
    const data = await getUserHistory(user.name);
    setHistory(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setShowHistory(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    setLoading(false);
    setShowHistory(false);
  };

  const startAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await analyzePlate(image);
      setAnalysis(result);
      await saveAnalysis(user.name, result);
    } catch (err: any) {
      console.error("Erro capturado silenciosamente:", err);
      reset();
    } finally {
      setLoading(false);
    }
  };

  const toggleHistory = async () => {
    if (!showHistory) {
      await loadHistory();
    }
    setShowHistory(!showHistory);
    setAnalysis(null);
    setImage(null);
  };

  return (
    <div className="w-full max-w-5xl">
      <div className="flex justify-between items-center mb-8 px-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-3xl font-[900] tracking-tighter">
            OLÁ, <span className="text-emerald-400">{user.name.toUpperCase()}</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.2em]">SISTEMA ATIVO • PREMIUM</p>
          </div>
        </motion.div>
        
        <div className="flex gap-2">
          <button
            onClick={toggleHistory}
            className={`p-3 glass rounded-2xl transition-all border-white/5 ${showHistory ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/60'}`}
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            className="p-3 glass hover:bg-red-500/20 rounded-2xl transition-all border-white/5"
          >
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showHistory ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="glass premium-border p-8 border-white/10"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Histórico de Refeições</h3>
              <button onClick={() => setShowHistory(false)} className="text-xs font-black uppercase tracking-widest text-emerald-400">Voltar</button>
            </div>
            
            <div className="grid gap-4">
              {history.length > 0 ? history.map((item, idx) => (
                <div key={idx} className="glass p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-lg uppercase text-white tracking-tight">{item.plate_name}</h4>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-widest">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Calorias</p>
                      <p className="font-black text-emerald-400">{item.total_calories} kcal</p>
                    </div>
                    <button 
                      onClick={() => {
                        setAnalysis(item);
                        setShowHistory(false);
                      }}
                      className="glass px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-emerald-500/30 text-emerald-400"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-20 uppercase font-black tracking-widest">Nenhuma análise encontrada</div>
              )}
            </div>
          </motion.div>
        ) : !analysis ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-8"
          >
            <div className="glass premium-border p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px] border-white/10 relative">
              
              {!image ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 w-full max-w-2xl">
                    {['Calorias', 'Macros', 'Gramas', 'Insights'].map((label) => (
                      <div key={label} className="glass p-4 rounded-3xl flex flex-col items-center gap-2 border-white/5">
                        <CheckCircle className="text-emerald-400 w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-500/20">
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                  </div>
                  
                  <h3 className="text-4xl font-[900] tracking-tighter mb-4 uppercase">Analise sua Refeição</h3>
                  <p className="text-white/40 max-w-md mb-12 font-medium leading-relaxed">
                    Capture uma foto nítida do seu prato para uma análise nutricional profunda via IA.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-3 bg-emerald-500 text-emerald-950 font-[900] px-6 py-5 rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                    >
                      <Camera className="w-5 h-5" />
                      TIRAR FOTO
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-3 glass text-white font-[900] px-6 py-5 rounded-2xl hover:bg-white/10 transition-all active:scale-95"
                    >
                      <ImageIcon className="w-5 h-5 text-emerald-400" />
                      GALERIA
                    </button>
                    <input type="file" ref={cameraInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="relative group mb-8">
                    <img
                      src={image}
                      alt="Refeição"
                      className="max-h-[350px] rounded-[3rem] object-cover shadow-2xl border-4 border-white/5"
                    />
                    {!loading && (
                      <button
                        onClick={reset}
                        className="absolute -top-4 -right-4 bg-red-500 p-3 rounded-full hover:bg-red-600 transition-all shadow-lg"
                      >
                        <RefreshCw className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={startAnalysis}
                    disabled={loading}
                    className={`flex flex-col items-center gap-4 w-full max-w-sm px-12 py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-90 ${loading ? 'bg-emerald-900/50 text-emerald-400' : 'bg-white text-emerald-950 font-[900]'}`}
                  >
                    <div className="flex items-center gap-3">
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Sparkles className="w-6 h-6 text-emerald-600" />
                      )}
                      <span className="font-black uppercase tracking-widest">
                        {loading ? (isRetrying ? 'OTIMIZANDO FILA...' : 'PROCESSANDO...') : 'GERAR RELATÓRIO'}
                      </span>
                    </div>
                    {loading && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        {isRetrying && <Clock size={10} className="animate-pulse" />}
                        <span className="text-[10px] tracking-widest font-black uppercase opacity-60">
                          {steps[loadingStep]}
                        </span>
                      </motion.div>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full flex flex-col gap-6"
          >
            <div className="flex items-center gap-4 px-4">
              <button
                onClick={reset}
                className="p-3 glass hover:bg-white/10 rounded-2xl transition-all border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-[900] tracking-tighter uppercase text-emerald-400">Inteligência Nutricional</h3>
            </div>
            <AnalysisReport analysis={analysis} image={image || "https://cdn-icons-png.flaticon.com/512/11641/11641857.png"} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutriDashboard;
