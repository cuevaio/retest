import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@retestlabs/ui/tooltip";

import { AlertCircle } from "lucide-react";
import { Button } from "@retestlabs/ui/button";

export const InputHint = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider delayDuration={100}>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-min h-min rounded-full p-0.5 text-muted-foreground"
        >
          <AlertCircle className="w-4 h-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{children}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
