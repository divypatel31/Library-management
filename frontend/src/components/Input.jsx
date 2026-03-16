import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const Input = ({ label, error, className, id, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={clsx("w-full mb-4", className)}>
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            "block mb-1.5 text-sm font-medium transition-colors duration-200",
            error ? "text-red-500" : isFocused ? "text-indigo-600" : "text-slate-600"
          )}
        >
          {label}
        </label>
      )}
      
      <div className="relative group">
         {/* Focus Glow Effect */}
         <AnimatePresence>
            {isFocused && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-indigo-500/10 rounded-xl blur-md -z-10"
              />
            )}
            {error && (
               <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-red-500/10 rounded-xl blur-md -z-10"
              />
            )}
         </AnimatePresence>

        <input
          id={id}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus && props.onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur && props.onBlur(e);
          }}
          className={clsx(
            "w-full px-4 py-2.5 rounded-xl outline-none transition-all duration-300",
            "bg-white border text-slate-800 placeholder:text-slate-400 shadow-sm",
            "focus:shadow-md",
            error
              ? "border-red-300 focus:border-red-500"
              : "border-slate-200 hover:border-slate-300 focus:border-indigo-500"
          )}
          {...props}
        />
        
        {error && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
             <AlertCircle size={18} />
           </div>
        )}
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="text-red-500 text-xs mt-1.5 ml-1"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
