import type { Column } from "@tanstack/react-table";
import * as React from "react";
import { Check, Filter, PlusCircle, X } from "lucide-react";

import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@acme/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@acme/ui/popover";
import { Separator } from "@acme/ui/separator";

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function UsersTableFilter<TData, TValue>({
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  const [open, setOpen] = React.useState(false);

  const removeFilter = React.useCallback(
    (value: string) => {
      selectedValues.delete(value);
      const filterValues = Array.from(selectedValues);
      column?.setFilterValue(filterValues.length ? filterValues : undefined);
    },
    [column, selectedValues],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 gap-1 border-dashed px-3 transition-all",
            selectedValues.size > 0
              ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
              : "text-muted-foreground",
          )}
        >
          {selectedValues.size > 0 ? (
            <Filter className="h-3.5 w-3.5" />
          ) : (
            <PlusCircle className="h-3.5 w-3.5" />
          )}
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-1 h-4" />
              <Badge
                variant="secondary"
                className="rounded-full bg-primary/20 px-1 text-xs font-normal text-primary"
              >
                {selectedValues.size}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <CommandInput
              placeholder={`Поиск по ${title?.toLowerCase() ?? ""}...`}
              className="h-9 border-0 text-sm focus:ring-0"
            />
            {selectedValues.size > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 rounded-full p-0"
                onClick={() => column?.setFilterValue(undefined)}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="sr-only">Очистить фильтры</span>
              </Button>
            )}
          </div>
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm text-muted-foreground">
                Нет результатов.
              </div>
            </CommandEmpty>
            <CommandGroup heading="Опции">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column?.setFilterValue(
                        filterValues.length ? filterValues : undefined,
                      );
                    }}
                    className={cn(
                      "cursor-pointer gap-2 transition-colors",
                      isSelected && "bg-primary/5 text-primary",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                      {option.icon && (
                        <option.icon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm">{option.label}</span>
                    </div>
                    {facets?.get(option.value) && (
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Выбранные фильтры">
                  <div className="flex flex-wrap gap-1 p-2">
                    {Array.from(selectedValues).map((value) => {
                      const option = options.find((opt) => opt.value === value);
                      return option ? (
                        <Badge
                          key={value}
                          variant="outline"
                          className="cursor-pointer gap-1 rounded-sm px-2 py-1 hover:bg-secondary"
                          onClick={() => removeFilter(value)}
                        >
                          {option.label}
                          <X className="h-3 w-3" />
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <CommandItem
                    onSelect={() => column?.setFilterValue(undefined)}
                    className="cursor-pointer justify-center text-center text-xs text-muted-foreground hover:text-foreground"
                  >
                    Очистить все фильтры
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
