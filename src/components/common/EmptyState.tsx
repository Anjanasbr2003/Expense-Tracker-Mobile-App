import { PlusCircle, Receipt, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = Receipt,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center my-3">
      <div className="w-14 h-14 rounded-2xl glass-panel flex items-center justify-center text-neutral-400 mb-3 shadow-xs">
        <Icon size={24} strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl glass-button-primary text-black text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <PlusCircle size={16} strokeWidth={2.2} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
