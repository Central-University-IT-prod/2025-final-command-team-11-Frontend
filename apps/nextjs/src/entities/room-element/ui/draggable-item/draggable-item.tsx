"use client";

import { useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

import type { DraggableItemProps } from "../../model/room-element.types";

export function DraggableItem({ type, name, children }: DraggableItemProps) {
  const [{ isDragging }, dragRef] = useDrag<
    { type: string; title: string },
    unknown,
    { isDragging: boolean }
  >(() => ({
    type: "roomElement",
    item: { type, title: name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      dragRef(ref);
    }
  }, [dragRef]);

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
}
