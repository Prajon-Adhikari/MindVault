import AuthShell from "@/components/auth/AuthShell";
import AuthForm from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <AuthShell mode="signup">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
