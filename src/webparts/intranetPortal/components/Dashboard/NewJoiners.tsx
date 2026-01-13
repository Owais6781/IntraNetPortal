import * as React from "react";

const NewJoiners: React.FC = () => {
  return (
    <div className="group rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

      {/* Header */}
      <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white text-sm shadow-lg shadow-emerald-200">
          👋
        </span>
        New Joiners
      </h3>

      {/* Joiners List */}
      <div className="space-y-4">

        {/* Joiner 1 */}
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer group/item">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white font-bold shadow-lg">
              AM
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-slate-800 group-hover/item:text-indigo-600 transition-colors">
              Arjun M.
            </p>
            <p className="text-sm text-slate-500">UI Designer</p>
          </div>

          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
            New
          </span>
        </div>

        {/* Joiner 2 */}
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-violet-50 transition-colors cursor-pointer group/item">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-lg">
              SR
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-slate-800 group-hover/item:text-violet-600 transition-colors">
              Sofia R.
            </p>
            <p className="text-sm text-slate-500">HR Lead</p>
          </div>

          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-1 rounded-full">
            New
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewJoiners;
