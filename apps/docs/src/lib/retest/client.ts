"use client";

import {
  generateUseRetestClient,
  generateRetestBlockClient,
} from "@retestlabs/nextjs/client";

import { experiments } from ".";

export const useRetestClient = generateUseRetestClient(experiments);
export const RetestBlockClient = generateRetestBlockClient(experiments);
