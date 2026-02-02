

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
import { WebPartContext } from "@microsoft/sp-webpart-base";
import InternalTools from "./../InternalTools/InternalTools";

interface DashboardProps {
  sp: SPFI;
  graph: GraphFI;
  context: WebPartContext
}

const Dashboard: React.FC<DashboardProps> = ({ sp, graph, context }) => {
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
      <div className="max-w-7xl mx-auto w-full mt-6">
        <InternalTools />
      </div>

      {/* ================= BOTTOM SECTION ================= */}
      <div className="relative max-w-7xl mx-auto mt-10 flex flex-col lg:flex-row gap-6">
        {/* LEFT */}

        <div className="flex-[3] flex flex-col gap-6">
          <PersonalQuickAccess />
          <LatestCompanyNews sp={sp} />
          <GlobalCompanyEvents sp={sp} />
        </div>

        {/* RIGHT */}
        <div className="flex-[1] flex flex-col gap-6">
          <EmployeeOfTheMonth />
          <NewJoiners context={context} sp={sp} />
          <HRPolicies sp={sp} />
          <NewOpenings sp={sp} />

        </div>
      </div>
    </div>
  );
};

export default Dashboard;



