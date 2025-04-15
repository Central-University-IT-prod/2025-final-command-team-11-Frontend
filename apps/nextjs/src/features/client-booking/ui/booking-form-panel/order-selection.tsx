"use client";

import { Package } from "lucide-react";

import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Label } from "@acme/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { things } from "~/features/admin/orders-list/constants";

interface OrderSelectionProps {
  selectedOrders: string[];
  onOrdersChange: (orders: string[]) => void;
}

export function OrderSelection({
  selectedOrders,
  onOrdersChange,
}: OrderSelectionProps) {
  const toggleOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      onOrdersChange(selectedOrders.filter((id) => id !== orderId));
    } else {
      onOrdersChange([...selectedOrders, orderId]);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-primary" />
          <Label className="text-sm font-semibold sm:text-base">
            Дополнительные услуги
          </Label>
        </div>

        {selectedOrders.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {selectedOrders.length} выбрано
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Выберите дополнительные услуги для вашего бронирования
      </p>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {things.map((item) => (
          <TooltipProvider key={item.value}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={
                    selectedOrders.includes(item.value) ? "default" : "outline"
                  }
                  className={cn(
                    "group flex h-auto w-full flex-col items-center justify-center gap-1 border p-2 transition-all hover:bg-primary/10 sm:gap-2 sm:p-4",
                    selectedOrders.includes(item.value)
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "bg-transparent hover:border-primary/20 hover:bg-muted/5",
                  )}
                  onClick={() => toggleOrder(item.value)}
                >
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full transition-colors",
                      selectedOrders.includes(item.value)
                        ? "bg-primary/10 text-primary"
                        : "bg-muted/30 text-muted-foreground group-hover:bg-muted/40",
                    )}
                  >
                    <item.icon className="size-4 sm:size-5" />
                  </div>
                  <span className="text-wrap text-xs font-medium sm:text-sm">
                    {item.label}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="flex items-center gap-1">
                  <item.icon className="size-3.5" />
                  <span>{item.label}</span>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  );
}
