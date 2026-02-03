/**
 * Toast notification component
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToasterContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToasterContext = React.createContext<ToasterContextType | null>(null);

export const useToaster = (): ToasterContextType => {
  const context = React.useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within ToasterProvider');
  }
  return context;
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose showToast globally for IPC events
  useEffect(() => {
    (window as unknown as Record<string, unknown>).showToast = showToast;
  }, [showToast]);

  return (
    <ToasterContext.Provider value={{ showToast }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToasterContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle size={18} className="text-[#00d26a]"></CheckCircle>,
    error: <AlertCircle size={18} className="text-red-500"></AlertCircle>,
    info: <Info size={18} className="text-blue-500"></Info>,
  };

  const borderColors = {
    success: 'border-[#00d26a]/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg bg-[#1f1f1f] border ${borderColors[toast.type]}
        shadow-lg animate-slideUp min-w-[300px] max-w-[400px]
      `}
    >
      {icons[toast.type]}
      <span className="flex-1 text-sm">{toast.message}</span>
      <button
        onClick={onRemove}
        className="text-gray-500 hover:text-white transition-colors"
      >
        <X size={14}></X>
      </button>
    </div>
  );
};
