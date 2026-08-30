import HeroSection from '../components/home/HeroSection';
import CategorySection from '../components/home/CategorySection';
import NewArrivals from '../components/home/NewArrivals';
import PromoBanner from '../components/home/PromoBanner';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <NewArrivals />
      <PromoBanner />
    </>
  );
}
