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
    setTags([...tags, values.tag]);
    form.reset();
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          aria-label="Tag input form"
        >
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <Label htmlFor="tag-input">Enter Tag</Label>
                <FormControl>
                  <Input
                    {...field}
                    id="tag-input"
                    aria-invalid={form.formState.errors.tag ? "true" : "false"}
                    aria-describedby="tag-error"
                    placeholder="Enter tag and press Enter"
                  />
                </FormControl>
                <FormMessage id="tag-error">
                  {form.formState.errors.tag?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <Button type="submit">Add Tag</Button>
        </form>
      </Form>
      <div>
        <h2>Tags:</h2>
        <ul>
          {tags.map((tag, index) => (
            <li
              key={index}
              className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
