"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  Package,
  FileText,
  X
} from 'lucide-react';

// Mock Data Models
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
  createdTime: string; // Could be ISO string or formatted date
  items: OrderItem[];
  customerName?: string;
}

interface DailyReport {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  topSellingItems: number;
  revenueByHour: { hour: string, amount: number }[];
}

const MOCK_REPORT: DailyReport = {
  date: "2026-04-15",
  totalRevenue: 2475.50,
  totalOrders: 42,
  topSellingItems: 120,
  revenueByHour: [
    { hour: "9AM", amount: 120 },
    { hour: "10AM", amount: 350 },
    { hour: "11AM", amount: 280 },
    { hour: "12PM", amount: 450 },
    { hour: "1PM", amount: 600 },
    { hour: "2PM", amount: 400 },
    { hour: "3PM", amount: 275.50 },
  ]
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-1001",
    totalAmount: 145.50,
    status: "Completed",
    createdTime: "10:30 AM",
    customerName: "Walk-in Customer",
    items: [ { id: "v1", sku: "ST-001", name: "Matcha Notebook A5", price: 12.5, quantity: 2 } ]
  },
  {
    id: "ORD-1002",
    totalAmount: 8.40,
    status: "Completed",
    createdTime: "11:15 AM",
    items: [ { id: "v2", sku: "ST-002", name: "Ceramic Gel Pen 0.5mm", price: 2.8, quantity: 3 } ]
  },
  {
    id: "ORD-1003",
    totalAmount: 32.00,
    status: "Processing",
    createdTime: "11:45 AM",
    customerName: "Jane Doe",
    items: [ { id: "v7", sku: "ART-001", name: "Watercolor Set 24pc", price: 32.0, quantity: 1 } ]
  },
  {
    id: "ORD-1004",
    totalAmount: 85.20,
    status: "Pending",
    createdTime: "12:10 PM",
    items: [ { id: "v3", sku: "ST-003", name: "Green Tea Sticky Notes", price: 4.2, quantity: 5 } ]
  },
  {
    id: "ORD-1005",
    totalAmount: 25.00,
    status: "Completed",
    createdTime: "12:30 PM",
    customerName: "Walk-in Customer",
    items: [ { id: "v1", sku: "ST-001", name: "Matcha Notebook A5", price: 12.5, quantity: 2 } ]
  }
];

export function OrderHistory() {
  const [filterType, setFilterType] = useState<'Date' | 'Month' | 'Year'>('Date');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Completed': return 'text-[#6baf92] bg-[#ebf3ef] border-[#6baf92]/20';
      case 'Processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-neutral-600 bg-neutral-100 border-neutral-200';
    }
  };

  const maxRevenue = Math.max(...MOCK_REPORT.revenueByHour.map(r => r.amount));

  return (
    <div className="flex flex-col h-screen bg-[#F4F8F6] font-sans overflow-hidden">
      {/* ── TOP BAR ── */}
      <header className="h-20 bg-white border-b border-[#e2ede7] px-6 flex items-center justify-between shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-10 h-10 bg-[#ebf3ef] text-[#6baf92] rounded-xl flex items-center justify-center shadow-inner">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-neutral-900 text-lg leading-tight">{"Order History & Reports"}</h1>
            <p className="text-xs font-bold text-[#5c7268] uppercase tracking-wider">{"Store Dashboard"}</p>
          </div>
        </div>

        {/* Top Filters */}
        <div className="flex items-center justify-center gap-2 w-1/3">
          <div className="flex items-center bg-[#F4F8F6] p-1 rounded-xl border border-[#e2ede7]">
            {(['Date', 'Month', 'Year'] as const).map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterType === type 
                    ? 'bg-white text-[#6baf92] shadow-sm' 
                    : 'text-[#5c7268] hover:text-neutral-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-1/3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e2ede7] rounded-xl text-sm font-bold text-neutral-800 shadow-sm hover:border-[#6baf92] transition-colors">
            <Calendar className="h-4 w-4 text-[#6baf92]" />
            {"April 15, 2026"}</button>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-auto custom-scrollbar p-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-[#e2ede7] shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#ebf3ef] flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-[#6baf92]" />
                  </div>
                  <span className="text-xs font-extrabold text-[#6baf92] bg-[#ebf3ef] px-2 py-1 rounded-lg">+12%</span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#5c7268] uppercase tracking-wider mb-1">{"Total Revenue"}</p>
                  <h3 className="text-3xl font-extrabold text-neutral-900">${MOCK_REPORT.totalRevenue.toFixed(2)}</h3>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border border-[#e2ede7] shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#ebf3ef] flex items-center justify-center">
                    <FileText className="h-6 w-6 text-[#6baf92]" />
                  </div>
                  <span className="text-xs font-extrabold text-[#5c7268] bg-[#F4F8F6] px-2 py-1 rounded-lg">{"Today"}</span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#5c7268] uppercase tracking-wider mb-1">{"Total Orders"}</p>
                  <h3 className="text-3xl font-extrabold text-neutral-900">{MOCK_REPORT.totalOrders}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#e2ede7] shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#ebf3ef] flex items-center justify-center">
                    <Package className="h-6 w-6 text-[#6baf92]" />
                  </div>
                  <span className="text-xs font-extrabold text-[#5c7268] bg-[#F4F8F6] px-2 py-1 rounded-lg">{"Units"}</span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-[#5c7268] uppercase tracking-wider mb-1">{"Top Selling Items"}</p>
                  <h3 className="text-3xl font-extrabold text-neutral-900">{MOCK_REPORT.topSellingItems}</h3>
                </div>
              </div>
            </div>

            {/* Optional Chart: Revenue over time */}
            <div className="bg-white p-6 rounded-3xl border border-[#e2ede7] shadow-sm">
              <h3 className="text-lg font-extrabold text-neutral-900 mb-6">{"Revenue Overview"}</h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {MOCK_REPORT.revenueByHour.map((point, idx) => {
                  const height = `${(point.amount / maxRevenue) * 100}%`;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="w-full relative rounded-t-xl bg-[#ebf3ef] overflow-hidden transition-all group-hover:bg-[#a8d5ba]" style={{ height }}>
                        <div className="absolute bottom-0 w-full bg-[#6baf92] transition-all duration-500 rounded-t-xl" style={{ height: '100%' }}></div>
                        {/* Tooltip on hover */}
                        <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity w-full text-center py-1">
                          <span className="text-[10px] font-extrabold text-white">${point.amount}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#5c7268]">{point.hour}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white border border-[#e2ede7] rounded-3xl shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-[#e2ede7] flex justify-between items-center bg-[#F4F8F6]/30">
                <h3 className="text-lg font-extrabold text-neutral-900">{"Recent Orders"}</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#e2ede7] rounded-lg hover:border-[#6baf92] hover:text-[#6baf92] transition-colors shadow-sm font-bold text-xs text-[#5c7268]">
                  <Filter className="h-3 w-3" />
                  {"Filter"}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F4F8F6]/50 border-b border-[#e2ede7] text-xs font-extrabold text-[#5c7268] uppercase tracking-wider">
                      <th className="px-6 py-4 w-48">{"Order ID"}</th>
                      <th className="px-6 py-4">{"Status"}</th>
                      <th className="px-6 py-4">{"Amount"}</th>
                      <th className="px-6 py-4">{"Time"}</th>
                      <th className="px-6 py-4 w-24 text-right">{"Action"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map(order => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <tr 
                          key={order.id} 
                          onClick={() => setSelectedOrder(order)}
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        {/* ── ORDER DETAIL DRAWER ── */}
        <div className={`absolute top-0 right-0 h-full w-[450px] bg-white border-l border-[#e2ede7] shadow-2xl transition-transform duration-300 ease-in-out z-20 flex flex-col ${
          selectedOrder ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {selectedOrder && (
            <>
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
                  onClick={() => setSelectedOrder(null)} 
                  className="p-2 text-[#5c7268] hover:text-neutral-900 bg-white rounded-xl shadow-sm border border-[#e2ede7] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
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

                <div className="bg-[#F4F8F6] p-5 rounded-2xl border border-[#e2ede7]">
                  <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider mb-2">{"Customer Details"}</h4>
                  <p className="text-sm font-semibold text-[#5c7268]">{selectedOrder.customerName || "Walk-in Customer"}</p>
                </div>
              </div>

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
