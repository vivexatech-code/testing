import { Container } from "@/components/container";
import { ServiceDetail } from "@/app/services/[serviceId]/service-detail";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;

  return (
    <Container className="py-12">
      <ServiceDetail serviceIdOrSlug={serviceId} />
    </Container>
  );
}

