"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addLesson } from "@/lib/api/catalog-instructor.service";
import { ApiError } from "@/lib/api/errors";
import { applyApiFieldErrors } from "@/lib/api/form-errors";
import { isValidPdfUrl, isValidYouTubeUrl } from "@/lib/validation/lesson-url";

const lessonSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Titre requis")
      .max(255, "Maximum 255 caractères"),
    description: z.string().trim().max(5000, "Description trop longue").optional(),
    kind: z.enum(["VIDEO", "PDF"]),
    contentUrl: z
      .string()
      .trim()
      .min(1, "Lien requis")
      .max(2048, "Lien trop long")
      .url("Lien invalide"),
    durationMinutes: z
      .number({ error: "Durée invalide" })
      .int()
      .min(1, "Minimum 1 minute")
      .max(100000)
      .optional(),
  })
  .superRefine((values, ctx) => {
    if (values.kind === "VIDEO") {
      if (!isValidYouTubeUrl(values.contentUrl)) {
        ctx.addIssue({
          code: "custom",
          path: ["contentUrl"],
          message: "Lien YouTube invalide.",
        });
      }
      if (values.durationMinutes == null) {
        ctx.addIssue({
          code: "custom",
          path: ["durationMinutes"],
          message: "Durée obligatoire pour une leçon vidéo.",
        });
      }
    } else if (!isValidPdfUrl(values.contentUrl)) {
      ctx.addIssue({
        code: "custom",
        path: ["contentUrl"],
        message: "Lien PDF invalide (https://…/fichier.pdf requis).",
      });
    }
  });

type LessonFormValues = z.infer<typeof lessonSchema>;

type AddLessonFormProps = {
  courseId: number;
  lockedLessonType?: "VIDEO" | "PDF" | null;
  onAdded: () => void;
};

function defaultLessonValues(
  lockedLessonType?: "VIDEO" | "PDF" | null,
): LessonFormValues {
  return {
    title: "",
    description: "",
    kind: lockedLessonType ?? "VIDEO",
    contentUrl: "",
    durationMinutes: undefined,
  };
}

export function AddLessonForm({
  courseId,
  lockedLessonType = null,
  onAdded,
}: AddLessonFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: defaultLessonValues(lockedLessonType),
  });

  useEffect(() => {
    if (lockedLessonType) {
      form.setValue("kind", lockedLessonType);
    }
  }, [form, lockedLessonType]);

  async function onSubmit(values: LessonFormValues) {
    setIsLoading(true);

    try {
      await addLesson(courseId, {
        title: values.title,
        description: values.description?.trim() ? values.description : null,
        lessonType: values.kind,
        contentUrl: values.contentUrl,
        durationMinutes:
          values.kind === "VIDEO" ? (values.durationMinutes ?? null) : null,
      });

      toast.success("Leçon ajoutée");
      form.reset(defaultLessonValues(lockedLessonType));
      onAdded();
    } catch (error) {
      if (applyApiFieldErrors(error, form.setError, { lessonType: "kind" })) {
        toast.error("Ajout échoué", {
          description: "Corrigez les champs indiqués.",
        });
        return;
      }

      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible d'ajouter la leçon.";

      toast.error("Ajout échoué", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  const kind = form.watch("kind");
  const isTypeLocked = lockedLessonType != null;
  const urlPlaceholder =
    kind === "PDF"
      ? "https://exemple.com/document.pdf"
      : "https://www.youtube.com/watch?v=...";

  return (
    <Form {...form}>
      <form
        id={`add-lesson-form-${courseId}`}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-border/50 bg-muted/20 p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre de la leçon</FormLabel>
                <FormControl>
                  <Input placeholder="Ex. Leçon 1 — Les bases" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isTypeLocked}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="VIDEO">Vidéo YouTube</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                  </SelectContent>
                </Select>
                {isTypeLocked ? (
                  <p className="text-xs text-muted-foreground">
                    Le type est fixé par la première leçon de ce cours.
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="contentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lien</FormLabel>
              <FormControl>
                <Input type="url" placeholder={urlPlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {kind === "VIDEO" ? (
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée en minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.valueAsNumber;
                        field.onChange(Number.isNaN(value) ? undefined : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className={kind === "PDF" ? "sm:col-span-2" : undefined}>
                <FormLabel>Description (optionnel)</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-10"
                    placeholder="Détails de la leçon"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? "Ajout..." : "Ajouter la leçon"}
        </Button>
      </form>
    </Form>
  );
}
