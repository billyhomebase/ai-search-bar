import { ArrowUp, Search } from "lucide-react";
import { KeyboardEvent, useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex items-end w-full p-3 bg-white dark:bg-[#40414F] border border-black/10 dark:border-white/20 rounded-xl shadow-md focus-within:ring-1 focus-within:ring-black/10 dark:focus-within:ring-white/20 focus-within:border-black/10 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Explore our news & research..."
          className="w-full max-h-[200px] py-3 pl-3 pr-12 bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-base text-foreground placeholder:text-muted-foreground scrollbar-hide"
          rows={1}
          style={{ height: "52px" }}
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim() || disabled}
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-primary text-primary-foreground disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-600 dark:disabled:text-gray-400 transition-colors duration-200"
        >
          <ArrowUp className="w-4 h-4 stroke-[3px]" />
        </button>
      </div>
      {/* 
      <div className="mt-2 text-center text-xs text-muted-foreground">
         AI can make mistakes. Consider checking important information.
        
      </div>  */}
    </div>
  );
}
