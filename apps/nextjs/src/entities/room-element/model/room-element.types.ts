import type { TBookingEntity } from "~/entities/booking-entity/model/booking-entity.types";

export interface DraggableItemProps {
  type: string;
  name: string;
  children: React.ReactNode;
}

export interface DraggableRoomElementProps {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  type: string;
  title?: string;
  isSelected?: boolean;
  moveElement: (id: string, left: number, top: number) => void;
  resizeElement: (id: string, width: number, height: number) => void;
  onSelect?: (id: string) => void;
  children: React.ReactNode;
}

export interface DropZoneProps {
  children?: React.ReactNode;
  onElementSelect?: (element: TBookingEntity | null) => void;
  selectedElement?: TBookingEntity | null;
  onElementUpdate?: (element: TBookingEntity) => void;
  elements: TBookingEntity[];
  setElements: (
    elements: TBookingEntity[] | ((prev: TBookingEntity[]) => TBookingEntity[]),
  ) => void;
  onElementAdd?: (element: TBookingEntity) => void;
}
