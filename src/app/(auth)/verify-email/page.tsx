"use client";

/**
 * Email Verification Page
 * Author: Ahmed Adel Bakr Alderai
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Invalid or missing verification token.");
      return;
    }

    const verifyEmail = async () => {
      try {
        await apiPost("/auth/verify-email", { token });
        setStatus("success");
        toast.success("Email verified successfully!", {
          description: "You can now log in to your account.",
        });
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          {status === "loading" && (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
          )}
          {status === "success" && (
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          )}
          {status === "error" && (
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-bold text-center">
          {status === "loading" && "Verifying Email..."}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Failed"}
        </CardTitle>
        <CardDescription className="text-center">
          {status === "loading" && "Please wait while we verify your email address..."}
          {status === "success" && "Your email has been verified successfully."}
          {status === "error" && error}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "success" && (
          <p className="text-center text-muted-foreground text-sm">
            Redirecting you to login page...
          </p>
        )}
        {status === "error" && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              The verification link may have expired or is invalid.
            </p>
            <div className="flex justify-center">
              <Mail className="w-12 h-12 text-muted-foreground/50" />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {status === "success" ? (
          <Link href="/login">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go to Login
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
