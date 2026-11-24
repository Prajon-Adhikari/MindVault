import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <AuthShell mode="login">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
