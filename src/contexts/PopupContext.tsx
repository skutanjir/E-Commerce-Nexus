import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'info' | 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface PopupContextType {
  toast: (message: string, type?: ToastType) => void;
  confirm: (message: string) => Promise<boolean>;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{ message: string; resolve: (val: boolean) => void } | null>(null);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const handleConfirm = () => {
    if (confirmState) {
      confirmState.resolve(true);
      setConfirmState(null);
    }
  };

  const handleCancel = () => {
    if (confirmState) {
      confirmState.resolve(false);
      setConfirmState(null);
    }
  };

  return (
    <PopupContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="fixed top-20 md:top-6 right-4 md:right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto min-w-[280px] max-w-sm px-4 py-3.5 rounded-2xl shadow-xl shadow-black/5 border text-sm font-bold flex items-start gap-3 transform transition-all duration-300 translate-y-0 opacity-100 ${
              t.type === 'error' ? 'bg-error-container text-on-error-container border-error/20' :
              t.type === 'success' ? 'bg-primary-container text-on-primary-container border-primary/20' :
              'bg-surface-container-highest text-on-surface border-outline/20'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] mt-0.5">
              {t.type === 'error' ? 'error' : t.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <p className="flex-1 leading-snug">{t.message}</p>
            <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-error">
              <div className="w-12 h-12 bg-error-container text-on-error-container rounded-full flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <h3 className="text-xl font-black text-on-surface">Konfirmasi</h3>
            </div>
            <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest rounded-xl font-bold transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 bg-error hover:bg-error/90 text-white rounded-xl font-bold transition-colors shadow-sm active:scale-95 text-sm"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) throw new Error('usePopup must be used within PopupProvider');
  return context;
};
