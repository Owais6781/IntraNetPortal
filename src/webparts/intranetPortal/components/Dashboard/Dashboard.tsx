

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-100/50 p-6">


      <HeroSection userName={userName} loading={loading} />

      {/* ================= BOTTOM SECTION ================= */}
      <div className="relative max-w-7xl mx-auto mt-10 flex flex-col lg:flex-row gap-6">
        {/* LEFT */}
        <div className="flex-[3] flex flex-col gap-6">
          <PersonalQuickAccess />
          <LatestCompanyNews sp={sp} />
          <GlobalCompanyEvents />
        </div>

        {/* RIGHT */}
        <div className="flex-[1] flex flex-col gap-6">
          <EmployeeOfTheMonth />
          <NewJoiners />
          <HRPolicies />
          <NewOpenings />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;



