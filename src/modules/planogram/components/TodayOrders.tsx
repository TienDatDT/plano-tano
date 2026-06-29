"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  X, 
  Package,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

// Mock Data
type OrderStatus = 'Completed' | 'Processing' | 'Pending';

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdTime: string;
  items: OrderItem[];
  customerName?: string;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-1001",
    totalAmount: 145.50,
    status: "Completed",
    createdTime: "10:30 AM",
    customerName: "Walk-in Customer",
    items: [
      { id: "v1", sku: "ST-001", name: "Matcha Notebook A5", price: 12.5, quantity: 2 },
      { id: "v4", sku: "ST-004", name: "Washi Tape Set – Zen", price: 15.0, quantity: 1 }
    ]
  },
  {
    id: "ORD-1002",
    totalAmount: 8.40,
    status: "Completed",
    createdTime: "11:15 AM",
    items: [
      { id: "v2", sku: "ST-002", name: "Ceramic Gel Pen 0.5mm", price: 2.8, quantity: 3 }
    ]
  },
  {
    id: "ORD-1003",
    totalAmount: 32.00,
    status: "Processing",
    createdTime: "11:45 AM",
    customerName: "Jane Doe",
    items: [
      { id: "v7", sku: "ART-001", name: "Watercolor Set 24pc", price: 32.0, quantity: 1 }
    ]
  },
  {
    id: "ORD-1004",
    totalAmount: 85.20,
    status: "Pending",
    createdTime: "12:10 PM",
    items: [
      { id: "v3", sku: "ST-003", name: "Green Tea Sticky Notes", price: 4.2, quantity: 5 },
      { id: "v5", sku: "ST-005", name: "Linen Pencil Case", price: 18.9, quantity: 2 },
      { id: "v6", sku: "ST-006", name: "Bamboo Ruler 15cm", price: 3.5, quantity: 1 }
    ]
  },
  {
    id: "ORD-1005",
    totalAmount: 25.00,
    status: "Completed",
    createdTime: "12:30 PM",
    customerName: "Walk-in Customer",
    items: [
      { id: "v1", sku: "ST-001", name: "Matcha Notebook A5", price: 12.5, quantity: 2 }
    ]
  }
];

export function TodayOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return MOCK_ORDERS.filter(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedOrder = useMemo(() => MOCK_ORDERS.find(o => o.id === selectedOrderId), [selectedOrderId]);

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Completed': return 'text-[#6baf92] bg-[#ebf3ef] border-[#6baf92]/20';
      case 'Processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-neutral-600 bg-neutral-100 border-neutral-200';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F4F8F6] font-sans overflow-hidden">
      {/* ── TOP BAR ── */}
      <header className="h-20 bg-white border-b border-[#e2ede7] px-6 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3 w-1/4">
          <div className="w-10 h-10 bg-[#ebf3ef] text-[#6baf92] rounded-xl flex items-center justify-center shadow-inner">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-neutral-900 text-lg leading-tight">{"Downtown Store"}</h1>
            <p className="text-xs font-bold text-[#5c7268] uppercase tracking-wider">{"Today's Orders"}</p>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-2xl relative">
          <div className="flex items-center bg-[#F4F8F6] border-2 border-transparent hover:border-[#a8d5ba] focus-within:border-[#6baf92] focus-within:bg-white focus-within:shadow-soft transition-all rounded-2xl overflow-hidden">
            <div className="pl-4 pr-2 text-[#6baf92]">
              <Search className="h-5 w-5" />
            </div>
            <input 
              type="text" 
              placeholder={"Search by Order ID or Status..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3.5 bg-transparent outline-none font-semibold text-neutral-800 placeholder:text-[#5c7268]/60"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="px-4 text-[#5c7268] hover:text-neutral-900"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 w-1/4">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e2ede7] rounded-xl text-sm font-bold text-neutral-800 shadow-sm hover:border-[#6baf92] transition-colors">
            <Calendar className="h-4 w-4 text-[#6baf92]" />
            {"Today"}<ChevronRight className="h-4 w-4 text-[#5c7268] rotate-90" />
          </button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-auto custom-scrollbar p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-neutral-900">{"Orders Overview"}</h2>
              <div className="flex items-center gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#e2ede7] rounded-xl hover:border-[#6baf92] hover:text-[#6baf92] transition-colors shadow-sm font-bold text-sm text-[#5c7268]">
                  <Filter className="h-4 w-4" />
                  {"Filter"}</button>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-[#e2ede7] rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4F8F6]/50 border-b border-[#e2ede7] text-xs font-extrabold text-[#5c7268] uppercase tracking-wider">
                      <th className="px-6 py-4 w-48">{"Order ID"}</th>
                      <th className="px-6 py-4">{"Status"}</th>
                      <th className="px-6 py-4">{"Total Amount"}</th>
                      <th className="px-6 py-4">{"Created Time"}</th>
                      <th className="px-6 py-4 w-24 text-right">{"Action"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-[#5c7268]">
                          <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="font-bold">{"No orders found"}</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => {
                        const isSelected = selectedOrderId === order.id;
                        return (
                          <tr 
                            key={order.id} 
                            onClick={() => setSelectedOrderId(order.id)}
                            className={`group cursor-pointer border-b border-[#e2ede7] last:border-0 transition-colors ${
                              isSelected 
                                ? 'bg-[#ebf3ef] border-l-4 border-l-[#6baf92]' 
                                : 'bg-white hover:bg-[#F4F8F6] border-l-4 border-l-transparent'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <span className="font-bold text-neutral-900">{order.id}</span>
                              {order.customerName && (
                                <p className="text-xs text-[#5c7268] font-semibold mt-0.5">{order.customerName}</p>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide rounded-full border ${getStatusColor(order.status)}`}>
                                {order.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                                {order.status === 'Processing' && <Clock className="h-3 w-3" />}
                                {order.status === 'Pending' && <Clock className="h-3 w-3" />}
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-neutral-900 font-extrabold">
                              ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-[#5c7268] font-semibold text-sm">
                              {order.createdTime}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className={`inline-flex w-8 h-8 rounded-full items-center justify-center transition-colors ${
                                isSelected ? 'bg-[#6baf92] text-white shadow-sm' : 'bg-[#F4F8F6] text-[#6baf92] group-hover:bg-[#ebf3ef]'
                              }`}>
                                <ChevronRight className="h-4 w-4" />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* ── ORDER DETAIL DRAWER ── */}
        <div className={`absolute top-0 right-0 h-full w-[450px] bg-white border-l border-[#e2ede7] shadow-2xl transition-transform duration-300 ease-in-out z-20 flex flex-col ${
          selectedOrderId ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {selectedOrder && (
            <>
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#e2ede7] bg-[#F4F8F6]/50 flex items-start justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-extrabold text-xl text-neutral-900">{selectedOrder.id}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-lg border ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#5c7268] flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {"Today,"}{selectedOrder.createdTime}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrderId(null)} 
                  className="p-2 text-[#5c7268] hover:text-neutral-900 bg-white rounded-xl shadow-sm border border-[#e2ede7] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Drawer Body - Items */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-white">
                
                <div>
                  <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider mb-4 border-b border-[#e2ede7] pb-2">{"Order Items"}</h4>
                  <div className="flex flex-col gap-3">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="p-4 bg-white border border-[#e2ede7] rounded-2xl flex items-center justify-between shadow-sm hover:border-[#6baf92] transition-colors">
                        <div className="flex items-center gap-4 flex-1 pr-4">
                          <div className="w-12 h-12 rounded-xl bg-[#ebf3ef] flex items-center justify-center shrink-0">
                            <Package className="h-6 w-6 text-[#6baf92]" />
                          </div>
                          <div className="min-w-0">
                            <span className="inline-block text-[10px] font-extrabold uppercase text-[#6baf92] mb-0.5">{item.sku}</span>
                            <h5 className="font-bold text-sm text-neutral-900 truncate">{item.name}</h5>
                            <div className="text-xs font-semibold text-[#5c7268] mt-1">
                              ${item.price.toFixed(2)} x {item.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-extrabold text-neutral-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-[#F4F8F6] p-5 rounded-2xl border border-[#e2ede7]">
                  <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider mb-2">{"Customer Details"}</h4>
                  <p className="text-sm font-semibold text-[#5c7268]">{selectedOrder.customerName || "Walk-in Customer"}</p>
                </div>
              </div>

              {/* Drawer Footer - Summary & Actions */}
              <div className="p-6 bg-[#F4F8F6]/50 border-t border-[#e2ede7] shrink-0">
                <div className="space-y-3 mb-6 bg-white p-4 rounded-2xl border border-[#e2ede7]">
                  <div className="flex justify-between items-center text-sm font-semibold text-[#5c7268]">
                    <span>{"Subtotal"}</span>
                    <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-[#5c7268]">
                    <span>{"Tax (0%)"}</span>
                    <span>$0.00</span>
                  </div>
                  <div className="h-px w-full bg-[#e2ede7] my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-neutral-900">{"Total"}</span>
                    <span className="font-extrabold text-[#6baf92] text-xl">${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.status !== 'Completed' && (
                  <button className="w-full py-4 bg-[#6baf92] text-white font-extrabold rounded-2xl shadow-md hover:bg-[#5a9c80] transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {"Mark as Completed"}</button>
                )}
                {selectedOrder.status === 'Completed' && (
                  <button className="w-full py-4 bg-white border-2 border-[#6baf92] text-[#6baf92] font-extrabold rounded-2xl shadow-sm hover:bg-[#ebf3ef] transition-colors flex items-center justify-center gap-2">
                    {"Print Receipt"}</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
