import { cn } from "@acme/ui";
import { Avatar, AvatarFallback } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";

export default function UserProfile({
  name,
  email,
  verified,
}: {
  name: string;
  email: string;
  verified: boolean;
}) {
  return (
    <div className="px-4 py-2">
      <div className="mb-4 flex items-center">
        <Avatar className="mr-4 h-16 w-16 border-2 border-gray-200">
          <AvatarFallback>
            {name
              .split(" ")
              .map((a) => a[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-medium">{name}</h3>
          <p className="text-sm text-gray-500">E-Mail: {email}</p>
          <Badge
            variant={verified ? "outline" : "destructive"}
            className={cn(
              "mt-1",
              verified ? "bg-green-400 dark:bg-green-600" : "",
            )}
          >
            {verified ? "Верифицирован" : "Не верефицирован"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
