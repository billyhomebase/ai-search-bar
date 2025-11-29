import { Message } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { ThinkingIndicator } from "./thinking-indicator";

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
}

// Simple function to parse **bold** text for the mockup
const renderContent = (content: string) => {
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export function MessageList({ messages, isThinking }: MessageListProps) {
  return (
    <div className="flex flex-col space-y-6 pb-32 max-w-3xl mx-auto w-full px-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "group flex w-full text-foreground border-b border-black/5 dark:border-white/5 pb-6 last:border-0"
          )}
        >
          <div className="flex-shrink-0 mr-4 mt-1">
            {message.role === "assistant" ? (
              <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
                <Bot className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-secondary rounded-sm flex items-center justify-center text-secondary-foreground">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
          
          <div className="relative flex-1 overflow-hidden">
            <div className="font-semibold text-sm mb-1 opacity-90">
              {message.role === "assistant" ? "ChatGPT" : "You"}
            </div>
            <div className="text-[15px] leading-7 whitespace-pre-wrap text-foreground/90">
              {renderContent(message.content)}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 align-middle bg-primary animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        </motion.div>
      ))}
      
      {isThinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex w-full items-center"
        >
          <div className="flex-shrink-0 mr-4">
            <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center text-primary">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <ThinkingIndicator />
        </motion.div>
      )}
    </div>
  );
}