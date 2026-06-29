"use client";

import React from 'react';

export function PlanogramUI() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-sm border-2 border-emerald-100">
        <h2 className="text-3xl font-extrabold tracking-tight text-emerald-900 flex items-center gap-3">
          <span className="text-4xl shadow-sm bg-emerald-50 p-2 rounded-2xl">🏪</span> 
          {"Visual Planogram"}</h2>
        <div className="flex gap-4">
          <button className="bg-white border-2 border-slate-200 text-slate-600 font-bold px-6 py-3 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            {"Reset Shelf"}</button>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 hover:scale-105">
            {"Save Layout"}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] shadow-sm border-2 border-emerald-100">
          <h3 className="text-xl font-extrabold text-emerald-900 mb-6">{"Inventory Items"}</h3>
          <div className="flex flex-col gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-slate-50 p-4 border-2 border-slate-200 rounded-2xl flex items-center gap-4 cursor-grab hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border-2 border-slate-100">
                  {['🍎', '🥤', '🍪', '🍫', '🍞'][item - 1]}
                </div>
                <div>
                  <p className="font-extrabold text-slate-800">{"Product"}{item}</p>
                  <p className="font-bold text-slate-400 text-sm">{"SKU-"}{item}482</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-emerald-50 p-8 rounded-[2rem] shadow-inner border-4 border-dashed border-emerald-200 min-h-[600px] flex flex-col justify-center gap-8 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="text-center absolute top-10 w-full left-0">
            <span className="bg-white text-emerald-600 font-extrabold px-6 py-2 rounded-full shadow-sm border-2 border-emerald-100">
              {"Drag items to the shelves below! 🛒"}</span>
          </div>

          {[1, 2, 3].map((shelf) => (
            <div key={shelf} className="w-full relative mt-10">
              {/* Shelf Items Mock */}
              <div className="h-24 w-full px-8 flex items-end justify-around gap-4 z-10 relative">
                {shelf === 1 && (
                  <>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md border-b-4 border-slate-200 flex items-center justify-center text-3xl transform hover:-translate-y-2 transition-transform cursor-pointer">🍎</div>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md border-b-4 border-slate-200 flex items-center justify-center text-3xl transform hover:-translate-y-2 transition-transform cursor-pointer">🍎</div>
                  </>
                )}
                {shelf === 2 && (
                  <>
                    <div className="w-16 h-20 bg-white rounded-2xl shadow-md border-b-4 border-slate-200 flex items-center justify-center text-3xl transform hover:-translate-y-2 transition-transform cursor-pointer">🥤</div>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md border-b-4 border-slate-200 flex items-center justify-center text-3xl transform hover:-translate-y-2 transition-transform cursor-pointer">🍪</div>
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-md border-b-4 border-slate-200 flex items-center justify-center text-3xl transform hover:-translate-y-2 transition-transform cursor-pointer">🍪</div>
                  </>
                )}
              </div>
              {/* Shelf Base */}
              <div className="h-6 w-full bg-emerald-200 rounded-full shadow-sm border-b-4 border-emerald-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
