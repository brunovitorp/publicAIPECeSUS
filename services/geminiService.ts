import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedFormSchema } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Chatbot Service (Proposal C) ---

export const createChatSession = () => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `Você é um Assistente Virtual Especialista em Protocolos Clínicos do Ministério da Saúde do Brasil (APS/e-SUS).
      
      Diretrizes de resposta:
      1. SEJA CONCISO. Evite textos longos. O médico tem pouco tempo.
      2. Use tópicos (bullet points) sempre que possível para facilitar a leitura rápida.
      3. Baseie-se em evidências e manuais oficiais (CAB).
      4. Se a pergunta for sobre MTC/Acupuntura, dê a localização exata e função sucinta.
      
      Formatação: Use negrito (**texto**) apenas para destacar palavras-chave essenciais.`,
    },
  });
};

// --- Form Builder Service (Proposal D) ---

export const generateFormFromDocument = async (
  fileData: string, 
  mimeType: string,
  additionalContext: string
): Promise<GeneratedFormSchema> => {
  const ai = getClient();

  // Define the schema for the JSON output
  const formSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      formTitle: { type: Type.STRING, description: "The title of the clinical form" },
      description: { type: Type.STRING, description: "Brief description of the form's purpose" },
      fields: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique snake_case identifier" },
            label: { type: Type.STRING, description: "Human readable label" },
            type: { 
              type: Type.STRING, 
              enum: ['text', 'number', 'date', 'select', 'checkbox', 'textarea'],
              description: "HTML input type. Prefer 'select' or 'checkbox' over 'text' whenever strict options exist."
            },
            required: { type: Type.BOOLEAN },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Options if type is select. Must be populated if type is select."
            },
            placeholder: { type: Type.STRING },
            validationRule: { type: Type.STRING, description: "Logic for validation (e.g., 'Must be > 0')" }
          },
          required: ["id", "label", "type", "required"]
        }
      }
    },
    required: ["formTitle", "fields"]
  };

  const prompt = `Analise este documento clínico e transforme-o em um formulário eletrônico estruturado para o e-SUS APS.
  
  DIRETRIZES ESTRITAS:
  1. Priorize DADOS ESTRUTURADOS. Se um campo tem opções limitadas (ex: Sim/Não, Lados, Intensidade 1-10), use 'select' ou 'checkbox', NÃO use 'text'.
  2. Crie listas de 'options' completas para todos os campos do tipo 'select'.
  3. Evite campos de texto livre ('textarea') a menos que seja estritamente necessário para observações.
  4. O objetivo é padronização de dados para análise futura.
  
  Contexto adicional do usuário: ${additionalContext || "Nenhum contexto adicional."}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: fileData } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: formSchema,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedFormSchema;
    } else {
      throw new Error("No response text generated");
    }
  } catch (error) {
    console.error("Error generating form:", error);
    throw error;
  }
};