import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/leaderboard?limit=50`);
        const data = await res.json();
        setLeaders(data.rankings || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ type: "spring", stiffness: 200, damping: 20 }}
           className="inline-flex items-center justify-center p-4 bg-neon-green/10 rounded-full mb-4 ring-1 ring-neon-green/30 shadow-[0_0_20px_rgba(0,255,157,0.2)]"
        >
          <Trophy size={48} className="text-neon-green" />
        </motion.div>
        <h1 className="text-4xl font-extrabold mb-2 text-white tracking-tight flex justify-center items-center gap-3">
           Global Rankings <Sparkles className="text-yellow-400" size={24} />
        </h1>
        <p className="text-text-muted text-lg">Compete with engineers worldwide. Earn points by solving problems.</p>
      </div>

      <div className="glass-panel overflow-hidden border border-white/10 rounded-xl bg-gradient-to-b from-dark-surface to-dark-bg/50">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-dark-bg/80 border-b border-white/5 text-xs font-bold text-text-muted uppercase tracking-wider">
          <div className="col-span-2">Rank</div>
          <div className="col-span-6">Engineer</div>
          <div className="col-span-2 text-right">Solved</div>
          <div className="col-span-2 text-right">Points</div>
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-white/10 border-t-neon-green rounded-full animate-spin"></div>
           </div>
        ) : leaders.length === 0 ? (
           <div className="text-center py-16 text-text-muted border-b border-white/5">
              No participants yet. Be the first to solve a problem!
           </div>
        ) : (
          <div className="divide-y divide-white/5">
            {leaders.map((user, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={user._id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group cursor-default"
              >
                <div className="col-span-2 flex items-center gap-3 font-bold text-lg">
                  {idx === 0 ? <Medal className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" size={28} /> :
                   idx === 1 ? <Medal className="text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.6)]" size={24} /> :
                   idx === 2 ? <Medal className="text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.6)]" size={24} /> :
                   <span className="text-text-muted w-7 text-center">{idx + 1}</span>}
                </div>
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-green/30 to-accent-purple/30 border border-white/10 flex items-center justify-center text-white font-bold text-xs ring-2 ring-transparent group-hover:ring-neon-green/50 transition-all">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-white group-hover:text-neon-green transition-colors">{user.username}</span>
                  {idx === 0 && <span className="bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"><Award size={10} /> Grandmaster</span>}
                </div>
                <div className="col-span-2 text-right font-mono text-text-secondary">
                  {user.problemsSolved}
                </div>
                <div className="col-span-2 text-right font-mono font-bold text-neon-green">
                  {user.points.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
