import type { things } from "../constants";

export default function ThingIcon({
  thing,
  className,
}: {
  thing: (typeof things)[0];
  className?: string;
}) {
  return <thing.icon className={className} />;
}
