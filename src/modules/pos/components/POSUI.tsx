"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  RotateCcw,
  Printer,
  Loader2,
  Sparkles,
  Filter,
  CheckCircle2,
  ChevronRight,
  Package,
  Calendar,
  Layers,
  AlertTriangle,
  X
} from 'lucide-react';
import { posApi } from '../api/pos.api';
import type { POSProductItem } from '../services/pos.service';
import { toast } from 'sonner';

interface CartItem extends POSProductItem {
  quantity: number;
}

export function POSUI() {
  // State
  const [products, setProducts] = useState<POSProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Search Input Reference for shortcuts
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch available products on load
  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await posApi.getAvailableProducts();
      if (res.success) {
        setProducts(res.data);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load POS catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // 2. Load Cart from localStorage (Persistent cash register state)
  useEffect(() => {
    const savedCart = localStorage.getItem('tanaplano_pos_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse saved cart:', err);
      }
    }
  }, []);

  // 3. Save Cart to localStorage whenever it changes
  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('tanaplano_pos_cart', JSON.stringify(newCart));
  };

  // 4. Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus Search: Ctrl+F or Ctrl+/
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === '/')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Checkout: F9
      if (e.key === 'F9') {
        e.preventDefault();
        handleCheckout();
      }
      // Escape: clear search or close receipt
      if (e.key === 'Escape') {
        if (completedOrder) {
          setCompletedOrder(null);
        } else {
          setSearchQuery('');
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, completedOrder]);

  // 5. Dynamic Categories list (extracted from loaded active inventory)
  const categories = useMemo(() => {
    const names = products.map((p) => p.categoryName);
    return ['All Items', ...Array.from(new Set(names))];
  }, [products]);

  // 6. Filter & Search Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lotNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All Items' || p.categoryName === selectedCategory;

      const matchesLowStock = !onlyLowStock || p.stockQuantity <= 5;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, onlyLowStock]);

  // 7. Cart operations
  const handleAddToCart = (product: POSProductItem) => {
    const existing = cart.find((item) => item.batchId === product.batchId);

    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        toast.warning(`Cannot add more. Limit of ${product.stockQuantity} items in stock reached.`);
        return;
      }
      const newCart = cart.map((item) =>
        item.batchId === product.batchId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCartToStorage(newCart);
    } else {
      const newCart = [...cart, { ...product, quantity: 1 }];
      saveCartToStorage(newCart);
      toast.success(`Added ${product.productName} to bill`, { duration: 1500 });
    }
  };

  const handleUpdateQuantity = (batchId: string, delta: number) => {
    const item = cart.find((i) => i.batchId === batchId);
    if (!item) return;

    const newQuantity = item.quantity + delta;

    if (newQuantity <= 0) {
      handleRemoveItem(batchId);
      return;
    }

    if (newQuantity > item.stockQuantity) {
      toast.warning(`Only ${item.stockQuantity} items available in batch stock.`);
      return;
    }

    const newCart = cart.map((i) =>
      i.batchId === batchId ? { ...i, quantity: newQuantity } : i
    );
    saveCartToStorage(newCart);
  };

  const handleRemoveItem = (batchId: string) => {
    const newCart = cart.filter((i) => i.batchId !== batchId);
    saveCartToStorage(newCart);
    toast.info('Item removed from current bill');
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to clear the current bill?')) {
      saveCartToStorage([]);
      toast.info('Bill cleared');
    }
  };

  // 8. Calculations (Memoized for high performance)
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
    const tax = subtotal * 0.08; // 8% sales tax
    const total = subtotal + tax;
    return {
      subtotal,
      tax,
      total,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart]);

  // 9. Checkout Transaction
  const handleCheckout = async () => {
    if (cart.length === 0 || checkoutLoading) return;

    // Client-side Stock Boundary Check
    for (const item of cart) {
      if (item.quantity > item.stockQuantity) {
        toast.error(`Out of stock boundary: ${item.productName} has only ${item.stockQuantity} items left.`);
        return;
      }
    }

    try {
      setCheckoutLoading(true);
      const res = await posApi.checkout({
        status: 'COMPLETED',
        items: cart.map((i) => ({
          batchId: i.batchId,
          variantId: i.variantId,
          quantity: i.quantity,
          salePrice: i.salePrice,
        })),
      });

      if (res.success) {
        toast.success('Transaction checkout completed successfully!');
        setCompletedOrder(res.data);
        saveCartToStorage([]); // Clear cart
        await loadProducts(); // Reload products to get decremented stock counts
      }
    } catch (e: any) {
      toast.error(e.message || 'Checkout failed. Please review stock limits.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // 10. Receipt Printer Trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[1550px] mx-auto h-[100dvh] md:h-[calc(100vh-190px)] bg-slate-50 dark:bg-slate-900 md:rounded-3xl flex flex-col overflow-hidden border-0 md:border md:border-premium-border shadow-none md:shadow-2xl relative font-sans">
      
      {/* Top Header Controls */}
      <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-5 bg-white border-b border-premium-border shrink-0 select-none">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-premium-subtle text-premium-primary shadow-sm border border-premium-primary/10">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-neutral-800 tracking-tight flex items-center gap-1.5 md:gap-2">
              <span>{"POS Register"}</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[10px] md:text-[11px] text-premium-muted font-medium mt-0.5">
              <span className="hidden md:inline">{"Cashier Register ID:"}</span><span className="font-mono font-bold">{"#REG-001"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-premium-border rounded-xl px-4 py-2 text-xs font-semibold text-neutral-600">
            <span className="text-premium-muted">{"Keyboard Shortcut:"}</span>
            <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono shadow-xs">{"Ctrl + F"}</kbd>
            <span>{"Search"}</span>
            <div className="h-3 w-[1px] bg-slate-300 mx-1" />
            <kbd className="bg-white border border-slate-300 rounded px-1.5 py-0.5 font-mono shadow-xs">{"F9"}</kbd>
            <span>{"Checkout"}</span>
          </div>
          <button
            onClick={loadProducts}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 md:p-2.5 rounded-xl border border-premium-border bg-white text-neutral-500 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
            title={"Refresh Catalog"}
          >
            <RotateCcw className="w-5 h-5 md:w-4 md:h-4" />
          </button>
        </div>
      </header>

      {/* MainPOS Frame */}
      <main className="flex-1 flex overflow-hidden min-h-0 bg-premium-bg/10 relative">
        
        {/* LEFT COLUMN: Catalog Grid & Search (Scrollable) */}
        <section className="flex-1 lg:flex-[8] flex flex-col p-4 md:p-8 overflow-hidden min-w-0 md:border-r border-premium-border w-full">
          
          {/* Filtering & Debounced Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6 shrink-0">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-premium-muted absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={"Search products by name, SKU, or lot..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-white border border-premium-border rounded-2xl text-sm font-bold text-neutral-800 placeholder-premium-muted focus:outline-none focus:ring-2 focus:ring-premium-primary focus:border-transparent transition-all shadow-soft"
              />
            </div>
            
            <button
              onClick={() => setOnlyLowStock(prev => !prev)}
              className={`flex items-center justify-center gap-2 px-4 h-12 border rounded-2xl text-xs font-bold transition-all shadow-soft min-h-[48px] ${
                onlyLowStock
                  ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                  : 'bg-white border-premium-border text-neutral-600 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{"Low Stock"}</span>
            </button>
          </div>

          {/* Catalog Categories horizontal row */}
          <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 scrollbar-none md:scrollbar-thin shrink-0 select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shadow-soft hover:scale-[1.02] active:scale-[0.98] min-h-[44px] md:min-h-0 ${
                  selectedCategory === cat
                    ? 'bg-premium-primary text-white border-premium-primary'
                    : 'bg-white text-neutral-500 border-premium-border hover:bg-slate-50 hover:text-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Main Grid display area */}
          <div className="flex-1 overflow-y-auto pr-1 md:pr-2 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 pb-24 lg:pb-8 content-start custom-scrollbar">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="bg-white border border-premium-border rounded-2xl md:rounded-3xl p-3 md:p-5 flex flex-col animate-pulse h-[200px] md:h-[220px]">
                  <div className="w-full h-24 bg-slate-100 rounded-2xl mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2 mb-4" />
                  <div className="mt-auto flex justify-between items-center">
                    <div className="h-5 bg-slate-100 rounded w-1/3" />
                    <div className="h-7 w-7 rounded-full bg-slate-100" />
                  </div>
                </div>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <div
                  key={item.batchId}
                  onClick={() => handleAddToCart(item)}
                  className="bg-white border border-premium-border rounded-3xl p-5 flex flex-col cursor-pointer transition-all hover:border-premium-primary hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden"
                >
                  {/* Category badge */}
                  <div className="absolute top-4 left-4 bg-slate-50 border border-slate-150 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-premium-muted">
                    {item.categoryName}
                  </div>

                  {/* SKU Code */}
                  <div className="absolute top-4 right-4 bg-premium-subtle text-premium-primary border border-premium-primary/10 rounded-lg px-2 py-0.5 text-[9px] font-bold font-mono">
                    {item.sku}
                  </div>

                  {/* Icon Placeholder representing the stationery item */}
                  <div className="w-full h-28 bg-premium-bg/30 rounded-2xl flex items-center justify-center mb-4 mt-4 group-hover:bg-premium-bg/60 transition-colors">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-full w-full object-cover rounded-2xl"
                      />
                    ) : (
                      <Package className="w-10 h-10 text-premium-muted group-hover:scale-110 transition-transform duration-300" />
                    )}
                  </div>

                  {/* Product & Variant details */}
                  <h3 className="font-bold text-neutral-800 text-sm line-clamp-1 leading-snug group-hover:text-premium-primary transition-colors">
                    {item.productName}
                  </h3>
                  
                  {/* Unit conversion and Expiration lot */}
                  <div className="flex items-center gap-1.5 text-[10px] text-premium-muted font-semibold mt-1">
                    <span>{"Unit:"}{item.unitName}</span>
                    <span>•</span>
                    <span className="font-mono text-premium-primary">{"Lot"}{item.lotNumber}</span>
                  </div>

                  {/* Expiration date warnings */}
                  {item.expDate && (
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-premium-muted font-bold">
                      <Calendar className="w-3 h-3" />
                      <span>{"Exp:"}{new Date(item.expDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Price & Stock status */}
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-premium-muted leading-none">{"Price"}</p>
                      <p className="font-black text-base text-premium-primary mt-1">
                        ${item.salePrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Stock level tag */}
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-premium-muted leading-none">{"Stock"}</p>
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-extrabold mt-1 ${
                        item.stockQuantity <= 5
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {item.stockQuantity} {item.unitName}s
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                <div className="h-16 w-16 bg-white border border-premium-border rounded-2xl flex items-center justify-center shadow-soft mb-4">
                  <Search className="w-8 h-8 text-premium-muted" />
                </div>
                <p className="font-bold text-sm text-neutral-700">{"No active stock matches your query"}</p>
                <p className="text-xs text-premium-muted mt-1">{"Try relaxing filters or resetting low stock alerts."}</p>
              </div>
            )}
          </div>
        </section>

        {/* Floating Cart Button for Mobile/Tablet */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center justify-center bg-premium-primary text-white p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-transform min-h-[56px] min-w-[56px] relative"
          >
            <ShoppingCart className="w-6 h-6" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Overlay for Mobile/Tablet Cart Drawer */}
        {isCartOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
        )}

        {/* RIGHT COLUMN: Bill Basket Sidebar */}
        <section className={`
          fixed lg:static inset-y-0 right-0 w-full sm:w-[400px] lg:w-auto lg:flex-[3] bg-white flex flex-col z-50 lg:z-10 shadow-2xl lg:shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.04)] select-none shrink-0
          transition-transform duration-300 ease-in-out
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          
          {/* Order Header */}
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-premium-border flex justify-between items-center bg-white shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCartOpen(false)}
                className="lg:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="font-bold text-sm md:text-base text-neutral-800">{"Current Sales Order"}</h2>
                <p className="text-[10px] text-premium-muted font-bold font-mono mt-0.5">{"ID: #ORD-PENDING"}</p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl border border-red-100 text-[11px] font-bold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{"Reset Bill"}</span>
              </button>
            )}
          </div>

          {/* Cart items list scrollable container */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-3 custom-scrollbar bg-slate-50/30">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.batchId} className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-premium-border hover:border-premium-primary/20 transition-all shadow-sm group relative">
                  
                  {/* Remove cross */}
                  <button
                    onClick={() => handleRemoveItem(item.batchId)}
                    className="absolute top-2 right-2 p-2 text-premium-muted hover:text-red-500 rounded-lg hover:bg-red-50/50 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex justify-between items-start pr-5">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-800 leading-snug line-clamp-1">
                        {item.productName}
                      </h4>
                      <p className="text-[9px] text-premium-muted mt-1 font-semibold flex items-center gap-1">
                        <span>{"SKU:"}{item.sku}</span>
                        <span>•</span>
                        <span className="font-mono text-premium-primary">{"Lot:"}{item.lotNumber}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100">
                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-premium-border rounded-xl p-1">
                      <button
                        onClick={() => handleUpdateQuantity(item.batchId, -1)}
                        className="w-8 h-8 rounded-lg text-neutral-500 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all min-w-[32px] min-h-[32px]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-neutral-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(item.batchId, 1)}
                        className="w-8 h-8 rounded-lg text-neutral-500 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all min-w-[32px] min-h-[32px]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Calculated row subtotal */}
                    <p className="text-xs font-bold text-neutral-800 whitespace-nowrap">
                      ${(item.salePrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
                <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-6 h-6 text-premium-muted" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800">{"No Items Added"}</h3>
                <p className="text-xs text-premium-muted mt-1 max-w-[180px] mx-auto leading-relaxed">
                  {"Click on product variant cards in the catalog to build your sales bill."}</p>
              </div>
            )}
          </div>

          {/* Pricing Totals & Checkout Button */}
          <div className="p-6 border-t border-premium-border bg-slate-50/50 shrink-0">
            <div className="flex justify-between text-xs text-premium-muted font-bold mb-2">
              <span>{"Items Total ("}{totals.itemCount} {"units)"}</span>
              <span>${totals.subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-xs text-premium-muted font-bold mb-4">
              <span>{"VAT / Sales Tax (8%)"}</span>
              <span>${totals.tax.toFixed(2)}</span>
            </div>
            
            <div className="h-[1px] bg-slate-200 my-4" />

            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-black text-neutral-800">{"Total Payable"}</span>
              <span className="text-xl font-black text-premium-primary">
                ${totals.total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || checkoutLoading}
              className={`w-full h-12 bg-premium-primary text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:pointer-events-none ${
                checkoutLoading ? 'bg-premium-primary/80' : 'hover:bg-premium-primary/95'
              }`}
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{"Processing Checkout..."}</span>
                </>
              ) : (
                <>
                  <span>{"Collect Payment (F9)"}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* RETAIL RECEIPT MODAL (COMPLETED checkout state) */}
      {completedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in select-none">
          <div className="bg-white border border-premium-border rounded-3xl w-full max-w-[450px] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
            
            {/* Modal Title */}
            <div className="px-6 py-4 bg-emerald-50 text-emerald-800 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm uppercase tracking-wide">{"Checkout Successful"}</span>
              </div>
              <button
                onClick={() => setCompletedOrder(null)}
                className="text-emerald-700 hover:text-emerald-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body (Formatted for printing) */}
            <div className="flex-1 overflow-y-auto p-8 font-mono text-xs text-neutral-800 flex flex-col bg-slate-50/30 custom-scrollbar print:bg-white print:p-0">
              <div className="text-center mb-6">
                <h2 className="text-sm font-black tracking-tight text-neutral-900 flex items-center justify-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-premium-primary" />
                  <span>{"Tanaplano Minimart"}</span>
                </h2>
                <p className="text-[10px] text-premium-muted mt-0.5">{"123 Retail Lane, Saigon City"}</p>
                <p className="text-[10px] text-premium-muted">{"Tel: +84 (28) 1234-5678"}</p>
              </div>

              <div className="h-[1px] border-b border-dashed border-slate-300 my-4" />

              <div className="space-y-1 text-[10px]">
                <p>{"Order ID:"}<span className="font-bold">{completedOrder.id}</span></p>
                <p>{"Status:"}<span className="font-bold text-emerald-600 uppercase">{completedOrder.status}</span></p>
                <p>{"Cashier:"}<span className="font-bold">{"Register #001"}</span></p>
                <p>{"Date:"}<span className="font-bold">{new Date(completedOrder.createdAt).toLocaleString()}</span></p>
              </div>

              <div className="h-[1px] border-b border-dashed border-slate-300 my-4" />

              {/* Items Table */}
              <div className="space-y-3">
                <div className="flex justify-between font-bold text-[10px] text-premium-muted uppercase">
                  <span className="w-1/2">{"Item Description"}</span>
                  <span className="w-1/6 text-center">{"Qty"}</span>
                  <span className="w-1/3 text-right">{"Total"}</span>
                </div>
                
                <div className="space-y-2">
                  {completedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start text-[10px]">
                      <div className="w-1/2">
                        <p className="font-bold leading-tight line-clamp-1">{item.variant?.product?.name || 'Product Item'}</p>
                        <p className="text-[8px] text-premium-muted mt-0.5">{"SKU:"}{item.variant?.sku} {"| Lot:"}{item.batch?.lotNumber}</p>
                      </div>
                      <span className="w-1/6 text-center">{item.quantity}</span>
                      <span className="w-1/3 text-right font-bold">${(Number(item.salePrice) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] border-b border-dashed border-slate-300 my-4" />

              {/* Final Receipt Pricing */}
              <div className="space-y-1.5 text-[10px] text-right">
                <div className="flex justify-between">
                  <span>{"Gross Subtotal:"}</span>
                  <span>${(Number(completedOrder.totalAmount) / 1.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{"VAT / Sales Tax (8%):"}</span>
                  <span>${(Number(completedOrder.totalAmount) * 0.08 / 1.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs text-neutral-900 pt-1.5 border-t border-slate-200">
                  <span>{"Amount Paid:"}</span>
                  <span>${Number(completedOrder.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="h-[1px] border-b border-dashed border-slate-300 my-4 font-bold" />
              
              <div className="text-center text-[10px] text-premium-muted mt-4">
                <p>{"Thank you for shopping at Tanaplano!"}</p>
                <p className="mt-1 font-bold">{"Please keep your receipt for returns."}</p>
              </div>
            </div>

            {/* Modal actions */}
            <div className="px-6 py-4 border-t border-premium-border bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setCompletedOrder(null)}
                className="px-4 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {"Close Register"}</button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-premium-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-premium-primary/90 shadow-soft transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Printer className="w-4 h-4" />
                <span>{"Print Receipt"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
