"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, FlipHorizontal, Info, Loader2, X } from "lucide-react";
import { useZxing } from "react-zxing";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { UserVerificationDrawer } from "./user-verification-drawer";

export function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );

  const router = useRouter();
  const { ref } = useZxing({
    onDecodeResult(result) {
      setResult(result.getText());
      setDrawerOpen(true);
      router.refresh();
      stopScanner();
    },
    constraints: {
      video: {
        facingMode: facingMode,
      },
    },
    paused: !scanning,
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {},
      });
      stream.getTracks().forEach((track) => track.stop());
      setScanning(true);
      setResult(null);
      setCameraReady(false);
    } catch (error) {
      handleError(error as Error);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    setCameraReady(false);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    if (scanning) {
      stopScanner();
      setTimeout(() => {
        void startScanner();
      }, 300);
    }
  };

  const handleCanPlay = () => {
    setCameraReady(true);
  };

  const handleError = (error: Error) => {
    console.error(error);
    setError(error.message);
    setScanning(false);
    setCameraReady(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            Верификация пользователя
          </CardTitle>
          <CardDescription className="text-center">
            Наведите камеру на QR-код пользователя
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Camera className="h-12 w-12 text-muted-foreground/50" />
                <Button
                  onClick={() => void startScanner()}
                  className="mt-2"
                  variant="default"
                >
                  Начать сканирование
                </Button>
              </div>
            )}
            {scanning && !cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Загрузка камеры...
                  </p>
                </div>
              </div>
            )}
            {scanning && (
              <>
                <video
                  ref={ref}
                  onCanPlay={handleCanPlay}
                  className="h-full w-full object-cover"
                  style={{
                    transform: facingMode === "user" ? "scaleX(-1)" : "none",
                    display: cameraReady ? "block" : "none",
                  }}
                />
                {cameraReady && (
                  <div className="absolute inset-0 z-10">
                    <div className="absolute bottom-[10%] left-[10%] right-[10%] top-[10%] overflow-hidden rounded-lg border-2 border-white" />
                    <div className="absolute bottom-4 left-0 right-0 text-center text-sm font-medium text-white drop-shadow-lg">
                      Поместите QR-код в область сканирования
                    </div>
                  </div>
                )}
              </>
            )}
            {error && (
              <div className="absolute inset-x-0 top-4 flex justify-center">
                <div className="rounded-lg bg-destructive/90 px-4 py-2 text-sm text-white backdrop-blur-sm">
                  {error}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                <li className="flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  Для лучшего результата, убедитесь что QR-код хорошо освещен
                </li>
                <li className="flex items-center">
                  <Info className="mr-2 h-4 w-4" />
                  Держите устройство неподвижно при сканировании
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          {scanning && (
            <div className="flex w-full justify-center gap-2">
              <Button onClick={stopScanner} variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Отменить
              </Button>
              <Button onClick={toggleCamera} variant="outline">
                <FlipHorizontal className="mr-2 h-4 w-4" />
                Сменить камеру
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <UserVerificationDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
        }}
        userID={result}
      />
    </div>
  );
}
