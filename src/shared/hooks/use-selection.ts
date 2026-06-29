"use client";

import { useState, useCallback, useMemo, useRef } from "react";

interface UseSelectionOptions<T> {
  /** Full current visible list (e.g. paginated slice) */
  items: T[];
  /** How to extract a stable unique key from an item */
  getKey: (item: T) => string;
  /**
   * Optional guard — items where this returns false cannot be selected.
   * Their checkboxes will be rendered disabled by the consumer.
   */
  canSelect?: (item: T) => boolean;
}

export interface UseSelectionReturn {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  /** Toggle a single item, with optional shift-click range */
  toggle: (id: string, shiftKey?: boolean) => void;
  /** Select all selectable items in the current page */
  selectAll: () => void;
  /** Clear the entire selection */
  clearSelection: () => void;
  /** Header checkbox action — select all if not all selected, else clear */
  toggleAll: () => void;
  /** Number of currently selected items */
  count: number;
  /** True when every selectable item on the current page is selected */
  isAllSelected: boolean;
  /** True when some (but not all) selectable items are selected */
  isIndeterminate: boolean;
  /** How many selectable items exist in the current view */
  selectableCount: number;
}

export function useSelection<T>({
  items,
  getKey,
  canSelect,
}: UseSelectionOptions<T>): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Track last clicked index for shift+click range selection
  const lastClickedIndexRef = useRef<number | null>(null);

  // All keys in current view that are selectable
  const selectableItems = useMemo(
    () => (canSelect ? items.filter(canSelect) : items),
    [items, canSelect]
  );

  const selectableKeys = useMemo(
    () => selectableItems.map(getKey),
    [selectableItems, getKey]
  );

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggle = useCallback(
    (id: string, shiftKey = false) => {
      const currentIndex = items.findIndex((item) => getKey(item) === id);

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (
          shiftKey &&
          lastClickedIndexRef.current !== null &&
          currentIndex !== -1
        ) {
          // Range select
          const from = Math.min(lastClickedIndexRef.current, currentIndex);
          const to = Math.max(lastClickedIndexRef.current, currentIndex);
          const shouldSelect = !prev.has(id);

          for (let i = from; i <= to; i++) {
            const item = items[i];
            if (!item) continue;
            if (canSelect && !canSelect(item)) continue;
            const key = getKey(item);
            if (shouldSelect) {
              next.add(key);
            } else {
              next.delete(key);
            }
          }
        } else {
          // Single toggle
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }

        return next;
      });

      if (currentIndex !== -1) {
        lastClickedIndexRef.current = currentIndex;
      }
    },
    [items, getKey, canSelect]
  );

  const selectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selectableKeys.forEach((k) => next.add(k));
      return next;
    });
  }, [selectableKeys]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    lastClickedIndexRef.current = null;
  }, []);

  const selectableCount = selectableKeys.length;

  const selectedSelectableCount = useMemo(
    () => selectableKeys.filter((k) => selectedIds.has(k)).length,
    [selectableKeys, selectedIds]
  );

  const isAllSelected =
    selectableCount > 0 && selectedSelectableCount === selectableCount;

  const isIndeterminate =
    selectedSelectableCount > 0 && selectedSelectableCount < selectableCount;

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      // Deselect only items visible on current page
      setSelectedIds((prev) => {
        const next = new Set(prev);
        selectableKeys.forEach((k) => next.delete(k));
        return next;
      });
    } else {
      selectAll();
    }
  }, [isAllSelected, selectAll, selectableKeys]);

  return {
    selectedIds,
    isSelected,
    toggle,
    selectAll,
    clearSelection,
    toggleAll,
    count: selectedIds.size,
    isAllSelected,
    isIndeterminate,
    selectableCount,
  };
}
