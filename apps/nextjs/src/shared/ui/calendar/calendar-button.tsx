import type { AriaButtonProps } from "@react-aria/button";
import type { CalendarState } from "@react-stately/calendar";
import { useRef } from "react";
import { useButton } from "@react-aria/button";
import { useFocusRing } from "@react-aria/focus";
import { mergeProps } from "@react-aria/utils";

import { cn } from "@acme/ui";

export function Button(
  props: AriaButtonProps<"button"> & {
    state?: CalendarState;
    side?: "left" | "right";
  },
) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <button
      {...mergeProps(buttonProps, focusProps)}
      ref={ref}
      className={cn(
        "text-gray-12 rounded-lg p-2 outline-none",
        props.isDisabled ? "text-gray-7" : "hover:bg-gray-4 active:bg-gray-5",
        isFocusVisible && "ring-gray-9 ring-2 ring-offset-2",
      )}
    >
      {props.children}
    </button>
  );
}
