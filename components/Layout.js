// /components/Layout.js
'use client';

import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({
  children,
  withContainer = false,            // <-- الافتراضي صار فل-وِدث
  containerClassName = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6',
  showNavbar = true,
  showFooter = true,
}) {
  return (
    <>
      {showNavbar && <Navbar />}
      <main id="content" className="w-full min-h-screen overflow-x-hidden">
        {withContainer ? (
          <div className={containerClassName}>{children}</div>
        ) : (
          children
        )}
      </main>
      {showFooter && <Footer />}
    </>
  );
}
