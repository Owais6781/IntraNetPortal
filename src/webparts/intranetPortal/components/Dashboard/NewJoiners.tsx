
import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import { WebPartContext } from "@microsoft/sp-webpart-base";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

interface Props {
  sp: SPFI;
  context: WebPartContext;
}

interface INewJoiner {
  Id: number;
  JoiningDate: string;
  Employee: {
    Title: string;
    EMail: string;
  };
  photoUrl?: string;
  jobTitle?: string;
}

const NewJoiners: React.FC<Props> = ({ sp }) => {
  const [joiners, setJoiners] = useState<INewJoiner[]>([]);

  const loadJoiners = async () => {
    const items = await sp.web.lists
      .getByTitle("NewJoiners")
      .items.select(
        "Id",
        "JoiningDate",
        "Employee/Title",
        "Employee/EMail"
      )
      .expand("Employee")
      .orderBy("JoiningDate", false)();

    const enriched = items.map((item: any) => ({
      ...item,
      photoUrl: `/_layouts/15/userphoto.aspx?size=M&accountname=${item.Employee.EMail}`,
      jobTitle: "Employee"
    }));

    setJoiners(enriched);
  };

  useEffect(() => {
    void loadJoiners();
  }, []);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl">
      <h3 className="text-lg font-bold mb-5">👋 New Joiners</h3>

      {/* ✅ ONLY THIS PART MATTERS */}
      <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
        {joiners.map((item) => (
          <div
            key={item.Id}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50"
          >
            <img
              src={item.photoUrl}
              className="h-12 w-12 rounded-full border"
            />

            <div className="flex-1">
              <p className="font-semibold">
                {item.Employee.Title}
              </p>

              <p className="text-sm text-slate-500">
                {item.jobTitle}
              </p>

              <p className="text-xs text-slate-400">
                Joined{" "}
                {new Date(
                  item.JoiningDate
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewJoiners;

