"use client";

import { useCallback } from "react";
import { Grid3X3, LayoutGrid, Save, Trash2, Copy } from "lucide-react";

import { Button } from "@acme/ui/button";
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

import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";
import { DraggableItem } from "~/entities/room-element/ui/draggable-item";

interface EditorSidebarProps {
  selectedElement: TBookingEntity | null;
  onElementUpdate: (element: TBookingEntity) => void;
  onElementDelete: (element: TBookingEntity) => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
}

const currentHost = typeof window !== "undefined" ? window.location.origin : "";

export function EditorSidebar({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onSave,
  isSaving,
  isDirty,
}: EditorSidebarProps) {
  const handleNameChange = useCallback(
    (name: string) => {
      if (selectedElement) {
        onElementUpdate({ ...selectedElement, title: name });
      }
    },
    [selectedElement, onElementUpdate],
  );

  const handleCapacityChange = useCallback(
    (capacity: string) => {
      if (selectedElement) {
        onElementUpdate({ ...selectedElement, capacity: Number(capacity) });
      }
    },
    [selectedElement, onElementUpdate],
  );

  const handleTypeChange = useCallback(
    (type: string) => {
      if (selectedElement) {
        onElementUpdate({
          ...selectedElement,
          type: type as "ROOM" | "OPEN_SPACE",
        });
      }
    },
    [selectedElement, onElementUpdate],
  );

  const handleSizeChange = useCallback(
    (prop: "width" | "height", value: number) => {
      if (selectedElement) {
        onElementUpdate({ ...selectedElement, [prop]: value });
      }
    },
    [selectedElement, onElementUpdate],
  );

  const handleDelete = useCallback(() => {
    if (selectedElement) {
      onElementDelete(selectedElement);
    }
  }, [selectedElement, onElementDelete]);

  return (
    <div className="flex w-full flex-col justify-between p-4 lg:w-64">
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium">Элементы помещения</h4>
          <div className="flex flex-wrap gap-2">
            <DraggableItem type="ROOM" name="Комната">
              <Button variant="outline" size="sm" className="w-full cursor-grab justify-start">
                <Grid3X3 className="mr-2 h-4 w-4" />
                Комната
              </Button>
            </DraggableItem>

            <DraggableItem type="OPEN_SPACE" name="Open Space">
              <Button variant="outline" size="sm" className="w-full cursor-grab justify-start">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Open Space
              </Button>
            </DraggableItem>
          </div>
        </div>
        <Separator />

        {selectedElement ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium">Свойства элемента</h4>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={selectedElement.title || ""}
                  onChange={(e) => handleNameChange(e.target.value)}
                  onBlur={(e) => handleNameChange(e.target.value)}
                  placeholder="Название элемента"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="capacity">Вместимость</Label>
                <Input
                  id="capacity"
                  value={selectedElement.capacity || ""}
                  onChange={(e) => handleCapacityChange(e.target.value)}
                  placeholder="Вместимость элемента"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="type">Тип</Label>
                <Select value={selectedElement.type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ROOM">Переговорная</SelectItem>
                    <SelectItem value="OPEN_SPACE">Open Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="width">Ширина (%)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={selectedElement.width}
                    onChange={(e) => handleSizeChange("width", Number(e.target.value))}
                    min={1}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="height">Высота (%)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={selectedElement.height}
                    onChange={(e) => handleSizeChange("height", Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="x-position">Позиция X (%)</Label>
                  <Input
                    id="x-position"
                    type="number"
                    value={selectedElement.x}
                    onChange={(e) =>
                      onElementUpdate({
                        ...selectedElement,
                        x: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="y-position">Позиция Y (%)</Label>
                  <Input
                    id="y-position"
                    type="number"
                    value={selectedElement.y}
                    onChange={(e) =>
                      onElementUpdate({
                        ...selectedElement,
                        y: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              {/* ----------- */}
              <div className="space-y-1">
                <Label>URL для экрана</Label>
                <div className="flex items-center gap-2">
                  <Input readOnly value={`${currentHost}/room-status/${selectedElement.id}`} className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      
                      await navigator.clipboard.writeText(`${currentHost}/room-status/${selectedElement.id}`);
                    }}
                    title="Копировать URL"
                  >
                    <Copy />
                  </Button>
                </div>
              </div>
              {/* ----------- */}
            </div>
          </div>
        ) : (
          <div>
            <h4 className="mb-2 text-sm font-medium">Свойства</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Выберите элемент на холсте для редактирования его свойств.</p>
              <p>Или перетащите элемент сверху, чтобы разместить его на холсте.</p>
            </div>
          </div>
        )}
      </div>
      <Button
        className="mt-4 w-full"
        onClick={() => {
          onSave()
        }}
        disabled={!isDirty || isSaving}
      >
        <Save className="mr-1 h-4 w-4" />
        Сохранить
      </Button>
    </div>
  );
}
