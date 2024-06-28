"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import dynamic from "next/dynamic";
import { SiteNavigation } from "@/lib/site-navigation/site-navigation";
const ThemedLogo = dynamic(
  () => import("../ui/themed-logo/logo").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-[125px] h-[37px]">
        <TailwindSpinner />
      </div>
    ), // Dodan fallback spinner dok se komponenta učitava
  }
);
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { testEmail } from "@/lib/zod-schemas/test-email-zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { resetPwd } from "@/_actions/_auth/reset-password";
import { useState, useEffect } from "react";
import TailwindSpinner from "../ui/spinner/tailwind-spinner";
import Link from "next/link";

export default function ForgotPasswordComponent() {
  const form = useForm<z.infer<typeof testEmail>>({
    resolver: zodResolver(testEmail),
    defaultValues: {
      email: "",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [submitting, setIsSubmitting] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const [resend, setResend] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  async function onSubmit(values: z.infer<typeof testEmail>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.set("email", values.email);
    setEmail(values.email);
    const result = await resetPwd(formData);
    if (result?.error_message) {
      setError(result.error_message);
      setEmailSent(false);
      setIsSubmitting(false);
    } else {
      setError(null);
      setEmailSent(true);
      setIsSubmitting(false);
      startCountdown();
    }
  }

  async function retry() {
    setError(null);
    setResend(true);
    const formData = new FormData();
    if (!email) {
      setError("Error processing your request. :( Try again later.");
      setResend(false);
      return;
    }
    formData.set("email", email);
    const result = await resetPwd(formData);
    if (result?.error_message) {
      setError(result.error_message);
      setResend(false);
      return;
    }
    setResend(false);
    startCountdown();
  }

  function startCountdown() {
    setCountdown(60); // 60 sekundi timeout
  }

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <>
      {!emailSent ? (
        <Card className="space-y-3 h-80">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription>
              No worries, it happens. Enter your email to request a password
              reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Email</Label>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>

                      {form.formState.errors.email ? (
                        <FormMessage className="h-6" />
                      ) : (
                        <div className="h-6"></div>
                      )}
                      {error && (
                        <span className="flex text-red-600 h-6 truncate overflow-hidden whitespace-nowrap text-ellipsis min-w-0 max-w-265">
                          <p>{error}</p>
                        </span>
                      )}
                    </FormItem>
                  )}
                />
                {!submitting ? (
                  <Button type="submit" className="w-full">
                    Request password reset link
                  </Button>
                ) : (
                  <Button type="submit" disabled className="w-full">
                    <TailwindSpinner />
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="space-y-3">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription>
              No worries, it happens. Enter your email to request a password
              reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Card className="w-full flex flex-col justify-between items-center shadow-md">
              <CardHeader className="w-full flex flex-col gap-1 p-4">
                <div className="bg-swappy text-white w-full rounded-md flex items-center justify-center h-12">
                  <CardTitle>
                    <div>Check your email</div>
                  </CardTitle>
                </div>
                <CardContent>
                  <span className="text-center font-semibold w-full rounded-md border-black flex flex-col items-center justify-center">
                    <p>Password reset link was emailed to you.</p>
                  </span>
                </CardContent>
                <CardContent>
                  <div className="flex items-center justify-center text-sm mt-4 mb-1 hover:text-swappy">
                    <Link
                      className="items-center text-sm hover:underline pointer-cursor"
                      href={SiteNavigation.logIn}
                    >
                      <span className="font-semibold underline">
                        Return to login page
                      </span>
                    </Link>
                  </div>
                </CardContent>
              </CardHeader>
              <CardContent>
                {!resend && countdown === 0 && (
                  <span className="text-wrap text-center flex flex-col gap-3">
                    <div
                      className="underline cursor-pointer  hover:text-swappy font-semibold text-sm flex items-center justify-center gap-1 flex-col "
                      onClick={() => retry()}
                    >
                      <span>Resend the email to </span>
                      <span className="flex h-6 truncate overflow-hidden whitespace-nowrap text-ellipsis min-w-0 max-w-[225px] sm:max-w-full">
                        {email}
                      </span>
                    </div>
                  </span>
                )}
                {!resend && countdown > 0 && (
                  <span className="text-sm text-wrap text-center flex flex-col gap-3">
                    <div>Give it a few moments, it should arrive shortly.</div>
                    <div className="text-sm text-wrap flex flex-col sm:flex-row gap-1">
                      In case your email didn't arrive, try resending it in
                      <div className="text-swappy font-semibold">
                        {countdown} seconds.
                      </div>
                    </div>
                  </span>
                )}
                {resend && <TailwindSpinner />}
                <div className="flex w-full items-center text-sm mt-2">
                  {error ? (
                    <span className="w-full text-red-600 h-6 text-center truncate overflow-hidden whitespace-nowrap text-ellipsis">
                      {error}
                    </span>
                  ) : (
                    <div className="h-6"></div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Link
              className="items-center justify-center flex text-sm pointer-cursor mt-2"
              href={SiteNavigation.logIn}
            >
              <ThemedLogo size={133} />
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
}
