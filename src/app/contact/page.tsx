import { Container } from "@/components/container";

export const metadata = {
  title: "Contact",
  description: "Contact Repair Series support.",
};

export default function ContactPage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Support details will be fetched dynamically from Firestore (admin
        settings) so they match the User App.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-sm font-medium">Call support</div>
          <div className="mt-2 h-6 w-44 animate-pulse rounded bg-muted" />
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-sm font-medium">Email support</div>
          <div className="mt-2 h-6 w-56 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </Container>
  );
}

