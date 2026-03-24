import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, Users, ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/submissions/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  const stats = useMemo(() => {
    const total = history.length;
    const accepted = history.filter(s => s.status === 'Accepted').length;
    const accRate = total > 0 ? ((accepted / total) * 100).toFixed(1) : '0.0';
    const sumTime = history.reduce((acc, curr) => acc + (curr.executionTime || 0), 0);
    const avgTime = total > 0 ? (sumTime / total).toFixed(3) : '0';
    
    return {
      total,
      accRate: `${accRate}%`,
      avgTime: `${avgTime}s`
    };
  }, [history]);

  const chartData = useMemo(() => {
    if (!history.length) return null;
    
    // Initialize buckets for 7 days (including today)
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const now = new Date();
    
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    history.forEach(s => {
      const d = new Date(s.createdAt);
      if (d >= sevenDaysAgo) {
        const diffDays = Math.floor((d.getTime() - sevenDaysAgo.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
            counts[diffDays]++;
        }
      }
    });

    const max = Math.max(...counts, 5); 
    const points = counts.map((c, i) => {
      const x = i * (800 / 6);
      const y = 250 - (c / max) * 200; 
      return `${x},${y}`;
    });

    return {
      path: `M ${points.join(' L ')}`,
      fillPath: `M 0 280 L ${points.join(' L ')} L 800 280 Z`,
      max,
      avg: (counts.reduce((a, b) => a + b, 0) / 7).toFixed(1)
    };
  }, [history]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Top Banner Area */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <button className="bg-dark-surface/50 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors font-medium text-sm">
            Export Report
          </button>
          <Link to="/workspace" className="inline-block bg-neon-green text-dark-bg px-4 py-2 rounded-lg hover:bg-neon-green/90 transition-colors font-bold text-sm">
            New Workspace
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Activity />}
          title="Total Submissions"
          value={loading ? '...' : stats.total.toString()}
          trend="+New"
          trendUp={true}
          delay={0.1}
        />
        <StatCard 
          icon={<Users />}
          title="Role"
          value="ENGINEER"
          trend="Active"
          trendUp={true}
          delay={0.2}
        />
        <StatCard 
          icon={<CheckCircle />}
          title="Acceptance Rate"
          value={loading ? '...' : stats.accRate}
          trend="+Acc"
          trendUp={true}
          delay={0.3}
        />
        <StatCard 
          icon={<Clock />}
          title="Avg. Execution Time"
          value={loading ? '...' : stats.avgTime}
          trend="-Opt"
          trendUp={false}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="col-span-1 lg:col-span-2 glass-panel p-6 min-h-[400px]"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold">Submission Activity</h3>
              <p className="text-sm text-text-muted">{history.length > 0 ? 'Recent activity trends' : 'Start solving problems to see activity'}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-neon-green"></span>
                <span className="text-text-secondary">Submissions</span>
              </div>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="w-full h-[280px] border-b border-l border-white/10 relative mt-4">
             {loading ? (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm border border-dashed border-white/5 rounded-lg">
                  Loading activity data...
                </div>
             ) : history.length === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm border border-dashed border-white/5 rounded-lg">
                 Waiting for submission data...
               </div>
             ) : (
               <>
                 <div className="absolute -left-12 flex flex-col justify-between h-full text-xs text-text-muted pb-2">
                   <span>{chartData?.max}</span>
                   <span></span>
                   <span>{chartData?.avg}</span>
                   <span></span>
                   <span>0</span>
                 </div>
                 
                 <div className="absolute -bottom-8 w-full flex justify-between text-xs text-text-muted px-4">
                   { [6, 5, 4, 3, 2, 1, 0].map(d => (
                     <span key={d}>{
                       new Date(new Date().setDate(new Date().getDate() - d)).toLocaleString('en-US', { weekday: 'short' })
                     }</span>
                   ))}
                 </div>

                 <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 280">
                   <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    d={chartData?.path} 
                    stroke="var(--color-neon-green)" 
                    strokeWidth="3" 
                    fill="none" 
                    className="drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]" 
                   />
                   <path d={chartData?.fillPath} fill="url(#gradient-green-dash)" opacity="0.1" />
                   <defs>
                     <linearGradient id="gradient-green-dash" x1="0" x2="0" y1="0" y2="1">
                       <stop offset="0%" stopColor="var(--color-neon-green)" stopOpacity="1" />
                       <stop offset="100%" stopColor="var(--color-neon-green)" stopOpacity="0" />
                     </linearGradient>
                   </defs>
                 </svg>
               </>
             )}
          </div>
        </motion.div>

        {/* Sidebar Widgets */}
        <div className="space-y-6 lg:col-span-1">
          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass-panel p-6"
          >
            <h3 className="text-lg font-bold mb-6">Recent Submissions</h3>
            <div className="space-y-6">
              {loading ? (
                <div className="text-sm text-center py-4 text-neon-green/80 animate-pulse">Loading execution records...</div>
              ) : history.length === 0 ? (
                <div className="text-sm text-center py-4 text-text-muted border border-white/5 border-dashed rounded-lg">No programming submissions found.</div>
              ) : (
                history.slice(0, 5).map((activity, i) => {
                  const isAccepted = activity.status === 'Accepted';
                  return (
                    <div key={i} className="flex gap-4 items-start">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ${isAccepted ? 'bg-neon-green shadow-[0_0_8px_var(--color-neon-green)]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-white">{activity.languageId === 63 ? 'JavaScript' : 'Code'} Submit</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-white/10 ${isAccepted ? 'text-neon-green bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{activity.status}</span>
                          <span className="text-xs text-text-muted">{new Date(activity.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Server Health */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="glass-panel p-6 bg-gradient-to-br from-dark-surface/80 to-neon-green/5"
          >
            <h3 className="text-lg font-bold mb-4">Judge Server Health</h3>
            
            <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-neon-green/10 border border-neon-green/20">
              <div className="w-3 h-3 rounded-full bg-neon-green animate-pulse shadow-[0_0_8px_rgba(0,255,157,0.8)]"></div>
              <span className="text-sm font-medium text-neon-green">All systems operational</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Uptime</span>
                <span className="font-mono text-white">99.98%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Queue Size</span>
                <span className="font-mono text-white">0 jobs</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Worker Nodes</span>
                <span className="font-mono text-white">4 active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Stats
const StatCard = ({ icon, title, value, trend, trendUp, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-panel p-6 hover:-translate-y-1 transition-transform duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="text-text-muted">{icon}</div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-dark-bg ${trendUp ? 'text-neon-green' : 'text-red-400'}`}>
        {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trend}
      </div>
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm text-text-secondary font-medium">{title}</div>
  </motion.div>
);

export default DashboardPage;
