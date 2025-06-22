import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";
import { useChatbot } from "./chatbot-provider";

export default function FloatingChatButton() {
  const { openChatbot, isOpen } = useChatbot();

  if (isOpen) return null;

  return (
    <Button
      onClick={openChatbot}
      className="fixed bottom-4 right-4 z-40 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
      size="lg"
    >
      <Bot className="w-6 h-6" />
    </Button>
  );
}