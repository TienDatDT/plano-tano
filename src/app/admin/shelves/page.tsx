import { ShelfManagementView } from "@/modules/shelves/components/ShelfManagementView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shelf Management | TanaPlano Admin",
  description: "Manage your store shelves and planogram templates.",
};

export default function AdminShelvesPage() {
  return <ShelfManagementView />;
}
