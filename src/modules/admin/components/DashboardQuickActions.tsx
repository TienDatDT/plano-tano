"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, ClipboardList, ShoppingCart, ArrowRight } from "lucide-react";
import { Card } from "@/shared/components/ui/Card";

export function DashboardQuickActions() {

  const actions = [
    {
      title: "Add Product",
      description: "Register new stationery items",
      icon: PlusCircle,
      href: "/admin/products",
      color: "bg-premium-primary",
    },
    {
      title: "Stock In",
      description: "Receive goods from suppliers",
      icon: ClipboardList,
      href: "/admin/stock-in",
      color: "bg-premium-secondary",
    },
    {
      title: "Create Order",
      description: "Start a new checkout session",
      icon: ShoppingCart,
      href: "/pos",
      color: "bg-premium-accent",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {actions.map((action) => (
        <Link key={action.title} href={action.href} className="group">
          <Card className="flex h-full items-center gap-4 p-5 transition-all duration-300 group-hover:shadow-card group-hover:-translate-y-1">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${action.color} text-white shadow-soft transition-transform group-hover:scale-110`}>
              <action.icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-neutral-900 leading-tight">{action.title}</h3>
              <p className="text-xs text-premium-muted mt-0.5 truncate">{action.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-premium-muted/30 transition-transform group-hover:translate-x-1 group-hover:text-premium-primary" />
          </Card>
        </Link>
      ))}
    </div>
  );
}

