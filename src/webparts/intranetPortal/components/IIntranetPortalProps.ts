import { WebPartContext } from "@microsoft/sp-webpart-base";
import { GraphFI } from "@pnp/graph";
import { SPFI } from "@pnp/sp";

export interface IIntranetPortalProps {
    sp: SPFI;
    context: WebPartContext;
    graph: GraphFI;

}

