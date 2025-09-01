//main
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, KeyRound, Smartphone, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-purple-50 to-indigo-100 pt-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-primary md:text-7xl">
              Secure Your Digital Fortress
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/80 md:text-xl">
              Fortress Auth provides robust, intelligent multi-factor
              authentication powered by Firebase and advanced AI, ensuring your
              application remains secure against unauthorized access.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h2 className="font-headline text-4xl font-bold text-primary">
                Features You Can Trust
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/70">
                A comprehensive suite of security features to protect your
                users.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<KeyRound className="h-8 w-8 text-accent" />}
                title="Email & Password Login"
                description="Standard, secure login method as the first line of defense, powered by Firebase Authentication."
              />
              <FeatureCard
                icon={<Mail className="h-8 w-8 text-accent" />}
                title="Email Verification"
                description="Ensure users own their email addresses before they can access sensitive parts of your application."
              />
              <FeatureCard
                icon={<Smartphone className="h-8 w-8 text-accent" />}
                title="Multiple MFA Options"
                description="Users can choose their preferred second factor: SMS, Email Link, or Authenticator App (TOTP)."
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-secondary/50">
          <div className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 md:grid-cols-2">
            <div>
              <h2 className="font-headline text-4xl font-bold text-primary">
                Intelligent MFA Step-Up
              </h2>
              <p className="mt-4 text-lg text-foreground/80">
                Our GenAI-powered system analyzes login attempts for risk. By
                evaluating IP address, geolocation, and past behavior, Fortress
                Auth intelligently decides when to prompt for a second factor,
                enhancing security without frustrating users.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>Dynamically assess risk based on contextual data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>
                    Reduce friction for legitimate users in familiar contexts.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <span>
                    Immediately challenge suspicious login attempts with MFA.
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <Card className="overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                  <Image
                    src="https://picsum.photos/600/400"
                    width={600}
                    height={400}
                    alt="Abstract security graphic"
                    className="w-full object-cover"
                    data-ai-hint="abstract security"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <footer className="border-t bg-background py-8">
          <div className="container mx-auto px-4 text-center text-foreground/60">
            <p>
              &copy; {new Date().getFullYear()} Fortress Auth. All rights
              reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center transition-transform hover:-translate-y-2">
      <CardHeader>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          {icon}
        </div>
        <CardTitle className="mt-4 font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground/70">{description}</p>
      </CardContent>
    </Card>
  );
}
