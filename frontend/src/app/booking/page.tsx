import { BookingContent } from "@/components/booking/booking-content";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";

export default function BookingPage() {
  return (
    <PageContainer size="default">
      <PageHeader
        title="Réserver une session"
        description="Choisissez un coach et un créneau disponible."
        className="[&_h1]:font-serif [&_h1]:font-semibold [&_h1]:text-brand-brown-dark"
      />
      <BookingContent />
    </PageContainer>
  );
}
