import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-background via-purple-50 to-indigo-100 p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <span className="font-headline">Fortress Auth</span>
        </Link>
      </div>
      {children}
    </div>
  );
}
