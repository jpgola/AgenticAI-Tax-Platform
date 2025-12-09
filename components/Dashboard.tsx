import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, FileText, DollarSign, Clock, ArrowRight, Shield, AlertCircle, Info, X, ShieldAlert, Check, Bot, CheckCheck, Download, ClipboardList, PlayCircle, ShieldCheck, Archive, Lightbulb, ChevronDown, ChevronUp, HelpCircle, Loader2, UserCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AgentVisualizer from './AgentVisualizer';
import { AgentType, AgentStatus, DeductionItem, TaxDocument, RiskItem } from '../types';

interface DashboardProps {
  onAskAdvisor: (question: string) => void;
  onContextUpdate?: (context: { deductions: DeductionItem[]; risks: RiskItem[] }) => void;
}

interface AuditLogItem {
  timestamp: Date;
  message: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onAskAdvisor, onContextUpdate }) => {
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [logs, setLogs] = useState<string[]>([]); // For visualizer (newest first)
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]); // For audit trail (oldest first)
  const [step, setStep] = useState(1); // 1: Intake, 2: Processing, 3: Review, 4: Filing
  const [documents, setDocuments] = useState<TaxDocument[]>([]);
  const [deductions, setDeductions] = useState<DeductionItem[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [showUploadGuide, setShowUploadGuide] = useState(true);
  const [filingComplete, setFilingComplete] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showCPAModal, setShowCPAModal] = useState(false);
  const [filingProgress, setFilingProgress] = useState(0);
  const [expandedDeductionId, setExpandedDeductionId] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Tax Tips Data
  const taxTips = [
    "Freelancers can often deduct a portion of their home internet bill if used for business.",
    "You can deduct up to $2,500 of student loan interest paid during the year, even if you don't itemize.",
    "Contributing to a traditional IRA or 401(k) directly reduces your taxable income for the year.",
    "Don't forget charitable donations! Keep receipts for cash and goods donated to qualified non-profits.",
    "The 'Saver's Credit' offers a tax break for low-to-moderate income earners saving for retirement.",
    "Medical expenses are deductible only if they exceed 7.5% of your adjusted gross income."
  ];

  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % taxTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Sync context to parent App for Chat Advisor awareness
  useEffect(() => {
    if (onContextUpdate) {
      onContextUpdate({ deductions, risks });
    }
  }, [deductions, risks, onContextUpdate]);

  // Mock Data for Charts
  const data = [
    { name: 'Standard', amount: 13850, type: 'standard' },
    { name: 'AgenticAI Found', amount: 18240, type: 'ai' },
  ];

  const addLog = (msg: string) => {
      setLogs(prev => [msg, ...prev]);
      setAuditLogs(prev => [...prev, { timestamp: new Date(), message: msg }]);
  };

  const toggleDeduction = (id: string) => {
    if (expandedDeductionId === id) {
        setExpandedDeductionId(null);
    } else {
        setExpandedDeductionId(id);
    }
  };

  const handleExportCSV = () => {
    if (deductions.length === 0) return;

    const headers = ['Category', 'Amount', 'Description', 'Confidence', 'Source'];
    const rows = deductions.map(d => [
      d.category,
      d.amount.toString(),
      `"${d.description.replace(/"/g, '""')}"`,
      `${(d.confidence * 100).toFixed(0)}%`,
      d.sourceDocId || 'System'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'tax_deductions_2024.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRunDemo = () => {
    // Populate Audit Logs
    const demoLogs = [
        "Intake Agent: Detected 1099-NEC from 'TechStream Inc'.",
        "Extraction Agent: OCR Parsing successful. Income: $48,500.",
        "Memory Agent: Retrieved previous year return (Schedule C).",
        "Advisor Agent: Cross-referenced bank feed 'Chase Business'.",
        "Advisor Agent: Identified Home Office deduction based on address match.",
        "Advisor Agent: Flagged high Travel expenses for review.",
        "Validation Agent: TIN matched against IRS database."
    ];
    
    setLogs(demoLogs);
    setAuditLogs(demoLogs.map(msg => ({ timestamp: new Date(), message: msg })));

    // Populate Documents
    setDocuments([{
        id: 'demo-doc-1',
        name: '1099-NEC_TechStream.pdf',
        type: '1099-NEC',
        status: 'verified',
        confidenceScore: 0.99,
        uploadDate: new Date().toLocaleDateString()
    }]);

    // Populate Deductions
    setDeductions([
        { 
          id: 'd1', 
          category: 'Home Office', 
          amount: 1450, 
          description: 'Simplified method (300 sq ft)', 
          confidence: 0.95,
          explanation: 'Your address has remained consistent, and you are a 1099 contractor. The simplified method is low-risk.',
          sourceDocId: 'FORM-8829-REF'
        },
        { 
          id: 'd2', 
          category: 'Equipment', 
          amount: 2899, 
          description: 'MacBook Pro 16" & Peripherals', 
          confidence: 0.98,
          explanation: 'Found purchase in "Best Buy" transaction log on Dec 12th. Fully deductible as business equipment.',
          sourceDocId: 'BANK-TX-992'
        },
        { 
          id: 'd3', 
          category: 'Travel', 
          amount: 3200, 
          description: 'Flight/Hotel for TechConf 2024', 
          confidence: 0.85,
          explanation: 'Transactions match conference dates. Ensure you keep the conference agenda as proof of business intent.',
          sourceDocId: 'CC-STMT-JAN'
        }
    ]);

    // Populate Risks
    setRisks([
        {
          id: 'r1',
          category: 'High Travel Expenses',
          severity: 'medium',
          description: 'Travel expenses are 7% of gross income.',
          mitigation: 'I have linked these expenses to the "TechConf 2024" calendar entry found in your metadata.'
        }
    ]);

    setAgentStatus(AgentStatus.SUCCESS);
    setStep(3); // Jump to review
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep(2);
    setLogs([]); // Clear visualizer logs
    setAuditLogs([]); // Clear audit logs for new session

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

      // Update document status to verified
      setDocuments(prev => prev.map(d => d.name === file.name ? { ...d, status: 'verified', confidenceScore: 0.99 } : d));
      
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
          explanation: 'Since you uploaded a 1099-NEC (Freelance), and your address history matches, you likely qualify for the simplified home office deduction.',
          sourceDocId: 'OCR-DOC-1'
        },
        { 
          id: '2', 
          category: 'Software Subs', 
          amount: 450, 
          description: 'Adobe Creative Cloud & Hosting', 
          confidence: 0.98,
          explanation: 'Recurring payments to "Adobe" found in connected bank statement linked to your freelance activity.',
          sourceDocId: 'LINKED-BANK-A'
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

  const handleApproveAndFile = () => {
    setStep(4);
    setLogs([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const runFiling = async () => {
        setFilingProgress(0);
        setActiveAgent(AgentType.FILING);
        setAgentStatus(AgentStatus.WORKING);
        
        // Granular Step 1: Validating Data
        addLog("Filing Agent: Validating Data...");
        await new Promise(r => setTimeout(r, 800));
        addLog("Filing Agent: Cross-referencing deductions against tax code...");
        setFilingProgress(15);
        await new Promise(r => setTimeout(r, 800));
        addLog("Filing Agent: Verifying SSN and TIN accuracy...");
        setFilingProgress(30);
        await new Promise(r => setTimeout(r, 800));
        
        // Granular Step 2: Packaging Return
        addLog("Filing Agent: Packaging Return...");
        setFilingProgress(45);
        await new Promise(r => setTimeout(r, 1000));
        addLog("Filing Agent: Compiling Form 1040 and schedules into submission packet...");
        setFilingProgress(60);
        await new Promise(r => setTimeout(r, 800));
        addLog("Filing Agent: Applying digital signature...");
        setFilingProgress(70);
        await new Promise(r => setTimeout(r, 800));
        
        // Granular Step 3: Archiving (Memory Agent)
        setActiveAgent(AgentType.MEMORY);
        addLog("Memory Agent: Archiving documents to secure vault...");
        setFilingProgress(75);
        await new Promise(r => setTimeout(r, 800));
        
        // Granular Step 4: Transmitting to IRS
        setActiveAgent(AgentType.FILING);
        addLog("Filing Agent: Transmitting to IRS...");
        setFilingProgress(85);
        await new Promise(r => setTimeout(r, 1200));
        addLog("Filing Agent: Handshaking with IRS E-File Gateway...");
        setFilingProgress(95);
        await new Promise(r => setTimeout(r, 1500));
        
        // Completion
        addLog("Filing Agent: Confirmation Received! Ref: 2024-X99-AGNT");
        setFilingProgress(100);
        
        setAgentStatus(AgentStatus.SUCCESS);
        setActiveAgent(null);
        setFilingComplete(true);
    };
    runFiling();
  };

  const handleRequestCPA = () => {
    setShowCPAModal(false);
    addLog("System: User requested CPA review. Handing off context to Partner Network...");
    setTimeout(() => {
        addLog("System: CPA Inquiry #9942 created. A professional will review within 24hrs.");
        onAskAdvisor("I've requested a CPA review for my return. What should I expect next?");
    }, 1000);
  };

  const handleDownload = () => {
    alert("Downloading tax_return_2024.pdf...");
  };

  const handleDownloadConfirmation = () => {
    alert("Downloading IRS_Confirmation_Receipt_2024-X99.pdf...");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: Main Workflow */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        
        {/* Progress Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">2024 Tax Return</h2>
                {auditLogs.length > 0 && (
                    <button 
                        onClick={() => setShowAuditModal(true)}
                        className="text-xs flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 px-2 py-1 rounded-md transition-colors shadow-sm"
                    >
                        <ClipboardList className="w-3.5 h-3.5" />
                        Audit Trail
                    </button>
                )}
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-semibold text-emerald-700">
                  Estimated Refund: <span className="font-bold">$2,840</span>
                </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full transition-all duration-1000 ease-out" 
              style={{ width: step === 1 ? '10%' : step === 2 ? '50%' : step === 3 ? '90%' : '100%' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500 font-medium">
            <span className={step >= 1 ? 'text-indigo-600' : ''}>Intake</span>
            <span className={step >= 2 ? 'text-indigo-600' : ''}>Processing</span>
            <span className={step >= 3 ? 'text-indigo-600' : ''}>Review</span>
            <span className={step >= 4 ? 'text-indigo-600' : ''}>File</span>
          </div>
        </div>

        {/* Dynamic Content Area */}
        {step === 1 && (
          <div className="space-y-4">
            {showUploadGuide && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 relative animate-in fade-in slide-in-from-top-2 shadow-sm">
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
                      Upload your <strong>W-2s, 1099-INTs, and receipts</strong> to let our agents auto-fill your return. This ensures 100% accuracy and helps identify every deduction you qualify for.
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
              <p className="text-slate-500 mt-2 max-w-md mx-auto mb-6">
                Drag and drop W-2s, 1099s, or receipts. The <strong>Intake Agent</strong> will automatically classify and extract data.
              </p>

              <button 
                type="button" 
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowTooltip(!showTooltip);
                }}
                className="relative z-10 inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-700 bg-white/50 px-3 py-1.5 rounded-full border border-indigo-100 hover:bg-indigo-50 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                What can I upload?
              </button>

              {showTooltip && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-white p-5 rounded-xl shadow-xl border border-slate-200 z-20 text-left animate-in zoom-in-95 duration-200 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltip(false);
                        }} 
                        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        Accepted Documents
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 mb-4 list-disc pl-4">
                        <li><strong>Income:</strong> W-2, 1099-NEC, 1099-INT</li>
                        <li><strong>Expenses:</strong> Receipts, Invoices, Bank Statements</li>
                        <li><strong>ID:</strong> Driver's License (for verification)</li>
                    </ul>
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <h5 className="text-xs font-bold text-emerald-800 uppercase mb-1">Why upload?</h5>
                        <p className="text-xs text-emerald-700 leading-relaxed">
                            Our AI agents extract data with 100% accuracy, finding hidden deductions that manual entry might miss.
                        </p>
                    </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-center">
                <button 
                  onClick={handleRunDemo}
                  className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium px-4 py-2 rounded-full hover:bg-white hover:shadow-sm"
                >
                    <PlayCircle className="w-4 h-4" />
                    Don't have a file? Load Demo Scenario
                </button>
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
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 hidden sm:inline">Auto-generated by Advisor Agent</span>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 px-2.5 py-1.5 rounded-md transition-colors shadow-sm"
                        title="Export to CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                    </button>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {deductions.map(deduction => (
                  <div 
                    key={deduction.id} 
                    className={`p-4 transition-all duration-200 cursor-pointer border-b border-slate-50 last:border-0 ${expandedDeductionId === deduction.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                    onClick={() => toggleDeduction(deduction.id)}
                  >
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
                          <div className="flex items-center gap-2">
                             <div className="font-medium text-slate-900">{deduction.category}</div>
                             {expandedDeductionId === deduction.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </div>
                          <div className="text-sm text-slate-500">{deduction.description}</div>
                          <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (expandedDeductionId !== deduction.id) {
                                    setExpandedDeductionId(deduction.id);
                                }
                            }}
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-100 transition-colors"
                          >
                            <Bot className="w-3 h-3" /> Explain
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold text-slate-900">${deduction.amount.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">{(deduction.confidence * 100).toFixed(0)}% Confidence</div>
                      </div>
                    </div>

                    {expandedDeductionId === deduction.id && (
                        <div className="mt-4 pt-3 border-t border-slate-200/50 animate-in slide-in-from-top-1">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Source</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                        <span className="text-xs font-medium text-slate-700 font-mono">{deduction.sourceDocId || 'System Generated'}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Confidence Logic</span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className={`h-full ${deduction.confidence > 0.9 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${deduction.confidence * 100}%`}}></div>
                                        </div>
                                        <span className="text-xs font-medium text-slate-700">AI Verified</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-indigo-50 rounded-lg p-3 text-sm text-indigo-900 border border-indigo-100 flex gap-3">
                                <Bot className="w-5 h-5 text-indigo-600 shrink-0" />
                                <div>
                                    <span className="font-semibold block mb-0.5 text-indigo-700">Agent Explanation</span>
                                    {deduction.explanation}
                                </div>
                            </div>

                            <button 
                                onClick={(e) => {
                                e.stopPropagation();
                                onAskAdvisor(`Regarding the ${deduction.category} deduction of $${deduction.amount.toLocaleString()} that was identified: "${deduction.explanation}". Could you provide a detailed explanation of the IRS criteria for this and what documentation is required?`)
                                }}
                                className="mt-3 text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium transition-colors w-fit ml-auto"
                            >
                                <Bot className="w-3 h-3" /> Ask Advisor for more details
                            </button>
                        </div>
                    )}
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
                 {risks.length === 0 ? (
                    <div className="text-center p-6 text-slate-500 text-sm flex flex-col items-center">
                      <ShieldCheck className="w-12 h-12 text-emerald-100 bg-emerald-50 p-2 rounded-full mb-3" />
                      <p>No significant audit risks detected by the Advisor Agent.</p>
                      <p className="text-xs text-slate-400 mt-1">Your return appears consistent with IRS guidelines.</p>
                    </div>
                 ) : (
                    risks.map(risk => (
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

                          <button 
                            onClick={() => onAskAdvisor(`I'm concerned about the '${risk.category}' risk. Can you explain why it was flagged and how to fix it?`)}
                            className="mt-3 text-xs flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          >
                            <Bot className="w-3 h-3" /> Discuss with Advisor
                          </button>
                        </div>
                      </div>
                   </div>
                 ))
                )}
                
                {/* CPA Call to Action */}
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                   <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full border border-slate-100 shadow-sm">
                         <UserCheck className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="text-sm">
                         <span className="block font-medium text-slate-900">Need professional assurance?</span>
                         <span className="text-slate-500 text-xs">Have a CPA review these risks before filing.</span>
                      </div>
                   </div>
                   <button 
                      onClick={() => setShowCPAModal(true)}
                      className="whitespace-nowrap bg-white text-slate-700 hover:text-indigo-600 border border-slate-300 hover:border-indigo-300 font-medium text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                   >
                      Consult with a CPA
                   </button>
                </div>
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
                 <button 
                   onClick={handleApproveAndFile}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                 >
                   Approve & File Return <ArrowRight className="w-4 h-4" />
                 </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[400px] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
             {!filingComplete ? (
                 <div className="w-full max-w-2xl">
                    <div className="mb-8 text-center">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Finalizing Your Return</h3>
                        <p className="text-slate-500 mb-6">The Filing Agent is preparing and transmitting your data.</p>
                        
                        {/* Progress Indicator */}
                        <div className="relative pt-1 mb-8 max-w-lg mx-auto">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-50">
                                Filing Progress
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-indigo-600">
                                {filingProgress}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-slate-100 border border-slate-200">
                            <div 
                                style={{ width: `${filingProgress}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-700 ease-out relative"
                            >
                                <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                            </div>
                          </div>
                          
                          {/* Active Action Display */}
                           <div className="h-6 flex items-center justify-center">
                                <span className="text-sm text-slate-600 font-medium flex items-center gap-2">
                                    {filingProgress < 100 && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                                    {logs.length > 0 && filingProgress < 100 
                                        ? (logs[0].includes(':') ? logs[0].split(':')[1].trim() : logs[0]) 
                                        : 'Initializing secure connection...'}
                                </span>
                           </div>
                        </div>

                    </div>
                    <AgentVisualizer activeAgent={activeAgent} status={agentStatus} logs={logs} />
                 </div>
             ) : (
                 <div className="max-w-md w-full space-y-6 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCheck className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Return Filed!</h2>
                        <p className="text-emerald-600 font-medium mt-2">Accepted by IRS</p>

                        <div className="mt-4 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 delay-300">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-700">
                              <Archive className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Securely archived by <strong>Memory Agent</strong></span>
                              <CheckCircle className="w-3 h-3 text-emerald-600 ml-1" />
                          </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-left space-y-4 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                             <span className="text-slate-500 text-sm font-medium">Federal Refund</span>
                             <span className="font-bold text-emerald-600 text-xl">$2,840.00</span>
                        </div>
                        <div className="space-y-3 pt-1">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Submission Date</span>
                                <span className="font-medium text-slate-900">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Submission Time</span>
                                <span className="font-medium text-slate-900">{new Date().toLocaleTimeString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Confirmation #</span>
                                <span className="font-mono font-medium text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs">2024-X99-AGNT</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <button 
                           onClick={handleDownloadConfirmation}
                           className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3.5 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 font-bold text-base"
                        >
                            <FileText className="w-5 h-5" /> Download Filing Confirmation
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-lg transition-colors font-medium shadow-sm"
                            >
                                <Download className="w-4 h-4" /> Return PDF
                            </button>
                            <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-lg transition-colors font-medium shadow-sm">
                                Dashboard
                            </button>
                        </div>
                    </div>
                 </div>
             )}
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
        {step !== 2 && step !== 4 && (
             <AgentVisualizer activeAgent={activeAgent} status={agentStatus} logs={logs} />
        )}
        
        {/* Allow seeing visualizer on side if step 4 is finished, for history context */}
        {step === 4 && filingComplete && (
            <AgentVisualizer activeAgent={null} status={AgentStatus.SUCCESS} logs={logs} />
        )}

        {/* Uploaded Docs List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 font-semibold text-slate-800">
            Document Vault
          </div>
          <div className="p-2 space-y-1">
            {documents.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-400">No documents yet</div>
            ) : (
                documents.map(doc => (
                    <div key={doc.id} className="group p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="shrink-0">
                             <FileText className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm font-medium text-slate-900 truncate pr-2">{doc.name}</span>
                                {doc.status === 'verified' && (
                                     <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                                <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">{doc.type}</span>
                                <span>{doc.uploadDate}</span>
                            </div>

                            {doc.status === 'verified' ? (
                                <div className="flex items-center gap-2 text-[10px] bg-emerald-50/50 p-1.5 rounded border border-emerald-100/50">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700 font-medium">Verified by Validation Agent</span>
                                    {doc.confidenceScore && (
                                        <span className="ml-auto text-emerald-600 font-mono font-bold">{(doc.confidenceScore * 100).toFixed(0)}%</span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
                                    Processing verification...
                                </div>
                            )}
                        </div>
                      </div>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Tax Tip of the Day */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl shadow-lg text-white p-5 relative overflow-hidden transition-all hover:shadow-xl">
            <div className="absolute -right-6 -top-6 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
            <div className="absolute -left-6 -bottom-6 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                    <Lightbulb className="w-4 h-4 text-yellow-300" />
                </div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-100">Tax Tip</h4>
            </div>
            
            <p key={currentTipIndex} className="text-sm font-medium leading-relaxed opacity-95 relative z-10 animate-in fade-in slide-in-from-right-2 duration-500">
                "{taxTips[currentTipIndex]}"
            </p>
        </div>

      </div>

      {/* Audit Trail Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                <div className="bg-indigo-100 p-2 rounded-lg">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">System Audit Trail</h3>
                    <p className="text-xs text-slate-500">Session ID: {documents[0]?.id || 'INIT-SESSION'}</p>
                </div>
                </div>
                <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                    <tr>
                    <th className="px-6 py-3 border-b border-slate-200">Time</th>
                    <th className="px-6 py-3 border-b border-slate-200">Agent</th>
                    <th className="px-6 py-3 border-b border-slate-200">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log, idx) => {
                    const parts = log.message.split(':');
                    const agent = parts.length > 1 ? parts[0] : 'System';
                    const action = parts.length > 1 ? parts.slice(1).join(':') : parts[0];
                    return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500 text-xs">
                            {log.timestamp.toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                            ${agent.includes('Intake') ? 'bg-blue-50 text-blue-700' : 
                                agent.includes('Extraction') ? 'bg-purple-50 text-purple-700' :
                                agent.includes('Advisor') ? 'bg-indigo-50 text-indigo-700' :
                                agent.includes('Validation') ? 'bg-amber-50 text-amber-700' :
                                agent.includes('Filing') ? 'bg-emerald-50 text-emerald-700' :
                                'bg-slate-100 text-slate-700'
                            }`}>
                            {agent}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                            {action}
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
                {auditLogs.length === 0 && <div className="p-8 text-center text-slate-500">No logs recorded yet.</div>}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                <button onClick={() => setShowAuditModal(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm hover:bg-slate-50 font-medium shadow-sm">
                Close
                </button>
            </div>
            </div>
        </div>
      )}

      {/* CPA Consultation Modal */}
      {showCPAModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
                <div className="bg-slate-50 p-6 border-b border-slate-200 text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-200 shadow-sm">
                         <UserCheck className="w-6 h-6 text-slate-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Connect with a Tax Professional</h3>
                    <p className="text-slate-500 text-sm mt-1">
                        Our AI has flagged potential risks. For complex situations, we recommend a human review.
                    </p>
                </div>
                
                <div className="p-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                        <h4 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Secure Data Handoff
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            By proceeding, you authorize AgenticAI to share your current return context (deductions, income, and flagged risks) with a certified partner from our CPA network.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={handleRequestCPA}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg transition-colors shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                        >
                            Request Human Review
                        </button>
                        <button 
                            onClick={() => setShowCPAModal(false)}
                            className="w-full bg-white text-slate-600 hover:bg-slate-50 font-medium py-3 rounded-lg transition-colors border border-slate-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default Dashboard;