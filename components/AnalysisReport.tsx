
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NutritionAnalysis } from '../types';
import { CheckCircle2, AlertCircle, Lightbulb, Scale, Utensils, Zap } from 'lucide-react';

interface AnalysisReportProps {
  analysis: NutritionAnalysis;
  image: string;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ analysis, image }) => {
  const chartData = [
    { name: 'Proteína', value: analysis.macros.protein, color: '#10b981' },
    { name: 'Carbo', value: analysis.macros.carbs, color: '#3b82f6' },
    { name: 'Gordura', value: analysis.macros.fats, color: '#f59e0b' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full pb-20">
      {/* Coluna Esquerda: Visuais */}
      <div className="lg:col-span-5 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass premium-border overflow-hidden relative shadow-2xl border-white/10"
        >
          <img src={image} alt="Prato" className="w-full h-auto aspect-square object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-transparent to-transparent flex flex-col justify-end p-8">
            <h2 className="text-4xl font-[900] uppercase tracking-tighter text-white leading-none mb-3">{analysis.plateName}</h2>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-emerald-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">IA ANALISADO</span>
              <span className="glass px-3 py-1 rounded-full text-[10px] font-black text-white/80 uppercase tracking-widest">{analysis.totalCalories} KCAL</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass premium-border p-8 h-[340px] border-white/5"
        >
          <h4 className="text-xs font-[900] tracking-[0.2em] uppercase text-emerald-400/80 mb-6 flex items-center gap-2">
            <Zap size={14} /> Distribuição de Macros
          </h4>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={95}
                paddingAngle={10}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#022c22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', color: '#fff', fontSize: '12px', fontWeight: '900' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}/>
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Coluna Direita: Detalhes */}
      <div className="lg:col-span-7 space-y-6">
        {/* Cards de Macros */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'PROTEÍNA', val: analysis.macros.protein, unit: 'g', color: '#10b981' },
            { label: 'CARBOS', val: analysis.macros.carbs, unit: 'g', color: '#3b82f6' },
            { label: 'GORDURA', val: analysis.macros.fats, unit: 'g', color: '#f59e0b' },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="glass premium-border p-5 text-center border-b-4 shadow-lg"
              style={{ borderBottomColor: item.color }}
            >
              <div className="text-white/40 text-[9px] font-black tracking-widest mb-2 uppercase">{item.label}</div>
              <div className="text-3xl font-[900] tracking-tighter">
                {item.val}<span className="text-xs ml-0.5 text-white/30">{item.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabela de Ingredientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass premium-border p-8 border-white/5"
        >
          <div className="flex items-center gap-3 mb-8">
            <Utensils className="text-emerald-400 w-5 h-5" />
            <h4 className="text-sm font-[900] tracking-widest uppercase">Ingredientes Detalhados</h4>
          </div>
          <div className="space-y-3">
            {analysis.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border border-white/5 group hover:bg-emerald-500/5 transition-all">
                <div>
                  <div className="font-[900] text-emerald-100 uppercase text-xs tracking-tight">{ing.name}</div>
                  <div className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5">{ing.householdMeasure}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-8 bg-emerald-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(ing.weightGrams / 2, 100)}%` }}></div>
                  </div>
                  <span className="font-[900] text-emerald-400 text-lg tracking-tighter">{ing.weightGrams}<span className="text-[10px] ml-1">G</span></span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Insights da IA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass premium-border p-8 border-l-4 border-emerald-500 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-4 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-[900] text-[10px] tracking-widest uppercase">Pontos Positivos</span>
            </div>
            <ul className="space-y-3">
              {analysis.positivePoints.map((point, i) => (
                <li key={i} className="text-sm font-semibold text-white/70 leading-relaxed flex gap-2">
                  <span className="text-emerald-500 text-lg leading-none">•</span> {point}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass premium-border p-8 border-l-4 border-amber-500 shadow-xl"
          >
            <div className="flex items-center gap-2 mb-4 text-amber-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-[900] text-[10px] tracking-widest uppercase">Atenção</span>
            </div>
            <ul className="space-y-3">
              {analysis.attentionPoints.map((point, i) => (
                <li key={i} className="text-sm font-semibold text-white/70 leading-relaxed flex gap-2">
                  <span className="text-amber-500 text-lg leading-none">•</span> {point}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Card de Melhoria */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass premium-border p-8 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 border border-emerald-500/10 shadow-2xl"
        >
          <div className="flex items-center gap-4 mb-5">
            <div className="p-3 bg-emerald-500/20 rounded-2xl shadow-inner border border-emerald-500/10">
              <Lightbulb className="text-emerald-400 w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-400">Upgrade Nutricional</h4>
              <p className="text-white font-[900] text-lg tracking-tighter uppercase">Sugestão NutriAI</p>
            </div>
          </div>
          <p className="text-emerald-100/80 font-semibold leading-relaxed italic text-lg">
            "{analysis.improvementSuggestion}"
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisReport;
