"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { RecaptchaVerifier, PhoneAuthProvider, multiFactor } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { enrollPhoneMfa } from "@/lib/actions";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const phoneSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/, "Please enter a valid E.164 phone number (e.g., +12223334444)."),
});

const codeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits."),
});

type PhoneMfaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PhoneMfaDialog({ open, onOpenChange }: PhoneMfaDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [resolver, setResolver] = useState<any>(null);

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const handlePhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    setIsLoading(true);
    if (!user) return;

    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-enroll', {
        'size': 'invisible',
        'callback': (response: any) => {},
      });

      const session = await multiFactor(user).getSession();
      const phoneInfoOptions = {
        phoneNumber: values.phoneNumber,
        session: session,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
      
      setVerificationId(verificationId);
      setStep("code");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send verification code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    setIsLoading(true);
    if (!verificationId || !user) return;

    try {
        const cred = PhoneAuthProvider.credential(verificationId, values.code);
        const multiFactorAssertion = {factorId: "phone", ...cred};
        await multiFactor(user).enroll(multiFactorAssertion, `Phone (${phoneForm.getValues("phoneNumber").slice(-4)})`);
        
        // Also update the user on the backend
        await enrollPhoneMfa(user.uid, phoneForm.getValues("phoneNumber"));

        toast({
            title: "Success",
            description: "Phone number has been added as a second factor.",
        });
        onOpenChange(false);
    } catch (error: any) {        
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid verification code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep('phone');
    phoneForm.reset();
    codeForm.reset();
    setVerificationId(null);
    setResolver(null);
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) reset(); onOpenChange(isOpen);}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enable Phone Authentication</DialogTitle>
          <DialogDescription>
            {step === "phone"
              ? "Enter your phone number to receive a verification code."
              : "Enter the 6-digit code sent to your phone."}
          </DialogDescription>
        </DialogHeader>

        <div id="recaptcha-container-enroll"></div>

        {step === "phone" ? (
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4 py-4">
              <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+12223334444" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Code
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-4 py-4">
              <FormField
                control={codeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setStep('phone')} disabled={isLoading}>Back</Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
