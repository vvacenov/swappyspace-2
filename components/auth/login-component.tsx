"use client";

import { loginZodSchema } from "@/lib/zod-schemas/login-zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { logIn } from "../../_actions/_auth/signup-login";
import Link from "next/link";
import { SiteNavigation } from "@/lib/site-navigation/site-navigation";
import { PasswordField } from "./login-password-input/password-input";
import { useState } from "react";
import TailwindSpinner from "../ui/spinner/tailwind-spinner";
import {
  DiscordLoginComponent,
  GitHubLoginComponent,
  GoogleLoginComponent,
} from "./social/google-login-component";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { FaInfoCircle as Info } from "react-icons/fa";

export default function LoginComponent() {
  const form = useForm<z.infer<typeof loginZodSchema>>({
    resolver: zodResolver(loginZodSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [submitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (values: z.infer<typeof loginZodSchema>) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.set("email", values.email);
      formData.set("password", values.password);
      const result = await logIn(formData);
      if (result?.error_message) {
        setIsSubmitting(false);
        setError(result.error_message);
        return;
      }
      if (!result?.error_message) {
        setSuccess(true);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        return;
      }
    }
  };
  return (
    <Card className="w-full shadow">
      <CardHeader className="flex pb-0">
        <CardTitle className="flex mb-6 gap-3 w-full justify-center text-2xl items-center">
          <span>Log in to your account</span>
        </CardTitle>
        <div className="flex gap-4 flex-col">
          <GoogleLoginComponent />
          <DiscordLoginComponent />
          <GitHubLoginComponent />
          <HoverCard>
            <HoverCardTrigger>
              <Info className="text-xl" />
            </HoverCardTrigger>
            <HoverCardContent className=" flex flex-col gap-3 text-sm">
              <span>Don't have an account? Let's keep it simple.</span>
              <span>
                Your first login with Google, Discord or Github will create one
                for you automatically.{" "}
              </span>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t"></div>
          <span className="flex-shrink mx-4 ">OR</span>
          <div className="flex-grow border-t "></div>
        </div>
      </CardHeader>
      <CardDescription className="flex mx-12 justify-center mt-0 mb-2 text-sm">
        <span>Log in with email and password below, if you prefer.</span>
      </CardDescription>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email</Label>
                  <FormControl>
                    <Input placeholder="Enter your email" {...field} />
                  </FormControl>
                  {form.formState.errors.email ? (
                    <FormMessage />
                  ) : (
                    <div className="h-5"></div>
                  )}
                </FormItem>
              )}
            />

            <PasswordField />
            {success ? (
              <div>Check your email!</div>
            ) : (
              <>
                {!submitting ? (
                  <div>
                    <Button className="w-full mt-3" type="submit">
                      <span>Log In</span>
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Button className="w-full mt-3" type="submit" disabled>
                      <TailwindSpinner />
                    </Button>
                  </div>
                )}
                <CardDescription className="text-sm flex flex-col gap-3 justify-between">
                  <span className=" h-5 text-red-600">{error}</span>
                  <Link
                    className="underline"
                    href={SiteNavigation.forgotPassword}
                  >
                    Forgot your password?
                  </Link>
                </CardDescription>
                <CardDescription className="flex gap-2">
                  <span>If you want to create a free account?</span>
                  <Link
                    className="underline hover:text-primary"
                    href={SiteNavigation.signUp}
                  >
                    Sign up here
                  </Link>
                </CardDescription>
              </>
            )}
          </form>
        </FormProvider>
      </CardContent>
      <CardFooter className="mt-5"></CardFooter>
    </Card>
  );
}
