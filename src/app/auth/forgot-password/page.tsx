import { Container } from "@/components/container";
import { ForgotPasswordForm } from "@/app/auth/forgot-password-form";

export const metadata = {
  title: "Forgot password",
  description: "Reset your Repair Series account password.",
};

export default function ForgotPasswordPage() {
  return (
    <Container className="py-12">
      <ForgotPasswordForm />
    </Container>
  );
}

