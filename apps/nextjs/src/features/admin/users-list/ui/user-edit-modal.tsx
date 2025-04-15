"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { $authFetch } from "@acme/api";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import type { TAccount } from "~/entities/account/model/account.types";

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Имя должно содержать не менее 2 символов",
  }),
  email: z.string().email({
    message: "Введите корректный email",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserEditModalProps {
  user: TAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEditModal({
  user,
  open,
  onOpenChange,
}: UserEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
    },
  });

  async function onSubmit(data: UserFormValues) {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      await $authFetch.PATCH("/account/{id}/edit", {
        params: {
          path: {
            id: user.id,
          },
        },
        body: data,
      });

      toast.success("Пользователь обновлен", {
        description: "Информация о пользователе успешно обновлена",
      });

      router.refresh();
      onOpenChange(false);
    } catch {
      toast.error("Ошибка при обновлении", {
        description: "Не удалось обновить информацию о пользователе",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Редактирование пользователя</DialogTitle>
          <DialogDescription>
            Измените информацию о пользователе. Нажмите сохранить, когда
            закончите.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя</FormLabel>
                  <FormControl>
                    <Input placeholder="Иван Иванов" {...field} />
                  </FormControl>
                  <FormDescription>Полное имя пользователя</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@example.com" {...field} />
                  </FormControl>
                  <FormDescription>Email адрес пользователя</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Сохранить
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
