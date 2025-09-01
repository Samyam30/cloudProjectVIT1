//dashboard
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, Smartphone, UserCog } from "lucide-react";
import { PhoneMfaDialog } from "@/components/auth/PhoneMfaDialog";
import { TotpMfaDialog } from "@/components/auth/TotpMfaDialog";
import type { MultiFactorInfo } from "firebase/auth";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPhoneMfaDialogOpen, setIsPhoneMfaDialogOpen] = useState(false);
  const [isTotpMfaDialogOpen, setIsTotpMfaDialogOpen] = useState(false);
  const [enrolledFactors, setEnrolledFactors] = useState<MultiFactorInfo[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (user) {
      setEnrolledFactors(user.multiFactor?.enrolledFactors || []);
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const isPhoneMfaEnabled = enrolledFactors.some((f) => f.factorId === "phone");
  const isTotpMfaEnabled = enrolledFactors.some((f) => f.factorId === "totp");

  const handleTotpDialogChange = (open: boolean) => {
    // Refresh user to get latest MFA info when dialog closes
    if (!open) {
      user.reload().then(() => {
        setEnrolledFactors(user.multiFactor?.enrolledFactors || []);
      });
    }
    setIsTotpMfaDialogOpen(open);
  };

  const handlePhoneDialogChange = (open: boolean) => {
    // Refresh user to get latest MFA info when dialog closes
    if (!open) {
      user.reload().then(() => {
        setEnrolledFactors(user.multiFactor?.enrolledFactors || []);
      });
    }
    setIsPhoneMfaDialogOpen(open);
  };

  return (
    <>
      <div className="flex min-h-screen flex-col bg-secondary/30">
        <Header />
        <main className="flex-1 pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="font-headline text-4xl font-bold text-primary">
                Welcome, {user.displayName || user.email?.split("@")[0]}
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your security settings and account details here.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <UserCog className="h-6 w-6 text-accent" />
                    Account Information
                  </CardTitle>
                  <CardDescription>
                    Your personal and login details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                      <strong>Email Verified:</strong>{" "}
                      {user.emailVerified ? "Yes" : "No"}
                    </p>
                    <p>
                      <strong>User ID:</strong>{" "}
                      <span className="font-code text-xs">{user.uid}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <KeyRound className="h-6 w-6 text-accent" />
                    Multi-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <MfaOption
                      icon={<Smartphone className="h-5 w-5" />}
                      title="Phone Number"
                      description="Use a one-time code sent to your phone."
                      enabled={isPhoneMfaEnabled}
                      onToggle={() => setIsPhoneMfaDialogOpen(true)}
                    />
                    <MfaOption
                      icon={<Mail className="h-5 w-5" />}
                      title="Authenticator App"
                      description="Use a TOTP app like Google Authenticator."
                      enabled={isTotpMfaEnabled}
                      onToggle={() => setIsTotpMfaDialogOpen(true)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <PhoneMfaDialog
        open={isPhoneMfaDialogOpen}
        onOpenChange={handlePhoneDialogChange}
      />
      <TotpMfaDialog
        open={isTotpMfaDialogOpen}
        onOpenChange={handleTotpDialogChange}
      />
    </>
  );
}

function MfaOption({
  icon,
  title,
  description,
  enabled,
  onToggle,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <div className="mt-1 text-primary">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        variant={enabled ? "destructive" : "outline"}
        size="sm"
        onClick={onToggle}
        disabled={disabled}
      >
        {enabled ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}
