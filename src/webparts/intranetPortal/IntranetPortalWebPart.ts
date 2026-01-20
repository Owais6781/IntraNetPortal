

import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import { graphfi, GraphFI } from "@pnp/graph";


import "../../tailwind-generated.css";
import "./Hide.scss";
import Routing from "./components/Routing";

export default class MaintenanceRequestWebPart extends BaseClientSideWebPart<{}> {

  private sp!: SPFI;
  private graph!: GraphFI;

  protected onInit(): Promise<void> {
    this.sp = spfi().using(SPFx(this.context));
    this.graph = graphfi().using(SPFx(this.context));
    
    return Promise.resolve();
  }

  public render(): void {
    const element = React.createElement(Routing, {
      sp: this.sp,
      graph: this.graph,
      context:this.context

    });

    ReactDom.render(element, this.domElement);
  }
}
