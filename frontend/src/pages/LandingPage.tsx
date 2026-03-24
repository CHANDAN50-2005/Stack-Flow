import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Database, Server, Code2, Globe, Lock, Activity, Zap, GitBranch } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative pt-32 pb-20 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-neon-green/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs text-text-secondary font-medium tracking-wide">Version 2.0 is now live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl"
          >
            Build modern apps<br />with <span className="text-neon-green">MERN Stack</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-text-secondary mb-10 max-w-2xl leading-relaxed"
          >
            A powerful full-stack development platform combining MongoDB,
            Express, React, and Node.js. Ship faster with our enterprise-grade toolkit.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link to="/auth" className="flex items-center justify-center gap-2 bg-neon-green text-dark-bg font-bold px-8 py-3 rounded-md hover:bg-neon-green/90 transition-colors shadow-[0_0_20px_rgba(0,255,157,0.3)]">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <button className="px-8 py-3 rounded-md border border-white/10 hover:bg-white/5 transition-colors font-medium">
              View Documentation
            </button>
          </motion.div>

          {/* Tech Stack Icons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-20 flex items-center justify-center gap-12 text-text-muted"
          >
            <div className="flex flex-col items-center gap-2 hover:text-neon-green transition-colors">
              <Database size={32} />
              <span className="text-sm font-medium">MongoDB</span>
            </div>
            <div className="flex flex-col items-center gap-2 hover:text-[#00FF9D] transition-colors">
              <Server size={32} />
              <span className="text-sm font-medium">Express</span>
            </div>
            <div className="flex flex-col items-center gap-2 hover:text-neon-green transition-colors">
              <Code2 size={32} />
              <span className="text-sm font-medium">React</span>
            </div>
            <div className="flex flex-col items-center gap-2 hover:text-[#00FF9D] transition-colors">
              <Globe size={32} />
              <span className="text-sm font-medium">Node.js</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Heading */}
      <section className="w-full py-20 border-t border-white/5 bg-dark-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">You need to ship fast</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Powerful features designed for modern full-stack development. Build, deploy, and scale with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-panel p-6 hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-neon-green/10 flex items-center justify-center mb-4 text-neon-green">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: <Database />,
    title: 'MongoDB Atlas',
    description: 'Flexible document database with powerful querying and indexing capabilities.'
  },
  {
    icon: <Lock />,
    title: 'Authentication',
    description: 'Secure user authentication with JWT, OAuth, and role-based access control.'
  },
  {
    icon: <Zap />,
    title: 'Edge Functions',
    description: 'Deploy serverless functions at the edge for ultra-low latency responses.'
  },
  {
    icon: <Activity />,
    title: 'Realtime Sync',
    description: 'Live data synchronization with WebSocket connections and push updates.'
  },
  {
    icon: <Globe />,
    title: 'API Gateway',
    description: 'Unified API gateway with rate limiting, caching, and request validation.'
  },
  {
    icon: <Server />,
    title: 'Analytics',
    description: 'Real-time analytics dashboard with customizable metrics and reports.'
  },
  {
    icon: <Code2 />,
    title: 'TypeScript First',
    description: 'Full TypeScript support with auto-generated types for your entire stack.'
  },
  {
    icon: <GitBranch />,
    title: 'Version Control',
    description: 'Integrated Git workflows with automatic deployments and rollbacks.'
  }
];

export default LandingPage;
