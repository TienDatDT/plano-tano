"use client";

import { useState } from "react";
import { StockInList } from "./StockInList";
import { StockInDetail } from "./StockInDetail";

export function StockInContent() {
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  const handleCreate = () => {
    setView("create");
    setSelectedReceiptId(null);
  };

  const handleViewDetail = (id: string) => {
    setSelectedReceiptId(id);
    setView("detail");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedReceiptId(null);
  };

  if (view === "list") {
    return <StockInList onCreate={handleCreate} onViewDetail={handleViewDetail} />;
  }

  return (
    <StockInDetail 
      onBack={handleBackToList} 
      initialData={selectedReceiptId ? { id: selectedReceiptId } : undefined} 
    />
  );
}

