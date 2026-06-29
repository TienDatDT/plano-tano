"use client";

import { useAlert } from "@/shared/components/AlertProvider";

export function useConfirm() {
  const { confirm } = useAlert();
  return confirm;
}
