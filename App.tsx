
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import NutriDashboard from './components/NutriDashboard';
import ParallaxBackground from './components/ParallaxBackground';
import { User } from './types';

const STORAGE_KEY = 'nutriai_user_name';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ name: '', isLoggedIn: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Verifica se existe um usuário salvo no localStorage ao montar o componente
    const savedName = localStorage.getItem(STORAGE_KEY);
    if (savedName) {
      setUser({ name: savedName, isLoggedIn: true });
    }
    setMounted(true);
  }, []);

  const handleLogin = (name: string) => {
    // Salva no localStorage e atualiza o estado
    localStorage.setItem(STORAGE_KEY, name);
    setUser({ name, isLoggedIn: true });
  };

  const handleLogout = () => {
    // Limpa o localStorage e reseta o estado
    localStorage.removeItem(STORAGE_KEY);
    setUser({ name: '', isLoggedIn: false });
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative text-white selection:bg-emerald-500/30">
      <ParallaxBackground />
      
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {!user.isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <NutriDashboard user={user} onLogout={handleLogout} />
        )}
      </main>
    </div>
  );
};

export default App;
