// /components/Layout.js
import { AnimatePresence, motion } from 'framer-motion';
import Head from 'next/head';
import Navbar from './Navbar';
import Footer from './Footer';
import { useRouter } from 'next/router';

const DEFAULT_TITLE = 'AIStore — AI Store Assistant';
const DEFAULT_DESCRIPTION =
  'AIStore helps e-commerce teams enhance products, generate try-ons, and launch polished listings in minutes.';

export default function Layout({
  children,
  title,
  description,
  className = '',
  hideFooter = false,
}) {
  const router = useRouter();

  const computedTitle = title
    ? title.includes('AIStore') || title.includes('AI Store')
      ? title
      : `${title} | AIStore`
    : DEFAULT_TITLE;

  const metaDescription = description || DEFAULT_DESCRIPTION;
  const mainClasses = [
    'flex-1 w-full pt-[5.5rem] layout-shell__content',
    className,
  ].filter(Boolean).join(' ');

  return (
    <AnimatePresence mode="wait">
      <div className="layout-shell min-h-screen w-full overflow-x-hidden flex flex-col bg-[#0B0F19] text-[#F1F5F9]">
        <Head>
          <title>{computedTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta property="og:title" content={computedTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta name="twitter:card" content="summary_large_image" />
        </Head>
        <Navbar />
        <motion.div
          key={router.asPath}
          role="main"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className={mainClasses}
        >
          {children}
        </motion.div>
        {!hideFooter && <Footer />}
      </div>
    </AnimatePresence>
  );
}
