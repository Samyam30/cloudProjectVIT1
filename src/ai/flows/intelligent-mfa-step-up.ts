// analyzes ip, geolocation for potential threats using gemini
import { ai } from "@/ai/genkit";
import { z } from "genkit";

const MFARequirementSchema = z.object({
  shouldRequestMFA: z
    .boolean()
    .describe("Whether MFA should be required based on risk assessment."),
  reason: z
    .string()
    .describe("The reason for requesting or not requesting MFA."),
});

export type MFARequirement = z.infer<typeof MFARequirementSchema>;

const UserContextSchema = z.object({
  ipAddress: z.string().describe("The IP address of the user."),
  geolocation: z
    .string()
    .describe("The geolocation of the user (e.g., city, country)."),
  loginHistory: z
    .string()
    .describe(
      "A summary of the user login history, including timestamps and locations."
    ),
  isSuspicious: z
    .boolean()
    .describe("A flag to signal if the login attempt is deemed suspicious."),
});

export type UserContext = z.infer<typeof UserContextSchema>;

export async function intelligentlyStepUpMFA(
  input: UserContext
): Promise<MFARequirement> {
  return intelligentMFAStepUpFlow(input);
}

const prompt = ai.definePrompt({
  name: "intelligentMFAPrompt",
  input: { schema: UserContextSchema },
  output: { schema: MFARequirementSchema },
  prompt: `You are an AI assistant that analyzes user login context and determines if multi-factor authentication (MFA) should be required.

  Consider the following factors to make your determination:

  - IP Address: {{{ipAddress}}}
  - Geolocation: {{{geolocation}}}
  - Login History: {{{loginHistory}}}
  - Suspicious Activity Flag: {{{isSuspicious}}}

  Based on these factors, output a JSON object indicating whether MFA should be required and the reason for your decision. If the login attempt is deemed suspicious or unusual based on the IP, geolocation, or login history, then MFA should be required.

  Example:
  {
    "shouldRequestMFA": true,
    "reason": "Unusual login location detected."
  }`,
});

const intelligentMFAStepUpFlow = ai.defineFlow(
  {
    name: "intelligentMFAStepUpFlow",
    inputSchema: UserContextSchema,
    outputSchema: MFARequirementSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
