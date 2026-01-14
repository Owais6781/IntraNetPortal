import * as React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layouts from "./Layouts/Layouts";
import Dashboard from "./Dashboard/Dashboard";
import Knowledge from "./Knowledge/Knowledge";
import Directory from "./Directory/Directory";
import ITSupport from "./IT Support/ITSupport";
import Engineering from "./Engineering/Engineering";
import Organization from "./Organization/Organization";
import News from "./News/News";
import WorkPlace from "./Workplace/Workplace";
import { SPFI } from "@pnp/sp";
import { GraphFI } from "@pnp/graph";



interface RoutingIPROPS{
    sp: SPFI;
      graph: GraphFI;
}


const Routing: React.FC <RoutingIPROPS>= ({sp , graph }) => {
  return (
   <HashRouter>
  <Routes>
    <Route path="/" element={<Layouts sp={sp} graph={graph} />}>
    
      <Route index element={<Navigate to="/dashboard" replace />} />

      <Route path="dashboard" element={<Dashboard />} />
      <Route path="organization" element={<Organization sp={sp}/>} />
      <Route path="news" element={<News />} />
      <Route path="knowledge" element={<Knowledge />} />
      <Route path="directory" element={<Directory />} />
      <Route path="workplace" element={<WorkPlace />} />
      <Route path="it-support" element={<ITSupport />} />
      <Route path="engineering" element={<Engineering />} />
    </Route>
  </Routes>
</HashRouter>
  );
};

export default Routing;
