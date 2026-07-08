'use client';

import { LayoutDashboard } from "lucide-react";

export function LoginLeftPanel() {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#1a1510] p-10 lg:flex">
      {/* Background Gradient & Circles */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#2a1f0f_0%,#1a1510_60%,#0f0c08_100%)] opacity-90" />
      <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[var(--premium-primary)] opacity-5 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-[600px] w-[600px] rounded-full bg-[var(--premium-primary)] opacity-5 blur-3xl" />

      {/* Content Top (if any) or just Spacer */}
      <div className="relative z-10" />

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[image:var(--image-gold-gradient)] shadow-[var(--shadow-gold)]">
          <LayoutDashboard className="h-10 w-10 text-white" strokeWidth={2} />
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white">TanaPlano</h1>
        <p className="mt-3 text-base font-medium text-amber-400/70">
          Hệ thống quản lý văn phòng phẩm
        </p>

        <ul className="mt-12 flex flex-col gap-4 text-left">
          <li className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--premium-primary)]" />
            <span className="text-sm font-medium text-white/70">Quản lý kho hàng thông minh</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--premium-primary)]" />
            <span className="text-sm font-medium text-white/70">Phân tích báo cáo chi tiết</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--premium-primary)]" />
            <span className="text-sm font-medium text-white/70">Phân quyền nhân viên linh hoạt</span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="relative z-10">
        <span className="font-mono text-xs font-bold text-amber-600/50">v1.0.0</span>
      </div>
    </div>
  );
}
