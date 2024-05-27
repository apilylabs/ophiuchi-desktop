"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import proxyListStore from "@/stores/proxy-list";
import { CommandList } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

export function ProxyGroupSelect() {
  const { selectedGroup, groupList } = proxyListStore();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(selectedGroup?.id ?? "");

  React.useEffect(() => {
    if (!selectedGroup) return;
    setValue(selectedGroup.id);
  }, [selectedGroup]);

  React.useEffect(() => {}, [groupList]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {value
            ? groupList.find((group) => group.id === value)?.name
            : "Select group..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search group..." />
          <CommandEmpty>No groups found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {groupList.map((group) => {
                return (
                  <CommandItem
                    key={group.id}
                    value={group.id}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === group.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {group.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
