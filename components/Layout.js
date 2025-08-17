// /components/Layout.js
'use client';

import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children, withContainer = true }) {
  return (
    <>
      <Navbar />
      <main
        id="content"
        className={withContainer
          ? 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6'
          : ''}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
