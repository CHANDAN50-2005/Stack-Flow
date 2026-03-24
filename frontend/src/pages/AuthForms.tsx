import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email, password } : { name, email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blur Elements */}
      <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-neon-green/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-accent-purple/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div 
        layout
        className="glass-panel w-full max-w-md relative z-10 p-8"
      >
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary mb-2">
                  Welcome Back
                </h2>
                <p className="text-text-muted text-sm">Sign in to your account to continue</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20">{error}</div>}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-dark-bg/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all font-sans text-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-dark-bg/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all font-sans text-sm"
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs mt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-text-muted hover:text-white transition-colors">
                    <input type="checkbox" className="rounded bg-dark-bg border-white/10 accent-neon-green" />
                    Remember me
                  </label>
                  <a href="#" className="text-neon-green hover:underline">Forgot password?</a>
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-neon-green text-dark-bg font-bold py-3 rounded-lg mt-6 flex items-center justify-center gap-2 hover:bg-neon-green/90 transition-colors shadow-[0_0_15px_rgba(0,255,157,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Signing In...' : (
                    <>Sign In <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-text-muted">
                Don't have an account?{' '}
                <button 
                  onClick={() => setIsLogin(false)}
                  className="text-white hover:text-neon-green transition-colors font-medium border-b border-transparent hover:border-neon-green"
                >
                  Create one
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-text-secondary mb-2">
                  Create Account
                </h2>
                <p className="text-text-muted text-sm">Join the platform to start coding</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && <div className="text-red-500 text-sm text-center bg-red-500/10 py-2 rounded border border-red-500/20">{error}</div>}
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-dark-bg/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all font-sans text-sm"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-dark-bg/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all font-sans text-sm"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-dark-bg/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-text-muted focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all font-sans text-sm"
                  />
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-neon-green text-dark-bg font-bold py-3 rounded-lg mt-6 flex items-center justify-center gap-2 hover:bg-neon-green/90 transition-colors shadow-[0_0_15px_rgba(0,255,157,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLoading ? 'Creating Account...' : (
                    <>Create Account <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
              
              <div className="mt-6 text-center text-sm text-text-muted">
                Already have an account?{' '}
                <button 
                  onClick={() => setIsLogin(true)}
                  className="text-white hover:text-neon-green transition-colors font-medium border-b border-transparent hover:border-neon-green"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthForms;
