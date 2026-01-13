// import * as React from "react";


// const PROJECTS = [
//   {
//     id: 1,
//     title: "Project Phoenix (v3.0)",
//     status: "On Track",
//     progress: 70,
//     description: "Refactoring core infrastructure for better scalability."
//   },
//   {
//     id: 2,
//     title: "Nebula Cloud Migration",
//     status: "Delayed",
//     progress: 35,
//     description: "Moving legacy database clusters to AWS Frankfurt."
//   },
//   {
//     id: 3,
//     title: "Atlas Security Upgrade",
//     status: "On Track",
//     progress: 55,
//     description: "Enhancing authentication and access control systems."
//   }
// ];

// // Security Alerts
// const ALERTS = [
//   {
//     id: 1,
//     icon: "🎉",
//     text: "Rotate all VPN credentials by Friday."
//   },
//   {
//     id: 2,
//     icon: "✅",
//     text: "Firewall patching complete for Noida HQ."
//   },
//   {
//     id: 3,
//     icon: "⚠️",
//     text: "MFA enforcement scheduled for next week."
//   }
// ];


// const QUICK_LINKS = [
//   { title: "GitHub Org", url: "https://github.com" },
//   { title: "Jira Dashboard", url: "https://jira.atlassian.com" },
//   { title: "Confluence Space", url: "https://confluence.atlassian.com" },
//   { title: "AWS Console", url: "https://aws.amazon.com/console" }
// ];


// const Engineering: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-slate-100 p-8">
//       <div className="max-w-7xl mx-auto">

//         {/* HEADER */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-slate-900">
//             Engineering Hub
//           </h1>
//           <p className="text-slate-600 mt-1">
//             Resources and updates for the Global Engineering Team.
//           </p>
//         </div>

//         {/* MAIN LAYOUT */}
//         <div className="flex flex-col lg:flex-row gap-6">

//           {/* LEFT – ACTIVE PROJECTS */}
//           <div className="flex-[3] bg-white rounded-3xl shadow-xl p-6">
//             <h2 className="text-lg font-semibold text-indigo-600 mb-6 flex items-center gap-2">
//               🚀 Active Projects
//             </h2>

//             {PROJECTS.map(project => (
//               <div
//                 key={project.id}
//                 className={`rounded-2xl p-5 mb-5 border
//                   ${project.status === "Delayed"
//                     ? "border-orange-200"
//                     : "border-indigo-200"}`}
//               >
//                 <div className="flex justify-between items-center">
//                   <h3 className="font-semibold text-slate-800">
//                     {project.title}
//                   </h3>

//                   <span
//                     className={`px-3 py-1 text-xs rounded-full font-medium
//                       ${project.status === "Delayed"
//                         ? "bg-orange-400 text-white"
//                         : "bg-sky-100 text-sky-600"}`}
//                   >
//                     {project.status}
//                   </span>
//                 </div>

//                 <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
//                   <div
//                     className={`h-full
//                       ${project.status === "Delayed"
//                         ? "bg-orange-400"
//                         : "bg-gradient-to-r from-indigo-500 to-purple-500"}`}
//                     style={{ width: `${project.progress}%` }}
//                   />
//                 </div>

//                 <p className="text-sm text-slate-500 mt-3">
//                   {project.description}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* RIGHT SIDE */}
//           <div className="flex-[2] flex flex-col gap-6">

//             {/* SECURITY ALERTS */}
//             <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl text-white">
//               <h2 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
//                 🛡️ Security Alerts
//               </h2>

//               <ul className="space-y-4 text-sm">
//                 {ALERTS.map(alert => (
//                   <li key={alert.id} className="flex gap-3">
//                     <span>{alert.icon}</span>
//                     <span>{alert.text}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* QUICK LINKS */}
//             <div className="rounded-3xl bg-white shadow-xl p-6">
//               <h2 className="text-lg font-semibold text-indigo-600 mb-4 flex items-center gap-2">
//                 🔗 Quick Links
//               </h2>

//               <div className="space-y-3">
//                 {QUICK_LINKS.map(link => (
//                   <button
//                     key={link.title}
//                     onClick={() => window.open(link.url, "_blank")}
//                     className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition text-sm font-medium"
//                   >
//                     {link.title}
//                   </button>
//                 ))}
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Engineering;





import * as React from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface IProps {
  sp: SPFI;
}

interface IProject {
  Id: number;
  Title: string;
  Status: string;
  Progress: string;
  Description: string;
}

const SECURITY_ALERTS = [
  { id: 1, icon: "⚠️", text: "Rotate all VPN credentials by Friday." },
  { id: 2, icon: "✅", text: "Firewall patching complete for Noida HQ." }
];

const QUICK_LINKS = [
  { title: "GitHub Org", url: "https://github.com" },
  { title: "Jira Dashboard", url: "https://jira.atlassian.com" },
  { title: "Confluence Space", url: "https://confluence.atlassian.com" },
  { title: "AWS Console", url: "https://aws.amazon.com/console" }
];

const Engineering: React.FC<IProps> = ({ sp }) => {
  const [projects, setProjects] = React.useState<IProject[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const items = await sp.web.lists
          .getByTitle("Engineering")
          .items
          .select("Id", "Title", "Status", "Progress", "Description")();

        setProjects(items as IProject[]);
      } catch (err) {
        console.error("Error loading Engineering list", err);
      } finally {
        setLoading(false);
      }
    };

    void loadProjects();
  }, [sp]);

  const getProgress = (value?: string): number => {
    const num = parseInt(value || "0", 10);
    if (isNaN(num)) return 0;
    if (num > 100) return 100;
    if (num < 0) return 0;
    return num;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-8 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 text-2xl shadow-sm">
              ⚙️
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Engineering Hub
            </h1>
          </div>
          <p className="text-slate-500 text-sm md:text-base">
            Overview of engineering projects, security alerts and quick tools.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT: PROJECTS */}
          <div className="flex-[3] bg-white/80 backdrop-blur rounded-3xl shadow-lg border border-slate-200 p-6 lg:p-7">
            <h2 className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase mb-6 flex items-center gap-2">
              <span className="text-base">🚀</span>
              Active Projects
            </h2>

            {projects.map(p => {
              const progress = getProgress(p.Progress);
              const isDelayed = p.Status?.toLowerCase() === "delayed";

              return (
                <div
                  key={p.Id}
                  className={`group rounded-2xl p-5 mb-5 border-2 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                    ${isDelayed
                      ? "border-amber-200 bg-amber-50/70"
                      : "border-slate-200 bg-slate-50/70"
                    }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-slate-900 text-base md:text-lg">
                      {p.Title}
                    </h3>

                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1
                        ${isDelayed
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full
                          ${isDelayed ? "bg-amber-500" : "bg-emerald-500"}`}
                      />
                      {p.Status}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                        Progress
                      </span>
                      <span
                        className={`text-xs font-semibold
                          ${isDelayed ? "text-amber-600" : "text-indigo-600"}`}
                      >
                        {progress}%
                      </span>
                    </div>

                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`${isDelayed
                          ? "bg-gradient-to-r from-amber-400 to-orange-400"
                          : "bg-gradient-to-r from-indigo-500 to-sky-500"
                          } h-full transition-[width] duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 uppercase tracking-wide">
                    Overall completion: {progress}%
                  </p>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed whitespace-pre-line">
                    {p.Description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-[2] flex flex-col gap-6">

         
            <div className="rounded-3xl bg-white/90 border border-rose-100 text-slate-900 p-6 shadow-lg">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-rose-600 uppercase mb-4 flex items-center gap-2">
                <span className="text-base">🛡️</span>
                Security Alerts
              </h2>

              <ul className="space-y-3 text-sm">
                {SECURITY_ALERTS.map(alert => (
                  <li
                    key={alert.id}
                    className="flex gap-3 items-start rounded-2xl bg-rose-50/70 border border-rose-100 px-3 py-3"
                  >
                    <span className="text-base">{alert.icon}</span>
                    <span className="text-slate-700">{alert.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* QUICK LINKS  */}
            <div className="rounded-3xl bg-white/90 border border-slate-200 p-6 shadow-lg">
              <h2 className="text-xs font-semibold tracking-[0.2em] text-indigo-600 uppercase mb-4 flex items-center gap-2">
                <span className="text-base">🔗</span>
                Quick Links
              </h2>

              {QUICK_LINKS.map(link => (
                <button
                  key={link.title}
                  onClick={() => window.open(link.url, "_blank")}
                  className="w-full flex items-center justify-between text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 mb-2 transition-colors border border-transparent hover:border-indigo-200"
                >
                  <span className="text-sm font-medium">{link.title}</span>
                  <span className="text-slate-300 group-hover:text-indigo-500 text-base">
                    →
                  </span>
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Engineering;