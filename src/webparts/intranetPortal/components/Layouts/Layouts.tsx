import * as React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { SPFI } from "@pnp/sp";
import { GraphFI } from "@pnp/graph";

interface ILayoutsProps {
  sp: SPFI
   graph: GraphFI
}

const Layouts: React.FC<ILayoutsProps>= ({sp, graph}) => {
  return (
    <div className="min-h-screen flex flex-col ">
      <Header sp={sp} graph={graph} />

  
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layouts;
