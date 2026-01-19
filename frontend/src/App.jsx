import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [view, setView] = useState('login'); // 'login', 'register', 'dashboard'
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (data) => {
    setUser({ id: data.id, name: data.name });
    setView('dashboard');
  };

  const handleRegisterSuccess = (data) => {
    // After registration, redirect to login
    setView('login');
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
  };

  if (view === 'dashboard' && user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (view === 'register') {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <Login
      onLoginSuccess={handleLoginSuccess}
      onSwitchToRegister={() => setView('register')}
    />
  );
}

export default App;
