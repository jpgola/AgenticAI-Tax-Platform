import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, FileText, DollarSign, Clock, ArrowRight, Shield, AlertCircle, Info, X, ShieldAlert, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AgentVisualizer from './AgentVisualizer';
import { AgentType, AgentStatus, DeductionItem, TaxDocument, RiskItem } from '../types';

const Dashboard: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [logs, setLogs] = useState<string[]>([]);
  const [step, setStep] = useState(1); // 1: Intake, 2: Processing, 3: Review
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [deductions, setDeductions] = useState<DeductionItem[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [showUploadGuide, setShowUploadGuide] = useState(true);

  // Mock Data for Charts
  const data = [
    { name: 'Standard', amount: 13850, type: 'standard' },
    { name: 'AgenticAI Found', amount: 18240, type: 'ai' },
  ];

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep(2);
    setLogs([]); // Clear logs for new process

    // Simulate Agentic Workflow
    const runWorkflow = async () => {
      // INTAKE AGENT
      setActiveAgent(AgentType.INTAKE);
      setAgentStatus(AgentStatus.WORKING);
      addLog(`Intake Agent: Detecting file type for ${file.name}...`);
      await new Promise(r => setTimeout(r, 1500));
      addLog("Intake Agent: Classified as 1099-NEC (Confidence: 99%)");
      setDocuments(prev => [...prev, {
        id: Date.now().toString(),
        name: file.name,
        type: '1099-NEC',
        status: 'uploaded',
        uploadDate: new Date().toLocaleDateString()
      }]);
      
      // EXTRACTION AGENT
      setActiveAgent(AgentType.EXTRACTION);
      addLog("Extraction Agent: OCR scanning document...");
      await new Promise(r => setTimeout(r, 1500));
      addLog("Extraction Agent: Extracted Payer: Acme Corp, Income: $12,500");
      addLog("Extraction Agent: Cross-referencing with Bank Statements (Memory Agent)...");
      
      // VALIDATION AGENT
      setActiveAgent(AgentType.VALIDATION);
      addLog("Validation Agent: Checking TIN match...");
      await new Promise(r => setTimeout(r, 1200));
      addLog("Validation Agent: No discrepancies found.");
      
      // ADVISOR AGENT (Deduction Discovery)
      setActiveAgent(AgentType.ADVISOR);
      addLog("Advisor Agent: Analyzing expense categories based on 1099-NEC...");
      await new Promise(r => setTimeout(r, 1500));
      addLog("Advisor Agent: Identified potential Home Office Deduction.");
      
      const newDeductions: DeductionItem[] = [
        { 
          id: '1', 
          category: 'Home Office', 
          amount: 1200, 
          description: 'Calculated based on square footage used for freelance work.', 
          confidence: 0.92,
          explanation: 'Since you uploaded a 1099-NEC (Freelance), and your address history matches, you likely qualify for the simplified home office deduction.'
        },
        { 
          id: '2', 
          category: 'Software Subs', 
          amount: 450, 
          description: 'Adobe Creative Cloud & Hosting', 
          confidence: 0.98,
          explanation: 'Recurring payments to "Adobe" found in connected bank statement linked to your freelance activity.'
        }
      ];
      setDeductions(newDeductions);
      addLog(`Advisor Agent: Found $1,650 in new deductions.`);

      // ADVISOR AGENT (Risk Analysis)
      addLog("Advisor Agent: Running Audit Risk algorithms...");
      await new Promise(r => setTimeout(r, 1000));
      const detectedRisks: RiskItem[] = [
        {
          id: 'r1',
          category: 'Home Office Deduction',
          severity: 'medium',
          description: 'The deduction is ~10% of total income, which is statistically significant.',
          mitigation: 'I have verified your address history matches the claim period, lowering the risk profile.'
        },
        {
          id: 'r2',
          category: 'Consistency Check',
          severity: 'low',
          description: 'Income matches 1099-NEC exactly.',
          mitigation: 'Perfect match. No under-reporting flags detected.'
        }
      ];
      setRisks(detectedRisks);
      addLog("Advisor Agent: Risk assessment complete. 2 items analyzed.");

      setAgentStatus(AgentStatus.SUCCESS);
      setActiveAgent(null);
      setStep(3);
    };

    runWorkflow();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Main Workflow */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        
        {/* Progress Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">2024 Tax Return</h2>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Estimated Refund: $2,840
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-1000 ease-out" 
              style={{ width: step === 1 ? '10%' : step === 2 ? '50%' : '90%' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
            <span className={step >= 1 ? 'text-indigo-600' : ''}>Intake</span>
            <span className={step >= 2 ? 'text-indigo-600' : ''}>Processing</span>
            <span className={step >= 3 ? 'text-indigo-600' : ''}>Review</span>
            <span>File</span>
          </div>
        </div>

        {/* Dynamic Content Area */}
        {step === 1 && (
          <div className="space-y-4">
            {showUploadGuide && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative animate-in fade-in slide-in-from-top-2">
                <button 
                  onClick={() => setShowUploadGuide(false)} 
                  className="absolute top-3 right-3 text-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Info className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-indigo-900 text-sm">Smart Document Intake</h4>
                    <p className="text-sm text-indigo-700 mt-1 max-w-lg">
                      Uploading documents allows our <strong>Intake & Extraction Agents</strong> to auto-fill your return with high accuracy, ensuring you get every deduction you deserve.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-indigo-700 border border-indigo-200 shadow-sm">
                           Supported: PDF, JPG, PNG
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-indigo-700 border border-indigo-200 shadow-sm">
                           W-2 • 1099-NEC • 1099-INT
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-indigo-700 border border-indigo-200 shadow-sm">
                           Receipts & Invoices
                        </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors relative group">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
              />
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Upload Tax Documents</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Drag and drop W-2s, 1099s, or receipts. The <strong>Intake Agent</strong> will automatically classify and extract data.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
              <AgentVisualizer activeAgent={activeAgent} status={agentStatus} logs={logs} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            
            {/* Deductions Review Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Deductions Review</h3>
                <span className="text-xs text-slate-500">Auto-generated by Advisor Agent</span>
              </div>
              <div className="divide-y divide-slate-100">
                {deductions.map(deduction => (
                  <div key={deduction.id} className="p-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {deduction.confidence > 0.9 ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{deduction.category}</div>
                          <div className="text-sm text-slate-500">{deduction.description}</div>
                          <div className="mt-2 text-xs bg-indigo-50 text-indigo-700 p-2 rounded border border-indigo-100 hidden group-hover:block animate-in fade-in">
                            <strong>Why?</strong> {deduction.explanation}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-slate-900">${deduction.amount.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">{(deduction.confidence * 100).toFixed(0)}% Confidence</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Risk Analysis Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">Audit Risk Analysis</h3>
              </div>
              <div className="p-4 grid gap-4">
                 {risks.map(risk => (
                   <div key={risk.id} className={`border rounded-lg p-4 ${risk.severity === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                           {risk.severity === 'medium' ? <AlertCircle className="w-5 h-5 text-amber-600" /> : <CheckCircle className="w-5 h-5 text-emerald-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                             <h4 className="text-sm font-semibold text-slate-900">{risk.category}</h4>
                             <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                               risk.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                             }`}>
                               {risk.severity === 'medium' ? 'Medium Risk' : 'Low Risk'}
                             </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{risk.description}</p>
                          
                          {/* Agent Mitigation Note */}
                          <div className="mt-3 flex gap-2 items-start text-xs bg-white/60 p-2 rounded border border-black/5">
                             <div className="shrink-0 pt-0.5"><Shield className="w-3 h-3 text-indigo-500" /></div>
                             <span className="text-slate-500"><strong className="text-indigo-600">Advisor Agent:</strong> {risk.mitigation}</span>
                          </div>
                        </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
            
            {/* ROI Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h4 className="font-semibold text-slate-800 mb-6">AgenticAI Optimization Impact</h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.type === 'ai' ? '#4f46e5' : '#94a3b8'} />
                            ))}
                        </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end pt-4">
                 <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform">
                   Approve & File Return <ArrowRight className="w-4 h-4" />
                 </button>
            </div>
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Metrics & Agent Status */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        
        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Clock className="w-4 h-4" /> Time Saved
            </div>
            <div className="text-2xl font-bold text-slate-900">4.5 hrs</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
              <Shield className="w-4 h-4" /> Automation
            </div>
            <div className="text-2xl font-bold text-emerald-600">85%</div>
          </div>
        </div>

        {/* Agent Visualizer (Persistent in Sidebar if not main view) */}
        {step !== 2 && (
             <AgentVisualizer activeAgent={activeAgent} status={agentStatus} logs={logs} />
        )}

        {/* Uploaded Docs List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-semibold text-slate-800">
            Document Vault
          </div>
          <div className="p-2">
            {documents.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-400">No documents yet</div>
            ) : (
                documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                        <FileText className="w-8 h-8 text-indigo-400 bg-indigo-50 p-1.5 rounded" />
                        <div className="overflow-hidden">
                            <div className="text-sm font-medium text-slate-900 truncate">{doc.name}</div>
                            <div className="text-xs text-slate-500">{doc.type} • {doc.uploadDate}</div>
                        </div>
                        <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                    </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;