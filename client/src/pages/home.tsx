import { useChat } from "@/hooks/use-chat";
import { ChatInput } from "@/components/chat-input";
import { MessageList } from "@/components/message-list";
import { Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const {
    messages,
    isThinking,
    inputText,
    setInputText,
    sendMessage,
    clearChat,
  } = useChat();

  const handleSubmit = () => {
    sendMessage(inputText);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Header 
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center space-x-2 font-semibold text-lg text-primary cursor-pointer hover:opacity-80 transition-opacity">
          <Sparkles className="w-5 h-5" />
          <span>ChatGPT</span>
          <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">
            Beta
          </span>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors flex items-center gap-2 text-sm"
          title="Clear conversation"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </header>*/}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth relative">
        <div className="min-h-full flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              
              <img className="w-12 h-12" src="https://www.sjp.co.uk/sites/sjp-corp/files/logos/SJP_Monogram_RGB_NAVY_0.svg" alt="St. James’s Place" title="St. James’s Place"/>

              <h1 className="text-3xl font-bold tracking-tight">
                How can I help you today?
              </h1>
              
            </div>
          ) : (
            <div className="flex-1 py-10">
              <MessageList messages={messages} isThinking={isThinking} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="w-full bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-4">
        <ChatInput
          value={inputText}
          onChange={setInputText}
          onSubmit={handleSubmit}
          disabled={isThinking && !messages.some((m) => m.isStreaming)}
        />
      </div>
    </div>
  );
}
