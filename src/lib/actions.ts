"use server";
import "dotenv/config";

import { headers } from "next/headers";
import { intelligentlyStepUpMFA } from "@/ai/flows/intelligent-mfa-step-up";
import type { UserContext } from "@/ai/flows/intelligent-mfa-step-up";
import { authAdmin } from "./firebase-admin";
import { revalidatePath } from "next/cache";


export async function enrollPhoneMfa(uid: string, phoneNumber: string) {
  try {
    const user = await authAdmin.getUser(uid);
    const existingFactors = user.multiFactor?.enrolledFactors || [];
    
    await authAdmin.updateUser(uid, {
      multiFactor: {
        enrolledFactors: [
          ...existingFactors,
          {
            factorId: "phone",
            phoneNumber,
            displayName: `Phone (${phoneNumber.slice(-4)})`,
          },
        ],
      },
    });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error("Error enrolling phone MFA:", error);
    return { success: false, error: error.message };
  }
}

export async function checkMfaRequirement(
  isSuspicious: boolean
): Promise<{ shouldRequestMFA: boolean; reason: string }> {
  const headerList = headers();
  const ipAddress = headerList.get("x-forwarded-for") || "not_found";

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
    return {
      shouldRequestMFA: isSuspicious,
      reason: isSuspicious ? "Suspicious flag was set and AI check failed." : "AI check failed, proceeding without MFA.",
    };
  }
}