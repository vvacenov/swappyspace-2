"use client";

import { signupZodSchema } from "@/lib/zod-schemas/signup-zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { PasswordField } from "./signup-password-input/password-input";
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
} from "@/components/ui/card";

import { signUp } from "../../_actions/_auth/signup-login";
import Link from "next/link";
import { SiteNavigation } from "@/lib/site-navigation/site-navigation";
import { useState } from "react";
import TailwindSpinner from "../ui/spinner/tailwind-spinner";

export default function SignupComponent() {
  const form = useForm<z.infer<typeof signupZodSchema>>({
    resolver: zodResolver(signupZodSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [submitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (values: z.infer<typeof signupZodSchema>) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.set("email", values.email);
      formData.set("password", values.password);
      const result = await signUp(formData);
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
    <>
      <Card className="w-full shadow">
        <CardHeader>
          <div className="flex flex-col mb-7 w-full justify-center text-xl items-center">
            <span>Sign up for Free</span>
            <span className="text-sm">
              Create an account using email and password
            </span>
          </div>
        </CardHeader>

        <CardContent>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full"
            >
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
                    <Button className="w-full" type="submit">
                      <span>Create free account</span>
                    </Button>
                  ) : (
                    <Button className="w-full" type="submit" disabled>
                      <TailwindSpinner />
                    </Button>
                  )}
                  <div className="h-5 text-sm text-red-600">
                    <span>{error}</span>
                  </div>
                </>
              )}
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter>
          <CardDescription className="flex gap-2">
            <span className="mb-6">Already have an account?</span>
            <Link
              className="underline hover:text-primary"
              href={SiteNavigation.logIn}
            >
              Log in here
            </Link>
          </CardDescription>
        </CardFooter>
      </Card>
    </>
  );
}
