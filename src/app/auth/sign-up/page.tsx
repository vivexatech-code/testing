import { Suspense } from "react";
import { Container } from "@/components/container";
import { CreateAccountForm } from "@/app/auth/create-account-form";

export const metadata = {
  title: "Create account",
  description: "Create your Repair Series account to book home repair services.",
};

export default function SignUpPage() {
  return (
    <Container className="py-12">
      <Suspense
        fallback={
          <div className="mx-auto h-64 max-w-md animate-pulse rounded-[24px] bg-muted/60" />
        }
      >
        <CreateAccountForm />
      </Suspense>
    </Container>
  );
}

