"use client";
//mfa challenge form
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  getAuth,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  TotpMultiFactorGenerator,
  TotpFactorInfo,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const formSchema = z.object({
  code: z
    .string()
    .length(6, { message: "Code must be 6 digits." })
    .regex(/^\d{6}$/, { message: "Code must be numeric." }),
});

export function MfaChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [resolverState, setResolverState] = useState<any>(null);
  const [hintState, setHintState] = useState<any>(null);
  const [recaptchaResolved, setRecaptchaResolved] = useState(false);

  const mfaType = useMemo(() => hintState?.factorId, [hintState]);

  useEffect(() => {
    const resolverStr = searchParams.get("resolver");
    const hintStr = searchParams.get("hint");
    if (resolverStr && hintStr) {
      try {
        const resolver = JSON.parse(decodeURIComponent(resolverStr));
        // Re-instantiate the resolver object with its methods
        const newResolver = getAuth().currentUser?.multiFactor.resolver;
        Object.assign(newResolver, resolver);

        const hint = JSON.parse(decodeURIComponent(hintStr));
        setResolverState(resolver);
        setHintState(hint);
      } catch (e) {
        console.error("Failed to parse resolver or hint", e);
        toast({ variant: "destructive", title: "Invalid MFA state" });
        router.push("/login");
      }
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (resolverState && mfaType === "phone" && !recaptchaResolved) {
      const recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            setRecaptchaResolved(true);
          },
        }
      );

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      phoneAuthProvider
        .verifyPhoneNumber(
          {
            multiFactorHint: hintState,
            session: resolverState.session,
          },
          recaptchaVerifier
        )
        .then(setVerificationId)
        .catch((error) => {
          console.error("SMS not sent", error);
          toast({
            variant: "destructive",
            title: "Failed to send verification code.",
          });
        });

      return () => {
        recaptchaVerifier.clear();
      };
    }
  }, [resolverState, hintState, toast, recaptchaResolved, mfaType]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!resolverState) {
      toast({
        variant: "destructive",
        title: "MFA challenge not initialized.",
      });
      setIsLoading(false);
      return;
    }

    try {
      let multiFactorAssertion;
      if (mfaType === "phone") {
        if (!verificationId) {
          toast({
            variant: "destructive",
            title: "Phone verification not initialized.",
          });
          setIsLoading(false);
          return;
        }
        const cred = PhoneAuthProvider.credential(verificationId, values.code);
        multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      } else if (mfaType === "totp") {
        multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
          hintState.uid,
          values.code
        );
      } else {
        toast({ variant: "destructive", title: "Unsupported MFA type." });
        setIsLoading(false);
        return;
      }

      const userCredential = await resolverState.resolveSignIn(
        multiFactorAssertion
      );

      toast({
        title: "Verification Successful",
        description: "You have been securely logged in.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "The code you entered is invalid. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const description =
    mfaType === "phone"
      ? `For your security, please enter the 6-digit code sent to your phone number ending in ${hintState?.phoneNumber?.slice(
          -4
        )}.`
      : "For your security, please enter the 6-digit code from your authenticator app.";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">
          Verification Required
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div id="recaptcha-container"></div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      {...field}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="\d{6}"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (mfaType === "phone" && !verificationId)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
