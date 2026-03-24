import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send, Settings, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProblemData {
  title: string;
  description: string;
  difficulty: string;
  examples: Array<{ input: string; output: string; explanation: string }>;
}

const WorkspacePage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [code, setCode] = useState('// Write your solution here\n');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [languageId, setLanguageId] = useState(63);
  const [output, setOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';
        const res = await fetch(`${API_URL}/api/problems/${id}`);
        if (!res.ok) throw new Error('Problem not found');
        const data = await res.json();
        setProblem(data);
        
        // Default templates based on language
        let defaultCode = '';
        if (languageId === 63) defaultCode = `// Write your solution here\nfunction solution(nums, target) {\n    // your code\n}`;
        else if (languageId === 71) defaultCode = `# Write your solution here\ndef solution(nums, target):\n    pass`;
        else if (languageId === 50) defaultCode = `// C Solution\n#include <stdio.h>\n\n// Add your logic here`;
        else if (languageId === 54) defaultCode = `// C++ Solution\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Add your logic here\n};`;
        else if (languageId === 62) defaultCode = `// Java Solution\nimport java.util.*;\n\nclass Solution {\n    public void solution() {\n        // Add logic\n    }\n}`;
        
        setCode(defaultCode);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProblem();
  }, [id, languageId]);

  const handleRun = async () => {
    setIsExecuting(true);
    setOutput(null);
    try {
      const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/submissions/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageId: languageId,
          code,
          testCases: problem?.examples
        })
      });
      const data = await res.json();
      setOutput({ type: 'run', data: data.results });
    } catch (err: any) {
      setOutput({ type: 'error', message: 'Failed to run code' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!token) {
       setOutput({ type: 'error', message: 'You must log in to submit code!' });
       return;
    }
    setIsExecuting(true);
    setOutput(null);
    try {
      const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/submissions/submit`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          problemId: id,
          languageId: languageId,
          code
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOutput({ type: 'submit', data: data.submission });
    } catch (err: any) {
      setOutput({ type: 'error', message: err.message || 'Failed to submit code' });
    } finally {
      setIsExecuting(false);
    }
  };

  const decodeBase64 = (str: string) => {
      try { return atob(str); } catch(e) { return str; }
  };

  const getMonacoLang = (id: number) => {
    switch(id) {
      case 63: return "javascript";
      case 71: return "python";
      case 50: return "c";
      case 54: return "cpp";
      case 62: return "java";
      default: return "javascript";
    }
  };

  if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center text-neon-green"><div className="w-12 h-12 border-4 border-white/10 border-t-neon-green rounded-full animate-spin"></div></div>;
  if (error || !problem) return <div className="flex h-[calc(100vh-64px)] items-center justify-center text-red-500 font-bold">{error || 'Not Found'}</div>;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel - Problem Description */}
      <div className="w-1/2 flex flex-col border-r border-white/5 bg-dark-bg">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 bg-dark-surface/30">
          <BookOpen size={18} className="text-neon-green" />
          <h2 className="font-bold text-lg">{problem.title}</h2>
          <span className={`px-2 py-0.5 text-xs font-bold rounded ml-auto ${
            problem.difficulty === 'Easy' ? 'bg-green-500/10 text-neon-green' :
            problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
            'bg-red-500/10 text-red-500'
          }`}>
            {problem.difficulty}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-text-secondary">
          <div className="whitespace-pre-wrap mb-8 text-white/90 font-sans">
            {problem.description}
          </div>

          {problem.examples.map((ex, i) => (
            <div key={i} className="mb-6">
              <h3 className="font-bold text-white mb-2">Example {i + 1}:</h3>
              <div className="glass-panel p-4 font-mono text-xs text-white/80">
                <span className="text-neon-green/80 font-bold">Input:</span> {ex.input}<br/>
                <span className="text-neon-green/80 font-bold">Output:</span> {ex.output}<br/>
                {ex.explanation && (
                  <span className="text-text-muted mt-2 block"><span className="text-white/60 font-bold">Explanation:</span> {ex.explanation}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Code Editor & Console */}
      <div className="w-1/2 flex flex-col bg-[#1e1e1e]">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-dark-surface/50 border-b border-black/50">
          <div className="flex items-center gap-2">
            <select value={languageId} onChange={(e) => setLanguageId(Number(e.target.value))} className="bg-dark-bg border border-white/10 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-neon-green/50">
              <option value="63">JavaScript (Node.js)</option>
              <option value="71">Python (3.8.1)</option>
              <option value="50">C (GCC 9.2.0)</option>
              <option value="54">C++ (GCC 9.2.0)</option>
              <option value="62">Java (OpenJDK 13.0.1)</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-1.5 text-text-muted hover:text-white transition-colors">
              <Settings size={16} />
            </button>
            <button onClick={handleRun} disabled={isExecuting} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50">
              <Play size={14} /> Run Code
            </button>
            <button onClick={handleSubmitCode} disabled={isExecuting} className="flex items-center gap-2 bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green hover:text-dark-bg px-4 py-1.5 rounded text-sm font-bold transition-all shadow-[0_0_10px_rgba(0,255,157,0.2)] disabled:opacity-50">
              <Send size={14} /> Submit
            </button>
          </div>
        </div>

        {/* Monaco Editor Component */}
        <div className="flex-1 border-b border-black/50 relative">
          <Editor
            height="100%"
            language={getMonacoLang(languageId)}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'ui-monospace, Consolas, monospace',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
            }}
          />
        </div>

        {/* Console / Test Results */}
        <div className="h-48 bg-dark-surface p-4 overflow-y-auto">
          <div className="flex items-center gap-4 border-b border-white/10 pb-2 mb-4">
            <button className="text-sm font-bold text-white border-b-2 border-neon-green pb-2 -mb-[9px]">Console Output</button>
          </div>
          
          {isExecuting ? (
             <div className="text-neon-green animate-pulse text-sm font-mono">Executing code on Judge0 cluster...</div>
          ) : output?.type === 'error' ? (
             <div className="text-red-500 text-sm font-bold">{output.message}</div>
          ) : output?.type === 'submit' ? (
             <div className="bg-dark-bg p-4 rounded border border-white/5">
                <div className={`text-xl font-bold mb-2 ${output.data.status === 'Accepted' ? 'text-neon-green drop-shadow-[0_0_5px_rgba(0,255,157,0.5)]' : 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]'}`}>
                    {output.data.status}
                </div>
                <div className="flex gap-6 mt-4 text-sm font-mono text-text-muted">
                    <div className="flex flex-col"><span className="text-white/50 text-xs mb-1">Time Elapsed</span><span className="text-white">{output.data.executionTime || 0}s</span></div>
                    <div className="flex flex-col"><span className="text-white/50 text-xs mb-1">Memory Usage</span><span className="text-white">{output.data.memory || 0} KB</span></div>
                    <div className="flex flex-col"><span className="text-white/50 text-xs mb-1">Language</span><span className="text-white">{
                        languageId === 63 ? 'JavaScript' : 
                        languageId === 71 ? 'Python' : 
                        languageId === 62 ? 'Java' : 
                        languageId === 54 ? 'C++' : 'C'
                    }</span></div>
                </div>
             </div>
          ) : output?.type === 'run' ? (
             <div className="space-y-4">
                {output.data.map((res: any, idx: number) => (
                    <div key={idx} className="bg-dark-bg p-3 rounded border border-white/5">
                        <div className={`text-xs font-bold mb-2 ${res.status?.id === 3 ? 'text-neon-green' : 'text-red-500'}`}>
                            Test Case {idx + 1}: {res.status?.description}
                        </div>
                        {res.stdout && <div className="text-xs font-mono text-white/80 mb-1"><span className="text-white/50">Stdout:</span> {decodeBase64(res.stdout)}</div>}
                        {res.stderr && <div className="text-xs font-mono text-red-400 mb-1"><span className="text-white/50">Stderr:</span> {decodeBase64(res.stderr)}</div>}
                        {res.compile_output && <div className="text-xs font-mono text-yellow-400 mb-1"><span className="text-white/50">Compile Err:</span> {decodeBase64(res.compile_output)}</div>}
                        {res.message && <div className="text-xs font-mono text-yellow-400 mb-1"><span className="text-white/50">Msg:</span> {decodeBase64(res.message)}</div>}
                    </div>
                ))}
             </div>
          ) : (
             <div className="text-sm border border-dashed border-white/10 rounded-lg p-6 text-center text-text-muted">
                 Write your solution and click <strong>Run Code</strong> to test against sample cases, or <strong>Submit</strong> to evaluate hidden cases.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspacePage;
