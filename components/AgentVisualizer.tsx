import React from 'react';
import { AgentType, AgentStatus } from '../types';
import { Bot, FileText, CheckCircle, AlertTriangle, Loader2, Database, ShieldCheck, Send, Archive } from 'lucide-react';

interface AgentVisualizerProps {
  activeAgent: AgentType | null;
  status: AgentStatus;
  logs: string[];
}

const AgentVisualizer: React.FC<AgentVisualizerProps> = ({ activeAgent, status, logs }) => {
  
  const getIcon = (agent: AgentType) => {
    switch (agent) {
      case AgentType.INTAKE: return <FileText className="w-5 h-5" />;
      case AgentType.EXTRACTION: return <Database className="w-5 h-5" />;
      case AgentType.VALIDATION: return <ShieldCheck className="w-5 h-5" />;
      case AgentType.ADVISOR: return <Bot className="w-5 h-5" />;
      case AgentType.FILING: return <Send className="w-5 h-5" />;
      case AgentType.MEMORY: return <Archive className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          Agent Orchestration
        </h3>
        <span className="text-xs font-mono text-slate-500">v2.1.0</span>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[300px]">
        {/* Active Agent Status */}
        <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <div className={`p-2 rounded-full ${status === AgentStatus.WORKING ? 'animate-pulse bg-indigo-200' : 'bg-indigo-100'}`}>
            {activeAgent ? getIcon(activeAgent) : <Bot className="w-6 h-6 text-indigo-600" />}
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {status === AgentStatus.IDLE ? 'System Ready' : 'Active Process'}
            </div>
            <div className="text-sm font-medium text-slate-900">
              {activeAgent ? `${activeAgent} is ${status}...` : 'Waiting for input'}
            </div>
          </div>
          {status === AgentStatus.WORKING && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
        </div>

        {/* Live Logs */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-500 uppercase">Process Log</div>
          <div className="flex flex-col gap-2">
            {logs.length === 0 && <div className="text-sm text-slate-400 italic">No activity recorded yet.</div>}
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-slate-600 animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentVisualizer;