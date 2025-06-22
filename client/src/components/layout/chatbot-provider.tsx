import { createContext, useContext, useState, ReactNode } from "react";
import ChatbotWidget from "@/components/ai/chatbot-widget";

interface ChatbotContextType {
  isOpen: boolean;
  isMinimized: boolean;
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleMinimize: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}

interface ChatbotProviderProps {
  children: ReactNode;
}

export function ChatbotProvider({ children }: ChatbotProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const openChatbot = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeChatbot = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <ChatbotContext.Provider
      value={{
        isOpen,
        isMinimized,
        openChatbot,
        closeChatbot,
        toggleMinimize,
      }}
    >
      {children}
      {isOpen && (
        <ChatbotWidget
          isMinimized={isMinimized}
          onToggleMinimize={toggleMinimize}
          onClose={closeChatbot}
        />
      )}
    </ChatbotContext.Provider>
  );
}