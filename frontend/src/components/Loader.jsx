import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="relative flex items-center justify-center">
      {/* Outer Glow */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute w-16 h-16 rounded-full border-t-2 border-r-2 border-purple-500 opacity-70"
      />
      
      {/* Middle Cyan Ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute w-12 h-12 rounded-full border-b-2 border-l-2 border-cyan-400 opacity-80"
      />

      {/* Inner Pink Ring */}
      <motion.div
         animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
         transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
         className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
      />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center">
         {content}
      </div>
    );
  }

  return <div className="flex justify-center items-center p-8">{content}</div>;
};

export default Loader;
