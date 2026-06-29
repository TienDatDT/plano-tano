"use client";

import { useCallback, useEffect, useState } from "react";
import { UnitHeader } from "@/modules/unit/components/UnitHeader";
import { UnitTable } from "@/modules/unit/components/UnitTable";
import { UnitDrawer } from "@/modules/unit/components/UnitDrawer";
import { UnitConversionTable } from "@/modules/unitconversion/components/UnitConversionTable";
import { UnitConversionDrawer } from "@/modules/unitconversion/components/UnitConversionDrawer";
import { UnitFilterBar } from "@/modules/unit/components/UnitFilterBar";
import { unitApi } from "@/modules/unit/api/unit.api";
import { unitConversionApi } from "@/modules/unitconversion/api/unitconversion.api";
import { toast } from "sonner";
import { ProductJson } from "@/modules/product/lib/serializeProduct";
import { productApi } from "@/modules/product/api/product.api";

export default function UnitsPage() {
  const [activeTab, setActiveTab] = useState<"units" | "conversions">("units");
  const [loading, setLoading] = useState(true);
  const [units, setUnits] = useState([]);
  const [conversions, setConversions] = useState([]);

  const [isUnitDrawerOpen, setIsUnitDrawerOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const [isConvDrawerOpen, setIsConvDrawerOpen] = useState(false);
  const [selectedConv, setSelectedConv] = useState<any>(null);

  const [products, setProducts] = useState<ProductJson[]>([]);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productApi.getProducts();
      if (res) {
        setProducts(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct])

  //-------------------Unit--------------------------------
  // Unit Handlers
  const handleAddUnit = () => {
    setSelectedUnit(null);
    setIsUnitDrawerOpen(true);
  };

  const handleDeleteUnit = async (id: string) => {
    try {
      await unitApi.deleteUnit(id);
      toast.success("Unit deleted successfully");
      await fetchUnits();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete unit");
    }
  }

  const handleEditUnit = async (unit: any) => {
    try {
      const data = await unitApi.getUnitById(unit.id);
      setSelectedUnit(data.data);
      setIsUnitDrawerOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch unit");
    }
  };

  const handleUnitSubmit = async (data: any) => {
    try {
      if (selectedUnit) {
        await unitApi.updateUnit(selectedUnit.id, data);
      } else {
        await unitApi.createUnit(data);
      }
      setIsUnitDrawerOpen(false);
      toast.success("Unit saved successfully");
      await fetchUnits();
    } catch (err: any) {
      toast.error(err.message || "Failed to save unit");
    }
  };
  // --------------------------Conversion--------------------------
  // Conversion Handlers
  const handleAddConv = () => {
    setSelectedConv(null);
    setIsConvDrawerOpen(true);
  };

  const handleEditConv = (conv: any) => {
    setSelectedConv(conv);
    setIsConvDrawerOpen(true);
  };

  // Fetch Data
  const fetchUnits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await unitApi.getUnits();
      if (response && response.data) {
        setUnits(response.data);
      } else {
        setUnits([]);
      }
    } catch (error) {
      toast.error("Failed to fetch units");
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [])

  const handleConvSubmit = async (data: any) => {
    try {
      if (selectedConv) {
        await unitConversionApi.updateConversion(selectedConv.id, data);
        toast.success("Conversion updated successfully");
      } else {
        await unitConversionApi.createConversion(data);
        toast.success("Conversion created successfully");
      }
      setIsConvDrawerOpen(false);
      await fetchConversions();
    } catch (err: any) {
      toast.error(err.message || "Failed to save conversion");
    }
  };

  const fetchConversions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await unitConversionApi.getConversions();
      if (response && response.data) {
        setConversions(response.data);
      } else {
        setConversions([]);
      }
    } catch (error) {
      toast.error("Failed to fetch conversions");
      setConversions([]);
    } finally {
      setLoading(false);
    }
  }, [])

  useEffect(() => {
    fetchUnits();
    fetchConversions();
  }, [fetchUnits, fetchConversions])


  return (
    <div className="flex min-h-screen flex-col bg-premium-bg p-6 lg:p-10">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Header Section */}
        <UnitHeader
          activeTab={activeTab}
          onAdd={activeTab === "units" ? handleAddUnit : handleAddConv}
          unitsCount={units.length}
          conversionsCount={conversions.length}
        />

        {/* Filter/Tab Section - Matching Reference Structure */}
        <section className="rounded-2xl border border-premium-border bg-white px-5 py-4 shadow-sm">
          <UnitFilterBar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </section>

        {/* Table Area - Matching Reference Structure */}
        <div className="space-y-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "units" ? (
              <UnitTable
                units={units}
                onEdit={handleEditUnit}
                onDelete={handleDeleteUnit} />
            ) : (
              <UnitConversionTable
                conversions={conversions}
                units={units}
                products={products}
                onEdit={handleEditConv}
              />
            )}
          </div>

          {/* Note: Pagination would go here if implemented, matching reference structure */}
        </div>
      </div>

      <UnitDrawer
        isOpen={isUnitDrawerOpen}
        onClose={() => setIsUnitDrawerOpen(false)}
        unit={selectedUnit}
        onSubmit={handleUnitSubmit}
      />

      <UnitConversionDrawer
        isOpen={isConvDrawerOpen}
        onClose={() => setIsConvDrawerOpen(false)}
        conversion={selectedConv}
        units={units}
        products={products}
        conversions={conversions}
        onSubmit={handleConvSubmit}
      />
    </div>
  );
}
