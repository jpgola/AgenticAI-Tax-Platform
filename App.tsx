import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, HelpCircle, Bell, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AdvisorChat from './components/AdvisorChat';
import { ChatMessage, DeductionItem, RiskItem } from './types';
import { sendMessageToGemini } from './services/geminiService';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Hello! I am your AgenticAI Tax Advisor. I can help you find deductions, explain tax rules, or guide you through the filing process. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // State to hold tax context from Dashboard
  const [taxContext, setTaxContext] = useState<{deductions: DeductionItem[], risks: RiskItem[]} | null>(null);

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
        // Prepare the message for the AI. If specific phrasing is detected, inject context.
        let apiMessage = text;
        const lowerText = text.toLowerCase();
        
        if (taxContext && (lowerText.includes('explain my entire return') || lowerText.includes('walk me through my return'))) {
             apiMessage = `
             [SYSTEM NOTE: The user is asking for a comprehensive summary. Here is the active tax context from the dashboard agents:
             Deductions Found: ${JSON.stringify(taxContext.deductions)}
             Risks Identified: ${JSON.stringify(taxContext.risks)}
             
             Please provide a structured, friendly summary of their return status, highlighting the key deductions found and any risks they should be aware of. Use the data provided above.]
             
             ${text}
             `;
        }

        const responseText = await sendMessageToGemini(chatMessages, apiMessage);
        const modelMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: responseText,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, modelMsg]);
    } catch (error) {
        console.error("Chat Error:", error);
    } finally {
        setIsTyping(false);
    }
  };

  const handleAskAdvisor = (question: string) => {
      setIsChatOpen(true);
      handleSendMessage(question);
  };
  
  const handleContextUpdate = (context: { deductions: DeductionItem[]; risks: RiskItem[] }) => {
      setTaxContext(context);
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
        
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white">AI</div>
              <span className="font-bold text-xl tracking-tight">AgenticAI</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">Tax Filing Platform</div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavItem icon={<LayoutDashboard />} label="Dashboard" active />
            <NavItem icon={<FileText />} label="Documents" />
            <NavItem icon={<Settings />} label="Settings" />
          </nav>

          <div className="p-4 border-t border-slate-800">
             <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full p-2 rounded-lg hover:bg-slate-800">
                <HelpCircle className="w-5 h-5" />
                Help & Support
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Bar */}
          <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4 md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600">
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
              <span className="font-bold text-lg">AgenticAI</span>
            </div>
            
            <div className="hidden md:block text-sm text-slate-500">
              Welcome back, <span className="font-semibold text-slate-900">John Doe</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs border border-indigo-200">
                JD
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <Dashboard onAskAdvisor={handleAskAdvisor} onContextUpdate={handleContextUpdate} />
          </main>
        </div>

        {/* Floating Chat Trigger */}
        <div className="fixed bottom-6 right-6 z-40">
           {!isChatOpen && (
             <button 
               onClick={() => setIsChatOpen(true)}
               className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2 font-medium"
             >
               <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
               Ask Advisor
             </button>
           )}
        </div>

        {/* Chat Widget */}
        <AdvisorChat 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
        />

      </div>
    </HashRouter>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <button className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-medium transition-colors ${
    active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
  }`}>
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
    {label}
  </button>
);

export default App;