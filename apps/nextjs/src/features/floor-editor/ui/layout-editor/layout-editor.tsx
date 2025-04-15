"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Grid,
  Maximize,
  Plus,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@acme/ui/button";
import { Checkbox } from "@acme/ui/checkbox";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";
import { Separator } from "@acme/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";
import type { TFloorLayout } from "~/entities/floor-layout/model/floor-layout.types";
import { DropZone } from "../drop-zone";
import { EditorSidebar } from "../editor-sidebar";

interface LayoutEditorProps {
  floors: TFloorLayout[];
  setFloors: (floors: TFloorLayout[]) => void;
  selectedFloorId?: string | null;
  setSelectedFloorId: (floorId: string | null) => void;
  onFloorsChange?: (floors: TFloorLayout[]) => void;
  onSelectedFloorChange?: (floorId: string | null) => void;
  onFloorCreate?: (floor: TFloorLayout) => void;
  saveChanges: (floor: TFloorLayout) => Promise<void>;
  isSaving?: boolean;
  isDirty?: boolean;
}

export function LayoutEditor({
  floors,
  setFloors,
  selectedFloorId,
  setSelectedFloorId,
  onFloorsChange,
  isDirty,
  isSaving,
  saveChanges,
  onSelectedFloorChange,
  onFloorCreate,
}: LayoutEditorProps) {
  const [isEditingFloorName, setIsEditingFloorName] = useState(false);
  const [floorNameInput, setFloorNameInput] = useState("");

  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const [gridOpacity, setGridOpacity] = useState(0.2);
  const [showMinimap, setShowMinimap] = useState(true);
  const [actionHistory, setActionHistory] = useState<{
    past: TFloorLayout[][];
    future: TFloorLayout[][];
  }>({ past: [], future: [] });

  useEffect(() => {
    if (onFloorsChange) {
      onFloorsChange(floors);
    }
  }, [floors, onFloorsChange]);

  useEffect(() => {
    if (onSelectedFloorChange) {
      onSelectedFloorChange(selectedFloorId ?? null);
    }
  }, [selectedFloorId, onSelectedFloorChange]);

  const selectedFloor = selectedFloorId
    ? (floors.find((floor) => floor.id === selectedFloorId) ?? null)
    : null;

  const [selectedElement, setSelectedElement] = useState<TBookingEntity | null>(
    null,
  );

  const startEditingFloorName = useCallback(() => {
    if (selectedFloor) {
      setFloorNameInput(selectedFloor.name);
      setIsEditingFloorName(true);
    }
  }, [selectedFloor]);

  const handleFloorNameChange = useCallback(async () => {
    if (selectedFloorId && floorNameInput.trim()) {
      setFloors(
        floors.map((floor) =>
          floor.id === selectedFloorId
            ? { ...floor, name: floorNameInput.trim(), updatedAt: new Date() }
            : floor,
        ),
      );
      setIsEditingFloorName(false);
      await saveChanges({
        id: selectedFloorId,
        name: floorNameInput.trim(),
        entities: selectedFloor?.entities ?? [],
        createdAt: selectedFloor?.createdAt ?? new Date(),
      });
    }
  }, [
    selectedFloorId,
    floorNameInput,
    setFloors,
    floors,
    saveChanges,
    selectedFloor?.entities,
    selectedFloor?.createdAt,
  ]);

  const handleElementSelect = useCallback((element: TBookingEntity | null) => {
    setSelectedElement(element);
  }, []);

  const saveStateToHistory = useCallback(() => {
    setActionHistory((prev) => ({
      past: [
        ...prev.past,
        JSON.parse(JSON.stringify(floors)) as TFloorLayout[],
      ],
      future: [],
    }));
  }, [floors]);

  const handleUndo = useCallback(() => {
    if (actionHistory.past.length === 0) return;

    const newPast = [...actionHistory.past];
    const previousState = newPast.pop();

    if (previousState) {
      setActionHistory({
        past: newPast,
        future: [
          JSON.parse(JSON.stringify(floors)) as TFloorLayout[],
          ...actionHistory.future,
        ],
      });
      setFloors(previousState);
    }
  }, [floors, actionHistory, setFloors]);

  const handleRedo = useCallback(() => {
    if (actionHistory.future.length === 0) return;

    const [nextState, ...newFuture] = actionHistory.future;

    setActionHistory({
      past: [
        ...actionHistory.past,
        JSON.parse(JSON.stringify(floors)) as TFloorLayout[],
      ],
      future: newFuture,
    });

    setFloors(nextState ?? []);
  }, [actionHistory.future, actionHistory.past, floors, setFloors]);

  const navigateFloors = useCallback(
    (direction: "next" | "prev") => {
      const currentIndex = floors.findIndex(
        (floor) => floor.id === selectedFloorId,
      );
      if (currentIndex === -1) return;

      let newIndex;
      if (direction === "next") {
        newIndex = (currentIndex + 1) % floors.length;
      } else {
        newIndex = (currentIndex - 1 + floors.length) % floors.length;
      }

      if (floors[newIndex]) {
        setSelectedFloorId(floors[newIndex]?.id ?? null);
      }
    },
    [floors, selectedFloorId, setSelectedFloorId],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }

      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }

      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        navigateFloors("prev");
      }

      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        navigateFloors("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, navigateFloors]);

  const handleUpdateElement = useCallback(
    (updatedElement: TBookingEntity) => {
      if (!selectedFloorId) return;

      saveStateToHistory();

      setFloors(
        floors.map((floor) => {
          if (floor.id !== selectedFloorId) return floor;

          return {
            ...floor,
            entities: floor.entities.map((el) =>
              el.id === updatedElement.id
                ? {
                    ...updatedElement,
                    title: updatedElement.title || el.title || "",
                    updatedAt: new Date(),
                  }
                : el,
            ),
            updatedAt: new Date(),
          };
        }),
      );

      if (selectedElement?.id === updatedElement.id) {
        setSelectedElement(updatedElement);
      }
    },
    [
      selectedFloorId,
      saveStateToHistory,
      setFloors,
      floors,
      selectedElement?.id,
    ],
  );

  const handleAddElement = useCallback(
    (element: TBookingEntity) => {
      if (!selectedFloorId) return;

      saveStateToHistory();

      setFloors(
        floors.map((floor) => {
          if (floor.id !== selectedFloorId) return floor;

          return {
            ...floor,
            entities: [...floor.entities, element],
            updatedAt: new Date(),
          };
        }),
      );
      setSelectedElement(element);
    },
    [selectedFloorId, saveStateToHistory, setFloors, floors],
  );

  const handleDeleteElement = useCallback(
    (elementToDelete: TBookingEntity) => {
      if (!selectedFloorId) return;

      saveStateToHistory();

      setFloors(
        floors.map((floor) => {
          if (floor.id !== selectedFloorId) return floor;

          return {
            ...floor,
            entities: floor.entities.filter(
              (el) => el.id !== elementToDelete.id,
            ),
            updatedAt: new Date(),
          };
        }),
      );
      if (selectedElement?.id === elementToDelete.id) {
        setSelectedElement(null);
      }
    },
    [selectedFloorId, selectedElement, saveStateToHistory, floors, setFloors],
  );

  const handleSetElements = useCallback(
    (
      elementsOrUpdater:
        | TBookingEntity[]
        | ((prev: TBookingEntity[]) => TBookingEntity[]),
    ) => {
      if (!selectedFloorId) return;

      saveStateToHistory();

      setFloors(
        floors.map((floor) => {
          if (floor.id !== selectedFloorId) return floor;

          const newElements =
            typeof elementsOrUpdater === "function"
              ? elementsOrUpdater(floor.entities)
              : elementsOrUpdater;

          return {
            ...floor,
            entities: newElements,
            updatedAt: new Date(),
          };
        }),
      );
    },
    [selectedFloorId, saveStateToHistory, setFloors, floors],
  );

  const handleCreateNewFloor = useCallback(() => {
    saveStateToHistory();

    const newFloorId = uuidv4();
    const newFloorNumber = floors.length + 1;

    const newFloor: TFloorLayout = {
      id: newFloorId,
      name: `Floor ${newFloorNumber}`,
      entities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (onFloorCreate) {
      onFloorCreate(newFloor);
    }

    setFloors([...floors, newFloor]);
    setSelectedFloorId(newFloorId);
    setSelectedElement(null);
  }, [
    saveStateToHistory,
    onFloorCreate,
    setFloors,
    floors,
    setSelectedFloorId,
  ]);

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-xl font-semibold">Редактор планировок</h3>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="floor-select" className="text-sm font-medium">
            Планировка:
          </label>
          {isEditingFloorName && selectedFloor ? (
            <div className="flex items-center">
              <Input
                className="h-8 w-36"
                value={floorNameInput}
                onChange={(e) => setFloorNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleFloorNameChange();
                  } else if (e.key === "Escape") {
                    setIsEditingFloorName(false);
                  }
                }}
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFloorNameChange}
                className="ml-1"
              >
                Сохранить
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigateFloors("prev")}
                      disabled={floors.length <= 1}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Предыдущая планировка (Alt+Left)
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Select
                value={selectedFloorId ?? ""}
                onValueChange={(value) => setSelectedFloorId(value)}
              >
                <SelectTrigger className="mx-1 h-8 w-36">
                  <SelectValue placeholder="Select floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((floor) => (
                    <SelectItem key={floor.id} value={floor.id}>
                      {floor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="mr-1 h-8 w-8"
                      onClick={() => navigateFloors("next")}
                      disabled={floors.length <= 1}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Следующая планировка (Alt+Right)
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {selectedFloor && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={startEditingFloorName}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Переименовать планировку</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleUndo}
                  disabled={actionHistory.past.length === 0}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Отменить (Ctrl+Z)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRedo}
                  disabled={actionHistory.future.length === 0}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Восстановить (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNewFloor}
                  className="ml-2 flex h-8 items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:block">Новая планировка</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Создать новую планировку</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-md border p-2">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Уменьшить масштаб (Ctrl+-)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-xs">{zoomLevel}%</span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Увеличить масштаб (Ctrl++)</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setZoomLevel(100)}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Сбросить масштаб</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="show-grid"
              checked={showGrid}
              onCheckedChange={() => setShowGrid((v) => !v)}
            />
            <Label htmlFor="show-grid" className="cursor-pointer text-xs">
              <span className="flex items-center">
                <Grid
                  className={`mr-1 h-3 w-3 ${showGrid ? "text-primary" : "text-muted-foreground"}`}
                />
                Показать сетку
              </span>
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="show-minimap"
              checked={showMinimap}
              onCheckedChange={() => setShowMinimap((v) => !v)}
            />
            <Label htmlFor="show-minimap" className="cursor-pointer text-xs">
              Показать мини-карту
            </Label>
          </div>

          {showGrid && (
            <>
              <div className="flex items-center gap-2">
                <Label htmlFor="grid-size" className="text-xs">
                  Размер сетки:
                </Label>
                <Select
                  value={gridSize.toString()}
                  onValueChange={(value) => setGridSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="grid-opacity" className="text-xs">
                  Контраст сетки:
                </Label>
                <Select
                  value={gridOpacity.toString()}
                  onValueChange={(value) => setGridOpacity(Number(value))}
                >
                  <SelectTrigger className="h-8 w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">Светлая</SelectItem>
                    <SelectItem value="0.2">Средняя</SelectItem>
                    <SelectItem value="0.4">Тёмная</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border-2 border-border">
        <DndProvider backend={HTML5Backend}>
          <div className="flex flex-col border-b lg:flex-row">
            <div className="relative flex-1 p-4">
              <div
                className="relative overflow-hidden rounded-md bg-muted/50 p-2"
                style={{
                  minHeight: "600px",
                  backgroundImage: showGrid
                    ? `linear-gradient(to right, hsl(var(--muted-foreground) / ${gridOpacity}) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--muted-foreground) / ${gridOpacity}) 1px, transparent 1px)`
                    : "none",
                  backgroundSize: `calc(100% / ${100 / gridSize}) calc(100% / ${100 / gridSize})`,
                  transition:
                    "background-image 0.2s ease, background-size 0.3s ease",
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "0 0",
                    width: `${10000 / zoomLevel}%`,
                    height: `${10000 / zoomLevel}%`,
                  }}
                >
                  {selectedFloor && (
                    <DropZone
                      floorId={selectedFloor.id}
                      elements={selectedFloor.entities}
                      setElements={handleSetElements}
                      onElementSelect={handleElementSelect}
                      selectedElement={selectedElement}
                      onElementUpdate={handleUpdateElement}
                      onElementAdd={handleAddElement}
                    />
                  )}
                </div>
              </div>

              {showMinimap &&
                selectedFloor &&
                selectedFloor.entities.length > 0 && (
                  <div className="absolute bottom-8 right-8 h-32 w-32 border border-border bg-background/80 p-1 shadow-md">
                    <div className="relative h-full w-full">
                      {selectedFloor.entities.map((element) => (
                        <div
                          key={`minimap-${element.id}`}
                          className="absolute bg-primary/50"
                          style={{
                            left: `${element.x}%`,
                            top: `${element.y}%`,
                            width: `${element.width}%`,
                            height: `${element.height}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
            </div>
            <EditorSidebar
              selectedElement={selectedElement}
              onElementUpdate={handleUpdateElement}
              onElementDelete={handleDeleteElement}
              isDirty={isDirty ?? false}
              isSaving={isSaving ?? false}
              onSave={() => {
                void saveChanges({
                  id: selectedFloor?.id ?? "",
                  name: selectedFloor?.name ?? "",
                  entities: selectedFloor?.entities ?? [],
                  createdAt: selectedFloor?.createdAt ?? new Date(),
                });
              }}
            />
          </div>
        </DndProvider>
      </div>
    </div>
  );
}
