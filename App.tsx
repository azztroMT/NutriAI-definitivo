
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import NutriDashboard from './components/NutriDashboard';
import ParallaxBackground from './components/ParallaxBackground';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ name: '', isLoggedIn: false });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = (name: string) => {
    setUser({ name, isLoggedIn: true });
  };

  const handleLogout = () => {
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
