"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { shortLinkAtom } from "@/lib/atoms/links";

interface ShouldReset {
  shouldReset: boolean;
  setShouldReset: (value: boolean) => void;
}

export default function CreateLinkInput({
  shouldReset,
  setShouldReset,
}: ShouldReset) {
  const { control, reset, formState } = useFormContext();
  const value = useAtomValue(shortLinkAtom);

  useEffect(() => {
    if (shouldReset) {
      {
        reset({ long_url: "", antibot: "" });
        setShouldReset(false);
      }
    }
  }, [shouldReset]);

  return (
    <>
      <FormField
        control={control}
        name="long_url"
        render={({ field }) => (
          <FormItem className="w-full">
            <Label
              className="font-bold text-xl flex gap-2 items-center pb-2"
              htmlFor="long_url"
            >
              <span>
                <Link />
              </span>
              <span>Destination Link</span>
            </Label>
            <FormControl>
              <Input
                {...field}
                id="long_url"
                type="text"
                className="bg-muted select-all"
                placeholder="https://"
                aria-describedby="long_url-error"
              />
            </FormControl>
            {formState?.errors?.long_url ? (
              <FormMessage id="email-error" role="alert" />
            ) : (
              <div className="h-5" id="email-error"></div>
            )}
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="antibot"
        render={({ field }) => (
          <FormItem className="hidden">
            <Label htmlFor="antibot">Confirm</Label>
            <FormControl>
              <Input
                {...field}
                id="antibot"
                type="text"
                className="bg-muted"
                aria-hidden="true"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
