import * as React from "react";

const HRPolicies: React.FC = () => {
  return (
    <div className="group rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Header */}
      <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-sm shadow-lg shadow-amber-200">
          📋
        </span>
        HR Policies
      </h3>

      {/* Policies List */}
      <div className="space-y-3">
        
        {/* Policy Item 1 */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all cursor-pointer group/item">
          <span className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">
            📄
          </span>

          <div className="flex-1">
            <p className="font-medium text-slate-700 group-hover/item:text-indigo-600 transition-colors">
              Leave Policy 2026
            </p>
            <p className="text-xs text-slate-400">Updated Jan 1</p>
          </div>

          <span className="text-indigo-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
            →
          </span>
        </div>

        {/* Policy Item 2 */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all cursor-pointer group/item">
          <span className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-lg">
            🏠
          </span>

          <div className="flex-1">
            <p className="font-medium text-slate-700 group-hover/item:text-violet-600 transition-colors">
              Remote Work Guide
            </p>
            <p className="text-xs text-slate-400">Updated Dec 15</p>
          </div>

          <span className="text-violet-500 opacity-0 group-hover/item:opacity-100 transition-opacity">
            →
          </span>
        </div>
      </div>
    </div>
  );
};

export default HRPolicies;
