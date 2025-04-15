import { ArrowLeft } from "lucide-react";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";

import type { BookingStep } from "../../model/booking-step.types";

interface BookingStepsProps {
  currentStep: BookingStep;
  onBack: () => void;
}

export function BookingSteps({ currentStep, onBack }: BookingStepsProps) {
  return (
    <div className="flex items-center gap-3">
      {currentStep !== "selection" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mr-2 gap-1 text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      )}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            currentStep === "selection"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          1
        </div>
        <div className="h-[2px] w-4 bg-muted"></div>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            currentStep === "map"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          2
        </div>
        <div className="h-[2px] w-4 bg-muted"></div>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            currentStep === "qrcode"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          3
        </div>
      </div>
    </div>
  );
}
