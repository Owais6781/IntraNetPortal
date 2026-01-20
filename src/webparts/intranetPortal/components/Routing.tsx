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
import { WebPartContext } from "@microsoft/sp-webpart-base";





interface RoutingIPROPS{
    sp: SPFI;
    graph: GraphFI;
    context: WebPartContext;
}


const Routing: React.FC <RoutingIPROPS>= ({sp , graph, context   }) => {
  return (
   <HashRouter>
  <Routes>
    <Route path="/" element={<Layouts sp={sp} graph={graph} />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard  sp={sp} graph={graph} />} />
      <Route path="organization" element={<Organization />} />
      <Route path="news" element={<News sp={sp} />} />
      <Route path="knowledge" element={<Knowledge sp={sp}  context={context} />} />
      <Route path="directory" element={<Directory  sp={sp}/>} />
      <Route path="workplace" element={<WorkPlace sp={sp} />} />
      <Route path="it-support" element={<ITSupport  sp={sp} context={context}  />} />
      <Route path="engineering" element={<Engineering  sp={sp}/>} />
     

    </Route>
  </Routes>
</HashRouter>
  );
};

export default Routing;



