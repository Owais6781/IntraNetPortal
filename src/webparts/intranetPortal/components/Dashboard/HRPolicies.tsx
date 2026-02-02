

import * as React from "react";
import { SPFI } from "@pnp/sp";

import "@pnp/sp/lists";
import "@pnp/sp/items";

interface IPolicyItem {
  Id: number;
  Title: string;
  FileRef: string;
  FileLeafRef: string;
  Modified: string;
  Status: string;
}

interface IProps {
  sp: SPFI;
}

const HRPolicies: React.FC<IProps> = ({ sp }) => {
  const [policies, setPolicies] = React.useState<IPolicyItem[]>([]);

  /* ================= LOAD POLICIES ================= */

  const loadPolicies = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle("OrganizationPolicies")
        .items.select(
          "Id",
          "Title",
          "FileRef",
          "FileLeafRef",
          "Modified",
          "Status"
        )
        .filter("Status eq 'Active'")
        .orderBy("Modified", false)();

      setPolicies(items);
    } catch (error) {
      console.error("Error loading policies", error);
    }
  };

  React.useEffect(() => {
    void loadPolicies();
  }, []);

  /* ================= OPEN PDF ================= */

  const openPdf = (url: string) => {
    window.open(url, "_blank");
  };

  /* ================= UI ================= */

  return (
    <div className="group rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl p-6">
      {/* HEADER */}
      <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white">
          📋
        </span>
        HR Policies
      </h3>

      {/* POLICIES LIST (SCROLL) */}
      <div
        className="space-y-3 overflow-y-auto pr-1"
        style={{ maxHeight: "180px" }} // 👈 height for 2 cards
      >
        {policies.map((item) => (
          <div
            key={item.Id}
            onClick={() => openPdf(item.FileRef)}
            className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100
                       hover:border-indigo-200 hover:bg-indigo-50/50
                       transition-all cursor-pointer group/item"
          >
            {/* ICON */}
            <span className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">
              📄
            </span>

            {/* CONTENT */}
            <div className="flex-1">
              <p className="font-medium text-slate-700 group-hover/item:text-indigo-600">
                {item.Title || item.FileLeafRef}
              </p>

              <p className="text-xs text-slate-400">
                Updated {new Date(item.Modified).toDateString()}
              </p>
            </div>

            {/* ARROW */}
            <span className="text-indigo-500 opacity-0 group-hover/item:opacity-100 transition">
              →
            </span>
          </div>
        ))}

        {/* EMPTY STATE */}
        {policies.length === 0 && (
          <p className="text-sm text-slate-400 text-center">
            No active policies available
          </p>
        )}
      </div>
    </div>
  );
};

export default HRPolicies;

