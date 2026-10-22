import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import HowItWorks from '@/components/home/HowItWorks';
import Featured from '@/components/home/Featured';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <Featured />
      <HowItWorks />
    </>
  );
}