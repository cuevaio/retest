"use client";

import * as React from "react";

import { Label } from "@retestlabs/ui/label";
import { Button } from "@retestlabs/ui/button";

import { Badge } from "@retestlabs/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@retestlabs/ui/dialog";
import { Input } from "@retestlabs/ui/input";
import { trpc } from "@/lib/trpc";
import { useToast } from "@retestlabs/ui/use-toast";
import { useRouter } from "next/navigation";

export const DeleteForm = ({ name, id }: { id: string; name: string }) => {
  let [openDialog, setOpenDialog] = React.useState(false);
  const { toast } = useToast();
  let deleteExperiment = trpc.deleteExperiment.useMutation({
    onSuccess: (data) => {
      setOpenDialog(false);
      toast({
        title: "Experiment deleted",
      });
      router.push("/app/experiments");
    },
    onError: (error) => {
      toast({
        title: "Error deleting experiment",
        description: error.message,
      });
    },
  });
  let router = useRouter();

  return (
    <>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button type="button" size="sm" variant="destructive">
            Delete experiment
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete experiment</DialogTitle>
            <DialogDescription>
              This experiment will be deleted, along with all of its variants,
              events, and data points recollected.
            </DialogDescription>
            <Badge variant="destructive">
              Warning: This action is not reversible. Please be certain.
            </Badge>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              deleteExperiment.mutate({ experimentId: id });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">
                Enter the experiment name <strong>{name}</strong> to continue
              </Label>
              <Input
                id="name"
                type="text"
                pattern={`\s*${name}\s*`}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">
                Enter <strong>delete my experiment</strong> to continue
              </Label>
              <Input
                id="action"
                type="text"
                pattern={`\s*${"delete my experiment"}\s*`}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
              />
            </div>
            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button
                  type="reset"
                  variant="secondary"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={deleteExperiment.isLoading}>
                  Continue
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
