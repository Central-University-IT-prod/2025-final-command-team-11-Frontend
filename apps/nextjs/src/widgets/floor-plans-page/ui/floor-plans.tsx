"use client";

import { useEffect } from "react";
import { Loader2, Map, Plus, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/alert-dialog";
import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { useFloorEditor } from "~/features/floor-editor/hooks/use-floor-editor";
import { LayoutEditor } from "~/features/floor-editor/ui/layout-editor";
import { TimeAgo } from "~/shared/ui/time-ago";

export function FloorPlansView() {
  const {
    floors,
    selectedFloorId,
    floorToDelete,
    isDirty,
    isLoadingFloors,

    isSaving,
    isDeleting,

    setSelectedFloorId,
    createNewFloor,
    deleteFloor,
    confirmDeleteFloor,
    cancelDeleteFloor,
    saveChanges,
    updateFloors,
  } = useFloorEditor();

  useEffect(() => {
    console.log("[FloorPlansView] Floors from useFloorEditor:", floors);
  }, [floors]);

  const renderPreviewLayout = (floorIndex: number) => {
    if (floorIndex === 0) {
      return (
        <div className="grid h-full grid-cols-3 gap-1">
          <div className="rounded bg-primary/10"></div>
          <div className="rounded bg-primary/10"></div>
          <div className="rounded bg-primary/10"></div>
          <div className="col-span-2 rounded bg-primary/20"></div>
          <div className="rounded bg-primary/10"></div>
          <div className="col-span-3 rounded bg-primary/20"></div>
        </div>
      );
    }
    return (
      <div className="grid h-full grid-cols-2 gap-1">
        <div className="rounded bg-primary/20"></div>
        <div className="rounded bg-primary/20"></div>
        <div className="rounded bg-primary/20"></div>
        <div className="rounded bg-primary/20"></div>
      </div>
    );
  };

  if (isLoadingFloors) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Загружаем планировки...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Создать новую планировку
            </CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader> 
          <CardContent className="pt-2">
            <div className="flex h-40 items-center justify-center rounded-md border-2 border-dashed">
              <Button variant="ghost" onClick={createNewFloor}>
                Создать с нуля
              </Button>
            </div>
          </CardContent>
        </Card>

        {floors.length > 0 ? (
          floors.map((floor, index) => (
            <Card
              key={floor.id}
              className={
                selectedFloorId === floor.id ? "border-2 border-primary" : ""
              }
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {floor.name}
                </CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-40 rounded-md bg-muted/50 p-2">
                  {renderPreviewLayout(index)}
                  {floor.entities.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {floor.entities.length} рабочих мест
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  Последнее изменение:{" "}
                  <TimeAgo date={floor.updatedAt ?? new Date()} />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedFloorId === floor.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedFloorId(floor.id)}
                  >
                    {selectedFloorId === floor.id
                      ? "Редактирование"
                      : "Редактировать"}
                  </Button>
                  {floors.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteFloor(floor.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-2 flex items-center justify-center rounded-md border-2 border-dashed p-8">
            <p className="text-sm text-muted-foreground">
              Планировок нет. Создайте новую планировку, чтобы начать работу.
            </p>
          </div>
        )}
      </div>

      {selectedFloorId && (
        <LayoutEditor
          key={`editor-${selectedFloorId}`}
          isDirty={isDirty}
          isSaving={isSaving}
          saveChanges={saveChanges}
          floors={floors}
          setFloors={updateFloors}
          selectedFloorId={selectedFloorId}
          setSelectedFloorId={setSelectedFloorId}
          onFloorCreate={createNewFloor}
        />
      )}

      <AlertDialog open={floorToDelete !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие удалит эту планировку и все её элементы. Это действие
              нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteFloor}>
              Отменить
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFloor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
