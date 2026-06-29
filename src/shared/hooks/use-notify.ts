"use client";

import { useAlert } from "@/shared/components/AlertProvider";

export function useNotify() {
  const { notify } = useAlert();
  return notify;
}
