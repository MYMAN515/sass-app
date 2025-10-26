// pages/index.js
import Layout from '@/components/Layout';
import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  return (
    <Layout className="px-0 md:px-0">
      <HeroSection />
    </Layout>
  );
}
