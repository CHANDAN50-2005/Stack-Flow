import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

interface Problem {
  _id: string;
  title: string;
  difficulty: string;
}

const ProblemsPage = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/problems`);
        if (!response.ok) throw new Error('Failed to fetch problems');
        const data = await response.json();
        setProblems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Problem List</h1>
        <p className="text-text-muted">Master your coding skills with our curated problem set.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-white/10 border-t-neon-green rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-10 glass-panel">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, idx) => (
            <motion.div
              key={problem._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Link to={`/workspace/${problem._id}`} className="block h-full">
                <div className="glass-panel p-6 hover:-translate-y-2 hover:border-neon-green/50 hover:shadow-[0_8px_30px_rgba(0,255,157,0.15)] transition-all duration-300 h-full flex flex-col cursor-pointer bg-gradient-to-br from-dark-surface to-[#1e2a4a]">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <BookOpen className="text-neon-green" size={24} />
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold border ${
                        problem.difficulty === 'Easy'
                          ? 'bg-green-500/10 text-neon-green border-neon-green/20'
                          : problem.difficulty === 'Medium'
                          ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-neon-green transition-colors">
                    {problem.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between text-sm text-text-muted border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle size={14} className="opacity-50" />
                      <span>--% Acceptance</span>
                    </div>
                    <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                      <Clock size={14} />
                      <span>Solve</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;
