import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { hapticWarning, hapticHeavy } from '../../utils/haptics';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      hapticWarning();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel();
    }, 160);
  };

  const handleConfirmAction = () => {
    hapticHeavy();
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onConfirm();
    }, 140);
  };

  return createPortal(
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#030805]/80 backdrop-blur-sm transition-opacity duration-150 ${
        isClosing ? 'opacity-0' : 'animate-in fade-in duration-150'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm glass-panel rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl transition-all duration-200 transform ${
          isClosing ? 'translate-y-6 opacity-0' : 'animate-in slide-in-from-bottom duration-200'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-3.5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDestructive
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25 shadow-xs'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-xs'
            }`}
          >
            {isDestructive ? <Trash2 size={18} /> : <AlertTriangle size={18} />}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl glass-button flex items-center justify-center text-neutral-400 hover:text-white transition-colors active:scale-90"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1.5">
          {title}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5">
          {message}
        </p>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-xl glass-button text-xs font-bold text-neutral-700 dark:text-neutral-300 active:scale-95 transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirmAction}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-md ${
              isDestructive
                ? 'glass-button-danger text-white'
                : 'glass-button-primary text-black'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
