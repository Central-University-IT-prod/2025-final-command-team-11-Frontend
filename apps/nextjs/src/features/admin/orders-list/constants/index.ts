import {
  CircleAlert,
  CircleCheck,
  Coffee,
  Laptop,
  Monitor,
} from "lucide-react";

export const statuses = [
  {
    value: "done",
    label: "Выполнен",
    icon: CircleCheck,
  },
  {
    value: "not-done",
    label: "Не выполнен",
    icon: CircleAlert,
  },
];

export const things = [
  {
    value: "laptop",
    label: "Ноутбук",
    icon: Laptop,
  },
  {
    value: "eboard",
    label: "Электронная доска",
    icon: Monitor,
  },
  {
    value: "coffee",
    label: "Кофе",
    icon: Coffee,
  },
];
