"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, Smartphone, UserCog } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <Header />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold text-primary">
              Welcome, {user.email?.split('@')[0]}
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
                <CardDescription>Your personal and login details.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
                  <p><strong>User ID:</strong> <span className="font-code text-xs">{user.uid}</span></p>
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
                    icon={<Smartphone className="h-5 w-5"/>} 
                    title="Authenticator App"
                    description="Use a TOTP app like Google Authenticator."
                    enabled={false}
                  />
                  <MfaOption 
                    icon={<Mail className="h-5 w-5"/>} 
                    title="Email Link"
                    description="Receive a secure link via email."
                    enabled={false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function MfaOption({icon, title, description, enabled}: {icon: React.ReactNode, title: string, description: string, enabled: boolean}) {
    return (
        <div className="flex items-start gap-4 rounded-lg border p-4">
            <div className="mt-1 text-primary">{icon}</div>
            <div className="flex-1">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Button variant={enabled ? "destructive" : "outline"} size="sm" disabled>
              {enabled ? "Disable" : "Enable"}
            </Button>
        </div>
    )
}
