import { WebPartContext } from "@microsoft/sp-webpart-base";
import { GraphFI } from "@pnp/graph";
import { SPFI } from "@pnp/sp";

export interface IIntranetPortalProps {
    sp: SPFI;
    context: WebPartContext;
    graph: GraphFI;

}




// import * as React from "react";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/files";
// import {
//   Folder,
//   FileText,
//   FileSignature,
//   File,
//   ExternalLink,
//   Download,
//   FileImage,
// } from "lucide-react";

// interface DocFile {
//   id?: number;
//   name: string;
//   fileUrl: string;
//   documentCategory: string[]; // ✅ multiple choice values
//   status?: "Active" | "Inactive";
// }

// const Knowledge: React.FC<IIntranetPortalProps> = ({ sp }) => {
//   const [knowledge, setKnowledge] = React.useState<DocFile[]>([]);
//   const [loading, setLoading] = React.useState(true);

//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);
//       const items = await sp.web.lists
//         .getByTitle("KnowledgeBase")
//         .items.select(
//           "Id",
//           "FileLeafRef",
//           "FileRef",
//           "DocumentCategory",
//           "Status"
//         )();

//       const mapped: DocFile[] = items.map((i: any) => ({
//         id: i.Id,
//         name: i.FileLeafRef,
//         fileUrl: i.FileRef,
//         documentCategory: Array.isArray(i.DocumentCategory)
//           ? i.DocumentCategory
//           : i.DocumentCategory
//           ? [i.DocumentCategory]
//           : [], // ✅ normalize to array
//         status: i.Status,
//       }));

//       setKnowledge(mapped.filter((d) => d.status === "Active"));
//     } catch (err) {
//       console.error("Error fetching documents:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   React.useEffect(() => {
//     void fetchDocuments();
//   }, [sp]);

//   // ✅ Build groups dynamically from all categories
//   const groupedDocs: Record<string, DocFile[]> = {};
//   knowledge.forEach((doc) => {
//     doc.documentCategory.forEach((cat) => {
//       if (!groupedDocs[cat]) {
//         groupedDocs[cat] = [];
//       }
//       groupedDocs[cat].push(doc);
//     });
//   });

//   const getFileIcon = (fileName?: string) => {
//     const ext = fileName?.split(".").pop()?.toLowerCase();
//     switch (ext) {
//       case "pdf":
//         return <FileText size={18} className="text-red-500" />;
//       case "doc":
//       case "docx":
//         return <FileText size={18} className="text-blue-500" />;
//       case "ppt":
//       case "pptx":
//         return <FileSignature size={18} className="text-orange-500" />;
//       case "jpg":
//       case "jpeg":
//       case "png":
//         return <FileImage size={18} className="text-purple-500" />;
//       default:
//         return <File size={18} className="text-gray-500" />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-zinc-50 to-emerald-50 px-4 py-10">
//       {/* Header */}
//       <div className="max-w-7xl mx-auto mb-10">
//         <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 mb-2">
//           Knowledge Base
//         </h1>
//         <p className="text-zinc-600">
//           Centralized access to corporate, technical, and HR documents.
//         </p>
//       </div>

//       {/* Content */}
//       <div className="max-w-7xl mx-auto bg-white/80 border border-zinc-200 rounded-2xl shadow-sm p-6">
//         {Object.entries(groupedDocs).map(([category, docs]) => (
//           <div key={category} className="mb-10 last:mb-0">
//             {/* Category Header */}
//             <div className="flex items-center gap-3 mb-4">
//               <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
//                 <Folder size={20} />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-zinc-900">
//                   {category}
//                 </h3>
//                 <p className="text-xs text-zinc-500">
//                   {docs.length} document{docs.length !== 1 && "s"}
//                 </p>
//               </div>
//             </div>

//             {/* Loading */}
//             {loading && (
//               <p className="text-sm text-zinc-500">Loading documents...</p>
//             )}

//             {/* Empty */}
//             {!loading && docs.length === 0 && (
//               <p className="text-sm text-zinc-500">No documents available.</p>
//             )}

//             {/* Document List */}
//             {!loading && docs.length > 0 && (
//               <ul className="flex flex-col gap-3">
//                 {docs.map((item) => (
//                   <li
//                     key={item.id}
//                     className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition group"
//                   >
//                     <div className="flex items-center gap-3 min-w-0">
//                       {getFileIcon(item.name)}
//                       <a
//                         href={item.fileUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="truncate text-sm font-medium text-zinc-700 hover:text-emerald-700"
//                         title={item.name}
//                       >
//                         {item.name}
//                       </a>
//                     </div>

//                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
//                       <a
//                         href={item.fileUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600"
//                         title="Open"
//                       >
//                         <ExternalLink size={16} />
//                       </a>
//                       <a
//                         href={item.fileUrl}
//                         download
//                         className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600"
//                         title="Download"
//                       >
//                         <Download size={16} />
//                       </a>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Knowledge;
