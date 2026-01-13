

// import * as React from "react";
// import { SPFI } from "@pnp/sp";
// import "@pnp/sp/webs";
// import "@pnp/sp/site-users/web";
// import "@pnp/graph/users";
// import "@pnp/graph/photos";
// import HeroSection from "./HeroSection";
// import PersonalQuickAccess from "./PersonalQuickAccess";
// import LatestCompanyNews from "./LatestCompanyNews";
// import GlobalCompanyEvents from "./GlobalCompanyEvents";
// import EmployeeOfTheMonth from "./EmployeeOfTheMonth";
// import NewJoiners from "./NewJoiners";
// import HRPolicies from "./HRPolicies";
// import NewOpenings from "./NewOpenings";
// import { GraphFI } from "@pnp/graph";


// interface DashboardProps {
//   sp: SPFI;
//   graph: GraphFI;
// }

// const Dashboard: React.FC<DashboardProps> = ({ sp, graph }) => {
//   const [userName, setUserName] = React.useState("");
//   const [loading, setLoading] = React.useState(true);
//   React.useEffect(() => {
//     const loadUser = async () => {
//       try {
//         const spUser = await sp.web.currentUser();
//         setUserName(spUser.Title);

//       } catch (error) {
//         console.error("User Load Error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     void loadUser();
//   }, [sp]);




//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-100/50 p-6">
//       {/* Decorative blobs */}
//       <div className="fixed top-20 left-20 w-72 h-72 bg-violet-300/30 rounded-full blur-3xl pointer-events-none" />
//       <div className="fixed bottom-20 right-20 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
//       <div className="fixed top-1/2 left-1/2 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />


//       <HeroSection
//         userName={userName}
//         loading={loading}
//       />


//       {/* ================= BOTTOM SECTION ================= */}
//       <div className="relative max-w-7xl mx-auto mt-10 flex flex-col lg:flex-row gap-6">
//         {/* LEFT – NEWS & EVENTS */}
//         <div className="flex-[3] flex flex-col gap-6">

//           <PersonalQuickAccess />
//           <LatestCompanyNews />
//           <GlobalCompanyEvents />
//         </div>

//         {/* RIGHT – POLICIES & JOINERS */}
//         <div className="flex-[1] flex flex-col gap-6">
//           <EmployeeOfTheMonth />
//           <NewJoiners / >
//           <HRPolicies />
//           <NewOpenings />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;







import * as React from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";

import HeroSection from "./HeroSection";
import PersonalQuickAccess from "./PersonalQuickAccess";
import LatestCompanyNews from "./LatestCompanyNews";
import GlobalCompanyEvents from "./GlobalCompanyEvents";
import EmployeeOfTheMonth from "./EmployeeOfTheMonth";
import NewJoiners from "./NewJoiners";
import HRPolicies from "./HRPolicies";
import NewOpenings from "./NewOpenings";
import { GraphFI } from "@pnp/graph";

interface DashboardProps {
  sp: SPFI;
  graph:GraphFI;
}

const Dashboard: React.FC<DashboardProps> = ({ sp,graph  }) => {
  const [userName, setUserName] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const spUser = await sp.web.currentUser();
        setUserName(spUser.Title);
      } catch (error) {
        console.error("User Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [sp]);

import { SPFI } from "@pnp/sp";


import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/graph/users";
import "@pnp/graph/photos";

interface DashboardProps {
  sp: SPFI;

}


const Dashboard: React.FC <DashboardProps> = ({sp}) => {

const [userName, setUserName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const spUser = await sp.web.currentUser();
        setUserName(spUser.Title);
      
      } catch (error) {
        console.error("User Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [sp]);




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-100/50 p-6">
      {/* Decorative blobs */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-violet-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* LEFT BIG CARD */}
        <div
          className="flex-[2] min-h-[400px] lg:min-w-[640px] relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient Overlay */}
          <div className=" " />

          {/* Animated grain effect */}
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />

          {/* Content */}
          <div className="relative z-10 p-8 sm:p-10 text-white h-full flex flex-col justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium tracking-wide">
                Live Dashboard
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Innovation Starts <br /> with You.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-white/80 max-w-md">
              Welcome back,{" "}
              <span className="text-violet-300 font-semibold"> {loading ? "Loading..." : userName}</span>. Your
              day is looking productive.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="group/btn relative px-6 py-3 rounded-full bg-white text-indigo-700 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
                <span className="relative z-10">My Workspace</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                <span className="absolute inset-0 flex items-center justify-center text-white font-semibold opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                  My Workspace
                </span>
              </button>

              <button className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 transition-all duration-300">
                Global Teams
              </button>
            </div>
          </div>
        </div>


      <HeroSection userName={userName} loading={loading} />

      {/* ================= BOTTOM SECTION ================= */}
      <div className="relative max-w-7xl mx-auto mt-10 flex flex-col lg:flex-row gap-6">
        {/* LEFT */}
        <div className="flex-[3] flex flex-col gap-6">
          <PersonalQuickAccess />
          <LatestCompanyNews />
          <GlobalCompanyEvents />
          {/* PERSONAL OVERVIEW / QUICK ACCESS / EMPLOYEE OF THE MONTH */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
            <div className="flex flex-col xl:flex-row gap-4">
              {/* Personal Overview */}
              <div className="flex-1 rounded-2xl bg-white shadow-md border border-slate-100 px-6 py-5">
                <h3 className="text-base sm:text-lg font-bold text-indigo-700 mb-4">
                  Personal Overview
                </h3>
                <div className="flex items-end gap-10">
                  <div>
                    <p className="text-3xl font-extrabold text-indigo-600">12</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Tasks Assigned
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-emerald-600">
                      4
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Workplace Access */}
              <div className="flex-1 rounded-2xl bg-white shadow-md border border-slate-100 px-6 py-5">
                <h3 className="text-base sm:text-lg font-bold text-indigo-700 mb-4">
                  Quick Workplace Access
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors">
                    🌴 Apply Leave
                  </button>
                  <button className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors">
                    💻 IT Support
                  </button>
                </div>
              </div>

              {/* Employee of the Month */}
              {/* <div className="flex-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 px-6 py-5 text-white shadow-md">
                <h3 className="text-base sm:text-lg font-bold mb-4">
                  Employee of the Month
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    🌟
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Jenkins</p>
                    <p className="text-xs sm:text-sm text-white/80">
                      Engineering Lead
                    </p>
                  </div>
                </div>
              </div> */}
            </div>

          </div>

          {/* Latest Company News */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-rose-200">
                  📰
                </span>
                Latest Company News
              </h2>
              <button className="text-sm px-5 py-2 rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 font-semibold transition-all duration-300">
                View All →
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* News Card 1 */}
              <div className="flex-1 group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
                    className="h-44 w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="News"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <span className="inline-flex items-center text-xs bg-sky-100 text-sky-600 px-3 py-1.5 rounded-full font-semibold">
                    🏢 Organization
                  </span>
                  <h3 className="mt-3 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    Noida Campus Expansion
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    We are expanding our Noida facility to support growth and
                    innovation…
                  </p>
                  <div className="mt-4 flex items-center text-xs text-slate-400">
                    <span>5 min read</span>
                    <span className="mx-2">•</span>
                    <span>Jan 5, 2026</span>
                  </div>
                </div>
              </div>

              {/* News Card 2 */}
              <div className="flex-1 group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                <div className="relative overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b"
                    className="h-44 w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt="News"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-5">
                  <span className="inline-flex items-center text-xs bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full font-semibold">
                    🎉 Events
                  </span>
                  <h3 className="mt-3 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    Annual Wellness Week
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                    Join us for yoga, nutrition & mindfulness sessions
                    throughout the week…
                  </p>
                  <div className="mt-4 flex items-center text-xs text-slate-400">
                    <span>3 min read</span>
                    <span className="mx-2">•</span>
                    <span>Jan 8, 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Events */}
          <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                🌍
              </span>
              Global Company Events
            </h2>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 group rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border border-indigo-100 p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                    12
                  </span>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                      January
                    </p>
                    <p className="text-sm text-slate-500">Thursday</p>
                  </div>
                </div>
                <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  Annual Strategy Townhall
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  10:00 AM – 12:00 PM
                </p>
                {/* <div className="mt-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-200" />
                  <span className="w-6 h-6 rounded-full bg-violet-200 -ml-2" />
                  <span className="w-6 h-6 rounded-full bg-purple-200 -ml-2" />
                  <span className="text-xs text-slate-500 ml-1">
                    +120 attending
                  </span>
                </div> */}
              </div>

              <div className="flex-1 group rounded-2xl bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border border-rose-100 p-5 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-200">
                    15
                  </span>
                  <div>
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wide">
                      January
                    </p>
                    <p className="text-sm text-slate-500">Sunday</p>
                  </div>
                </div>
                <p className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                  Product v3.0 Launch Party
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  5:30 PM Onwards
                </p>
                {/* <div className="mt-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-200" />
                  <span className="w-6 h-6 rounded-full bg-orange-200 -ml-2" />
                  <span className="w-6 h-6 rounded-full bg-amber-200 -ml-2" />
                  <span className="text-xs text-slate-500 ml-1">
                    +85 attending
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-[1] flex flex-col gap-6">
          <EmployeeOfTheMonth />

          {/* ✅ FIXED */}
          <NewJoiners
        
          
      
          />

          <HRPolicies />
          <NewOpenings />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



