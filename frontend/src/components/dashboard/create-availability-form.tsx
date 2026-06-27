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
import { createAvailability } from "@/lib/api/instructor.service";
import { ApiError } from "@/lib/api/errors";
import {
  localDateTimeInputToUtcIso,
  nextDefaultSlotStart,
  toLocalDateTimeInputValue,
} from "@/lib/format/datetime";
import { cn } from "@/lib/utils";

const availabilitySchema = z.object({
  startAt: z.string().min(1, "Date et heure requises"),
  durationMinutes: z
    .number({ error: "Durée requise" })
    .int()
    .min(15, "Minimum 15 minutes")
    .max(480, "Maximum 8 heures"),
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

type CreateAvailabilityFormProps = {
  onCreated: () => void;
};

function defaultFormValues(): AvailabilityFormValues {
  return {
    startAt: toLocalDateTimeInputValue(nextDefaultSlotStart()),
    durationMinutes: 60,
  };
}

export function CreateAvailabilityForm({ onCreated }: CreateAvailabilityFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: defaultFormValues(),
  });

  async function onSubmit(values: AvailabilityFormValues) {
    setIsLoading(true);

    try {
      await createAvailability({
        startAt: localDateTimeInputToUtcIso(values.startAt),
        durationMinutes: values.durationMinutes,
      });

      toast.success("Créneau créé");
      form.reset(defaultFormValues());
      onCreated();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Impossible de créer le créneau.";

      toast.error("Création échouée", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="rounded-2xl border-border/50 shadow-soft">
      <CardHeader>
        <CardTitle className="font-serif text-brand-brown-dark">
          Nouveau créneau
        </CardTitle>
        <CardDescription>
          Ajoutez une disponibilité pour les sessions privées.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 sm:grid-cols-[1fr_auto]"
          >
            <FormField
              control={form.control}
              name="startAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date et heure</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem className="sm:min-w-[160px]">
                  <FormLabel>Durée (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={15}
                      step={15}
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(event.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={isLoading}
                className={cn("w-full sm:w-auto")}
              >
                {isLoading ? "Création..." : "Ajouter le créneau"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
