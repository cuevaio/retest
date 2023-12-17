"use client";

import * as React from "react";
import { getQueryKey } from "@trpc/react-query";

import { Input } from "@retestlabs/ui/input";
import { Label } from "@retestlabs/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@retestlabs/ui/popover";

import { Button } from "@retestlabs/ui/button";
import { trpc } from "@/lib/trpc";
import { useToast } from "@retestlabs/ui/use-toast";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";

export const AddVariant = () => {
  let { experimentId } = useParams<{ experimentId: string }>();
  const { toast } = useToast();

  let [openFormModal, setOpenFormModal] = React.useState(false);

  let queryClient = useQueryClient();
  let listVariants = getQueryKey(trpc.listVariants, { experimentId }, "query");
  let createVariant = trpc.createVariant.useMutation({
    onSuccess: (data) => {
      setOpenFormModal(false);
      toast({
        title: "Variant created",
        description: "ID: " + data.id,
      });
      queryClient.invalidateQueries(listVariants);
    },
    onError: (error) => {
      toast({
        title: "Error creating variant",
        description: error.message,
      });
    },
  });

  return (
    <>
      <Popover open={openFormModal} onOpenChange={setOpenFormModal}>
        <PopoverTrigger className="w-full">
          <div className="w-full flex px-4 py-2 border-t items-center text-primary">
            <div className="flex-0">
              <PlusIcon className="w-4 h-4 font-light" />
            </div>

            <p className="flex-grow px-3 text-sm text-left">Add a variant</p>
          </div>
        </PopoverTrigger>{" "}
        <PopoverContent className="w-64 p-2" side="right">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              let formData = new FormData(event.currentTarget);
              let name = formData.get("name") as string;

              createVariant.mutate({
                name,
                experimentId,
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex justify-between">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={createVariant.isLoading}
                onClick={() => {
                  setOpenFormModal(false);
                }}
              >
                Back
              </Button>
              <Button type="submit" size="sm">
                Add variant
              </Button>
            </div>
          </form>
        </PopoverContent>
      </Popover>
    </>
  );
};
