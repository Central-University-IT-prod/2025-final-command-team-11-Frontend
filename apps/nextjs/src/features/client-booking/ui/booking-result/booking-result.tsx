import { MailPlus, UserPlus, X } from "lucide-react";

import { Button } from "@acme/ui/button";
import { CardContent } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { useBooking } from "../../hooks/use-booking";
import { OrderSelection } from "../booking-form-panel/order-selection";
import { QRCode } from "../booking-form-panel/qr-code";

export function BookingResult() {
  const {
    handleChangeOrders,
    orders,
    handleChangeGuests,
    guests,
    inviteGuestMutation,
    createOrderMutation,
    selectedEntity,
    timeFrom,
    timeTo,
    bookingId,
  } = useBooking();
  const handleOrdersChange = (orders: string[]) => {
    handleChangeOrders(orders);
  };
  const addGuest = () => {
    handleChangeGuests([...guests, { email: "" }]);
  };

  const removeGuest = (index: number) => {
    const newGuests = [...guests];
    newGuests.splice(index, 1);
    handleChangeGuests(newGuests);
  };

  const handleChange = (index: number, email: string) => {
    const newGuests = [...guests];
    newGuests[index] = { email };
    handleChangeGuests(newGuests);
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full transition-all">
        <CardContent className="px-0">
          <QRCode
            bookingId={bookingId}
            timeFrom={timeFrom ?? new Date()}
            timeTo={timeTo ?? new Date()}
            entityName={selectedEntity?.title ?? "Selected Space"}
          />
        </CardContent>
      </div>
      <div className="space-y-3 transition-all sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MailPlus className="size-4 text-primary" />
            <Label className="text-sm font-semibold sm:text-base">
              Пригласить гостей
            </Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGuest}
            className="h-8 gap-1 text-xs sm:text-sm"
          >
            <UserPlus className="size-3.5" />
            Добавить
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Добавьте адреса электронной почты гостей, которых вы хотите пригласить
          на это бронирование
        </p>

        {guests.length > 0 ? (
          <div className="space-y-2 rounded-md">
            <div className="flex items-center gap-2 text-xs font-medium sm:text-sm">
              <span className="text-muted-foreground">
                Список гостей ({guests.length})
              </span>
            </div>
            <div className="space-y-2">
              {guests.map((guest, index) => (
                <div
                  key={index}
                  className="group relative flex items-center space-x-2"
                >
                  <Input
                    id={`guest-${index}`}
                    type="email"
                    placeholder="Адрес электронной почты"
                    value={guest.email}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="pr-8 transition-all focus-within:border-primary/50 group-hover:border-primary/30"
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-muted/30 text-muted-foreground opacity-70 transition-opacity hover:bg-muted/50 hover:opacity-100 focus:outline-none focus:ring-1 focus:ring-primary/50"
                          onClick={() => removeGuest(index)}
                          aria-label="Remove guest"
                        >
                          <X className="size-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Удалить гостя</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-muted bg-muted/20 p-4 text-center text-sm text-muted-foreground">
            <p>Гостей ещё нет</p>
            <Button
              type="button"
              variant="ghost"
              onClick={addGuest}
              className="mt-2 h-8 text-xs hover:text-primary"
            >
              <UserPlus className="mr-1 size-3.5" />
              Добавить первого гостя
            </Button>
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={guests.length === 0}
          size="sm"
          onClick={() => {
            inviteGuestMutation.mutate({
              body: {
                email: guests[0]?.email ?? "",
              },
              params: {
                path: {
                  id: bookingId,
                },
              },
            });
          }}
        >
          Сохранить
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="rounded-lg transition-all">
          <OrderSelection
            selectedOrders={orders}
            onOrdersChange={handleOrdersChange}
          />
        </div>
        <div className="rounded-lg transition-all">
          <Button
            type="button"
            disabled={orders.length === 0}
            variant="outline"
            size="sm"
            onClick={() => {
              for (const order of orders) {
                createOrderMutation.mutate({
                  body: {
                    thing: order as "laptop" | "eboard" | "coffee",
                  },
                  params: {
                    path: {
                      bookingId: bookingId,
                    },
                  },
                });
              }
            }}
          >
            Добавить заказы
          </Button>
        </div>
      </div>
    </div>
  );
}
