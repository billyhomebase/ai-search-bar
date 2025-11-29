import { motion } from "framer-motion";

export function ThinkingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-4 bg-transparent">
      <motion.div
        className="w-2 h-2 bg-thinking rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-thinking rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.2,
        }}
      />
      <motion.div
        className="w-2 h-2 bg-thinking rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: 0.4,
        }}
      />
      <span className="text-sm text-muted-foreground ml-2 font-medium animate-pulse">Thinking...</span>
    </div>
  );
}