import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function TimeAgo({ date }: { date: string | number | Date }) {
  return (
    <span>
      {formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: ru,
      })}
    </span>
  );
}
