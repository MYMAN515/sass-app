// /components/Layout.js
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './Navbar';
<<<<<<< HEAD
=======
import Footer from './Footer';
>>>>>>> 292c6fba (New Front-end | Back-End|)
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <AnimatePresence mode="wait">
<<<<<<< HEAD
      <div className="min-h-screen flex flex-col">
        <Navbar />
=======
      <div className="min-h-screen flex flex-col bg-[#0B0F19] text-[#F1F5F9]">
        <Navbar />

>>>>>>> 292c6fba (New Front-end | Back-End|)
        <motion.main
          key={router.asPath}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
<<<<<<< HEAD
          className="flex-1 pt-20 px-4" // 👈 أضف pt-20 هنا
        >
          {children}
        </motion.main>
=======
          className="flex-1 px-4 md:px-10 pt-[5.5rem]" // Padding top = height of navbar
        >
          {children}
        </motion.main>

        <Footer />
>>>>>>> 292c6fba (New Front-end | Back-End|)
      </div>
    </AnimatePresence>
  );
}
