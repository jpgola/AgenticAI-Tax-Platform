import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('demo@agentic.ai');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      if (email && password) {
        if (password.length < 6) {
             setError('Password must be at least 6 characters');
             setIsLoading(false);
             return;
        }
        onLogin(email);
      } else {
        setError('Please fill in all fields');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-8 bg-slate-900 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/10 z-0"></div>
            <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center font-bold text-white text-2xl mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                    AI
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">AgenticAI</h1>
                <p className="text-slate-400 mt-2 text-sm">Autonomous Tax Filing Platform</p>
            </div>
        </div>
        
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input 
                            type="email" 
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input 
                            type="password" 
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
                        <ShieldCheck className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Authenticating...
                        </>
                    ) : (
                        <>
                            Sign In <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                    Protected by Enterprise-Grade Security
                </p>
                <div className="flex justify-center gap-4 mt-2">
                     <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">SOC2 Compliant</span>
                     <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">256-bit Encryption</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;