import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface IJobItem {
  Id: number;
  Title: string;
  Location: string;
  JobType: string;
  WorkMode: string;
  Status: boolean;
  ApplyLink?: {
    Url: string;
    Description: string;
  };
}

interface Props {
  sp: SPFI;
}

const NewOpenings: React.FC<Props> = ({ sp }) => {
  const [jobs, setJobs] = useState<IJobItem[]>([]);
  const [showAll, setShowAll] = useState(false);

  const loadJobs = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle("JobOpenings")
        .items.select(
          "Id",
          "Title",
          "Location",
          "JobType",
          "WorkMode",
          "Status",
          "ApplyLink"
        )
        .filter("Status eq 1")
        .orderBy("Created", false)();

      setJobs(items);
    } catch (error) {
      console.error("Job loading error:", error);
    }
  };

  useEffect(() => {
    void loadJobs();
  }, []);

  return (
    <>
      {/* ================= CARD ================= */}
      <div className="group rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-xl p-6 text-white overflow-hidden relative">

        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm">
              💼
            </span>
            New Openings
          </h3>

          {/* SHOW ONLY 2 JOBS */}
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {jobs.slice(0, 2).map((job) => (
              <div
                key={job.Id}
                className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
              >
                <p className="font-bold">{job.Title}</p>
                <p className="text-sm text-white/70 mt-1">
                  📍 {job.Location}
                </p>

                <div className="mt-3 flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-white/20">
                    {job.JobType}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-white/20">
                    {job.WorkMode}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-4 py-3 rounded-full bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition"
          >
            View All Jobs →
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showAll && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">

          <div className="bg-white rounded-3xl w-[90%] max-w-3xl p-6 shadow-2xl relative">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                💼 All Job Openings
              </h2>

              <button
                onClick={() => setShowAll(false)}
                className="text-xl text-slate-500 hover:text-red-500"
              >
                ✕
              </button>
            </div>

            {/* JOB LIST */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">

              {jobs.map((job) => (
                <div
                  key={job.Id}
                  className="p-4 rounded-xl border hover:shadow-md transition"
                >
                  <p className="font-semibold text-slate-800">
                    {job.Title}
                  </p>

                  <p className="text-sm text-slate-500">
                    📍 {job.Location}
                  </p>

                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                      {job.JobType}
                    </span>

                    <span className="px-2 py-1 bg-violet-100 text-violet-600 rounded-full">
                      {job.WorkMode}
                    </span>
                  </div>

                  {job.ApplyLink?.Url && (
                    <a
                      href={job.ApplyLink.Url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 text-sm text-indigo-600 hover:underline"
                    >
                      Apply Now →
                    </a>
                  )}
                </div>
              ))}

              {jobs.length === 0 && (
                <p className="text-center text-slate-400">
                  No job openings available
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewOpenings;
