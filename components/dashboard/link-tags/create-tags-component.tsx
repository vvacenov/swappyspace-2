"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { tagSchema } from "@/lib/zod-schemas/tags-zod-schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { X, Check } from "lucide-react";

const formSchema = z.object({
  tag: tagSchema,
});

export default function TagsComponent() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tag: "",
    },
  });

  const [tags, setTags] = useState<string[]>([]);

  const onSubmit = (values: { tag: string }) => {
    setTags((prevTags) => [...prevTags, values.tag]);
    form.reset();
  };

  return (
    <div className="flex flex-col justify-center w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label="Tag input form"
        >
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem className="flex flex-col lg:flex-row items-center w-full justify-center gap-8 m-0">
                <Label htmlFor="tag-input" className="sr-only">
                  Tag
                </Label>
                <FormControl className="flex max-w-96">
                  <Input
                    {...field}
                    id="tag-input"
                    aria-invalid={form.formState.errors.tag ? "true" : "false"}
                    aria-describedby="tag-error"
                    placeholder="Enter tag"
                  />
                </FormControl>
                <Button type="submit" className="flex m-0">
                  Add Tag
                </Button>
              </FormItem>
            )}
          />
        </form>
        <FormMessage id="tag-error">
          {form.formState.errors.tag?.message}
        </FormMessage>
      </Form>
      <div className="mt-4">
        <ul className="flex flex-wrap gap-2 mt-2 items-center justify-center">
          {tags.map((tag, index) => (
            <li
              key={index}
              className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
