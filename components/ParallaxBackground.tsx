
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ParallaxBackground: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [gyroPosition, setGyroPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 60,
        y: (e.clientY / window.innerHeight - 0.5) * 60,
      });
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      // Gamma: inclinação esquerda/direita (-90 a 90)
      // Beta: inclinação frente/trás (-180 a 180)
      if (e.gamma !== null && e.beta !== null) {
        setGyroPosition({
          x: (e.gamma / 45) * 30,
          y: ((e.beta - 45) / 45) * 30, // Calibrado para uso normal do celular
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Solicitar permissão para iOS se necessário
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      // Em apps reais, isso geralmente é acionado por um clique do usuário. 
      // Como é um PWA premium, assumimos o suporte ou captura no primeiro toque.
    }
    
    window.addEventListener('deviceorientation', handleOrientation);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const springConfig = { damping: 25, stiffness: 120 };
  
  // Definição de elementos do background para densidade visual
  const backgroundElements = [
    { icon: '🍎', size: 'text-8xl', top: '10%', left: '15%', factor: 0.5, blur: 'blur-sm' },
    { icon: '🥑', size: 'text-9xl', bottom: '15%', left: '5%', factor: 0.8, blur: 'blur-md' },
    { icon: '🍊', size: 'text-7xl', top: '35%', right: '8%', factor: 0.6, blur: 'blur-sm' },
    { icon: '🍇', size: 'text-6xl', bottom: '30%', right: '15%', factor: 0.4, blur: 'blur-lg' },
    { icon: '🍓', size: 'text-5xl', top: '65%', left: '20%', factor: 0.7, blur: 'blur-sm' },
    { icon: '🍌', size: 'text-8xl', top: '15%', right: '25%', factor: 0.3, blur: 'blur-xl' },
    { icon: '🍍', size: 'text-9xl', bottom: '5%', right: '35%', factor: 0.9, blur: 'blur-sm' },
    { icon: '🥦', size: 'text-7xl', top: '50%', left: '40%', factor: 0.2, blur: 'blur-2xl' },
    { icon: '🥕', size: 'text-6xl', bottom: '45%', left: '10%', factor: 0.55, blur: 'blur-md' },
    { icon: '🫐', size: 'text-4xl', top: '5%', left: '50%', factor: 1.1, blur: 'blur-none' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#022c22]">
      {/* Deep Gradient Background com look "molhado" */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#022c22] via-[#052e16] to-[#011a14]" />
      
      {/* Efeito de iluminação de fundo */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_50%,_#10b981_0%,_transparent_60%)]" />
      
      {/* Camada de "água" / reflexos translúcidos */}
      <motion.div 
        animate={{ 
          x: mousePosition.x + gyroPosition.x, 
          y: mousePosition.y + gyroPosition.y 
        }}
        transition={{ type: 'spring', ...springConfig }}
        className="absolute inset-[-10%] opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"
      />

      {/* Frutas Dinâmicas */}
      {backgroundElements.map((item, idx) => (
        <motion.div
          key={idx}
          animate={{ 
            x: (mousePosition.x + gyroPosition.x) * item.factor, 
            y: (mousePosition.y + gyroPosition.y) * item.factor 
          }}
          transition={{ type: 'spring', ...springConfig }}
          className={`absolute ${item.size} ${item.blur} opacity-30 select-none transition-opacity duration-1000`}
          style={{ 
            top: item.top, 
            left: item.left, 
            right: item.right, 
            bottom: item.bottom,
            rotate: idx * 45,
            filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.5))`
          }}
        >
          {item.icon}
        </motion.div>
      ))}
      
      {/* Partículas de "água" em suspensão */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-300 rounded-full opacity-30"
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Overlay de Vinheta Premium */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.7)]" />
    </div>
  );
};

export default ParallaxBackground;
