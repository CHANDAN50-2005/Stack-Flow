import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const DefaultLayout = () => {
  const { isAuthenticated, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar Placeholder */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-dark-bg/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-neon-green/20 border border-neon-green flex items-center justify-center">
              <span className="text-neon-green font-bold text-xl">S</span>
            </div>
            <span className="font-bold text-xl tracking-tight">StackFlow</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-text-secondary">
            <Link to="/problems" className="hover:text-white transition-colors">Problems</Link>
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green flex items-center justify-center cursor-pointer">
                  <span className="text-neon-green font-bold text-sm">Me</span>
                </div>
                <button 
                  onClick={logout}
                  className="block text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="block text-sm font-medium hover:text-white transition-colors">Sign In</Link>
                <Link to="/auth" className="block bg-neon-green text-dark-bg font-semibold px-4 py-2 rounded-md hover:bg-neon-green/90 transition-colors text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default DefaultLayout;
