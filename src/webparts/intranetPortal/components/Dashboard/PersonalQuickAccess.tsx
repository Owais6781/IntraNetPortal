import * as React from "react";
import { Link } from "react-router-dom";

const PersonalQuickAccess: React.FC = () => {
  return (
    <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-primary-200/50 p-6">
      <div className="flex flex-col xl:flex-row gap-4">

        {/* Personal Overview */}
        <div className="flex-1 rounded-2xl bg-white shadow-md border border-surface-100 px-6 py-5">
          <h3 className="text-base sm:text-lg font-bold text-primary-700 mb-4">
            Personal Overview
          </h3>

          <div className="flex items-end gap-10">
            <div>
              <p className="text-3xl font-extrabold text-primary-600">12</p>
              <p className="text-xs sm:text-sm text-surface-500 mt-1">
                Tasks Assigned
              </p>
            </div>

            <div>
              <p className="text-3xl font-extrabold text-emerald-600">4</p>
              <p className="text-xs sm:text-sm text-surface-500 mt-1">
                Completed
              </p>
            </div>
          </div>
        </div>

        {/* Quick Workplace Access */}
        <div className="flex-1 rounded-2xl bg-white shadow-md border border-surface-100 px-6 py-5">
          <h3 className="text-base sm:text-lg font-bold text-primary-700 mb-4">
            Quick Workplace Access
          </h3>

          <div className="flex flex-wrap gap-3">
            <Link to="/workplace">
              <button className="px-4 py-2 rounded-full bg-surface-50 border border-surface-200 text-sm font-medium hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors">
                🌴 Apply Leave
              </button>
            </Link>
<<<<<<< Updated upstream
            <Link to ="/it-support">
            <button className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors">
=======
            <button className="px-4 py-2 rounded-full bg-surface-50 border border-surface-200 text-sm font-medium hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors">
>>>>>>> Stashed changes
              💻 IT Support
            </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalQuickAccess;
