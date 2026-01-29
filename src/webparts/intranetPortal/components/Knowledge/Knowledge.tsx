

// import * as React from "react";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/folders";
// import "@pnp/sp/files";
// import "@pnp/sp/site-users/web";
// import {
//   Folder,
//   FileText,
//   FileSignature,
//   File,
//   Download,
//   ExternalLink,
//   FileImage,
// } from "lucide-react";

// interface DocFile {
//   id?: number;
//   name: string;
//   fileUrl: string;
//   documentType: "Corporate" | "Technical" | "HR Policies";
//   status?: string;
// }

// const Knowledge: React.FC<IIntranetPortalProps> = ({ sp, }) => {
//   const [knowledge, setKnowledge] = React.useState<DocFile[]>([]);
//   const [loading, setLoading] = React.useState(true);


//   const fetchDocuments = async () => {
//     try {
//       setLoading(true)
//       const item = await sp.web.lists.getByTitle("KnowledgeBase")
//         .items.select(
//           "Id",
//           "FileLeafRef",
//           "FileRef",
//           "DocumentType",
//           "Status"
//         )()

//       const mapped:DocFile[] = item.map((i: any) => ({
//         id: i.Id,
//         name: i.FileLeafRef,
//         fileUrl: i.FileRef,
//         documentType: i.DocumentType,
//         status: i.Status,
//       }));

//       setKnowledge(mapped)
//     } catch (error) {
//       console.log(error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   React.useEffect(() => {

//     void fetchDocuments();
//   }, [sp]);


//   const corporateDocs = knowledge.filter(
//     (d) => d.documentType === "Corporate"
//   );



//   const TechnicalDoc = knowledge.filter(
//     (d) => d.documentType === "Technical"
//   );



//   const HR = knowledge.filter(
//     (d) => d.documentType === "HR Policies"
//   );

//   const getFileIcon = (fileType?: string) => {
//     const type = fileType?.toLowerCase();
//     switch (type) {
//       case 'pdf':
//         return <FileText className="text-red-500" size={18} />;
//       case 'doc':
//       case 'docx':
//         return <FileText className="text-blue-500" size={18} />;
//       case 'ppt':
//       case 'pptx':
//         return <FileSignature className="text-orange-500" size={18} />;
//       // case 'xls':
//       // case 'xlsx':
//       //     return <FileSpreadsheet className="text-green-500" size={18} />;

//       case 'jpg':
//       case 'jpeg':
//       case 'png':
//       case 'gif':
//         return <FileImage className="text-purple-500" size={18} />;
//       // case 'mp4':
//       // case 'avi':
//       // case 'mov':
//       //     return <FileVideo className="text-pink-500" size={18} />;
//       // case 'zip':
//       // case 'rar':
//       //     return <FileArchive className="text-yellow-600" size={18} />;
//       default:
//         return <File className="text-gray-500" size={18} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-10">


//       <div className="max-w-7xl mx-auto mb-10">
//         <h1 className="text-4xl font-bold text-gray-900 mb-2">
//           Knowledge Base
//         </h1>
//         <p className="text-gray-600 text-lg">
//           Access centralized documentation, templates, and technical guides.
//         </p>
//       </div>

    
//       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

      
//         <div className="w-full lg:w-1/3">
//           <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
//             <div className="flex flex-row items-center gap-3 mb-6 text-indigo-500 font-semibold text-lg">
//               <Folder size={22} />
//               <span>Corporate Policies</span>
//             </div>

//             {loading && (
//               <div className="flex flex-col items-center justify-center py-8">
//                 <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
//                 <p className="text-gray-500">Loading documents...</p>
//               </div>
//             )}

//             {!loading && corporateDocs.length === 0 && (
//               <div className="flex flex-col items-center justify-center py-8">
//                 <Folder size={48} className="text-gray-300 mb-3" />
//                 <p className="text-gray-500">No documents found.</p>
//               </div>
//             )}

//             {!loading && corporateDocs.length > 0 && (
//               <ul className="flex flex-col gap-3">
//                 {corporateDocs.map((item) => (
//                   <li
//                     key={item.id}
//                     className="flex flex-row items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-all duration-200 group"
//                   >
//                     <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
//                       {getFileIcon(item.name)}
//                       <a
//                         href={item.fileUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-gray-700 hover:text-indigo-600 truncate font-medium"
//                         title={item.name}
//                       >
//                         {item.name}
//                       </a>
//                     </div>
//                     <div className="flex flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <a
//                         href={item.fileUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500"
//                         title="Open"
//                       >
//                         <ExternalLink size={16} />
//                       </a>
//                       <a
//                         href={item.fileUrl}
//                         download
//                         className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500"
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
//         </div>

      
//         <div className="w-full lg:w-1/3">
//           <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
//             <div className="flex flex-row items-center gap-3 mb-6 text-indigo-500 font-semibold text-lg">
//               <Folder size={22} />
//               <span>Technical Docs</span>
//             </div>


//             {!loading && TechnicalDoc.length === 0 && (
//               <div className="flex flex-col items-center justify-center py-8">
//                 <Folder size={48} className="text-gray-300 mb-3" />
//                 <p className="text-gray-500">No documents found.</p>
//               </div>
//             )}

//             {!loading && TechnicalDoc.length > 0 && (
//               <ul className="flex flex-col gap-3">
//                 {TechnicalDoc.map((item, index) => (
//                   <li
//                     key={index}
//                     className="flex flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-all duration-200 group"
//                   >

//                     <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
//                       {getFileIcon(item.name)}
//                       <a
//                         href={item.fileUrl}
//                         className="text-gray-700 hover:text-indigo-600 truncate font-medium"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         title={item.name}>
//                         {item.name}
//                       </a>
//                     </div>



//                     <div className="flex flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <a
//                         href={item.fileUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500"
//                         title="Open"
//                       >
//                         <ExternalLink size={16} />
//                       </a>
//                       <a
//                         href={item.fileUrl}
//                         download
//                         className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500"
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
//         </div>

        
//         <div className="w-full lg:w-1/3">
//           <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
//             <div className="flex flex-row items-center gap-3 mb-6 text-indigo-500 font-semibold text-lg">
//               <Folder size={22} />
//               <span>HR Templates</span>
//             </div>
//             {!loading && HR.length === 0 && (
//               <div className="flex flex-col items-center justify-center py-8">
//                 <Folder size={48} className="text-gray-300 mb-3" />
//                 <p className="text-gray-500">No documents found.</p>
//               </div>
//             )}


//             {!loading && HR.length > 0 && (
//               <ul className="flex flex-col gap-3">
//                 {HR.map((item, index) => (
//                   <li
//                     key={index}
//                     className="flex flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-all duration-200 group"
//                   >

//                     <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
//                       {getFileIcon(item.name)}
//                       <a
//                         href={item.fileUrl}
//                         className="text-gray-700 hover:text-indigo-600 truncate font-medium"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         title={item.name}>
//                         {item.name}
//                       </a>
//                     </div>



//                     <div className="flex flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <a
//                         href={item.fileUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500"
//                         title="Open"
//                       >
//                         <ExternalLink size={16} />
//                       </a>
//                       <a
//                         href={item.fileUrl}
//                         download
//                         className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-500"
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
//         </div>

//       </div>
//     </div>
//   );
// };

// export default Knowledge;


// 
// import * as React from "react";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/folders";
// import "@pnp/sp/files";
// import "@pnp/sp/site-users/web";
// import {
//   Folder,
//   FileText,
//   FileSignature,
//   File,
//   Download,
//   ExternalLink,
//   FileImage,
// } from "lucide-react";

// interface DocFile {
//   id?: number;
//   name: string;
//   fileUrl: string;
//   documentCategory: "Corporate Policies" | "Technical Document" | "HR Templates";
//   status?: "Active" | "Inactive";
// }

// const Knowledge: React.FC<IIntranetPortalProps> = ({ sp }) => {
//   const [knowledge, setKnowledge] = React.useState<DocFile[]>([]);
//   const [corporete,setCorporete]=React.useState(false)
//   const [technicaldata,setTechnicalData]=React.useState(false)
//   const [hrdata,setHrData]=React.useState(false)
//   const [loading, setLoading] = React.useState(true);

//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);
//       const item = await sp.web.lists
//         .getByTitle("KnowledgeBase")
//         .items.select("Id", "FileLeafRef", "FileRef", "DocumentCategory", "Status")();

//       const mapped: DocFile[] = item.map((i: any) => ({
//         id: i.Id,
//         name: i.FileLeafRef,
//         fileUrl: i.FileRef,
//         documentCategory: i.DocumentCategory,
//          status: i.Status
        
//       }));

//       setKnowledge(mapped);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   React.useEffect(() => {
//     void fetchDocuments();
//   }, [sp]);

//   const corporateDocs = knowledge.filter((d) => d.documentCategory === "Corporate Policies" && d.status==="Active");
//   const TechnicalDoc = knowledge.filter((d) => d.documentCategory === "Technical Document" && d.status==="Active");
//   const HR = knowledge.filter((d) => d.documentCategory === "HR Templates" && d.status==="Active");

//   const getFileIcon = (fileType?: string) => {
//     const type = fileType?.toLowerCase();
//     switch (type) {
//       case "pdf":
//         return <FileText className="text-red-500" size={18} />;
//       case "doc":
//       case "docx":
//         return <FileText className="text-blue-500" size={18} />;
//       case "ppt":
//       case "pptx":
//         return <FileSignature className="text-orange-500" size={18} />;
//       case "jpg":
//       case "jpeg":
//       case "png":
//       case "gif":
//         return <FileImage className="text-purple-500" size={18} />;
//       default:
//         return <File className="text-gray-500" size={18} />;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-zinc-50 to-emerald-50 px-4 py-10">
//       {/* Header */}
//       <div className="max-w-7xl mx-auto mb-10">
//         {/* <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase mb-2">
//           Knowledge Center
//         </p> */}
//         <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight mb-2">
//               Knowledge Base
//             </h1>
//             <p className="text-sm md:text-base text-zinc-600 whitespace-nowrap overflow-hidden text-ellipsis">
//               Access centralized documentation, templates, and technical guides for your organization.
//             </p>

//           </div>
// {/* 
//           <div className="flex flex-row gap-3 text-xs md:text-sm">
//             <div className="rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 shadow-sm flex flex-col justify-center">
//               <span className="text-zinc-500">Total documents</span>
//               <span className="mt-1 text-lg font-semibold text-zinc-900">
//                 {knowledge.length}
//               </span>
//             </div>
//           </div> */}


//         </div>
//       </div>

//       {/* Columns (flex row on large) */}
//       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
//         {/* Corporate Policies */}
//         <div className="w-full lg:w-1/3    ">
//           <div className="bg-white/80  border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 h-[400px] flex flex-col overflow-y-auto">
//             {/* Card header */}
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex flex-row items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
//                   <Folder size={20} />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-zinc-900">
//                     Corporate Policies
//                   </p>
//                   <p className="text-xs text-zinc-500">
//                     Official company standards and guidelines
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {loading && (
//               <div className="flex flex-col items-center justify-center py-8">
//                 <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-3">   </div>
//                 <p className="text-zinc-500 text-sm">Loading documents...</p>
             
//               </div>
//             )}

//             {!loading && corporateDocs.length === 0 && (
//               <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
//                 <Folder size={40} className="text-zinc-300 mb-3" />
//                 <p className="text-sm font-medium text-zinc-600">
//                   No documents found
//                 </p>
//                 <p className="text-xs text-zinc-500 mt-1">
//                   Corporate policies will appear here when added.
//                 </p>
//               </div>
//             )}

//             {!loading && corporateDocs.length > 0 && (
//               <>
//               <ul className="flex flex-col gap-3">
                
//                 {(corporete? corporateDocs:corporateDocs.slice(0,3)).map((item) => (
//                   <li
//                     key={item.id}
//                     className="flex flex-row items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all duration-200 group"
//                   >
//                     <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
//                       {getFileIcon(item.name)}
//                       <a
//                         href={item.fileUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-zinc-700 hover:text-emerald-700 truncate font-medium text-sm"
//                         title={item.name}
//                       >
//                         {item.name}
//                       </a>
//                     </div>
//                     <div className="flex flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <a
//                         href={item.fileUrl}
//                         // href={`${item.fileUrl}?web=1`}
//                         target="_blank"
//                        rel="noopener noreferrer"
//                         className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-200"
//                         title="Open"
//                       >
//                         <ExternalLink size={16} />
//                       </a>
//                       <a
//                         href={item.fileUrl}
//                         download
//                         className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-200"
//                         title="Download"
//                       >
//                         <Download size={16} />
//                       </a>
//                     </div>
//                   </li>
//                 ))}
                  // {corporateDocs.length > 3 && (
                  //   <div className="flex justify-center pt-4 flex-shrink-0">
                  //     <button
                  //       onClick={() => setCorporete(!corporete)}
                  //       className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
                  //     >
                  //       {corporete ? "Show Less" : "More"}
                  //     </button>
                  //   </div>
                  // )}


//                 </ul>
//                 </>
//             )}
//           </div>
//         </div>

//         {/* Technical Docs */}
//         <div className="w-full lg:w-1/3">
//           <div className="bg-white/80 border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 h-[400px] overflow-y-auto flex flex-col">
//             <div className="flex flex-row items-center justify-between mb-6">
//               <div className="flex flex-row items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
//                   <Folder size={20} />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-zinc-900">
//                     Technical Docs
//                   </p>
//                   <p className="text-xs text-zinc-500">
//                     Implementation, configuration & how‑tos
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {!loading && TechnicalDoc.length === 0 && (
//               <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
//                 <Folder size={40} className="text-zinc-300 mb-3" />
//                 <p className="text-sm font-medium text-zinc-600">
//                   No documents found
//                 </p>
//                 <p className="text-xs text-zinc-500 mt-1">
//                   Technical documentation will appear here when added.
//                 </p>
//               </div>
//             )}

//             {!loading && TechnicalDoc.length > 0 && (

//               <ul className="flex flex-col gap-3">
//                 <>
//                   {(technicaldata? TechnicalDoc : TechnicalDoc.slice(0, 3)).map((item, index) => (
//                     <li
//                       key={index}
//                       className="flex flex-row items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition-all duration-200 group"
//                     >
//                       <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
//                         {getFileIcon(item.name)}
//                         <a
//                           href={item.fileUrl}
//                           className="text-zinc-700 hover:text-teal-700 truncate font-medium text-sm"
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           title={item.name}
//                         >
//                           {item.name}
//                         </a>
//                       </div>

//                       <div className="flex flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                         <a
//                           href={item.fileUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 border border-transparent hover:border-teal-200"
//                           title="Open"
//                         >
//                           <ExternalLink size={16} />
//                         </a>
//                         <a
//                           href={item.fileUrl}
//                           download
//                           className="p-2 rounded-lg hover:bg-teal-50 text-teal-600 border border-transparent hover:border-teal-200"
//                           title="Download"
//                         >
//                           <Download size={16} />
//                         </a>
//                       </div>
//                     </li>
//                   ))}

//                   {TechnicalDoc.length > 3 && (
//                     <div className="flex justify-center pt-4 flex-shrink-0">
//                       <button
//                         onClick={() => setTechnicalData(!technicaldata)}
//                         className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
//                       >
//                         {technicaldata ? "Show Less" : "More"}
//                       </button>
//                     </div>
//                   )}
//                 </>
//               </ul>
//             )}
//           </div>
//         </div>

//         {/* HR Templates */}
//         <div className="w-full lg:w-1/3">
//           <div className="bg-white/80 border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 h-[400px] overflow-y-auto flex flex-col">
//             <div className="flex flex-row items-center justify-between mb-6">
//               <div className="flex flex-row items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
//                   <Folder size={20} />
//                 </div>
//                 <div>
//                   <p className="text-sm font-semibold text-zinc-900">
//                     HR Templates
//                   </p>
//                   <p className="text-xs text-zinc-500">
//                     Forms, letters, and HR policy documents
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {!loading && HR.length === 0 && (
//               <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
//                 <Folder size={40} className="text-zinc-300 mb-3" />
//                 <p className="text-sm font-medium text-zinc-600">
//                   No documents found
//                 </p>
//                 <p className="text-xs text-zinc-500 mt-1">
//                   HR templates will appear here when added.
//                 </p>
//               </div>
//             )}

//             {!loading && HR.length > 0 && (
//               <ul className="flex flex-col gap-3">
//                 <>
//                 {(hrdata? HR:HR.slice(0,3)).map((item, index) => (
//                   <li
//                     key={index}
//                     className="flex flex-row items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-all duration-200 group"
//                   >
//                     <div className="flex flex-row items-center gap-3 flex-1 min-w-0">
//                       {getFileIcon(item.name)}
//                       <a
//                         href={item.fileUrl}
//                         className="text-zinc-700 hover:text-amber-700 truncate font-medium text-sm"
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         title={item.name}
//                       >
//                         {item.name}
//                       </a>
//                     </div>

//                     <div className="flex flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                       <a
//                         href={item.fileUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 border border-transparent hover:border-amber-200"
//                         title="Open"
//                       >
//                         <ExternalLink size={16} />
//                       </a>
//                       <a
//                         href={item.fileUrl}
//                         download
//                         className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 border border-transparent hover:border-amber-200"
//                         title="Download"
//                       >
//                         <Download size={16} />
//                       </a>
//                     </div>
//                   </li>
//                 ))}
//                  {HR.length > 3 && (
//                     <div className="flex justify-center pt-4 flex-shrink-0">
//                       <button
//                         onClick={() => setHrData(!hrdata)}
//                         className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
//                       >
//                         {hrdata ? "Show Less" : "More"}
//                       </button>
//                     </div>
//                   )}
//                 </>
//               </ul>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Knowledge;





import * as React from "react";
import { IIntranetPortalProps } from "../IIntranetPortalProps";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import {
  Folder,
  FileText,
  FileSignature,
  File,
  Download,
  ExternalLink,
  FileImage,
  
} from "lucide-react";

interface DocFile {
  id: number;
  name: string;
  fileUrl: string;
  documentCategory: string[];
  status: string;
}

const Knowledge: React.FC<IIntranetPortalProps> = ({ sp }) => {
  const [knowledge, setKnowledge] = React.useState<DocFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAll, setShowAll] = React.useState(false);

  // ---------- FETCH DATA ----------
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const items = await sp.web.lists
        .getByTitle("KnowledgeBase")
        .items.select(
          "Id",
          "FileLeafRef",
          "FileRef",
          "DocumentCategory",
          "Status"
        )();

      const mapped: DocFile[] = items.map((i: any) => ({
        id: i.Id,
        name: i.FileLeafRef,
        fileUrl: i.FileRef,
        // Fixed typo: DocmentCategory -> DocumentCategory
        documentCategory: Array.isArray(i.DocumentCategory)
          ? i.DocumentCategory
          : i.DocumentCategory
          ? [i.DocumentCategory]
          : ["Other"], // Default if null
        status: i.Status,
      }));

      setKnowledge(mapped.filter((d) => d.status === "Active"));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void fetchDocuments();
  }, [sp]);

  // ---------- GROUP DATA ----------
  const GroupDocument: Record<string, DocFile[]> = {};
  
  knowledge.forEach((document) => {
    document.documentCategory.forEach((category) => {
      if (!GroupDocument[category]) {
        GroupDocument[category] = [];
      }
      GroupDocument[category].push(document);
    });
  });

  // ---------- ICONS ----------
  const getFileIcon = (fileName?: string) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText className="text-red-500" size={18} />;
      case "doc":
      case "docx":
        return <FileText className="text-blue-500" size={18} />;
      case "ppt":
      case "pptx":
        return <FileSignature className="text-orange-500" size={18} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="text-purple-500" size={18} />;
      default:
        return <File className="text-gray-500" size={18} />;
    }
  };

  // ---------- RENDER ----------
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-zinc-50 to-emerald-50 px-4 py-10">
      
//       <div className="max-w-7xl mx-auto mb-10">
//         <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight mb-2">
//               Knowledge Base
//             </h1>
//             <p className="text-sm md:text-base text-zinc-600 whitespace-nowrap overflow-hidden text-ellipsis">
//            Access centralized documentation, templates, and technical guides for your organization.
//             </p>
//           </div>
//         </div>
//       </div>


//       {loading && (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
//           <p className="text-zinc-500 text-sm">Loading Knowledge Base...</p>
//         </div>
//       )}

     
//       {!loading && knowledge.length === 0 && (
//         <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-white/50">
//           <Folder size={48} className="text-zinc-300 mb-4" />
//           <p className="text-lg font-medium text-zinc-600">No documents found</p>
//           <p className="text-zinc-500 mt-1">Check back later for updates.</p>
//         </div>
//       )}

//       {/* Content Grid - One Card per Category */}
//       {/* {!loading && knowledge.length > 0 && (
//         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
//           {Object.entries(GroupDocument).map(([category, items]) => (
//             <div
//               key={category}
//               className="bg-white/90 backdrop-blur-sm  border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 h-[400px] flex flex-col"
//             >
           
//               <div className="flex items-center col-start-1 col-end-2 gap-3 mb-6 pb-4 border-b border-zinc-100">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
//                   <Folder size={20} />
//                 </div>
//                 <div className="overflow-hidden">
//                   <h3 className="text-sm font-bold text-zinc-900 truncate uppercase tracking-wide">
//                     {category}
//                   </h3>
//                   <p className="text-xs text-zinc-500">
//                     {items.length} file{items.length !== 1 ? "s" : ""}
//                   </p>
//                 </div>
//               </div>

             
//               <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
//                 <ul className="flex flex-col gap-2">
//                   {items.map((item) => (
//                     <li
//                       key={item.id}
//                       className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all duration-200 group"
//                     >
                     
//                       <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
//                         <div className="shrink-0">{getFileIcon(item.name)}</div>
//                         <a
//                           href={item.fileUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="text-zinc-700 hover:text-emerald-700 truncate font-medium text-sm w-full"
//                           title={item.name}
//                         >
//                           {item.name}
//                         </a>
//                       </div>

                     
//                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
//                         <a
//                           href={item.fileUrl}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="p-1.5 rounded-md hover:bg-white text-zinc-400 hover:text-emerald-600 transition-colors"
//                           title="Open"
//                         >
//                           <ExternalLink size={14} />
//                         </a>
//                         <a
//                           href={item.fileUrl}
//                           download
//                           className="p-1.5 rounded-md hover:bg-white text-zinc-400 hover:text-emerald-600 transition-colors"
//                           title="Download"
//                         >
//                           <Download size={14} />
//                         </a>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </div>
//           ))}
//         </div>
//       )} */}

// {/* Content – Single Column Layout */}


      
//     </div>

    
//   );

 return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-zinc-50 to-emerald-50 px-4 py-10">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight mb-2">
              Knowledge Base
            </h1>
            <p className="text-sm md:text-base text-zinc-600 whitespace-nowrap overflow-hidden text-ellipsis">
              Access centralized documentation, templates, and technical guides for your organization.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 text-sm">Loading Knowledge Base...</p>
        </div>
      )}

      {!loading && knowledge.length === 0 && (
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-white/50">
          <Folder size={48} className="text-zinc-300 mb-4" />
          <p className="text-lg font-medium text-zinc-600">No documents found</p>
          <p className="text-zinc-500 mt-1">Check back later for updates.</p>
        </div>
      )}

      {/* Content – Cards Horizontal / Vertical */}
      {!loading && knowledge.length > 0 && (
        <div className="max-w-7xl mx-auto flex flex-wrap gap-6 justify-center  ">
          {Object.entries(GroupDocument).map(([category, items]) => (
            <div
              key={category}
              className="bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col w-[300px] "
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-zinc-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Folder size={20} />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-zinc-900 truncate  tracking-wide">
                    {category}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {items.length} file{items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Files */}
              <div   className={`flex-1 pr-2 custom-scrollbar ${
    showAll ? "overflow-y-auto max-h-[220px]" : "overflow-hidden"
  }`}>
                <ul className="flex flex-col gap-2 ">
                  {items.slice(0,showAll?items.length:3).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                        {getFileIcon(item.name)}
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-700 hover:text-emerald-700 truncate font-medium text-sm w-full"
                          title={item.name}
                        >
                          {item.name}
                        </a>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-white text-zinc-400 hover:text-emerald-600 transition-colors"
                          title="Open"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <a
                          href={item.fileUrl}
                          download
                          className="p-1.5 rounded-md hover:bg-white text-zinc-400 hover:text-emerald-600 transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </li>
                  ))}
                  {items.length > 3 && (
                    <div className="flex justify-center pt-4 flex-shrink-0  ">
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
                      >
                        {showAll ? "Show Less" : "More"}
                      </button>
                    </div>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Knowledge;
