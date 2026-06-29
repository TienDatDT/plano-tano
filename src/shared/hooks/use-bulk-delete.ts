"use client";

import { useState, useCallback } from "react";

export interface BulkDeleteResult {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

interface UseBulkDeleteOptions {
  /**
   * Primary: tries bulk API endpoint first.
   * Should throw on failure so we fall back to individual deletes.
   */
  bulkDeleteFn?: (ids: string[]) => Promise<void>;
  /** Fallback: called once per id when bulkDeleteFn is absent or throws */
  singleDeleteFn: (id: string) => Promise<void>;
  /** Called after a successful (or partial) deletion to sync UI */
  onSuccess: (deletedIds: string[]) => void;
  /** Called after completing with a result summary */
  onComplete?: (result: BulkDeleteResult) => void;
}

export interface UseBulkDeleteReturn {
  isDeleting: boolean;
  deleteItems: (ids: string[]) => Promise<BulkDeleteResult>;
}

export function useBulkDelete({
  bulkDeleteFn,
  singleDeleteFn,
  onSuccess,
  onComplete,
}: UseBulkDeleteOptions): UseBulkDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteItems = useCallback(
    async (ids: string[]): Promise<BulkDeleteResult> => {
      if (ids.length === 0) return { success: 0, failed: 0, errors: [] };

      setIsDeleting(true);

      let result: BulkDeleteResult = { success: 0, failed: 0, errors: [] };

      try {
        // --- Strategy 1: Bulk API ---
        if (bulkDeleteFn) {
          try {
            await bulkDeleteFn(ids);
            result = { success: ids.length, failed: 0, errors: [] };
            onSuccess(ids);
            onComplete?.(result);
            return result;
          } catch {
            // Bulk API failed — fall through to individual deletes
          }
        }

        // --- Strategy 2: Individual deletes (Promise.allSettled for partial success) ---
        const settled = await Promise.allSettled(
          ids.map((id) => singleDeleteFn(id).then(() => id))
        );

        const deletedIds: string[] = [];

        settled.forEach((outcome, index) => {
          if (outcome.status === "fulfilled") {
            result.success++;
            deletedIds.push(ids[index]);
          } else {
            result.failed++;
            result.errors.push({
              id: ids[index],
              error:
                outcome.reason instanceof Error
                  ? outcome.reason.message
                  : "Unknown error",
            });
          }
        });

        if (deletedIds.length > 0) {
          onSuccess(deletedIds);
        }

        onComplete?.(result);
        return result;
      } finally {
        setIsDeleting(false);
      }
    },
    [bulkDeleteFn, singleDeleteFn, onSuccess, onComplete]
  );

  return { isDeleting, deleteItems };
}
