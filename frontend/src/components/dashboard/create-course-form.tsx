"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createCourse } from "@/lib/api/catalog-instructor.service";
import { ApiError } from "@/lib/api/errors";

const courseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Titre requis")
    .max(255, "Maximum 255 caractères"),
  description: z.string().trim().max(5000, "Description trop longue").optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

type CreateCourseFormProps = {
  onCreated: () => void;
};

export function CreateCourseForm({ onCreated }: CreateCourseFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: { title: "", description: "" },
  });

  async function onSubmit(values: CourseFormValues) {
    setIsLoading(true);

    try {
      await createCourse({
        title: values.title,
        description: values.description?.trim() ? values.description : null,
      });

      toast.success("Cours créé");
      form.reset({ title: "", description: "" });
      onCreated();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de créer le cours.";

      toast.error("Création échouée", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl border-border/50 shadow-soft">
      <CardHeader>
        <CardTitle className="font-serif text-brand-brown-dark">
          Nouveau cours
        </CardTitle>
        <CardDescription>
          Créez un cours, puis ajoutez-y des leçons PDF ou vidéo YouTube.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex. Introduction au design" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="De quoi parle ce cours ?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? "Création..." : "Créer le cours"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
