import { createContext, useContext, useState, ReactNode } from "react";

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const showToast = (msg: string) => {
    setMessage(msg);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => setMessage(""), 300); // attendre la fin de l'animation
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast animé */}
      {message && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full z-[9999] transition-all duration-300 ease-out
            ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}
            bg-white text-black
          `}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé dans ToastProvider");
  }
  return context;
}
