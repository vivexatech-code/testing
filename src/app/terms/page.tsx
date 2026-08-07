import { Container } from "@/components/container";

export const metadata = {
  title: "Terms",
  description: "Repair Series terms and conditions.",
};

export default function TermsPage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Terms & Conditions
      </h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        This page will contain your production terms copy.
      </p>
    </Container>
  );
}

