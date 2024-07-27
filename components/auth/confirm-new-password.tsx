"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { StringPassword } from "@/lib/zod-schemas/zod-password-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { PasswordField } from "./update-password-input/password-input-update";
import { updatePwd } from "@/_actions/_auth/update_password";
import { useState } from "react";
import Link from "next/link";
import { SiteNavigation } from "@/lib/site-navigation/site-navigation";
import { FaSignInAlt } from "react-icons/fa";

export default function ChangePasswordComponent() {
  const form = useForm<z.infer<typeof StringPassword>>({
    resolver: zodResolver(StringPassword),
    defaultValues: {
      password: "",
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<boolean>(false);

  async function onSubmit(values: z.infer<typeof StringPassword>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const formData = new FormData();
    formData.set("password", values.password);
    const result = await updatePwd(formData);

    if (result.error) {
      setError(result.message);
      setUpdated(false);
    } else {
      setUpdated(true);
    }
  }

  return (
    <Card className="space-y-3">
      {!updated ? (
        <>
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Choose your new password</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <PasswordField />
                <Button type="submit" className="w-full">
                  Submit
                </Button>
                <div className="h-5 text-sm text-red-600">
                  <span>{error}</span>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">
              Great! Your password was updated successfully.
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href={SiteNavigation.logIn}
              className="flex items-center gap-3"
            >
              <Button>
                <span className="flex items-center gap-2 text-swappy">
                  Go to Login Page to sign in
                  <FaSignInAlt className="text-2xl" />
                </span>
              </Button>
            </Link>
          </CardContent>
        </>
      )}
    </Card>
  );
}
