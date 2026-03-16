import { motion } from 'framer-motion';
import clsx from 'clsx';

const AnimatedCard = ({ children, className, onClick, ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={clsx(
        "glass rounded-2xl p-6 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300",
        onClick && "cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedCard;
