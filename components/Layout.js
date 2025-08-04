// /components/Layout.js
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
      <div className="min-h-screen flex flex-col bg-[#0B0F19] text-[#F1F5F9]">
        <Navbar />
        <motion.main
          key={router.asPath}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex-1 px-4 md:px-10 pt-[5.5rem]"
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </AnimatePresence>
  );
}
