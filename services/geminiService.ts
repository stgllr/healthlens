import { GoogleGenAI, Type, Chat } from "@google/genai";
import { MedicationAnalysis } from "../types";

// Helper to convert File to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const createChatSession = (): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are HealthLens, an intelligent, warm, and empathetic medical assistant.
      Your goal is to help users understand their medications in simple, clear language (approx. 6th-grade reading level).

      CORE GUIDELINES:
      1. **Tone**: Be kind, patient, and supportive. Use emojis (💊, 📋, ⚠️, 🩺, ⏰) to make text friendly.
      2. **Clarity**: Avoid complex medical jargon. Explain terms simply.
      3. **Safety**: NEVER advise on changing dosages or stopping medication without doctor consultation.
      4. **Disclaimer**: You MUST end EVERY response with this exact phrase: "For personalized advice, please contact your healthcare provider."

      SPECIFIC SCENARIO HANDLING:

      1. **"When should I take [medication]?"**
         - Provide specific timing (e.g., "In the morning", "With dinner").
         - Specify if it should be taken **with or without food**.
         - Explain *why* briefly (e.g., "To prevent stomach upset").

      2. **"What are the side effects?"**
         - List **Common side effects** (mild things like nausea, drowsiness).
         - List **Serious side effects** (what to watch for, when to call a doctor).
         - Use bullet points.

      3. **"Can I take [Drug A] with [Drug B]?"**
         - Check for interactions (Drug-Drug, Food, Alcohol).
         - Format: "✅ **Safe combination**" OR "⚠️ **Caution**" OR "🚨 **Warning**".
         - **Verdict**: Provide a clear answer (e.g., "No, you should not take these together" or "Yes, generally safe").
         - **Explain the risk**: Why is it unsafe? (e.g., "Both thin your blood," "Risk of stomach bleeding," "One reduces the effect of the other").
         - **Alternatives**: If unsafe, suggest asking the doctor about safer alternatives (e.g., "Acetaminophen (Tylenol) is often a safer option for pain, but please check with your doctor").

      4. **"I forgot to take my medication"**
         - General guidance: "Usually, take it as soon as you remember. BUT, if it is close to your next dose, skip the missed one. Never take two doses at once."
         - Remind them to check the pill bottle or call their doctor if unsure.

      5. **"Can I drink alcohol with this?"**
         - Check specific interactions (e.g., increased drowsiness, liver risk).
         - Be conservative and safety-focused.

      If a question is unclear, kindly ask for clarification.
      `,
    }
  });
};

export const analyzeMedicationImage = async (base64Image: string, mimeType: string): Promise<MedicationAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const schema = {
    type: Type.OBJECT,
    properties: {
      isMedication: {
        type: Type.BOOLEAN,
        description: "True if the image contains a prescription, pill bottle, blister pack, box, or medication packaging.",
      },
      medications: {
        type: Type.ARRAY,
        description: "List of medications identified in the image.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Brand name of the medication" },
            genericName: { type: Type.STRING, description: "Generic name if visible (or inferred)", nullable: true },
            purpose: { type: Type.STRING, description: "Simple explanation of what it is for (e.g., 'Lowers blood pressure', 'Pain relief')" },
            strength: { type: Type.STRING, description: "Strength per unit if visible (e.g., '500mg', '10ml')", nullable: true },
            dosage: { type: Type.STRING, description: "Dosage amount (e.g., '1 tablet', '10mg')" },
            frequency: { type: Type.STRING, description: "How often to take (e.g., 'Twice daily', 'Every 4-6 hours'). If not specific, state 'As directed'." },
            duration: { type: Type.STRING, description: "How long to take it (e.g., 'For 10 days' or 'Ongoing'). If unknown, use empty string." },
            bestTime: { type: Type.STRING, description: "Best time of day to take (e.g., 'Morning with breakfast')" },
            instructions: { type: Type.STRING, description: "Specific instructions (e.g., 'Take with food', 'Do not crush')" },
            storage: { type: Type.STRING, description: "Storage instructions (e.g., 'Store in a cool dry place', 'Keep refrigerated')", nullable: true },
            expiryDate: { type: Type.STRING, description: "Expiry date if visible on packaging.", nullable: true },
            expiryWarning: { type: Type.STRING, description: "Warning if the date is passed or near. Null if valid or not found.", nullable: true },
            sideEffects: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "List of common side effects" 
            },
            warnings: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Important safety warnings or contraindications" 
            },
            symbolExplanations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }, 
              description: "Explanations for any warning symbols found on packaging (e.g., 'Drowsiness warning', 'Do not drink alcohol')",
              nullable: true
            }
          },
          required: ["name", "purpose", "dosage", "frequency", "bestTime", "instructions", "sideEffects", "warnings"]
        }
      },
      interactions: {
        type: Type.ARRAY,
        description: "Detailed analysis of interactions. Required if multiple meds are found. Also check for food/alcohol interactions for single meds.",
        items: {
          type: Type.OBJECT,
          properties: {
            severity: { 
              type: Type.STRING, 
              enum: ["safe", "caution", "warning"],
              description: "safe: No interaction/Safe combo. caution: Timing/Food warnings. warning: Serious drug interaction." 
            },
            description: { 
              type: Type.STRING, 
              description: "Explanation of the interaction. E.g. '[Drug A] and [Drug B] can be taken together' or '[Drug A] interacts with Grapefruit'." 
            }
          },
          required: ["severity", "description"]
        }
      },
      generalAdvice: {
        type: Type.STRING,
        description: "General doctor's instructions found on the prescription, or general safety advice for the packaging.",
        nullable: true
      },
      reminderSuggestion: {
        type: Type.STRING,
        description: "A friendly suggestion for setting reminders based on the frequency (e.g., 'Would you like me to suggest reminder times?')."
      },
      languageDetected: {
        type: Type.STRING,
        description: "The primary language of the text.",
      }
    },
    required: ["isMedication", "medications", "interactions", "reminderSuggestion"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `You are HealthLens. Analyze this medical image (Prescription OR Medication Package).
            
            **CURRENT DATE**: ${currentDate} (Use this to check for expired medications).

            1. **IDENTIFY MEDICATIONS**:
               - **Prescription**: Extract Name, Dosage, Frequency, Duration, Instructions. Infer Purpose, Best Time, Side Effects.
               - **Packaging**: Extract Brand/Generic Name, Strength, Expiry Date, Storage. Interpret symbols. Infer Purpose, Side Effects.
               - **Expiry Check**: If an expiry date is found, compare it with ${currentDate}. If expired or expiring within 30 days, set 'expiryWarning'.

            2. **PERFORM INTERACTION CHECKS** (Crucial):
               - **Drug-Drug**: Do identified meds interact?
               - **Food/Drink**: Check for Grapefruit, Dairy, Alcohol conflicts.
               - **Timing**: Should they be taken apart?
               
               Populate 'interactions' array:
               - ✅ 'safe': "[Drug A] and [Drug B] can be taken together"
               - ⚠️ 'caution': "[Drug C] and [Drug D] - take 2 hours apart" or Food interactions.
               - 🚨 'warning': Serious interactions. "Contact your doctor".

            3. **LANGUAGE**: 
               - Detect the language of the input image text.
               - **translate ALL output fields** (purpose, instructions, warnings, etc.) into that SAME language.

            4. **REMINDERS**: Suggest reminder logic based on frequency.
            
            5. **CLARITY**: Use simple, empathetic language (6th grade level). Use emojis in text fields.

            If image is not medical, set isMedication: false.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as MedicationAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the medication image. Please try again.");
  }
};
