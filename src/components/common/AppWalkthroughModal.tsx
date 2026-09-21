import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSettings } from '../../context/SettingsContext';
import { Wallet, Home, Plus, BarChart2, CheckCircle2, LayoutTemplate } from 'lucide-react';

interface WalkthroughStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: WalkthroughStep[] = [
  {
    title: "Welcome to SpendWise!",
    description: "Your 100% offline, privacy-first personal finance tracker.",
    icon: <Wallet size={48} className="text-lime-400" />
  },
  {
    title: "Dashboard & Limits",
    description: "Track your monthly, weekly, and daily budget limits right from the home screen.",
    icon: <Home size={48} className="text-emerald-400" />
  },
  {
    title: "Quick Entry",
    description: "Tap the floating '+' button at the bottom to instantly record any new expense.",
    icon: <Plus size={48} className="text-teal-400" />
  },
  {
    title: "Insights & Analytics",
    description: "Use the History and Analytics tabs to see where your money goes over time.",
    icon: <BarChart2 size={48} className="text-blue-400" />
  },
  {
    title: "Home Screen Widgets",
    description: "Long-press your phone's home screen to add our fast budget widget!",
    icon: <LayoutTemplate size={48} className="text-indigo-400" />
  }
];

export const AppWalkthroughModal: React.FC = () => {
  const { settings, completeWalkthrough } = useSettings();
  const [currentStep, setCurrentStep] = useState(0);

  if (settings.hasCompletedWalkthrough || !settings.hasCompletedOnboarding) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeWalkthrough();
    }
  };

  const step = steps[currentStep];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030805] animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm rounded-3xl glass-emerald-card border border-lime-400/35 p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.2)] animate-scale-check">
        
        {/* Step Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center shadow-inner">
            <div className="animate-float">
              {step.icon}
            </div>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white mb-2">
          {step.title}
        </h2>
        <p className="text-sm font-medium text-neutral-600 dark:text-emerald-200/80 mb-8 min-h-[40px]">
          {step.description}
        </p>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep 
                  ? 'w-6 bg-lime-400' 
                  : 'w-2 bg-neutral-700 dark:bg-emerald-900/50'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full py-3.5 px-4 rounded-2xl glass-button-primary text-black font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all shadow-lg shadow-emerald-950/30"
        >
          <span>{currentStep === steps.length - 1 ? "Let's Go!" : "Next"}</span>
          {currentStep === steps.length - 1 && <CheckCircle2 size={18} strokeWidth={2.5} />}
        </button>

      </div>
    </div>,
    document.body
  );
};
