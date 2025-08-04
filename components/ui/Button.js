import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', ...props }) {
  const base = 'px-5 py-2 rounded-full font-medium transition-all text-sm';

  const styles = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-md',
    secondary: 'border border-purple-300 text-purple-700 hover:bg-purple-50',
    ghost: 'text-purple-600 hover:underline',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.03 }}
      className={`${base} ${styles[variant]}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
