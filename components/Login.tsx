
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User as UserIcon, Sparkles, BrainCircuit, Activity } from 'lucide-react';

interface LoginProps {
  onLogin: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="glass premium-border p-12 w-full max-w-md shadow-2xl relative overflow-hidden group border-white/10"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
      
      <div className="text-center mb-10">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="inline-block p-4 rounded-3xl bg-emerald-500/20 mb-6 shadow-lg shadow-emerald-500/10"
        >
          <BrainCircuit className="w-10 h-10 text-emerald-400" />
        </motion.div>
        
        <h1 className="text-5xl font-[900] tracking-tighter mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          NUTRI<span className="text-emerald-500 font-[900]">AI</span>
        </h1>
        <p className="text-emerald-300/60 font-medium text-sm uppercase tracking-widest">Inteligência Nutricional Premium</p>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        <div className="glass px-3 py-1 rounded-full text-[10px] font-black text-emerald-400 border-emerald-500/20 flex items-center gap-1">
          <Activity size={10} /> GEMINI 3 FLASH
        </div>
        <div className="glass px-3 py-1 rounded-full text-[10px] font-black text-emerald-400 border-emerald-500/20 flex items-center gap-1">
          <Sparkles size={10} /> VISÃO COMPUTACIONAL
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Como devemos te chamar?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/30 border border-emerald-500/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-semibold"
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-950 font-[900] py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20"
        >
          <LogIn className="w-5 h-5" />
          INICIAR EXPERIÊNCIA
        </button>
      </form>
      
      <div className="mt-8 text-center">
        <p className="text-white/10 text-[9px] tracking-[0.2em] uppercase font-black">Powered by Google Gemini Vision</p>
      </div>
    </motion.div>
  );
};

export default Login;
