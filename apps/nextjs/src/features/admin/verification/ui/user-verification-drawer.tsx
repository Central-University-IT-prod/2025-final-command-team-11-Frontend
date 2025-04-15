import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  File,
  FileText,
  LoaderCircle,
  MapPin,
  Shield,
  Upload,
  X,
} from "lucide-react";

import { $bookingFetch } from "@acme/api";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@acme/ui/drawer";
import { ScrollArea } from "@acme/ui/scroll-area";
import { Separator } from "@acme/ui/separator";
import { Skeleton } from "@acme/ui/skeleton";
import { toast } from "@acme/ui/toast";

import {
  checkUserAccess,
  checkUserVerify,
  getUser,
  uploadPhotoApi,
} from "../api/endpoints";
import UserProfile from "./user-profile";

interface UserInfoDrawerProps {
  open: boolean;
  onClose: () => void;
  userID: string | null;
}

export function UserVerificationDrawer({
  open,
  onClose,
  userID,
}: UserInfoDrawerProps) {
  const queryClient = useQueryClient();

  const handleConfirmArrival = () => {
    queryClient.clear();
    onClose();
  };

  const {
    data: userInfo,
    isError,
    isLoading: isUserLoading,
  } = useQuery({
    enabled: !!userID,
    queryKey: ["userInfo", userID],
    queryFn: () => getUser(userID ?? ""),
    retry: false,
  });

  const router = useRouter();

  const { data: userAccess, isLoading: isAccessLoading } = useQuery({
    staleTime: 0,
    enabled: !!userInfo,
    queryKey: ["status", userInfo?.id ?? ""],
    queryFn: () => checkUserAccess(userInfo?.id ?? ""),
  });

  const { data: userVerification, isLoading: isVerificationLoading } = useQuery(
    {
      staleTime: 0,
      enabled: !!userAccess,
      queryKey: ["verified", userInfo?.id],
      queryFn: () => checkUserVerify(userInfo?.id ?? ""),
    },
  );

  const { data: bookingInfo, isLoading: isBookingLoading } = useQuery({
    staleTime: 0,
    enabled: userAccess ? userAccess.status !== "NOT_READY" : false,
    queryKey: ["booking", userAccess?.booking_id],
    queryFn: () =>
      $bookingFetch
        .GET("/bookings/{bookingId}", {
          params: {
            path: {
              bookingId: userAccess ? (userAccess.booking_id ?? "") : "",
            },
          },
        })
        .then((res) => res.data),
  });

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Н/Д";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "Н/Д";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const {
    mutate: uploadPhoto,
    isPending: isPhotoUploading,
    isSuccess: isPhotoSuccess,
    isError: isPhotoError,
  } = useMutation({
    mutationFn: async ({ id, passport }: { id: string; passport: File }) => {
      await uploadPhotoApi(id, passport);
    },
    onSuccess: () => {
      router.refresh();
      toast.success("Документ успешно загружен");
    },
    onError: () => {
      toast.error("Ошибка при загрузке документа");
    },
  });

  const isLoading = isUserLoading || isAccessLoading || isVerificationLoading;
  const hasBooking =
    userAccess?.booking_id && userAccess.status !== "NOT_READY";

  const getStatusBadge = () => {
    if (isLoading) return null;

    if (!userAccess || userAccess.status === "NOT_READY") {
      return (
        <Badge variant="destructive" className="ml-2">
          Нет доступа
        </Badge>
      );
    }

    if (userVerification?.verified) {
      return (
        <Badge
          variant="default"
          className="ml-2 bg-green-500 hover:bg-green-500"
        >
          Верифицирован
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="ml-2">
        Ожидает верификации
      </Badge>
    );
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      preventScrollRestoration={false}
      disablePreventScroll
    >
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="flex items-center text-lg">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="ml-2 h-5 w-20" />
              </>
            ) : userAccess?.status !== "NOT_READY" && !isError ? (
              userVerification?.verified ? (
                <>
                  <Shield className="mr-2 h-5 w-5 text-green-500" />
                  Профиль пользователя
                  {getStatusBadge()}
                </>
              ) : (
                <>
                  <Clock className="mr-2 h-5 w-5 text-yellow-500" />
                  Профиль пользователя
                  {getStatusBadge()}
                </>
              )
            ) : (
              <>
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Профиль пользователя
                {getStatusBadge()}
              </>
            )}
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-auto px-4 py-6">
          {isLoading ? (
            <div className="space-y-4 px-1">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
              <Separator className="my-4" />
              <Skeleton className="h-4 w-[120px]" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Separator className="my-4" />
              <Skeleton className="h-[200px] w-full rounded-md" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-red-50 p-6 dark:bg-red-950/30">
              <X className="h-12 w-12 text-red-500" />
              <h3 className="text-lg font-medium">Пользователь не найден</h3>
              <p className="text-center text-sm text-muted-foreground">
                Возможно, был отсканирован недействительный QR-код
              </p>
              <Button variant="outline" onClick={onClose} className="mt-2">
                Закрыть
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-lg bg-card p-4 shadow-sm">
                <UserProfile
                  name={userInfo?.name ?? "Нет данных"}
                  email={userInfo?.email ?? ""}
                  verified={userVerification?.verified ?? false}
                />
              </div>

              <div className="rounded-lg bg-card p-4 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4" />
                  Информация о бронировании
                </h3>

                {hasBooking ? (
                  <div className="space-y-3">
                    {isBookingLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
                        <div className="text-muted-foreground">Дата:</div>
                        <div className="font-medium">
                          {formatDate(bookingInfo?.time_from ?? 0)}
                        </div>

                        <div className="text-muted-foreground">Время:</div>
                        <div className="font-medium">
                          {formatTime(bookingInfo?.time_from ?? 0)}
                          {" — "}
                          {formatTime(bookingInfo?.time_to ?? 0)}
                        </div>

                        <div className="text-muted-foreground">Место:</div>
                        <div className="flex items-center font-medium">
                          <MapPin className="mr-1 h-3 w-3" />
                          {bookingInfo?.entity.title ?? "Не указано"}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950/30">
                    <div className="flex items-start">
                      <AlertCircle className="mr-3 mt-0.5 h-5 w-5 text-amber-600 dark:text-amber-500" />
                      <div>
                        <h4 className="font-medium text-amber-800 dark:text-amber-500">
                          Нет активных бронирований
                        </h4>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                          У пользователя нет бронирований на ближайшее время
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {hasBooking && (
                <div className="rounded-lg bg-card p-4 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 font-medium">
                    <FileText className="h-4 w-4" />
                    Верификация документов
                  </h3>

                  <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-4">
                    {isPhotoSuccess || userVerification?.verified ? (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
                          <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm font-medium">
                          Документ подтвержден
                        </p>

                        {userVerification?.passport && (
                          <div className="mt-2 overflow-hidden rounded-md border">
                            <Image
                              width={500}
                              height={300}
                              alt="Документ пользователя"
                              className="w-full object-cover"
                              src={
                                "https://prod-team-11-78orvads.REDACTED/api/v1/files/" +
                                userVerification.passport
                              }
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                          <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-medium">
                          Требуется верификация
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Перед предоставлением доступа необходимо проверить
                          документы пользователя
                        </p>

                        <input
                          type="file"
                          accept="image/*"
                          id="document-upload"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              uploadPhoto({
                                id: userInfo?.id ?? "",
                                passport: e.target.files[0],
                              });
                            }
                          }}
                          disabled={isPhotoUploading}
                        />

                        <Button
                          variant={isPhotoError ? "destructive" : "secondary"}
                          onClick={() =>
                            document.getElementById("document-upload")?.click()
                          }
                          disabled={isPhotoUploading}
                          className="mt-2"
                        >
                          {isPhotoUploading ? (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          {isPhotoUploading
                            ? "Загрузка..."
                            : "Загрузить документ"}
                        </Button>

                        {isPhotoError && (
                          <p className="text-xs text-red-500">
                            Произошла ошибка при загрузке. Пожалуйста,
                            попробуйте снова.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <DrawerFooter className="border-t pt-4">
          <Button
            onClick={handleConfirmArrival}
            className="w-full"
            variant={userVerification?.verified ? "default" : "outline"}
          >
            {userVerification?.verified ? "Подтвердить и закрыть" : "Закрыть"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
