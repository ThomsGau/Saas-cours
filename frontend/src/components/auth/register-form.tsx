"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AuthFormCard,
  authFieldClassName,
  authSelectTriggerClassName,
} from "@/components/auth/auth-form-card";
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
import { ApiError, apiEndpoints, apiPost } from "@/lib/api";
import type { AuthResponse, RegisterRequest, Role } from "@/lib/api/types";

const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Le prénom est requis")
    .max(100, "Maximum 100 caractères"),
  lastName: z
    .string()
    .trim()
    .min(1, "Le nom est requis")
    .max(100, "Maximum 100 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .max(100, "Maximum 100 caractères"),
  role: z.enum(["STUDENT", "INSTRUCTOR"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);

    try {
      const payload: RegisterRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role as Role,
      };
      await apiPost<AuthResponse>(apiEndpoints.auth.register, payload);

      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("Compte créé", {
          description: "Connectez-vous avec vos identifiants.",
        });
        router.push("/login");
        return;
      }

      toast.success("Compte créé et connecté");
      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.error, { description: error.message });
        return;
      }

      toast.error("Inscription échouée", {
        description:
          error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthFormCard
      title="Inscription"
      description="Créez un compte élève ou instructeur en quelques instants."
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Déjà inscrit ?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Se connecter
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Prénom
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Jean"
                    autoComplete="given-name"
                    className={authFieldClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nom
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Dupont"
                    autoComplete="family-name"
                    className={authFieldClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="vous@example.com"
                    autoComplete="email"
                    className={authFieldClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Mot de passe
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Minimum 8 caractères"
                    autoComplete="new-password"
                    className={authFieldClassName}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rôle
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={authSelectTriggerClassName}>
                      <SelectValue placeholder="Choisir un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="STUDENT">Élève</SelectItem>
                    <SelectItem value="INSTRUCTOR">Instructeur</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            size="lg"
            className="mt-2 h-11 w-full"
            disabled={isLoading}
          >
            {isLoading ? "Création..." : "Créer mon compte"}
          </Button>
        </form>
      </Form>
    </AuthFormCard>
  );
}
