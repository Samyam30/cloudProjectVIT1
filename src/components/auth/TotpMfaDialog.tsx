"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { multiFactor, TotpMultiFactorGenerator, TotpSecret } from "firebase/auth";
import { generateTotpSecret } from "@/lib/actions";
import QRCode from "qrcode";

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
import { Loader2, Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const codeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits."),
});

type TotpMfaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TotpMfaDialog({ open, onOpenChange }: TotpMfaDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState<TotpSecret | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const codeForm = useForm<z.infer<typeof codeSchema>>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    async function getSecret() {
      if (open && user) {
        setIsLoading(true);
        const session = await multiFactor(user).getSession();
        const secret = await TotpMultiFactorGenerator.generateSecret(session);
        setSecret(secret);

        const qrCodeUri = secret.generateQrCodeUri(user.email!, "Fortress Auth");
        const dataUrl = await QRCode.toDataURL(qrCodeUri);
        setQrCodeUrl(dataUrl);
        setIsLoading(false);
      }
    }
    getSecret();
  }, [open, user]);

  const handleCodeSubmit = async (values: z.infer<typeof codeSchema>) => {
    setIsLoading(true);
    if (!secret || !user) return;

    try {
      const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(secret, values.code);
      await multiFactor(user).enroll(multiFactorAssertion, `Authenticator App`);
      
      toast({
          title: "Success",
          description: "Authenticator app has been enabled.",
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
  
  const copySecret = () => {
    if(secret) {
        navigator.clipboard.writeText(secret.secretKey);
        toast({ title: "Secret key copied to clipboard." });
    }
  }

  const reset = () => {
    codeForm.reset();
    setSecret(null);
    setQrCodeUrl(null);
    setIsLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) reset(); onOpenChange(isOpen);}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enable Authenticator App</DialogTitle>
          <DialogDescription>
            Scan the QR code with your app, then enter the generated code below to verify.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
            {isLoading || !qrCodeUrl ? (
                <Skeleton className="h-48 w-48" />
            ) : (
                <img src={qrCodeUrl} alt="QR Code" />
            )}
        </div>
        
        <div className="text-center text-sm">
            <p className="text-muted-foreground">Or enter this code manually:</p>
            <div className="flex items-center justify-center gap-2 mt-2 font-mono bg-secondary p-2 rounded-md">
                <span>{secret?.secretKey}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copySecret}>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>

        <Form {...codeForm}>
          <form onSubmit={codeForm.handleSubmit(handleCodeSubmit)} className="space-y-4 pt-4">
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
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Enable
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
