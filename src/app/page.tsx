import { Database, MonitorSmartphone, LayoutGrid } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F8F6] text-slate-800 font-sans p-6 relative overflow-hidden">
      {/* Very subtle background texture/gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F4F8F6] via-[#E8F1EC] to-[#F4F8F6] opacity-60"></div>

      <main className="z-10 w-full max-w-5xl flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            {"TanaPlano"}</h1>
          <p className="text-lg md:text-xl font-medium text-slate-500 max-w-2xl mx-auto">
            {"Retail Inventory & Planogram System"}</p>
          {/* Subtle divider */}
          <div className="pt-6">
            <div className="h-1 w-16 bg-[#6BAF92] mx-auto rounded-full opacity-80"></div>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {/* Admin Management */}
          <Link
            href="/admin/dashboard"
            className="group flex flex-col bg-white p-6 rounded-2xl border border-[#E6F0EB] hover:border-[#6BAF92] hover:shadow-xl hover:shadow-[#6BAF92]/10 transition-all duration-200 transform hover:-translate-y-1 active:scale-95"
          >
            <div className="w-12 h-12 bg-[#F4F8F6] group-hover:bg-[#6BAF92] text-[#6BAF92] group-hover:text-white rounded-full flex items-center justify-center mb-5 transition-colors duration-200">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1.5">{"Admin Management"}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {"Manage inventory, view reports, and configure store options."}</p>
          </Link>

          {/* Product List */}
          {/* <Link
            href="/products"
            className="group flex flex-col bg-white p-6 rounded-2xl border border-[#E6F0EB] hover:border-[#6BAF92] hover:shadow-xl hover:shadow-[#6BAF92]/10 transition-all duration-200 transform hover:-translate-y-1 active:scale-95"
          >
            <div className="w-12 h-12 bg-[#F4F8F6] group-hover:bg-[#6BAF92] text-[#6BAF92] group-hover:text-white rounded-full flex items-center justify-center mb-5 transition-colors duration-200">
              <Package strokeWidth={2} className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1.5">Product List</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Quick access to product catalog for fast reference.
            </p>
          </Link> */}

          {/* Sales / Cashier */}
          <Link
            href="/pos"
            className="group flex flex-col bg-white p-6 rounded-2xl border border-[#E6F0EB] hover:border-[#6BAF92] hover:shadow-xl hover:shadow-[#6BAF92]/10 transition-all duration-200 transform hover:-translate-y-1 active:scale-95"
          >
            <div className="w-12 h-12 bg-[#F4F8F6] group-hover:bg-[#6BAF92] text-[#6BAF92] group-hover:text-white rounded-full flex items-center justify-center mb-5 transition-colors duration-200">
              <MonitorSmartphone strokeWidth={2} className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1.5">{"Sales / Cashier"}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {"Process customer orders and ring up purchases efficiently."}</p>
          </Link>

          {/* Store Layout */}
          <Link
            href="/planogram"
            className="group flex flex-col bg-white p-6 rounded-2xl border border-[#E6F0EB] hover:border-[#6BAF92] hover:shadow-xl hover:shadow-[#6BAF92]/10 transition-all duration-200 transform hover:-translate-y-1 active:scale-95"
          >
            <div className="w-12 h-12 bg-[#F4F8F6] group-hover:bg-[#6BAF92] text-[#6BAF92] group-hover:text-white rounded-full flex items-center justify-center mb-5 transition-colors duration-200">
              <LayoutGrid strokeWidth={2} className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1.5">{"Store Layout"}</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {"Visualize and arrange inventory on physical store shelves."}</p>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 mb-4 text-center">
        <p className="text-xs font-medium text-slate-400">
          {"TanaPlano v1.0.0 &copy;"}{new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
