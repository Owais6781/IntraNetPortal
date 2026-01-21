// import * as React from "react";
// import { useEffect, useState } from "react";
// import { SPFI } from "@pnp/sp";
// import { MSGraphClientV3 } from "@microsoft/sp-http";

// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";

// interface Props {
//   sp: SPFI;
//   context: any;
// }

// interface INewJoiner {
//   Id: number;
//   JoiningDate: string;
//   Employee: {
//     Title: string;
//     EMail: string;
//   };
//   photoUrl?: string;
//   jobTitle?: string;
// }

// const NewJoiners: React.FC<Props> = ({ sp, context }) => {
//   const [joiners, setJoiners] = useState<INewJoiner[]>([]);

//   const loadJoiners = async () => {
//     try {
//       const items = await sp.web.lists
//         .getByTitle("NewJoiners")
//         .items.select(
//           "Id",
//           "JoiningDate",
//           "Employee/Title",
//           "Employee/EMail"
//         )
//         .expand("Employee")
//         .filter("Status eq 'Active'")
//         .orderBy("JoiningDate", false)
//         .top(5)();

//       const graphClient: MSGraphClientV3 =
//         await context.msGraphClientFactory.getClient("3");

//       const enriched = await Promise.all(
//         items.map(async (item: any) => {
//           let jobTitle = "";
//           let photoUrl = "";

//           try {
//             const user = await graphClient
//               .api(`/users/${item.Employee.EMail}`)
//               .select("jobTitle")
//               .get();

//             jobTitle = user.jobTitle;
//           } catch (e) {
//             console.log("Graph user not found");
//           }

//           photoUrl = `/_layouts/15/userphoto.aspx?size=M&accountname=${item.Employee.EMail}`;

//           return {
//             ...item,
//             jobTitle,
//             photoUrl
//           };
//         })
//       );

//       setJoiners(enriched);
//     } catch (error) {
//       console.error("New Joiners error:", error);
//     }
//   };

//   useEffect(() => {
//     void loadJoiners();
//   }, []);

//   return (
//     <div className="rounded-3xl bg-white p-6 shadow-xl">
//       <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
//         👋 New Joiners
//       </h3>

//       <div className="space-y-4">
//         {joiners.map((item) => (
//           <div
//             key={item.Id}
//             className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50"
//           >
//             <img
//               src={
//                 item.photoUrl ||
//                 "https://static.thenounproject.com/png/403588-200.png"
//               }
//               className="h-12 w-12 rounded-full border"
//             />

//             <div className="flex-1">
//               <p className="font-semibold">
//                 {item.Employee.Title}
//               </p>

//               <p className="text-sm text-slate-500">
//                 {item.jobTitle}
//               </p>

//               <p className="text-xs text-slate-400">
//                 Joined on{" "}
//                 {new Date(
//                   item.JoiningDate
//                 ).toLocaleDateString()}
//               </p>
//             </div>

//             <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full">
//               New
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default NewJoiners;


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

