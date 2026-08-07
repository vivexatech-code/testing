import { Container } from "@/components/container";
import { CategoryDetail } from "@/app/categories/[categoryId]/category-detail";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  return (
    <Container className="py-12">
      <CategoryDetail categoryIdOrSlug={categoryId} />
    </Container>
  );
}

