// import * as React from "react";

// interface HeroSectionProps {
//   userName: string;
//   loading: boolean;
// }

// const HeroSection: React.FC<HeroSectionProps> = ({ userName, loading }) => {
//   return (
//     <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
//       {/* LEFT BIG CARD */}
//       <div
//         className="flex-[2] min-h-[400px] lg:min-w-[640px] relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
//         style={{
//           backgroundImage:
//             "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//         }}
//       >
//         {/* Grain Effect */}
//         <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

//         {/* Content */}
//         <div className="relative z-10 p-8 sm:p-10 text-white h-full flex flex-col justify-end">
//           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit mb-4">
//             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
//             <span className="text-xs font-medium tracking-wide">
//               Live Dashboard
//             </span>
//           </div>

//           <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
//             Innovation Starts <br /> with You.
//           </h1>

//           <p className="mt-4 text-base sm:text-lg text-white/80 max-w-md">
//             Welcome back,{" "}
//             <span className="text-violet-300 font-semibold">
//               {loading ? "Loading..." : userName}
//             </span>
//             . Your day is looking productive.
//           </p>

//           <div className="mt-8 flex flex-wrap gap-4">
//             <button className="group/btn relative px-6 py-3 rounded-full bg-white text-indigo-700 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
//               <span className="relative z-10">My Workspace</span>
//               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
//               <span className="absolute inset-0 flex items-center justify-center text-white font-semibold opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
//                 My Workspace
//               </span>
//             </button>

//             <button className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-300">
//               Global Teams
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="flex flex-col gap-6 lg:w-[380px]">
//         {/* QUOTE CARD */}
//         <div className="group relative rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-8 shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
//           <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
//           <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />

//           <div className="relative z-10">
//             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
//               💡
//             </div>
//             <p className="text-lg font-medium text-white">
//               "Success is not final; failure is not fatal: it is the courage to
//               continue that counts."
//             </p>
//             <p className="mt-4 text-sm text-white/70">
//               — Winston Churchill
//             </p>
//           </div>
//         </div>

//         {/* CALENDAR CARD */}
//            <div className="group rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-200/50 hover:-translate-y-1 transition-all duration-300">
//             <div className="flex items-center justify-between mb-5">
//               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
//                 <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
//                   📅
//                 </span>
//                 Quick Calendar
//               </h3>
//               <button className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
//                 View All →
//               </button>
//             </div>

//             <div className="space-y-3">
//               <div className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 hover:border-indigo-200 hover:shadow-md transition-all duration-300 cursor-pointer group/item">
//                 <div className="text-center px-3 py-2 rounded-xl bg-white shadow-sm">
//                   <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
//                     Jan
//                   </p>
//                   <p className="text-xl font-bold text-slate-800">08</p>
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-semibold text-slate-800 group-hover/item:text-indigo-600 transition-colors">
//                     Product Sync
//                   </p>
//                   <p className="text-sm text-slate-500">
//                     11:00 AM – 12:00 PM
//                   </p>
//                 </div>
//                 <div className="w-2 h-2 rounded-full bg-indigo-500" />
//               </div>

//               <div className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 hover:border-violet-200 hover:shadow-md transition-all duration-300 cursor-pointer group/item">
//                 <div className="text-center px-3 py-2 rounded-xl bg-white shadow-sm">
//                   <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">
//                     Jan
//                   </p>
//                   <p className="text-xl font-bold text-slate-800">10</p>
//                 </div>
//                 <div className="flex-1">
//                   <p className="font-semibold text-slate-800 group-hover/item:text-violet-600 transition-colors">
//                     Q1 Goal Setting
//                   </p>
//                   <p className="text-sm text-slate-500">
//                     02:00 PM – 03:30 PM
//                   </p>
//                 </div>
//                 <div className="w-2 h-2 rounded-full bg-violet-500" />
//               </div>
//             </div>



//           </div>
//       </div>
//     </div>
//   );
// };

// export default HeroSection;


import * as React from "react";

interface HeroSectionProps {
  userName: string;
  loading: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ userName, loading }) => {
  return (
    <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 sm:gap-6">
      {/* LEFT BIG CARD */}
      <div

        className="flex-[2] min-h-[340px] lg:min-w-[640px] relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Grain Effect */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

        {/* Content */}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        <div className="relative z-10 p-6 sm:p-8 text-white h-full flex flex-col justify-end " style={{marginTop:"-60px"}}>
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit mb-4">
=======
=======
>>>>>>> Stashed changes
        <div className="relative z-10 p-6 sm:p-8 text-white h-full flex flex-col justify-end " style={{ marginTop: "-60px" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit mb-4">
>>>>>>> Stashed changes
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wide">
              Live Dashboard
            </span>
          </div> */}

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Innovation Starts <br /> with You.
          </h1>

          <p className="mt-3 mb-3 text-sm sm:text-base text-white/80 max-w-md">
            Welcome back,{" "}
            <span className="text-primary-200 font-semibold">
              {loading ? "Loading..." : userName}
            </span>
            . Your day is looking productive.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button className="group/btn relative px-5 py-2.5 rounded-full bg-white text-primary-700 font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden text-sm">
              <span className="relative z-10">My Workspace</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              <span className="absolute inset-0 flex items-center justify-center text-white font-semibold opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                My Workspace
              </span>
            </button>

            <button className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-300 text-sm">
              Global Teams
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col gap-4 lg:w-[380px]">
        {/* QUOTE CARD */}
        {/* CHANGED: Reduced padding from p-8 to p-6 */}
        <div className="group relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-6 shadow-xl shadow-primary-500/20 hover:shadow-2xl hover:shadow-primary-500/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700" />

          <div className="relative z-10">
            {/* CHANGED: mb-4 to mb-3 for less height */}
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-3">
              <span className="text-sm">💡</span>
            </div>
            <p className="text-base font-medium text-white leading-snug">
              "Success is not final; failure is not fatal: it is the courage to
              continue that counts."
            </p>
            <p className="mt-3 text-xs text-white/70">
              — Winston Churchill
            </p>
          </div>
        </div>

        {/* CALENDAR CARD */}

        <div className="group rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 p-5 shadow-xl shadow-surface-200/50 hover:shadow-2xl hover:shadow-primary-200/50 hover:-translate-y-1 transition-all duration-300 ">

          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-surface-800 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-primary-100 flex items-center justify-center text-sm">
                📅
              </span>
              Quick Calendar
            </h3>
            <button className="text-[10px] text-primary-600 font-semibold hover:text-primary-700 transition-colors uppercase tracking-wide">
              View All →
            </button>
          </div>

          <div className="space-y-2 ">

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-surface-50 to-surface-100 border border-primary-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 cursor-pointer group/item" style={{ marginBottom: "2px" }}>
              <div className="text-center py-1  px-2 rounded-lg bg-white shadow-sm">
                <p className="text-[9px] font-bold text-primary-500 uppercase tracking-wider">
                  Jan
                </p>
                <p className="text-lg font-bold text-surface-800 leading-none">08</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-800 group-hover/item:text-primary-600 transition-colors truncate">
                  Product Sync
                </p>
                <p className="text-[11px] text-surface-500 truncate">
                  11:00 AM – 12:00 PM
                </p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
            </div>

            {/* CHANGED: p-3 to p-2 for items */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-surface-100 to-surface-200 border border-secondary-100 hover:border-secondary-200 hover:shadow-md transition-all duration-300 cursor-pointer group/item">
              <div className="text-center py-1  px-2 rounded-lg bg-white shadow-sm">
                <p className="text-[9px] font-bold text-primary-400 uppercase tracking-wider">
                  Jan
                </p>
                <p className="text-lg font-bold text-surface-800 leading-none">10</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-800 group-hover/item:text-primary-600 transition-colors truncate">
                  Q1 Goal Setting
                </p>
                <p className="text-[11px] text-surface-500 truncate">
                  02:00 PM – 03:30 PM
                </p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
            </div>
          </div>
        </div>




      </div>
    </div>
  );
};

export default HeroSection;
