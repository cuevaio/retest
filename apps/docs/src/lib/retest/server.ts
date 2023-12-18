import {
  generateUseRetestServer,
  generateRetestBlockServer,
} from "@retestlabs/nextjs/server";

import { experiments } from ".";

export const RetestBlockServer = generateRetestBlockServer(experiments);
export const useRetestServer = generateUseRetestServer(experiments);
