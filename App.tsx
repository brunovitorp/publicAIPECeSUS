import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatAssistant from './components/ChatAssistant';
import SmartFormBuilder from './components/SmartFormBuilder';
import { AppMode } from './types';
import { BrainCircuit, FileStack, ArrowRight, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.DASHBOARD);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.CHATBOT:
        return (
          <div className="h-full flex flex-col animate-fadeIn">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Assistente Virtual de Protocolos</h1>
                <p className="text-slate-500">Consulte diretrizes e protocolos de MTC em tempo real.</p>
              </div>
              <button 
                onClick={() => setCurrentMode(AppMode.DASHBOARD)}
                className="text-sm text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1"
              >
                Voltar ao Início
              </button>
            </div>
            <div className="flex-1 min-h-0">
               <ChatAssistant />
            </div>
          </div>
        );
      case AppMode.FORM_BUILDER:
        return (
          <div className="h-full flex flex-col animate-fadeIn">
            <div className="mb-4 flex items-center justify-between">
               <div>
                 <h1 className="text-2xl font-bold text-slate-800">Construtor de Fichas</h1>
                 <p className="text-slate-500">Digitalize protocolos clínicos PDF em formulários e-SUS.</p>
               </div>
               <button 
                onClick={() => setCurrentMode(AppMode.DASHBOARD)}
                className="text-sm text-slate-500 hover:text-purple-600 font-medium flex items-center gap-1"
              >
                Voltar ao Início
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <SmartFormBuilder />
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex flex-col justify-center items-center animate-fadeIn pb-10">
            <header className="mb-12 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-4 border border-blue-100">
                <Sparkles size={16} />
                <span>Inteligência Artificial para APS</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
                e-SUS APS <span className="text-blue-600">AI Suite</span>
              </h1>
              <p className="text-slate-500 text-lg">
                Selecione uma ferramenta abaixo para otimizar seu fluxo de trabalho clínico e administrativo.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
              
              {/* Feature Card: Chatbot */}
              <div 
                onClick={() => setCurrentMode(AppMode.CHATBOT)}
                className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-slate-100 hover:border-blue-200 cursor-pointer transition-all duration-300 relative overflow-hidden transform hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-600 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500">
                   <BrainCircuit size={160} />
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                    <BrainCircuit size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">Assistente Virtual</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed flex-grow">
                    Especialista em Protocolos e MTC. Tire dúvidas clínicas, consulte doses e diretrizes do Ministério da Saúde instantaneamente.
                  </p>
                  
                  <div className="flex items-center gap-2 font-bold text-blue-600 group-hover:gap-3 transition-all">
                    Iniciar Conversa <ArrowRight size={20} />
                  </div>
                </div>
              </div>

              {/* Feature Card: Form Builder */}
              <div 
                onClick={() => setCurrentMode(AppMode.FORM_BUILDER)}
                className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-slate-100 hover:border-purple-200 cursor-pointer transition-all duration-300 relative overflow-hidden transform hover:-translate-y-1"
              >
                 <div className="absolute top-0 right-0 p-12 opacity-5 text-purple-600 transform translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-500">
                   <FileStack size={160} />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform duration-300">
                    <FileStack size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-purple-600 transition-colors">Construtor de Fichas</h3>
                  <p className="text-slate-500 mb-8 leading-relaxed flex-grow">
                    Carregue PDFs de protocolos clínicos e gere automaticamente formulários estruturados compatíveis com o PEC e-SUS.
                  </p>
                  
                  <div className="flex items-center gap-2 font-bold text-purple-600 group-hover:gap-3 transition-all">
                    Criar Nova Ficha <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </div>
            
            <p className="mt-12 text-slate-400 text-sm font-medium">
              Ambiente Seguro • Dados Protegidos • Em conformidade com LGPD
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar currentMode={currentMode} onModeChange={setCurrentMode} />
      <main className="flex-1 p-4 lg:p-6 overflow-hidden h-full relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;