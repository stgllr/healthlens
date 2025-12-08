
import React from 'react';
import { Stethoscope, ShieldCheck, Heart, Brain, ChevronLeft, Lock } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Home
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-center w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl mb-6 mx-auto">
          <Stethoscope className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>

        <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-2">About HealthLens</h2>
        <p className="text-center text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Your personal intelligent medical assistant for understanding medications and prescriptions.
        </p>

        <div className="space-y-8">
          <Section 
            icon={<Heart className="w-6 h-6 text-rose-500" />}
            title="Our Mission"
            text="HealthLens aims to make medical information accessible and understandable for everyone. We help you decode complex medical jargon, prescription instructions, and medication packaging into simple, actionable insights."
          />

          <Section 
            icon={<Brain className="w-6 h-6 text-indigo-500" />}
            title="Powered by AI"
            text="Using advanced Google Gemini AI technology, we analyze images of your prescriptions and medications to extract names, dosages, and instructions instantly. Our intelligent chat assistant remembers your context to answer your specific health questions."
          />

          <Section 
            icon={<ShieldCheck className="w-6 h-6 text-emerald-500" />}
            title="Safety First"
            text="Your health is our priority. We automatically flag potential drug interactions, highlight important warnings, and detect controlled substances to keep you informed and safe. Always consult your healthcare provider for medical advice."
          />

          <Section 
            icon={<Lock className="w-6 h-6 text-amber-500" />}
            title="Privacy & Data"
            text="We respect your privacy. Your medication history is stored securely, and we provide easy tools for you to manage or delete your data at any time."
          />
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">
            HealthLens Version 1.0.0
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm hover:shadow-md"
          >
            Start Using HealthLens
          </button>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="flex items-start">
    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl mr-5 shrink-0 transition-colors">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{text}</p>
    </div>
  </div>
);

export default About;