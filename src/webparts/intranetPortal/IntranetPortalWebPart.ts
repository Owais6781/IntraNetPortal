// // import * as React from 'react';
// // import * as ReactDom from 'react-dom';
// // import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
// // import "./Hide.scss"
// // import Routing from './components/Routing';
// // import '../../tailwind-generated.css'

// // export default class IntranetPortalWebPart extends BaseClientSideWebPart<{}> {


// //   public render(): void {
// //     const element= React.createElement(
// //      Routing
      
// //     );

// //     ReactDom.render(element, this.domElement);
// //   }
// // }






// import * as React from 'react';
// import * as ReactDom from 'react-dom';
// import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
// import '../../tailwind-generated.css'
// import "./Hide.scss"
// import { spfi, SPFx } from '@pnp/sp'; 
// import Routing from './components/Routing';
// export default class MaintenanceRequestWebPart extends BaseClientSideWebPart<{}> {

//     private sp: any;
  
//     protected onInit(): Promise<void> {
//       this.sp = spfi().using(SPFx(this.context));  
//       return Promise.resolve();
//     }

//   public render(): void {
//     const element = React.createElement(
//          Routing,{
//          sp: this.sp,
//         // context: this.context 
//       }
      
//     );

//     ReactDom.render(element, this.domElement);
//   }


// }


import * as React from "react";
import * as ReactDom from "react-dom";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { spfi, SPFx, SPFI } from "@pnp/sp";
import { graphfi, GraphFI } from "@pnp/graph";

import Routing from "./components/Routing";
import "../../tailwind-generated.css";
import "./Hide.scss";

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
