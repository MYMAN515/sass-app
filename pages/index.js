// pages/index.js
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('@/components/HeroSection'), {
  ssr: false
});

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
    </Layout>
  );
}
