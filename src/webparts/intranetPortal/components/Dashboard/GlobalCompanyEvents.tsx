// import * as React from "react";

// const GlobalCompanyEvents: React.FC = () => {
//   return (
//     <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
      
//       {/* Header */}
//       <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
//         <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
//           🌍
//         </span>
//         Global Company Events
//       </h2>

//       {/* Events */}
//       <div className="flex flex-col md:flex-row gap-4">
        
//         {/* Event Card 1 */}
//         <div className="flex-1 group rounded-2xl bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 border border-indigo-100 p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
//           <div className="flex items-center gap-3 mb-3">
//             <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
//               12
//             </span>
//             <div>
//               <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
//                 January
//               </p>
//               <p className="text-sm text-slate-500">Thursday</p>
//             </div>
//           </div>

//           <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
//             Annual Strategy Townhall
//           </p>
//           <p className="text-sm text-slate-500 mt-1">
//             10:00 AM – 12:00 PM
//           </p>
//         </div>

//         {/* Event Card 2 */}
//         <div className="flex-1 group rounded-2xl bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 border border-rose-100 p-5 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
//           <div className="flex items-center gap-3 mb-3">
//             <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-200">
//               15
//             </span>
//             <div>
//               <p className="text-xs font-bold text-rose-600 uppercase tracking-wide">
//                 January
//               </p>
//               <p className="text-sm text-slate-500">Sunday</p>
//             </div>
//           </div>

//           <p className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
//             Product v3.0 Launch Party
//           </p>
//           <p className="text-sm text-slate-500 mt-1">
//             5:30 PM Onwards
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default GlobalCompanyEvents;


import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface IEventItem {
  Id: number;
  Title: string;
  EventDate: string;
  EventTime: string;
  Location: string;
  Status: string;
  Color: string;
}

interface Props {
  sp: SPFI;
}

const GlobalCompanyEvents: React.FC<Props> = ({ sp }) => {
  const [events, setEvents] = useState<IEventItem[]>([]);

  const loadEvents = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle("GlobalCompanyEvents")
        .items.select(
          "Id",
          "Title",
          "EventDate",
          "EventTime",
          "Location",
          "Status",
          "Color"
        )
        .filter("Status eq 'Active'")
        .orderBy("EventDate", true)();

      setEvents(items);
    } catch (error) {
      console.error("Event loading error:", error);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const getColorStyle = (color: string) => {
    switch (color) {
      case "Rose":
        return {
          bg: "from-rose-50 via-orange-50 to-amber-50",
          border: "border-rose-200",
          badge: "from-rose-400 to-orange-400",
          text: "text-rose-600"
        };
      case "Amber":
        return {
          bg: "from-amber-50 via-yellow-50 to-orange-50",
          border: "border-amber-200",
          badge: "from-amber-400 to-orange-400",
          text: "text-amber-600"
        };
      default:
        return {
          bg: "from-indigo-50 via-violet-50 to-purple-50",
          border: "border-indigo-200",
          badge: "from-indigo-500 to-violet-500",
          text: "text-indigo-600"
        };
    }
  };

  return (
    <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl p-6">
      {/* HEADER */}
      <h2 className="text-xl font-bold text-slate-800 mb-5 flex items-center gap-3">
        <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg">
          🌍
        </span>
        Global Company Events
      </h2>

      {/* EVENTS */}
      <div className="flex flex-col gap-4 max-h-[260px] overflow-y-auto pr-1">
        {events.map((event) => {
          const style = getColorStyle(event.Color);
          const date = new Date(event.EventDate);

          return (
            <div
              key={event.Id}
              className={`group rounded-2xl bg-gradient-to-br ${style.bg}
                border ${style.border} p-5 cursor-pointer
                hover:shadow-xl hover:-translate-y-1 transition-all`}
            >
              {/* DATE */}
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.badge}
                    flex items-center justify-center text-white font-bold`}
                >
                  {date.getDate()}
                </span>

                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wide ${style.text}`}
                  >
                    {date.toLocaleString("default", {
                      month: "long"
                    })}
                  </p>
                  <p className="text-sm text-slate-500">
                    {date.toLocaleDateString("en-US", {
                      weekday: "long"
                    })}
                  </p>
                </div>
              </div>

              {/* CONTENT */}
              <p className="font-bold text-slate-800">
                {event.Title}
              </p>

              <p className="text-sm text-slate-500 mt-1">
                {event.EventTime}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                📍 {event.Location}
              </p>
            </div>
          );
        })}

        {events.length === 0 && (
          <p className="text-sm text-slate-400 text-center">
            No upcoming events
          </p>
        )}
      </div>
    </div>
  );
};

export default GlobalCompanyEvents;

