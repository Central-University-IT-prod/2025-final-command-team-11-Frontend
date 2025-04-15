import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2Icon, Loader2 } from "lucide-react";

import { $adminApi } from "@acme/api";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

interface ActionButtonProps {
  id: string;
  orderName?: string;
}

export default function ActionButton({ id, orderName }: ActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const mutation = $adminApi.useMutation("post", "/orders/{id}", {
    onError: (error) => {
      toast.error("Error completing order", {
        description: error.error,
      });
      setIsLoading(false);
    },
    onSuccess: () => {
      toast.success("Order completed successfully");
      setIsLoading(false);
    },
  });

  const handleCompleteOrder = async () => {
    try {
      setIsLoading(true);
      await mutation.mutateAsync({
        params: {
          path: {
            id,
          },
        },
      });

      router.refresh();

      toast.success(
        orderName
          ? `Заказ "${orderName}" успешно выполнен`
          : "Заказ успешно выполнен",
      );
    } catch (error) {
      console.error("Failed to complete order:", error);
      toast.error(
        "Не удалось выполнить заказ. Пожалуйста, попробуйте еще раз.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isLoading ? "outline" : "default"}
            size="sm"
            onClick={handleCompleteOrder}
            disabled={isLoading}
            className="relative h-9 w-9 border-green-200 bg-green-50 p-0 text-green-700 hover:bg-green-100 hover:text-green-800"
            aria-label="Отметить как выполненный"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <CheckCircle2Icon className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Отметить заказ как выполненный</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
