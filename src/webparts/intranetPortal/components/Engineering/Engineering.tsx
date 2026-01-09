import * as React from "react";

const Engineering: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Engineering Hub
          </h1>
          <p className="text-slate-600 mt-1">
            Resources and updates for the Global Engineering Team.
          </p>
        </div>

        {/* MAIN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT – ACTIVE PROJECTS */}
          <div className="flex-[3] bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-indigo-600 mb-6 flex items-center gap-2">
              🚀 Active Projects
            </h2>

            {/* PROJECT 1 */}
            <div className="rounded-2xl border border-indigo-100 p-5 mb-5">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">
                  Project Phoenix (v3.0)
                </h3>
                <span className="px-3 py-1 text-xs rounded-full bg-sky-100 text-sky-600 font-medium">
                  On Track
                </span>
              </div>

              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              </div>

              <p className="text-sm text-slate-500 mt-3">
                Refactoring core infrastructure for better scalability.
              </p>
            </div>

            {/* PROJECT 2 */}
            <div className="rounded-2xl border border-orange-100 p-5">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">
                  Nebula Cloud Migration
                </h3>
                <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-medium">
                  Delayed
                </span>
              </div>

              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full w-[35%] bg-orange-400"></div>
              </div>

              <p className="text-sm text-slate-500 mt-3">
                Moving legacy database clusters to AWS Frankfurt.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-[2] flex flex-col gap-6">

            {/* SECURITY ALERTS */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-xl text-white">
              <h2 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                🛡️ Security Alerts
              </h2>

              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span>🎉</span>
                  <span>Rotate all VPN credentials by Friday.</span>
                </li>
                <li className="flex gap-3">
                  <span>✅</span>
                  <span>Firewall patching complete for Noida HQ.</span>
                </li>
              </ul>
            </div>

            {/* QUICK LINKS */}
            <div className="rounded-3xl bg-white shadow-xl p-6">
              <h2 className="text-lg font-semibold text-indigo-600 mb-4 flex items-center gap-2">
                🔗 Quick Links
              </h2>

              <div className="space-y-3">
                {[
                  "GitHub Org",
                  "Jira Dashboard",
                  "Confluence Space",
                  "AWS Console",
                ].map((link) => (
                  <button
                    key={link}
                    className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 transition text-sm font-medium"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Engineering;
