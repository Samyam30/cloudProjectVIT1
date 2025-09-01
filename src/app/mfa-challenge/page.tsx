import { MfaChallengeForm } from "@/components/auth/MfaChallengeForm";
import AuthLayout from "@/components/layout/AuthLayout";
import { Suspense } from "react";

export default function MfaChallengePage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Loading...</div>}>
        <MfaChallengeForm />
      </Suspense>
    </AuthLayout>
  );
}
