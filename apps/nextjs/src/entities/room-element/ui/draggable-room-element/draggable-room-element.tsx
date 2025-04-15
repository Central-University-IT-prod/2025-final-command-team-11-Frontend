"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

import type { DraggableRoomElementProps } from "../../model/room-element.types";

interface DragItem {
  id: string;
  left: number;
  top: number;
  type: string;
}

export function DraggableRoomElement({
  id,
  left,
  top,
  width,
  height,
  type,
  title: _title,
  isSelected,
  moveElement,
  resizeElement,
  onSelect,
  children,
}: DraggableRoomElementProps) {
  const [{ isDragging }, dragRef] = useDrag<
    DragItem,
    unknown,
    { isDragging: boolean }
  >(
    () => ({
      type: "placedElement",
      item: { id, left, top, type },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        if (!monitor.didDrop()) {
          return;
        }

        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) {
          return;
        }

        const dropZoneRect = document
          .getElementById("dropZone")
          ?.getBoundingClientRect();

        if (dropZoneRect) {
          const x = Math.round(
            (clientOffset.x - dropZoneRect.left) / (dropZoneRect.width / 100),
          );
          const y = Math.round(
            (clientOffset.y - dropZoneRect.top) / (dropZoneRect.height / 100),
          );

          moveElement(id, x, y);
        }
      },
    }),
    [id, left, top, type, moveElement],
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      dragRef(ref);
    }
  }, [dragRef]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onSelect) {
        onSelect(id);
      }
    },
    [id, onSelect],
  );

  const handleDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onSelect) {
        onSelect(id);
      }

      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft = left;
      const startTop = top;

      const onMouseMove = (moveEvent: MouseEvent) => {
        moveEvent.preventDefault();

        const dropZoneRect = document
          .getElementById("dropZone")
          ?.getBoundingClientRect();

        if (dropZoneRect) {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;

          const newLeft =
            startLeft + Math.round(deltaX / (dropZoneRect.width / 100));
          const newTop =
            startTop + Math.round(deltaY / (dropZoneRect.height / 100));

          moveElement(id, newLeft, newTop);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [id, left, top, moveElement, onSelect],
  );

  const handleResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onSelect) {
        onSelect(id);
      }

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = width;
      const startHeight = height;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        const dropZoneRect = document
          .getElementById("dropZone")
          ?.getBoundingClientRect();

        if (dropZoneRect) {
          const newWidth = Math.max(
            1,
            Math.round(
              ((startWidth * dropZoneRect.width) / 100 + deltaX) /
                (dropZoneRect.width / 100),
            ),
          );
          const newHeight = Math.max(
            1,
            Math.round(
              ((startHeight * dropZoneRect.height) / 100 + deltaY) /
                (dropZoneRect.height / 100),
            ),
          );

          resizeElement(id, newWidth, newHeight);
        }
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [id, width, height, resizeElement, onSelect],
  );

  return (
    <div
      ref={ref}
      onMouseDown={handleDrag}
      onClick={handleClick}
      className={`absolute rounded border-2 ${
        isSelected
          ? "border-solid border-primary ring-1 ring-primary"
          : "border-dashed border-primary/50"
      } bg-primary/10 p-2 ${
        isDragging ? "z-50 opacity-50 shadow-lg" : "opacity-100"
      }`}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        cursor: "move",
        transition: isDragging ? "none" : "all 0.1s",
      }}
    >
      {children}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize text-primary"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleResize(e);
        }}
      >
        <path
          d="M6 18H18V6"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
