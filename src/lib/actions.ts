"use server";

import { headers } from "next/headers";
import { intelligentlyStepUpMFA } from "@/ai/flows/intelligent-mfa-step-up";
import type { UserContext } from "@/ai/flows/intelligent-mfa-step-up";

export async function checkMfaRequirement(
  isSuspicious: boolean
): Promise<{ shouldRequestMFA: boolean; reason: string }> {
  const headerList = headers();
  const ipAddress = headerList.get("x-forwarded-for") || "not_found";

  // In a real app, you would:
  // 1. Look up geolocation from IP using a service.
  // 2. Query your database (e.g., Firestore) for the user's login history.
  const userContext: UserContext = {
    ipAddress,
    geolocation: "San Francisco, USA (simulated)",
    loginHistory: "Last login: 1 day ago from New York, USA (simulated)",
    isSuspicious,
  };

  try {
    const result = await intelligentlyStepUpMFA(userContext);
    return result;
  } catch (error) {
    console.error("Error in intelligent MFA step-up flow:", error);
    // Fail safe: if AI check fails, require MFA for suspicious attempts.
    return {
      shouldRequestMFA: isSuspicious,
      reason: isSuspicious ? "Suspicious flag was set and AI check failed." : "AI check failed, proceeding without MFA.",
    };
  }
}
