import { Container } from "@/components/container";

export const metadata = {
  title: "Privacy Policy",
  description: "Repair Series privacy policy.",
};

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        This page will contain your production privacy policy copy.
      </p>
    </Container>
  );
}

