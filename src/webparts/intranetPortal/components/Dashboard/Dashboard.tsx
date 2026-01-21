
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
<<<<<<< Updated upstream
import { WebPartContext } from "@microsoft/sp-webpart-base";

interface DashboardProps {
  sp: SPFI;
  graph:GraphFI;
  context:WebPartContext
}

const Dashboard: React.FC<DashboardProps> = ({ sp,graph, context  }) => {
=======

interface DashboardProps {
  sp: SPFI;
  graph: GraphFI;
}

const Dashboard: React.FC<DashboardProps> = ({ sp, graph }) => {
>>>>>>> Stashed changes
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
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-primary-50/20 to-primary-100/20 p-6">


      <HeroSection userName={userName} loading={loading} />

      {/* ================= BOTTOM SECTION ================= */}
      <div className="relative max-w-7xl mx-auto mt-10 flex flex-col lg:flex-row gap-6">
        {/* LEFT */}
        <div className="flex-[3] flex flex-col gap-6">
          <PersonalQuickAccess />
<<<<<<< Updated upstream
          <LatestCompanyNews sp={sp} />
          <GlobalCompanyEvents sp={sp} />
=======
          <LatestCompanyNews />
          <GlobalCompanyEvents />
>>>>>>> Stashed changes
        </div>

        {/* RIGHT */}
        <div className="flex-[1] flex flex-col gap-6">
          <EmployeeOfTheMonth />
<<<<<<< Updated upstream
          <NewJoiners context={context}  sp={sp}   />
          <HRPolicies sp={sp} />
          <NewOpenings sp={sp}  />
          
=======
          <NewJoiners />
          <HRPolicies />
          <NewOpenings />
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
};

export default Dashboard;