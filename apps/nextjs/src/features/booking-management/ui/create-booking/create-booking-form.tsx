"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { ru } from "date-fns/locale";
import { useAtom } from "jotai";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { $adminApi } from "@acme/api";
import { useSession } from "@acme/api/auth";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Calendar } from "@acme/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/tabs";

import type { TCreateBooking } from "../../model/booking-management.types";
import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";
import { selectedUserIdAtom } from "~/features/client-booking/model/booking-atoms";
import { dateToUnixTimestamp } from "~/utils/format";
import { useBookingMutations } from "../../hooks/use-booking-management";
import { CreateBookingSchema } from "../../model/booking-management.schema";
import { FloorMap } from "./floor-map";

interface CreateBookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FloorEntity {
  id: string;
  name: string;
  created_at?: number;
  updated_at?: number;
}

export function CreateBookingForm({
  onSuccess,
  onCancel,
}: CreateBookingFormProps) {
  const router = useRouter();
  const { session } = useSession();
  const { createBooking } = useBookingMutations();
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [floors, setFloors] = useState<FloorEntity[]>([]);
  const [entities, setEntities] = useState<TBookingEntity[]>([]);
  const [isLoadingFloors, setIsLoadingFloors] = useState(true);
  const [activeTab, setActiveTab] = useState("user");
  const [selectedUserId, setSelectedUserId] = useAtom(selectedUserIdAtom);

  // Default to current user if no user is selected
  useEffect(() => {
    if (!selectedUserId && session?.user.id) {
      setSelectedUserId(session.user.id);
    }
  }, [session, selectedUserId, setSelectedUserId]);

  const form = useForm<TCreateBooking>({
    resolver: zodResolver(CreateBookingSchema),
    defaultValues: {
      entity_id: "",
      date: new Date(),
      time_from: "09:00",
      time_to: "18:00",
      user_id: selectedUserId || "",
    },
  });

  // Update form when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      form.setValue("user_id", selectedUserId);
    }
  }, [selectedUserId, form]);

  const { data: floorsData, isLoading } = $adminApi.useQuery(
    "get",
    "/layout/floors",
    {},
    { refetchInterval: 5000, refetchIntervalInBackground: true },
  );

  useEffect(() => {
    if (floorsData) {
      const mappedFloors: FloorEntity[] = floorsData.map((floor) => ({
        id: floor.id ?? "",
        name: floor.name ?? "",
        created_at: floor.created_at ? Number(floor.created_at) * 1000 : 0,
        updated_at: floor.updated_at ? Number(floor.updated_at) * 1000 : 0,
      }));

      setFloors(mappedFloors);

      if (mappedFloors.length > 0 && !selectedFloorId) {
        setSelectedFloorId(mappedFloors[0]?.id ?? "");
      }
    }
    setIsLoadingFloors(isLoading);
  }, [floorsData, isLoading, selectedFloorId]);

  const { data: floorEntities } = $adminApi.useQuery(
    "get",
    "/layout/floors/{id}",
    {
      params: {
        path: { id: selectedFloorId },
      },
    },
    {
      enabled: !!selectedFloorId,
    },
  );

  useEffect(() => {
    if (floorEntities && floorEntities.length > 0) {
      setEntities(
        floorEntities.map((entity) => ({
          id: entity.id ?? "",
          type: entity.type ?? "OPEN_SPACE",
          capacity: entity.capacity ?? 1,
          title: entity.title ?? `Место ${entity.id?.slice(0, 4) ?? ""}`,
          x: entity.x ?? 0,
          y: entity.y ?? 0,
          floor_id: selectedFloorId,
          width: entity.width ?? 30,
          height: entity.height ?? 10,
          updated_at: entity.updated_at ?? "",
        })),
      );
    }
  }, [floorEntities, selectedFloorId]);

  const handleSelectEntity = (entity: TBookingEntity) => {
    form.setValue("entity_id", entity.id);
    setActiveTab("time");
  };

  const onSubmit = async (values: TCreateBooking) => {
    try {
      console.log(values);
      const timeFromUnix = dateToUnixTimestamp(
        parse(values.time_from, "HH:mm", new Date()),
      );
      const timeToUnix = dateToUnixTimestamp(
        parse(values.time_to, "HH:mm", new Date()),
      );

      // Include user_id in the booking request
      await createBooking.mutateAsync(
        {
          params: {
            path: {
              userId: values.user_id,
            },
          },
          body: {
            entity_id: values.entity_id,
            time_from: timeFromUnix,
            time_to: timeToUnix,
          },
        },
        {
          onSuccess: (data) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (data === undefined) {
              toast.error("Ошибка при создании бронирования", {
                description: "Это время уже занято",
              });
            } else {
              toast.success("Бронирование успешно создано");
            }
          },
          onError: (error) => {
            toast.error("Ошибка при создании бронирования");
            console.error("Error creating booking:", error);
          },
        },
      );

      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Ошибка при создании бронирования");
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const selectedEntityId = form.watch("entity_id");

  const selectedEntity = entities.find(
    (entity) => entity.id === selectedEntityId,
  );

  const handleTabChange = (value: string) => {
    if (value === "time" && !selectedEntityId) {
      toast.warning("Сначала выберите рабочее место на карте");
      return;
    }
    setActiveTab(value);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="user">1. Пользователь</TabsTrigger>
            <TabsTrigger value="location" disabled={!selectedUserId}>
              2. Выбор места
            </TabsTrigger>
            <TabsTrigger value="time" disabled={!selectedEntityId}>
              3. Дата и время
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="mt-0 space-y-4">
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Пользователь</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        placeholder="ID пользователя"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">
                Текущий пользователь: {session?.user.name ?? "Не выбран"}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {session?.user.id ?? "Не выбран"}
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Отмена
              </Button>
              <Button
                type="button"
                onClick={() => setActiveTab("location")}
                disabled={!selectedUserId}
              >
                Далее
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-0 space-y-4">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <Label>Этаж</Label>
                <Select
                  value={selectedFloorId}
                  onValueChange={setSelectedFloorId}
                  disabled={isLoadingFloors}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите этаж" />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id}>
                        {floor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEntityId && (
                <Button
                  type="button"
                  onClick={() => setActiveTab("time")}
                  className="mb-0.5"
                >
                  Далее
                </Button>
              )}
            </div>

            <div className="h-[300px] rounded-md border">
              {selectedFloorId ? (
                <FloorMap
                  floorId={selectedFloorId}
                  onSelectEntity={handleSelectEntity}
                  selectedEntityId={selectedEntityId}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Выберите этаж для просмотра мест
                  </p>
                </div>
              )}
            </div>

            <input type="hidden" {...form.register("entity_id")} />

            {selectedEntity && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-sm font-medium">
                  Выбрано: {selectedEntity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedEntity.type === "OPEN_SPACE"
                    ? "Рабочее место"
                    : "Переговорная комната"}
                </p>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("user")}
              >
                Назад
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Отмена
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="time" className="mt-0 space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Дата бронирования</FormLabel>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal")}
                        >
                          {format(field.value, "PPP", { locale: ru })}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() ||
                          date >
                            new Date(
                              new Date().setMonth(new Date().getMonth() + 3),
                            )
                        }
                        locale={ru}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time_from"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Время начала</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите время" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem
                            key={i}
                            value={`${i.toString().padStart(2, "0")}:00`}
                          >
                            {`${i.toString().padStart(2, "0")}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_to"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Время окончания</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите время" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, i) => (
                          <SelectItem
                            key={i}
                            value={`${i.toString().padStart(2, "0")}:00`}
                          >
                            {`${i.toString().padStart(2, "0")}:00`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("location")}
              >
                Назад
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Создать бронирование
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
}
