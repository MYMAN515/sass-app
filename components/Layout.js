// /components/Layout.js
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <motion.main
          key={router.asPath}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex-1 pt-20 px-4" // 👈 أضف pt-20 هنا
        >
          {children}
        </motion.main>
      </div>
    </AnimatePresence>
  );
}
