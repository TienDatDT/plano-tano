"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Package,
  Layers,
  Plus,
  Minus,
  CheckCircle2,
  HelpCircle,
  Eye,
  RefreshCw,
  Layout,
  CornerDownRight
} from "lucide-react";
import { storeLayoutApi } from "@/modules/store-layout/api/store-layout.api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface POSCartItem {
  productId: string;
  productName: string;
  description: string | null;
  imageUrl: string | null;
  categoryName: string;
  variantId: string;
  sku: string;
  unitName: string;
  salePrice: number;
  batchId: string;
  lotNumber: string;
  expDate: string | Date | null;
  stockQuantity: number;
  quantity: number;
}

export function StoreView() {
  const router = useRouter();

  // Switcher and Full Layout states
  const [layouts, setLayouts] = useState<any[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("");
  const [layout, setLayout] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Interaction and Canvas states
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hoveredShelfId, setHoveredShelfId] = useState<string | null>(null);
  const [selectedProductVariantId, setSelectedProductVariantId] = useState<string | null>(null);
  
  // Persistent Cashier Shopping Cart State
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch panning & zooming state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchState = useRef({
    startX: 0, startY: 0, startPanX: 0, startPanY: 0, initialDistance: 0, initialZoom: 1
  });
  const [lastTap, setLastTap] = useState(0);

  // 1. Fetch layouts switcher list on initial load
  const loadLayoutsList = async () => {
    try {
      const res = await storeLayoutApi.getAll();
      if (res.success && Array.isArray(res.data)) {
        setLayouts(res.data);
        const activeLayout = res.data.find((l: any) => l.isActive) || res.data[0];
        if (activeLayout) {
          setSelectedLayoutId(activeLayout.id);
        }
      }
    } catch (e: any) {
      toast.error("Failed to load store layout switcher templates");
    }
  };

  // 2. Fetch full layout detail with nested shelves, cells, items, and variant batches
  const loadFullLayout = async (layoutId: string) => {
    try {
      setLoading(true);
      const res = await storeLayoutApi.getById(layoutId);
      if (res.success && res.data) {
        setLayout(res.data);
      }
    } catch (e: any) {
      toast.error("Failed to load hierarchical layout data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLayoutsList();
  }, []);

  useEffect(() => {
    if (selectedLayoutId) {
      loadFullLayout(selectedLayoutId);
    }
  }, [selectedLayoutId]);

  // Load existing persistent cashier cart from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem("tanaplano_pos_cart");
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to parse cashier cart from storage:", err);
      }
    }
  }, []);

  // Sync state changes back to localStorage to avoid state loss
  const saveCartToStorage = (updatedCart: POSCartItem[]) => {
    setCartItems(updatedCart);
    localStorage.setItem("tanaplano_pos_cart", JSON.stringify(updatedCart));
  };

  const GRID_SIZE = 40;

  // 3. Map all physical layout items placed on active shelves
  const flattenedShelfItems = useMemo(() => {
    if (!layout?.shelves) return [];
    
    const itemsList: any[] = [];
    for (const shelf of layout.shelves) {
      const cols = shelf.template?.layoutType === "GRID" ? (shelf.template?.columns ?? 2) : 2;
      const rows = shelf.template?.layoutType === "GRID" ? (shelf.template?.rows ?? 1) : 1;
      const width = cols * GRID_SIZE;
      const height = rows * GRID_SIZE;
      
      for (const cell of shelf.cells) {
        for (const item of cell.items) {
          if (!item.batch?.variant?.product) continue;
          
          itemsList.push({
            id: item.id,
            shelfId: shelf.id,
            shelfName: shelf.name || "Shelf",
            shelfX: shelf.posX * GRID_SIZE,
            shelfY: shelf.posY * GRID_SIZE,
            shelfWidth: width,
            shelfHeight: height,
            cellId: cell.id,
            row: cell.row,
            column: cell.column,
            batchId: item.batch.id,
            lotNumber: item.batch.lotNumber,
            importPrice: Number(item.batch.importPrice),
            stockQuantity: item.batch.quantity,
            expDate: item.batch.expDate,
            variantId: item.batch.variant.id,
            sku: item.batch.variant.sku,
            salePrice: Number(item.batch.variant.salePrice),
            productId: item.batch.variant.product.id,
            productName: item.batch.variant.product.name,
            description: item.batch.variant.product.description,
            imageUrl: item.batch.variant.product.imageUrl || null,
            categoryName: item.batch.variant.product.category?.name || "Stationery",
            unitName: item.batch.variant.unit?.name || "pcs"
          });
        }
      }
    }
    return itemsList;
  }, [layout]);

  // 4. Debounced client-side fuzzy searching on active store products
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    
    // Deduplicate matching variations by variantId so we show clean results
    const matchesMap = new Map<string, any>();
    
    for (const item of flattenedShelfItems) {
      if (
        item.productName.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.lotNumber.toLowerCase().includes(q)
      ) {
        matchesMap.set(item.variantId, item);
      }
    }
    return Array.from(matchesMap.values());
  }, [searchQuery, flattenedShelfItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.salePrice * item.quantity, 0);
  }, [cartItems]);

  const handleSearchFocus = () => {
    setIsSearchActive(true);
    setIsCartOpen(false);
  };

  // Add Item to shopping register cart
  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    
    const posCartItem: POSCartItem = {
      productId: item.productId,
      productName: item.productName,
      description: item.description,
      imageUrl: item.imageUrl,
      categoryName: item.categoryName,
      variantId: item.variantId,
      sku: item.sku,
      unitName: item.unitName,
      salePrice: item.salePrice,
      batchId: item.batchId,
      lotNumber: item.lotNumber,
      expDate: item.expDate,
      stockQuantity: item.stockQuantity,
      quantity: 1
    };

    const existingIndex = cartItems.findIndex(i => i.variantId === item.variantId && i.batchId === item.batchId);
    let newCart: POSCartItem[] = [];

    if (existingIndex > -1) {
      newCart = cartItems.map((cItem, index) => 
        index === existingIndex ? { ...cItem, quantity: cItem.quantity + 1 } : cItem
      );
    } else {
      newCart = [...cartItems, posCartItem];
    }

    saveCartToStorage(newCart);
    toast.success(`Added ${item.productName} to cashier order`);
  };

  const updateCartQuantity = (variantId: string, batchId: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.variantId === variantId && item.batchId === batchId) {
        return { ...item, quantity: item.quantity + delta };
      }
      return item;
    }).filter(item => item.quantity > 0);

    saveCartToStorage(updated);
  };

  // Confirm order redirects directly to POS, preloading register basket memory
  const handleConfirmOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Shopping cart is empty");
      return;
    }
    
    // Save to shared localStorage key used by POSUI
    localStorage.setItem("tanaplano_pos_cart", JSON.stringify(cartItems));
    toast.success("Order saved! Navigating to POS cash register...");
    
    setTimeout(() => {
      router.push("/pos");
    }, 600);
  };

  // Zoom to and highlight clicked product
  const handleProductSelect = (variantId: string) => {
    setSelectedProductVariantId(variantId);
    setIsSearchActive(true); // Open Details Sidebar!
    setIsCartOpen(false); // Close Cart Sidebar to prevent overlap!
    
    // Find the shelf holding this product variant
    const matchedItem = flattenedShelfItems.find(item => item.variantId === variantId);
    
    if (matchedItem && containerRef.current) {
      setZoom(1.3); // Apply locator zoom
      
      setTimeout(() => {
        const shelfElement = document.getElementById(`shelf-${matchedItem.shelfId}`);
        if (shelfElement) {
          shelfElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center"
          });
        }
      }, 100);
    }
  };

  // Canvas interaction handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".shelf-item")) return;
    
    if ('touches' in e) {
      if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTap < 300) {
          setZoom(1);
        }
        setLastTap(now);

        touchState.current.startX = e.touches[0].clientX;
        touchState.current.startY = e.touches[0].clientY;
        touchState.current.startPanX = containerRef.current?.scrollLeft || 0;
        touchState.current.startPanY = containerRef.current?.scrollTop || 0;
        setIsDragging(true);
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchState.current.initialDistance = Math.sqrt(dx * dx + dy * dy);
        touchState.current.initialZoom = zoom;
      }
    } else {
      touchState.current.startX = e.clientX;
      touchState.current.startY = e.clientY;
      touchState.current.startPanX = containerRef.current?.scrollLeft || 0;
      touchState.current.startPanY = containerRef.current?.scrollTop || 0;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging && !('touches' in e && e.touches.length === 2)) return;
    
    if ('touches' in e) {
      if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - touchState.current.startX;
        const dy = e.touches[0].clientY - touchState.current.startY;
        if (containerRef.current) {
          containerRef.current.scrollLeft = touchState.current.startPanX - dx;
          containerRef.current.scrollTop = touchState.current.startPanY - dy;
        }
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = distance / (touchState.current.initialDistance || 1);
        const newZoom = Math.min(Math.max(0.5, touchState.current.initialZoom * scale), 2.5);
        setZoom(newZoom);
      }
    } else {
      if (isDragging) {
        const dx = e.clientX - touchState.current.startX;
        const dy = e.clientY - touchState.current.startY;
        if (containerRef.current) {
          containerRef.current.scrollLeft = touchState.current.startPanX - dx;
          containerRef.current.scrollTop = touchState.current.startPanY - dy;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F8F6] font-sans overflow-hidden select-none">
      
      {/* Glow animations for visual store blueprint map locators */}
      <style>{`
        @keyframes shelfGlow {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .shelf-highlight {
          animation: shelfGlow 2s infinite;
          background-color: rgba(16, 185, 129, 0.12) !important;
          border-color: #10b981 !important;
        }
        @keyframes productPulse {
          0% { transform: scale(1.1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          50% { transform: scale(1.2); box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
          100% { transform: scale(1.1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .product-highlight {
          animation: productPulse 1.5s infinite;
          background-color: #10b981 !important;
          z-index: 30 !important;
        }
      `}</style>

      {/* TOP CONTROL BAR */}
      <header className="h-16 md:h-20 bg-white border-b border-[#e2ede7] px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-30">
        
        {/* Layout switcher */}
        <div className="flex items-center gap-2 md:gap-3 w-auto md:w-1/4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#ebf3ef] text-[#10b981] rounded-xl md:rounded-2xl flex items-center justify-center">
            <MapPin className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div>
            <div className="relative">
              <select
                value={selectedLayoutId}
                onChange={(e) => setSelectedLayoutId(e.target.value)}
                className="appearance-none font-extrabold text-neutral-900 text-xs md:text-sm leading-tight pr-5 md:pr-6 bg-transparent border-none outline-none cursor-pointer focus:ring-0 max-w-[120px] md:max-w-full truncate"
              >
                {layouts.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <p className="text-[10px] font-black text-[#5c7268] uppercase tracking-wider mt-0.5">{"Active Planogram"}</p>
          </div>
        </div>

        {/* Global Blueprint Search Bar */}
        <div className="flex-1 max-w-xl relative mx-2 md:mx-4 hidden md:block">
          <div className={`flex items-center bg-[#ebf3ef] border-2 transition-all rounded-2xl overflow-hidden ${
            isSearchActive ? 'border-[#10b981] bg-white shadow-soft' : 'border-transparent hover:border-[#a8d5ba]'
          }`}>
            <div className="pl-4 pr-2 text-[#10b981]">
              <Search className="h-5 w-5" />
            </div>
            <input 
              type="text" 
              placeholder={"Locate products on map by name, SKU or lot..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              className="w-full py-3 bg-transparent outline-none font-bold text-xs text-neutral-800 placeholder:text-[#5c7268]/60"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(""); setIsSearchActive(false); setSelectedProductVariantId(null); }}
                className="px-4 text-[#5c7268] hover:text-neutral-900 min-h-[44px] min-w-[44px]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right buttons */}
        <div className="flex items-center justify-end gap-2 md:gap-6 w-auto md:w-1/4">
          <button 
            onClick={() => { setIsSearchActive(!isSearchActive); setIsCartOpen(false); }}
            className={`md:hidden relative flex items-center justify-center w-10 h-10 border rounded-xl transition-all shadow-sm ${
              isSearchActive ? 'border-[#10b981] bg-[#ebf3ef]' : 'bg-white border-[#e2ede7] hover:border-[#10b981] hover:bg-[#ebf3ef]'
            }`}
          >
            <Search className={`h-4 w-4 ${isSearchActive ? 'text-[#10b981]' : 'text-[#5c7268]'}`} />
          </button>
          
          <button 
            onClick={() => { setIsCartOpen(!isCartOpen); setIsSearchActive(false); }}
            className={`relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 border rounded-xl md:rounded-2xl transition-all shadow-sm ${
              isCartOpen ? 'border-[#10b981] bg-[#ebf3ef]' : 'bg-white border-[#e2ede7] hover:border-[#10b981] hover:bg-[#ebf3ef]'
            }`}
          >
            <ShoppingCart className={`h-4 w-4 md:h-5 md:w-5 ${isCartOpen ? 'text-[#10b981]' : 'text-[#5c7268]'}`} />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#10b981] text-white text-[10px] font-extrabold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CANVAS AND SIDE PANEL */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Visual Map Canvas */}
        <main 
          className="flex-1 relative overflow-hidden" 
          style={{ backgroundImage: 'radial-gradient(#e2ede7 2px, transparent 2px)', backgroundSize: '30px 30px' }}
          onClick={() => { setIsSearchActive(false); setIsCartOpen(false); setSelectedProductVariantId(null); }}
        >
          {loading ? (
            <div className="absolute inset-0 bg-[#F4F8F6]/80 z-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#10b981] animate-spin" />
              <p className="text-xs font-bold text-premium-muted">{"Aggregating visual planogram cells..."}</p>
            </div>
          ) : null}

          {/* Zoom Buttons */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 bg-white p-1.5 rounded-2xl shadow-soft border border-[#e2ede7]">
            <button onClick={() => setZoom(z => Math.min(2.5, z + 0.1))} className="p-3 text-[#5c7268] hover:text-[#10b981] hover:bg-[#ebf3ef] rounded-xl transition-colors min-h-[44px] min-w-[44px]">
              <ZoomIn className="h-5 w-5" />
            </button>
            <div className="w-full h-px bg-[#e2ede7]"></div>
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-3 text-[#5c7268] hover:text-[#10b981] hover:bg-[#ebf3ef] rounded-xl transition-colors min-h-[44px] min-w-[44px]">
              <ZoomOut className="h-5 w-5" />
            </button>
          </div>

          {/* Store Layout Grid Viewport */}
          <div 
            ref={containerRef} 
            className={`w-full h-full relative bg-[#F4F8F6] p-4 md:p-12 overflow-auto custom-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
          >
            <div 
              className="relative rounded-3xl bg-white shadow-card ring-1 ring-neutral-200 transition-transform origin-top-left duration-200"
              style={{ 
                transform: `scale(${zoom})`,
                width: (layout?.width || 20) * GRID_SIZE, 
                height: (layout?.height || 15) * GRID_SIZE
              }}
            >
              {/* Background Grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e2ede7 1px, transparent 1px),
                    linear-gradient(to bottom, #e2ede7 1px, transparent 1px)
                  `,
                  backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
                }}
              />

              <div className="absolute inset-0 pointer-events-auto">
                
                {/* Active Placed Shelves Map */}
                {layout?.shelves?.map((shelf: any) => {
                  const cols = shelf.template?.layoutType === "GRID" ? (shelf.template?.columns ?? 2) : 2;
                  const rows = shelf.template?.layoutType === "GRID" ? (shelf.template?.rows ?? 1) : 1;
                  const shelfWidth = cols * GRID_SIZE;
                  const shelfHeight = rows * GRID_SIZE;
                  
                  // Query items placed in this physical shelf cells
                  const shelfItems = flattenedShelfItems.filter(item => item.shelfId === shelf.id);
                  const isHovered = hoveredShelfId === shelf.id;
                  const hasSearchedProduct = searchQuery && shelfItems.some(item => searchResults.some(res => res.variantId === item.variantId));
                  const hasSelectedProduct = selectedProductVariantId && shelfItems.some(item => item.variantId === selectedProductVariantId);

                  return (
                    <div
                      key={shelf.id}
                      id={`shelf-${shelf.id}`}
                      onMouseEnter={() => setHoveredShelfId(shelf.id)}
                      onMouseLeave={() => setHoveredShelfId(null)}
                      className={`absolute rounded-3xl border-2 transition-all duration-300 flex flex-col bg-white overflow-hidden shadow-soft ${
                        hasSelectedProduct
                          ? 'shelf-highlight z-20 border-[#10b981] scale-[1.01]'
                          : hasSearchedProduct 
                            ? 'border-[#10b981] ring-4 ring-[#10b981]/20 z-10 scale-[1.01]' 
                            : isHovered 
                              ? 'border-[#10b981]/50 z-10 shadow-md' 
                              : 'border-[#e2ede7]'
                      }`}
                      style={{
                        left: shelf.posX * GRID_SIZE,
                        top: shelf.posY * GRID_SIZE,
                        width: shelfWidth,
                        height: shelfHeight,
                        transform: `rotate(${shelf.rotation || 0}deg)`,
                        transformOrigin: 'center center'
                      }}
                    >
                      {/* Shelf Header bar */}
                      <div className={`px-4 py-2 border-b flex items-center justify-between transition-colors ${
                        hasSelectedProduct || hasSearchedProduct || isHovered ? 'bg-[#10b981]/5 border-[#10b981]/20' : 'bg-slate-50/50 border-[#e2ede7]'
                      }`}>
                        <span className="font-extrabold text-[11px] text-neutral-800 truncate pr-2">{shelf.name || "Shelf Display"}</span>
                        <Layers className={`h-3.5 w-3.5 shrink-0 ${hasSelectedProduct || hasSearchedProduct || isHovered ? 'text-[#10b981]' : 'text-slate-400'}`} />
                      </div>

                      {/* Products visual slots grid inside shelf cell boxes */}
                      <div className="flex-1 p-3 flex flex-wrap gap-2.5 overflow-y-auto content-start custom-scrollbar">
                        {shelfItems.map((item: any) => {
                          const isMatchesSearch = searchQuery && searchResults.some(res => res.variantId === item.variantId);
                          const isSelected = selectedProductVariantId === item.variantId;

                          return (
                            <div
                              key={item.id}
                              onClick={(e) => { e.stopPropagation(); handleProductSelect(item.variantId); }}
                              className={`relative group cursor-pointer w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                isSelected ? 'product-highlight scale-105' :
                                isMatchesSearch ? 'bg-[#10b981] shadow-lg scale-105 z-10' : 
                                'bg-[#F4F8F6] border border-transparent hover:border-[#10b981]/40'
                              }`}
                            >
                              <Package className={`h-5 w-5 ${isSelected || isMatchesSearch ? 'text-white' : 'text-[#10b981]'}`} />

                              {/* Small Quick addition float trigger */}
                              {isSelected && (
                                <div className="absolute -top-3 -right-3 z-50 animate-in zoom-in duration-150">
                                  <button
                                    onClick={(e) => handleAddToCart(e, item)}
                                    className="flex items-center justify-center w-8 h-8 bg-[#10b981] text-white rounded-full shadow-lg hover:bg-emerald-600 hover:scale-110 transition-all ring-2 ring-white touch-action-none"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              )}



                            </div>
                          );
                        })}

                        {shelfItems.length === 0 && (
                          <div className="w-full h-full flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        </main>

        {/* SEARCH RESULTS SIDEBAR PANEL */}
        {isSearchActive && (
          <div className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity" onClick={() => setIsSearchActive(false)} />
        )}
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[380px] bg-white border-l border-[#e2ede7] shadow-2xl transition-transform duration-350 ease-in-out z-40 flex flex-col ${
          isSearchActive ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4 md:p-6 border-b border-[#e2ede7] bg-[#F4F8F6]/50 flex items-center justify-between">
            <div className="flex-1 mr-4">
              <h3 className="font-black text-sm text-neutral-800 uppercase tracking-wide">
                {selectedProductVariantId ? "Item Details" : "Planogram Matches"}
              </h3>
              
              {/* Mobile inline search bar */}
              <div className="md:hidden mt-2 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#10b981]" />
                <input
                  type="text"
                  placeholder={"Locate products..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#e2ede7] rounded-lg py-1.5 pl-8 pr-2 text-xs outline-none focus:border-[#10b981]"
                />
              </div>
              <p className="hidden md:block text-xs font-semibold text-[#5c7268] mt-1">
                {selectedProductVariantId ? "Located in visual layout" : `Located ${searchResults.length} variations`}
              </p>
            </div>
            <button 
              onClick={() => { setIsSearchActive(false); setSelectedProductVariantId(null); }} 
              className="p-2 text-[#5c7268] hover:text-neutral-900 bg-white rounded-xl shadow-sm border border-[#e2ede7] hover:bg-[#ebf3ef] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Active Product Selector Details Card */}
          {selectedProductVariantId && (
            (() => {
              const activeItem = flattenedShelfItems.find(item => item.variantId === selectedProductVariantId);
              if (!activeItem) return null;
              return (
                <div className="p-5 border-b border-[#e2ede7] bg-emerald-50/40 animate-in fade-in slide-in-from-top-3 duration-250 shrink-0">
                  <span className="text-[9px] font-black uppercase text-[#10b981] bg-[#ebf3ef] px-2.5 py-0.5 rounded-full mb-2 inline-block">
                    {"Active Selector Selection"}</span>
                  <h4 className="font-black text-sm text-neutral-900 leading-tight mb-1">
                    {activeItem.productName}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold mb-3">{"SKU:"}{activeItem.sku} {"· Lot:"}{activeItem.lotNumber}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 bg-white p-3 rounded-2xl border border-neutral-100 text-[11px]">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{"Shelf Placement"}</p>
                      <p className="font-extrabold text-neutral-800 mt-0.5">{activeItem.shelfName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{"Visual Grid Cell"}</p>
                      <p className="font-extrabold text-neutral-800 mt-0.5">{"Row"}{activeItem.row} {"· Col"}{activeItem.column}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{"Unit Price"}</p>
                      <p className="font-black text-[#10b981] mt-0.5">${activeItem.salePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{"Stock Remainder"}</p>
                      <p className={`font-black mt-0.5 ${activeItem.stockQuantity < 10 ? 'text-rose-500' : 'text-slate-600'}`}>
                        {activeItem.stockQuantity} {"pcs"}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, activeItem)}
                    className="w-full py-3 bg-[#10b981] hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{"Add to Cashier Order"}</span>
                  </button>
                </div>
              );
            })()
          )}

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-slate-50/50">
            {!searchQuery && !selectedProductVariantId ? (
              <div className="text-center py-16 text-[#5c7268]">
                <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-25" />
                <p className="font-bold text-xs">{"Select any shelf cell to inspect its products"}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{"Or use the search bar above to locate items"}</p>
              </div>
            ) : searchQuery && searchResults.length === 0 ? (
              <div className="text-center py-16 text-[#5c7268]">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-25" />
                <p className="font-bold text-xs">{"No placed variations found on shelves"}</p>
              </div>
            ) : (
              searchResults.map(item => {
                const isSelected = selectedProductVariantId === item.variantId;
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleProductSelect(item.variantId)}
                    className={`p-4 bg-white border rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                      isSelected ? 'border-[#10b981] shadow-soft bg-emerald-50/5' : 'border-[#e2ede7] hover:border-[#10b981]/40'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <span className="inline-block text-[9px] font-black uppercase text-[#10b981] bg-[#ebf3ef] px-2 py-0.5 rounded-full mb-1">{item.sku}</span>
                      <h4 className="font-bold text-xs text-neutral-800 truncate mb-1">{item.productName}</h4>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-neutral-700 font-extrabold">{item.shelfName}</span>
                        <span>{"· Row"}{item.row} {"Col"}{item.column}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-black text-[#10b981]">
                        <span>${item.salePrice.toFixed(2)}</span>
                        <span className="text-slate-300 font-normal">|</span>
                        <span className={item.stockQuantity < 10 ? 'text-rose-500' : 'text-slate-500'}>{item.stockQuantity} {"pieces left"}</span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleAddToCart(e, item)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        isSelected 
                          ? 'bg-[#10b981] text-white shadow-md hover:bg-emerald-600' 
                          : 'bg-[#F4F8F6] text-[#10b981] hover:bg-[#10b981] hover:text-white'
                      }`}
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SHOPPING CART DRAWER */}
        {isCartOpen && (
          <div className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity" onClick={() => setIsCartOpen(false)} />
        )}
        <div className={`absolute top-0 right-0 h-full w-full sm:w-[380px] bg-white border-l border-[#e2ede7] shadow-2xl transition-transform duration-350 ease-in-out z-40 flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-4 md:p-6 border-b border-[#e2ede7] bg-[#F4F8F6]/50 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-neutral-800 uppercase tracking-wide">{"Cashier Cart"}</h3>
              <p className="text-xs font-semibold text-[#5c7268] mt-1">{cartItems.reduce((acc, i) => acc + i.quantity, 0)} {"items pending checkout"}</p>
            </div>
            <button onClick={() => setIsCartOpen(false)} className="p-2 text-[#5c7268] hover:text-neutral-900 bg-white rounded-xl shadow-sm border border-[#e2ede7] min-w-[44px] min-h-[44px] flex items-center justify-center">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-scrollbar">
  <div className="flex flex-col gap-3 p-3 sm:p-4 pb-24">
    {cartItems.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-center text-[#5c7268]">
        <ShoppingCart className="h-10 w-10 mb-3 opacity-20" />
        <p className="text-[11px] sm:text-xs font-bold">
          {"Register shopping cart is currently empty"}</p>
      </div>
    ) : (
      cartItems.map((item) => (
        <div
          key={`${item.variantId}-${item.batchId}`}
          className="
            w-full
            rounded-2xl
            border border-[#e2ede7]
            bg-white
            shadow-sm
            p-3 sm:p-4
            flex flex-col sm:flex-row
            gap-3
            sm:items-center
            sm:justify-between
            overflow-hidden
          "
        >
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <span className="block text-[9px] sm:text-[10px] font-bold text-slate-400 mb-1 truncate">
              {item.sku}
            </span>

            <h4
              className="
                font-extrabold
                text-[11px] sm:text-xs
                text-neutral-800
                leading-tight
                break-words
                line-clamp-2
                mb-1
              "
            >
              {item.productName}
            </h4>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-bold">
              <span className="text-[#10b981]">
                ${item.salePrice.toFixed(2)}
              </span>

              <span className="text-slate-300 font-normal">x</span>

              <span className="text-slate-500 font-extrabold">
                {item.quantity}
              </span>
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-end sm:justify-center shrink-0">
            <div
              className="
                flex items-center
                rounded-xl
                border border-[#e2ede7]
                bg-[#F4F8F6]
                overflow-hidden
              "
            >
              <button
                onClick={() =>
                  updateCartQuantity(item.variantId, item.batchId, -1)
                }
                className="
                  flex items-center justify-center
                  w-10 h-10
                  sm:w-9 sm:h-9
                  text-[#5c7268]
                  hover:text-[#10b981]
                  active:scale-95
                  transition-all
                  touch-manipulation
                "
              >
                <Minus className="h-4 w-4" />
              </button>

              <span
                className="
                  min-w-[40px]
                  text-center
                  text-sm sm:text-base
                  font-black
                  text-neutral-800
                  px-2
                "
              >
                {item.quantity}
              </span>

              <button
                onClick={() =>
                  updateCartQuantity(item.variantId, item.batchId, 1)
                }
                className="
                  flex items-center justify-center
                  w-10 h-10
                  sm:w-9 sm:h-9
                  text-[#5c7268]
                  hover:text-[#10b981]
                  active:scale-95
                  transition-all
                  touch-manipulation
                "
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))
    )}
  </div>
</div>

          {/* Confirm checkout redirect drawer footer */}
          {cartItems.length > 0 && (
            <div className="p-6 bg-white border-t border-[#e2ede7] shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-xs text-slate-500 uppercase">{"Estimated Total"}</span>
                <span className="font-black text-[#10b981] text-lg">${cartTotal.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleConfirmOrder}
                className="w-full py-3.5 bg-[#10b981] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span>{"Confirm order to POS checkout"}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>  
  );
}
