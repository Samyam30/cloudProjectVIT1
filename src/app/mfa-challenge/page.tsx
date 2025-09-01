import { MfaChallengeForm } from "@/components/auth/MfaChallengeForm";
import AuthLayout from "@/components/layout/AuthLayout";

export default function MfaChallengePage() {
  return (
    <AuthLayout>
      <MfaChallengeForm />
    </AuthLayout>
  );
}
