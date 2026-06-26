import { BestsellersSection } from "@/components/landing/bestsellers-section";
import { FeatureCardsSection } from "@/components/landing/feature-cards-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { SubscriptionCtaSection } from "@/components/landing/subscription-cta-section";

export default function HomePage() {
  return (
    <div className="space-y-20 pb-4 pt-0 lg:space-y-24">
      <HeroSection />
      <StatsBar />
      <BestsellersSection />
      <FeatureCardsSection />
      <HowItWorksSection />
      <SubscriptionCtaSection />
    </div>
  );
}
