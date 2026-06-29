import { POSUI } from "@/modules/pos/components/POSUI";
import Link from "next/link";

export default async function POSPage() {

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col font-sans">
      <div className="max-w-7xl mx-auto w-full mb-8 flex justify-between items-center">
        {/* <Link href="/" className="text-sky-500 font-extrabold hover:text-sky-700 flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border-2 border-sky-100 transition-all hover:-translate-x-1">
          <span className="text-xl">🔙</span>
        </Link> */}
      </div>
      <POSUI />
    </div>
  );
}
