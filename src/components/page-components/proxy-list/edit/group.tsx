import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import proxyListStore from "@/stores/proxy-list";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Label } from "@radix-ui/react-label";
import { PopoverClose } from "@radix-ui/react-popover";

import React, { useEffect } from "react";

export function EditGroupDialog() {
  const { selectedGroup, updateGroup, deleteGroup } = proxyListStore();
  const [groupName, setGroupName] = React.useState("");
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (!selectedGroup) return;
    setGroupName(selectedGroup.name);
  }, [selectedGroup]);

  if (!selectedGroup) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size={"xs"} className="flex">
          Edit
        </Button>
        {/* <Button variant="outline" className="w-full">
          <PlusIcon className="h-4 w-4" />
          Add Group
        </Button> */}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>Edit the name of the group.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="name" className="sr-only">
              Group Name
            </Label>
            <Input
              id="name"
              placeholder="ex) Workplace"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
              }}
            />
          </div>
        </div>
        <DialogFooter className="flex w-full sm:justify-between items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant={"ghost"}>
                <TrashIcon className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">
                    Delete {selectedGroup?.name}?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <PopoverClose asChild>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </PopoverClose>
                  <PopoverClose asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        deleteGroup(selectedGroup.id);
                      }}
                    >
                      Delete
                    </Button>
                  </PopoverClose>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            type="submit"
            disabled={!groupName || groupName.length === 0}
            onClick={() => {
              if (!groupName || groupName.length === 0) return;
              selectedGroup.name = groupName;
              updateGroup(selectedGroup);
              setOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
