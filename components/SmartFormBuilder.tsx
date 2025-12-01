import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, ArrowRight, Code, Layout, Loader2, AlertTriangle, Play, Save, History, Trash2 } from 'lucide-react';
import { GeneratedFormSchema, FileUpload } from '../types';
import { generateFormFromDocument } from '../services/geminiService';

const SmartFormBuilder: React.FC = () => {
  const [file, setFile] = useState<FileUpload | null>(null);
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<GeneratedFormSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
  const [savedForms, setSavedForms] = useState<GeneratedFormSchema[]>([]);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError("O arquivo é muito grande. O limite máximo é 10MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = base64String.split(',')[1];
        
        setFile({
          name: selectedFile.name,
          mimeType: selectedFile.type,
          data: base64Data
        });
        setError(null);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedForm(null);

    try {
      const result = await generateFormFromDocument(file.data, file.mimeType, context);
      setGeneratedForm(result);
    } catch (err) {
      setError("Falha ao gerar o formulário. Verifique se o documento é válido ou tente novamente.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveForm = () => {
    if (generatedForm) {
      setSavedForms(prev => [...prev, generatedForm]);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 3000);
    }
  };

  const loadSavedForm = (form: GeneratedFormSchema) => {
    setGeneratedForm(form);
    setFile(null); // Clear file input as we are loading from library
    setError(null);
  };

  const deleteSavedForm = (index: number) => {
    setSavedForms(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-purple-600" />
            Construtor Inteligente de Fichas (PEC)
          </h2>
          <p className="text-slate-500 mt-1">
            Transforme PDFs de protocolos em formulários estruturados e reutilizáveis para o e-SUS.
          </p>
        </div>
        {savedForms.length > 0 && (
          <div className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            {savedForms.length} Modelos Salvos
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
        
        {/* Left Column: Input & Library */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 min-h-0 overflow-y-auto pr-1">
          
          {/* Upload Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
            <h3 className="font-semibold text-slate-700 mb-4">1. Novo Modelo</h3>
            
            <div className="space-y-4">
              {/* File Upload Area */}
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${file ? 'border-purple-200 bg-purple-50' : 'border-slate-300 hover:border-purple-400'}`}>
                <input 
                  type="file" 
                  id="pdf-upload" 
                  accept="application/pdf,image/png,image/jpeg" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                
                {!file ? (
                  <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                      <Upload size={24} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Upload Protocolo</span>
                    <span className="text-xs text-slate-400">PDF, PNG ou JPG (Max 10MB)</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between bg-white p-3 rounded border border-purple-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="text-purple-600 flex-shrink-0" size={20} />
                      <div className="text-left overflow-hidden">
                        <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">Pronto</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-slate-400 hover:text-red-500 ml-2"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Instruções para IA</label>
                <textarea 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  rows={2}
                  placeholder="Ex: Crie selects para os sintomas..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={!file || isGenerating}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                  !file || isGenerating 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play size={20} />
                    Gerar Estrutura
                  </>
                )}
              </button>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Saved Templates Library */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <History size={18} />
              Biblioteca de Modelos
            </h3>
            
            {savedForms.length === 0 ? (
              <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <p className="text-sm">Nenhum modelo salvo.</p>
                <p className="text-xs mt-1">Gere e salve fichas para reutilizar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedForms.map((form, index) => (
                  <div key={index} className="group p-3 border border-slate-200 hover:border-purple-300 rounded-lg bg-slate-50 hover:bg-white transition-all cursor-pointer relative" onClick={() => loadSavedForm(form)}>
                    <h4 className="font-medium text-slate-800 text-sm truncate pr-6">{form.formTitle}</h4>
                    <p className="text-xs text-slate-500 mt-1">{form.fields.length} campos estruturados</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSavedForm(index); }}
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Arrow for Desktop */}
        <div className="hidden lg:flex flex-col justify-center text-slate-300">
          <ArrowRight size={32} />
        </div>

        {/* Output Column */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 min-h-0">
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden relative">
             
             {/* Toast Notification */}
             {showSavedToast && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 text-sm animate-fadeIn">
                 <CheckCircle size={16} />
                 Modelo salvo na biblioteca!
               </div>
             )}

             <div className="border-b border-slate-200 p-4 flex justify-between items-center bg-slate-50">
               <h3 className="font-semibold text-slate-700">2. Pré-visualização e Validação</h3>
               <div className="flex gap-2 bg-slate-200 p-1 rounded-lg">
                 <button 
                   onClick={() => setActiveTab('preview')}
                   className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${activeTab === 'preview' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <Layout size={14} /> Visual
                 </button>
                 <button 
                   onClick={() => setActiveTab('json')}
                   className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${activeTab === 'json' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   <Code size={14} /> JSON
                 </button>
               </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
               {!generatedForm ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   {isGenerating ? (
                     <div className="text-center">
                       <Loader2 size={48} className="animate-spin text-purple-200 mx-auto mb-4" />
                       <p className="text-slate-500 font-medium">Lendo protocolo clínico...</p>
                       <p className="text-slate-400 text-sm mt-1">Identificando campos e validações</p>
                     </div>
                   ) : (
                     <div className="text-center">
                       <Layout size={48} className="mx-auto mb-4 opacity-20" />
                       <p>O formulário gerado aparecerá aqui.</p>
                     </div>
                   )}
                 </div>
               ) : (
                 <>
                   {activeTab === 'preview' ? (
                     <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                       <div className="mb-8 border-b border-slate-100 pb-4">
                         <div className="flex justify-between items-start">
                            <h1 className="text-2xl font-bold text-slate-800">{generatedForm.formTitle}</h1>
                            <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                e-SUS APS
                            </div>
                         </div>
                         <p className="text-slate-500 mt-2">{generatedForm.description}</p>
                       </div>

                       <div className="space-y-6">
                         {generatedForm.fields.map((field) => (
                           <div key={field.id} className="grid gap-2 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                             <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                               {field.label}
                               {field.required && <span className="text-red-500" title="Obrigatório">*</span>}
                             </label>
                             
                             {field.type === 'text' && (
                               <input type="text" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder={field.placeholder} />
                             )}
                             
                             {field.type === 'number' && (
                               <input type="number" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm" placeholder={field.placeholder} />
                             )}

                             {field.type === 'date' && (
                               <input type="date" className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm text-slate-600" />
                             )}

                             {field.type === 'textarea' && (
                               <textarea className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none text-sm" rows={3} placeholder={field.placeholder} />
                             )}

                             {field.type === 'select' && (
                               <select className="w-full p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm">
                                 <option value="">Selecione uma opção...</option>
                                 {field.options?.map(opt => (
                                   <option key={opt} value={opt}>{opt}</option>
                                 ))}
                               </select>
                             )}
                             
                             {field.type === 'checkbox' && (
                                <div className="flex items-center gap-2 mt-1">
                                  <input type="checkbox" className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 cursor-pointer" />
                                  <span className="text-sm text-slate-600">{field.placeholder || "Confirmar"}</span>
                                </div>
                             )}

                             {field.validationRule && (
                               <div className="flex items-center gap-1 text-xs text-orange-400 mt-1">
                                  <AlertTriangle size={10} />
                                  <span>Regra: {field.validationRule}</span>
                               </div>
                             )}
                           </div>
                         ))}
                       </div>
                       
                       <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                         <button 
                            onClick={() => setGeneratedForm(null)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
                         >
                            Descartar
                         </button>
                         <button 
                            onClick={handleSaveForm}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                         >
                            <Save size={18} />
                            Salvar Modelo
                         </button>
                       </div>
                     </div>
                   ) : (
                     <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto h-full shadow-inner">
                       <pre className="text-xs text-green-400 font-mono">
                         {JSON.stringify(generatedForm, null, 2)}
                       </pre>
                     </div>
                   )}
                 </>
               )}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SmartFormBuilder;