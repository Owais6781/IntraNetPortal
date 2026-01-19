import * as React from "react";

const NewOpenings: React.FC = () => {
  return (
    <div className="group rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-xl shadow-indigo-200 p-6 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-1 transition-all duration-300 text-white overflow-hidden relative">
      
      {/* Decorative */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/5 rounded-full" />

      <div className="relative z-10">
        
        {/* Header */}
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">
            💼
          </span>
          New Openings
        </h3>

        {/* Job Card */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <p className="font-bold">Senior DevOps</p>
            <p className="text-sm text-white/70 mt-1">📍 Noida HQ</p>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full bg-white/20">
                Full-time
              </span>
              <span className="px-2 py-1 rounded-full bg-white/20">
                Remote OK
              </span>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full py-3 rounded-full bg-white text-indigo-600 font-bold hover:bg-indigo-50 hover:shadow-lg transition-all duration-300">
            View All Jobs →
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewOpenings;
