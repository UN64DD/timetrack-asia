import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`
                pointer-events-auto min-w-[320px] p-5 rounded-2xl border flex items-center gap-4 shadow-2xl backdrop-blur-md
                ${n.type === 'success' ? 'bg-[#ccff00]/10 border-[#ccff00]/20 text-[#ccff00]' : 
                  n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                  'bg-blue-500/10 border-blue-500/20 text-blue-500'}
              `}
            >
              <div className="shrink-0">
                {n.type === 'success' && <CheckCircle2 size={24} />}
                {n.type === 'error' && <AlertCircle size={24} />}
                {n.type === 'info' && <Info size={24} />}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">{n.type}</p>
                <p className="text-sm font-black uppercase tracking-tight text-white">{n.message}</p>
              </div>
              <button onClick={() => removeNotification(n.id)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
}
