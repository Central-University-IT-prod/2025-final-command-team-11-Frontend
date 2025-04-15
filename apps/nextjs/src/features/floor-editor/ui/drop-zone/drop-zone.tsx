"use client";

import { useCallback, useRef } from "react";
import { useDrop } from "react-dnd";
import { v4 as uuidv4 } from "uuid";

import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";
import type { DropZoneProps } from "~/entities/room-element/model/room-element.types";
import { DraggableRoomElement } from "~/entities/room-element/ui/draggable-room-element/draggable-room-element";

interface ExtendedDropZoneProps extends DropZoneProps {
  elements: TBookingEntity[];
  floorId: string;
  setElements: React.Dispatch<React.SetStateAction<TBookingEntity[]>>;
  onElementAdd?: (element: TBookingEntity) => void;
}

export function DropZone({
  children,
  elements,
  setElements,
  onElementSelect,
  selectedElement,
  onElementUpdate,
  onElementAdd,
  floorId,
}: ExtendedDropZoneProps) {
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const keepWithinBounds = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const boundedX = Math.max(0, Math.min(100 - width, x));
      const boundedY = Math.max(0, Math.min(100 - height, y));

      return { x: boundedX, y: boundedY };
    },
    [],
  );

  const generateDefaultName = useCallback(
    (type: string) => {
      const typeMap: Record<string, string> = {
        ROOM: "Переговорная",
        OPEN_SPACE: "Open Space",
      };

      const baseName = typeMap[type] ?? type;

      const existingOfType = elements.filter((el) => el.type === type);
      const count = existingOfType.length + 1;

      return `${baseName} ${count}`;
    },
    [elements],
  );

  const [, drop] = useDrop(
    () => ({
      accept: ["roomElement", "placedElement"],
      drop: (item: TBookingEntity, monitor) => {
        const dropZoneRect = dropZoneRef.current?.getBoundingClientRect();
        const offset = monitor.getClientOffset();

        if (dropZoneRect && offset) {
          let x = Math.round(
            (offset.x - dropZoneRect.left) / (dropZoneRect.width / 100),
          );
          let y = Math.round(
            (offset.y - dropZoneRect.top) / (dropZoneRect.height / 100),
          );

          if (item.id) {
            const existingElement = elements.find(
              (el) => String(el.id) === item.id,
            );
            if (existingElement) {
              const { width = 30, height = 10 } = existingElement;
              const bounded = keepWithinBounds(x, y, width, height);
              x = bounded.x;
              y = bounded.y;
            }

            setElements((prev) =>
              prev.map((el) =>
                String(el.id) === item.id ? { ...el, x, y } : el,
              ),
            );
          } else {
            const defaultName = generateDefaultName(item.type);

            const width = 30;
            const height = 10;

            const bounded = keepWithinBounds(x, y, width, height);
            x = bounded.x;
            y = bounded.y;

            const newElement: TBookingEntity = {
              type: item.type,
              title: defaultName,
              x,
              y,
              width,
              height,
              id: uuidv4(),
              capacity: 1,
              floor_id: floorId,
              updated_at: new Date().toISOString(),
            };

            if (onElementAdd) {
              onElementAdd(newElement);
            } else {
              setElements((prev) => [...prev, newElement]);
            }

            if (onElementSelect) {
              onElementSelect(newElement);
            }
          }
        }
      },
    }),
    [
      elements,
      generateDefaultName,
      onElementAdd,
      onElementSelect,
      setElements,
      keepWithinBounds,
    ],
  );

  const moveElement = useCallback(
    (id: string, left: number, top: number) => {
      const element = elements.find((el) => el.id === id);
      if (!element) return;

      const { width = 10, height = 10 } = element;
      const bounded = keepWithinBounds(left, top, width, height);

      setElements((prev) => {
        const updatedElements = prev.map((el) =>
          el.id === id ? { ...el, x: bounded.x, y: bounded.y } : el,
        );

        if (selectedElement && selectedElement.id === id && onElementUpdate) {
          const updatedElement = {
            ...selectedElement,
            x: bounded.x,
            y: bounded.y,
          };
          onElementUpdate(updatedElement);
        }

        return updatedElements;
      });
    },
    [elements, selectedElement, onElementUpdate, setElements, keepWithinBounds],
  );

  const resizeElement = useCallback(
    (id: string, width: number, height: number) => {
      const element = elements.find((el) => el.id === id);
      if (!element) return;

      const newWidth = Math.max(1, Math.min(100, width));
      const newHeight = Math.max(1, Math.min(100, height));

      const { x = 0, y = 0 } = element;
      const bounded = keepWithinBounds(x, y, newWidth, newHeight);

      setElements((prev) => {
        const updatedElements = prev.map((el) =>
          el.id === id
            ? {
                ...el,
                width: newWidth,
                height: newHeight,
                x: bounded.x,
                y: bounded.y,
              }
            : el,
        );

        if (selectedElement && selectedElement.id === id && onElementUpdate) {
          const updatedElement = {
            ...selectedElement,
            width: newWidth,
            height: newHeight,
            x: bounded.x,
            y: bounded.y,
          };
          onElementUpdate(updatedElement);
        }

        return updatedElements;
      });
    },
    [elements, selectedElement, onElementUpdate, setElements, keepWithinBounds],
  );

  const handleElementSelect = useCallback(
    (id: string) => {
      const element = elements.find((el) => el.id === id) ?? null;
      if (onElementSelect) {
        onElementSelect(element);
      }
    },
    [elements, onElementSelect],
  );

  return (
    <div
      id="dropZone"
      ref={(node) => {
        drop(node);
        dropZoneRef.current = node;
      }}
      className="relative h-full w-full"
      style={{
        minHeight: "600px",
        backgroundSize: "calc(100% / 100) calc(100% / 100)",
      }}
      onClick={() => onElementSelect && onElementSelect(null)}
    >
      {children}
      {elements.map((element) => (
        <DraggableRoomElement
          key={element.id}
          id={element.id}
          left={element.x}
          top={element.y}
          width={element.width}
          height={element.height}
          type={element.type}
          title={element.title}
          isSelected={selectedElement?.id === element.id}
          moveElement={moveElement}
          resizeElement={resizeElement}
          onSelect={handleElementSelect}
        >
          <div className="text-xs font-medium">{element.title}</div>
        </DraggableRoomElement>
      ))}
    </div>
  );
}
