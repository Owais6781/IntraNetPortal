// // import * as React from "react";

// // const ITSupport: React.FC = () => {
// //   return (

// //         <>
// //         <h1>ITSupport</h1>
// //         </>

// //   );
// // };

// // export default ITSupport;





// // import * as React from "react";
// // import { useNavigate } from "react-router-dom";
// // import { useState } from "react";
// // import { IIntranetPortalProps } from "../IIntranetPortalProps";
// // import "@pnp/sp/lists";
// // import "@pnp/sp/items";
// // import "@pnp/sp/site-users/web";

// // interface Support {
// //   id?: number;
// //   useremail: string;
// //   username: string;
// //   category: string;
// //   summary: string;
// //   description: string;
// // }

// // const ITsupport: React.FC<IIntranetPortalProps> = ({ sp, context }) => {
// //   const UserEmail = context.pageContext.user.email;
// //   const UserName = context.pageContext.user.displayName;

// //   const initialize: Support = {
// //     username: UserName,
// //     useremail: UserEmail,
// //     category: "",
// //     summary: "",
// //     description: "",
// //   };

// //   const [list, setList] = React.useState<Support>(initialize);
// //   const [tickets, setTickets] = React.useState<Support[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [modalData, setModalData] = useState<Support | null>(null); // ✅ For popup
// //   const navigate = useNavigate();
// //   const [showAll, setShowAll] = React.useState(false);

// //   const handleChange = (
// //     e: React.ChangeEvent<
// //       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
// //     >
// //   ) => {
// //     const { name, value } = e.target;
// //     setList((prev) => ({ ...prev, [name]: value }));
// //   };

// //   const submitTicket = async () => {
// //     try {
// //       setLoading(true);
// //       await sp.web.lists.getByTitle("ITsupport").items.add({
// //         UserEmail: list.useremail,
// //         Title: list.username,
// //         Category: list.category,
// //         Summary: list.summary,
// //         Description: list.description,
// //       });
// //       setList(initialize);
// //       navigate("/");
// //       alert("Ticket submitted successfully");
// //     } catch (err) {
// //       console.error(err);
// //       alert("Error submitting ticket");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchTickets = async () => {
// //     try {
// //       const currentUser = await sp.web.currentUser();
// //       const userEmail = currentUser.Email;

// //       const items = await sp.web.lists
// //         .getByTitle("ITsupport")
// //         .items.select("Id", "UserEmail", "Category", "Summary", "Description")
// //         .filter(`UserEmail eq '${userEmail}'`)()

// //       const mapped: Support[] = items.map((i: any) => ({
// //         id: i.Id,
// //         useremail: i.UserEmail,
// //         category: i.Category,
// //         summary: i.Summary,
// //         description: i.Description,
// //         username: i.Title,
// //       }));
// //       setTickets(mapped);
// //     } catch (error) {
// //       console.error("Error fetching tickets:", error);
// //     }
// //   };

// //   React.useEffect(() => {
// //     void fetchTickets();
// //   }, [sp]);

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-100 p-6">
// //       {/* Header */}
// //       <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl py-24 mb-8 shadow-lg text-center m-10 h-[300px]">
// //         <h1 className="text-4xl font-bold mb-3">Technology Support</h1>
// //         <p className="text-lg text-white/90">
// //           Need help with your hardware, software, or network? We are here to
// //           help 24/7.
// //         </p>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto ">
// //         {/* New Ticket Form */}
// //         <div className="col-start-1 col-end-2 bg-white rounded-2xl shadow-lg p-8 transition duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-200">
// //           <h2 className="text-xl font-semibold text-indigo-600 mb-6">
// //             Open a New Ticket
// //           </h2>

// //           <div className="space-y-5">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">
// //                 Priority Level
// //               </label>
// //               <select
// //                 name="category"
// //                 value={list.category}
// //                 onChange={handleChange}
// //                 className="w-full rounded-lg font-medium border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
// //               >
// //                 <option className="font-medium" value="">
// //                   -- Select --
// //                 </option>
// //                 <option value="P3 - Standard">P3 - Standard</option>
// //                 <option value="P2 - High">P2 - High</option>
// //                 <option value="P1 - Critical">P1 - Critical</option>
// //               </select>
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">
// //                 Issue Summary
// //               </label>
// //               <input
// //                 name="summary"
// //                 value={list.summary}
// //                 onChange={handleChange}
// //                 placeholder="Short title of the problem"
// //                 className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">
// //                 Detailed Description
// //               </label>
// //               <textarea
// //                 name="description"
// //                 rows={4}
// //                 value={list.description}
// //                 onChange={handleChange}
// //                 placeholder="Describe your issue in detail"
// //                 className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
// //               />
// //             </div>

// //             <button
// //               onClick={submitTicket}
// //               disabled={loading}
// //               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
// //             >
// //               {loading ? "Submitting..." : "Submit Ticket"}
// //             </button>
// //           </div>
// //         </div>

// //         {/* Tickets List */}
// //         <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col">
// //           <h2 className="text-xl font-semibold text-indigo-500 mb-6">
// //             System Status
// //           </h2>
// //           {tickets.length === 0 ? (
// //             <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
// //               <p className="text-sm text-gray-500">No tickets submitted yet.</p>
// //             </div>
// //           ) : (
// //             <>
// //               <div className="space-y-6 mb-6 gap-6">
// //                 {(showAll ? tickets : tickets.slice(0, 2)).map((t) => (
// //                   <div
// //                     key={t.id}
// //                     className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 transition duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-200"
// //                   >
// //                     <h4 className="text-lg font-semibold text-indigo-500 mb-4">
// //                       Ticket : {t.id}
// //                     </h4>
// //                     <p className="font-semibold p-2">Email Services : {t.useremail}</p>
// //                     <p className="font-semibold p-2">VPN Gateway : {t.category}</p>
// //                     <p className="text-sm p-2">Database Cluster : {t.summary}</p>
// //                     <p className="text-sm p-2 line-clamp-2">
// //                       Description : {t.description}
// //                     </p>
// //                     <button
// //                       onClick={() => setModalData(t)}
// //                       className="mt-2 text-indigo-600 font-semibold hover:underline"
// //                     >
// //                       View More
// //                     </button>
// //                   </div>
// //                 ))}
// //               </div>

// //               {tickets.length > 0 && (
// //                 <div className="text-center">
// //                   <button
// //                     onClick={() => setShowAll(!showAll)}
// //                     className="bg-gray-400 cursor-pointer text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
// //                   >
// //                     {showAll ? "Show Less" : "Read More"}
// //                   </button>
// //                 </div>
// //               )}
// //             </>
// //           )}
// //         </div>
// //       </div>

// //       {/* Modal */}
// //       {modalData && (
// //         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
// //           <div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-lg">
// //             <button
// //               className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
// //               onClick={() => setModalData(null)}
// //             >
// //               ✕
// //             </button>
// //             <h3 className="text-xl font-semibold text-indigo-500 mb-4">
// //               Ticket : {modalData.id}
// //             </h3>
// //             <p className="font-semibold mb-2">Email: {modalData.useremail}</p>
// //             <p className="font-semibold mb-2">Category: {modalData.category}</p>
// //             <p className="font-semibold mb-2">Summary: {modalData.summary}</p>
// //             <p className="mb-2">Description: {modalData.description}</p>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ITsupport;






// import * as React from "react";
// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/site-users/web";
// import { MoreVertical  } from "lucide-react";
// interface Support {
//     id?: number;
//     useremail: string;
//     username: string;
//     category: string;
//     summary: string;
//     description: string;
// }

// const ITsupport: React.FC<IIntranetPortalProps> = ({ sp, context }) => {
//     const UserEmail = context.pageContext.user.email;
//     const UserName = context.pageContext.user.displayName;

//     const initialize: Support = {
//         username: UserName,
//         useremail: UserEmail,
//         category: "",
//         summary: "",
//         description: "",
//     };

//     const [list, setList] = React.useState<Support>(initialize);
//     const [tickets, setTickets] = React.useState<Support[]>([]);
//     const [showpopup, setShowPopup] = React.useState<Support | null>(null)
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();
//     const [showAll, setShowAll] = React.useState(false)

//     const handleChange = (
//         e: React.ChangeEvent<
//             HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//         >
//     ) => {
//         const { name, value } = e.target;
//         setList((prev) => ({ ...prev, [name]: value }));
//     };

//     const submitTicket = async () => {
//         try {
//             setLoading(true);
//             await sp.web.lists.getByTitle("ITsupport").items.add({
//                 UserEmail: list.useremail,
//                 Title: list.username,
//                 Category: list.category,
//                 Summary: list.summary,
//                 Description: list.description,
//             });
//             setList(initialize);
//             navigate("/");
//             alert("Ticket submitted successfully");

//         } catch (err) {
//             console.error(err);
//             alert("Error submitting ticket");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchTickets = async () => {
//         try {
//             const currentUser = await sp.web.currentUser();
//             const userEmail = currentUser.Email;

//             const items = await sp.web.lists
//                 .getByTitle("ITsupport")
//                 .items.select("Id",
//                     "UserEmail",
//                     "Category",
//                     "Summary",
//                     "Description"
//                 )
//                 .filter(`UserEmail eq '${userEmail}'`)(); // ✅ wrap in quotes

//             const mapped: Support[] = items.map((i: any) => ({
//                 id: i.Id,
//                 useremail: i.UserEmail,
//                 category: i.Category,
//                 summary: i.Summary,
//                 description: i.Description,
//                 username: i.Title,
//             }));
//             setTickets(mapped);
//         } catch (error) {
//             console.error("Error fetching tickets:", error);
//         }
//     };

//     React.useEffect(() => {
//         void fetchTickets();
//     }, [sp]);


//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-200 to-gray-100 p-6">


//             <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-2xl py-24 mb-8 shadow-lg text-center m-10 h-[300px]">
//                 <h1 className="text-4xl font-bold mb-3">Technology Support</h1>
//                 <p className="text-lg text-white/90">
//                     Need help with your hardware, software, or network? We are here to help 24/7.
//                 </p>
//             </div>


//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl  items-start ">


//                 <div className=" col-start-1 col-end-2 bg-white rounded-2xl shadow-lg p-8 transition  
//     duration-300
//     ease-in-out
//     hover:shadow-2xl
//     hover:-translate-y-1
//     hover:border-indigo-200">
//                     <h2 className="text-xl font-semibold text-indigo-600 mb-6">
//                         Open a New Ticket
//                     </h2>

//                     <div className="space-y-5">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Priority Level
//                             </label>
//                             <select
//                                 name="category"
//                                 value={list.category}
//                                 onChange={handleChange}
//                                 className="w-full rounded-lg font-medium  border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
//                             >
//                                 <option className="font-medium " value="">-- Select --</option>
//                                 <option value="P3 - Standard  ">P3 - Standard</option>
//                                 <option value="P2 - High ">P2 - High</option>
//                                 <option value="P1 - Critical ">P1 - Critical</option>
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Issue Summary
//                             </label>
//                             <input
//                                 name="summary"
//                                 value={list.summary}
//                                 onChange={handleChange}
//                                 placeholder="Short title of the problem"
//                                 className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-400 outline-none"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Detailed Description
//                             </label>
//                             <textarea
//                                 name="description"
//                                 rows={4}
//                                 value={list.description}
//                                 onChange={handleChange}
//                                 placeholder="Describe your issue in detail"
//                                 className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
//                             />
//                         </div>

//                         <button
//                             onClick={submitTicket}
//                             disabled={loading}
//                             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
//                         >
//                             {loading ? "Submitting..." : "Submit Ticket"}
//                         </button>
//                     </div>
//                 </div>




//                 <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 h-full flex flex-col ">


//                     <h2 className="text-xl font-semibold text-indigo-500 mb-6">
//                         System Status
//                     </h2>
//                     {tickets.length === 0 ? (
//                         <div className=" bg-white rounded-xl shadow-lg p-6 border border-gray-100">
//                             <p className="text-sm text-gray-500">No tickets submitted yet.</p>
//                         </div>
//                     ) : (<>
//                         <div className="space-y-4 mb-6 gap-6">
//                             {(showAll ? tickets : tickets.slice(0, 3)).map((t) => (
//                                 <div
//                                     key={t.id}

//                                     className=" bg-white rounded-xl shadow-lg p-4 border border-gray-100
//     transition
//     duration-300
//     ease-in-out
//     hover:shadow-2xl
//     hover:-translate-y-1
//     hover:border-indigo-200
//   "
//                                 >
//                                   <div className="flex justify-between">

//                                       <h4 className="text-lg font-semibold text-indigo-500 mb-2">
//                                         Ticket : {t.id}
//                                     </h4>

//                                     <MoreVertical 
//                                         size={20}
//                                         className="text-indigo-600 cursor-pointer hover:text-indigo-800"
//                                         onClick={() => setShowPopup(t)}

//                                     />
//                                   </div>
//                                     <div className="flex justify-between p-1">
//                                         <p className="font-semibold ">Email Services : {t.useremail}</p>
//                                         <p className="font-semibold" >VPN Gateway : {t.category}</p>
//                                     </div>
//                                     <div className="flex items-center justify-between p-1 gap-4">
//                                         <p className="text-sm  " >Database Cluster : {t.summary}</p>
//                                         <p className="text-sm  truncate max-w-[40%] text-right">Description : {t.description}</p>
//                                     </div>

//                                     {/* 
//                                     <MoreVertical 
//                                         size={20}
//                                         className="text-indigo-600 cursor-pointer hover:text-indigo-800"
//                                         onClick={() => setShowPopup(t)}

//                                     /> */}
//                                 </div>
//                             ))}
//                         </div>

//                         {tickets.length > 0 && (
//                             <div className="text-center  ">
//                                 <button
//                                     onClick={() => setShowAll(!showAll)}
//                                     className=" bg-gray-400   cursor-pointer text-white  px-6  py-2  rounded-lg   font-semibold hover:bg-gray-600   transition "
//                                 >
//                                     {showAll ? "Show Less" : " More"}
//                                 </button>
//                             </div>
//                         )}

//                     </>
//                     )}
//                 </div>
//             </div>

//             {showpopup && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl max-w-lg w-full p-6 relative shadow-lg">
//                         <button
//                             className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
//                             onClick={() => setShowPopup(null)}>
//                             ✕
//                         </button>

//                         <h3 className="text-xl font-semibold text-indigo-500 mb-4">Ticket : {showpopup.id}</h3>
//                         <p className="font-semibold mb-2">Email Services: {showpopup.useremail}</p>
//                         <p className="font-semibold mb-2">VPN Gateway :  {showpopup.category}</p>
//                         <p className="font-semibold mb-2">Database Cluster : {showpopup.summary}</p>
//                         <p className="font-semibold whitespace-pre mb-2">Description : {showpopup.description}</p>
//                     </div>

//                 </div>
//             )}

//         </div>
//     );
// };

// export default ITsupport;





//*****working code*******//

// import * as React from "react";

// import { useState } from "react";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/site-users/web";
// import { MoreVertical, Headphones, Send, X } from "lucide-react";

// interface Support {
//     id?: number;
//     ticketId?: string;
//     useremail: string;
//     username: string;
//     category: string;
//     summary: string;
//     description: string
//     status:string;
// }

// const ITsupport: React.FC<IIntranetPortalProps> = ({ sp, context }) => {
//     const UserEmail = context.pageContext.user.email;
//     const UserName = context.pageContext.user.displayName;

//     const initialize: Support = {
//         username: UserName,
//         useremail: UserEmail,
//         category: "",
//         summary: "",
//         description: "",
//          status:""
//     };

//     const [list, setList] = React.useState<Support>(initialize);
//     const [tickets, setTickets] = React.useState<Support[]>([]);
//     const [showpopup, setShowPopup] = React.useState<Support | null>(null);
//     const [loading, setLoading] = useState(false);
   
//     const [showAll, setShowAll] = React.useState(false);

//     const handleChange = (
//         e: React.ChangeEvent<
//             HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//         >
//     ) => {
//         const { name, value } = e.target;
//         setList((prev) => ({ ...prev, [name]: value }));
//     };

//     const submitTicket = async () => {
//         try {
//             setLoading(true);
//             const result = await sp.web.lists.getByTitle("ITsupport").items.add({
//                 UserName: list.username,
//                 UserEmail: list.useremail,
//                 Category: list.category,
//                 Summary: list.summary,
//                 Description: list.description,
//             });

//             const itmeId = result.Id;
//             const year = new Date().getFullYear();
       

//             const customId = `TCK${year}-${String(itmeId).padStart(4, "0")}`
           

//             await sp.web.lists.getByTitle("ITsupport").items.getById(itmeId).update({
//                 Title:customId,
//             })
//             setList(initialize);
         
//             alert(`Ticket ${customId} submitted successfully`);
//         } catch (err) {
//             console.error(err);
//             alert("Error submitting ticket");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchTickets = async () => {
//         try {
//             const currentUser = await sp.web.currentUser();
//             const userEmail = currentUser.Email;

//             const items = await sp.web.lists
//                 .getByTitle("ITsupport")
//                 .items.select("Id","Title", "UserEmail", "Category", "Summary", "Description")
//                 .filter(`UserEmail eq '${userEmail}'`).orderBy("Id",false)();

//             const mapped: Support[] = items.map((i: any) => ({
//                 id: i.Id,
//                 ticketId: i.Title,
//                 useremail: i.UserEmail,
//                 category: i.Category,
//                 summary: i.Summary,
//                 description: i.Description,
//                 username: i.UserName,
//                 status:i.Status ||"Pending",
//             }));
//             setTickets(mapped);
//         } catch (error) {
//             console.error("Error fetching tickets:", error);
//         }
//     };

//     React.useEffect(() => {
//         void fetchTickets();
//     }, [sp]);

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6"
//         >

//             {/* Hero Section */}
//             <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-3xl py-16 mb-10 shadow-2xl mx-4">
//                 <div className="absolute inset-0 opacity-10">
//                     <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
//                     <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
//                 </div>
//                 <div className="relative flex flex-col items-center justify-center text-center px-6">
//                     <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-5">
//                         <Headphones size={32} className="text-white" />
//                     </div>
//                     <h1 className="text-4xl md:text-5xl font-bold mb-4">Technology Support</h1>
//                     <p className="text-lg md:text-xl text-white/90 max-w-2xl">
//                         Need help with your hardware, software, or network? We are here to help 24/7.
//                     </p>
//                 </div>
//             </div>

//             <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto   px-4"
//             >

//               <div className="w-full lg:w-1/2 ">
//                     <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl h-[600px] flex flex-col">


//                         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex-shrink-0">
//                             <div className="flex flex-row items-center gap-4">
//                                 <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
//                                     <Send size={22} className="text-white" />
//                                 </div>
//                                 <h2 className="text-xl font-bold text-white">Open a New Ticket</h2>
//                             </div>
//                         </div>


//                         <div className="p-8 flex-1 ">
//                             <div className="flex flex-col gap-6">

//                                 <div className="flex flex-col gap-2">
//                                     <label className="text-sm font-semibold text-gray-700">
//                                         Priority Level
//                                     </label>
//                                     <select
//                                         name="category"

//                                         value={list.category}
//                                         onChange={handleChange}
//                                         className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
//                                     >
//                                         <option value="">-- Select --</option>
//                                         <option value="P3 - Standard">P3 - Standard</option>
//                                         <option value="P2 - High">P2 - High</option>
//                                         <option value="P1 - Critical">P1 - Critical</option>
//                                     </select>
//                                 </div>

//                                 <div className="flex flex-col gap-2">
//                                     <label className="text-sm font-semibold text-gray-700">
//                                         Issue Summary
//                                     </label>
//                                     <input
//                                         name="summary"
//                                        required
//                                         value={list.summary}
//                                         onChange={handleChange}
//                                         placeholder="Short title of the problem"
//                                         className="w-full  rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
//                                     />
//                                 </div>


//                                 <div className="flex flex-col gap-2">
//                                     <label className="text-sm font-semibold text-gray-700">
//                                         Detailed Description
//                                     </label>
//                                     <textarea
//                                         name="description"
//                                         rows={4}
//                                         value={list.description}
//                                         onChange={handleChange}
//                                         placeholder="Describe your issue in detail"
//                                         className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
//                                     />
//                                 </div>


//                                 <button
//                                     onClick={submitTicket}
//                                     disabled={loading}
//                                     className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex flex-row items-center justify-center gap-3"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                                             <span>Submitting...</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Send size={20} />
//                                             <span>Submit Ticket</span>
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div> 

//                 <div className="w-full lg:w-1/2">
//                     <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[600px] flex flex-col">



//                         <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6 flex-shrink-0">
//                             <div className="flex items-center justify-between">
//                                 <h2 className="text-xl font-bold text-white">System Status</h2>
//                                 {/* <Link to="/" className="text-xl font-bold text-white">Request</Link>
//                                 <Link to="/" className="text-xl font-bold text-white">Approvel</Link>
//                                 <Link to="/" className="text-xl font-bold text-white">Action</Link> */}

//                                 <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
//                                     <p className="text-sm font-semibold text-white">Total Ticket</p>
//                                     <span className="text-white font-bold text-sm">{tickets.length}</span>

//                                 </div>
//                             </div>
//                         </div>


//                         {/* Tickets Body - Scrollable */}
//                         <div className="p-6 flex-1 overflow-y-auto flex flex-col">
//                             {tickets.length === 0 ? (
//                                 <div className="flex flex-col items-center justify-center flex-1">
//                                     <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
//                                         <Send size={28} className="text-gray-400" />
//                                     </div>
//                                     <p className="text-gray-500 text-center">No tickets submitted yet.</p>
//                                 </div>
//                             ) : (
//                                 <>
//                                     <div className="flex flex-col gap-4 flex-1">
//                                         {(showAll ? tickets : tickets.slice(0, 3)).map((t) => (
//                                             <div
//                                                 key={t.id}
//                                                 onClick={() => setShowPopup(t)}
//                                                 className="bg-gradient-to-br from-gray-50 to-white cursor-pointer rounded-2xl p-5 border-2 border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 flex-shrink-0"
//                                             >
//                                                 {/* Ticket Header */}
//                                                 <div className="flex flex-row items-center justify-between mb-3"
//                                                 >
//                                                     <h4 className="text-lg font-bold text-indigo-600">
//                                                         Ticket : {t.ticketId}

//                                                     </h4>
//                                                     <MoreVertical
//                                                         size={20}
//                                                         className="text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors"
//                                                         onClick={() => setShowPopup(t)}
//                                                     />
//                                                 </div>

//                                                 <div className="flex flex-row justify-between items-center p-1 bg-gray-50 rounded-lg mb-2">
//                                                     <p className="font-semibold text-gray-700 text-sm">
//                                                         Email Services : {t.useremail}
//                                                     </p>
//                                                     <p className="font-semibold text-gray-700 text-sm">
//                                                         VPN Gateway : {t.category}
//                                                     </p>
//                                                 </div>

//                                                 <div className="flex flex-row items-center justify-between p-1 gap-4">
//                                                     <p className="text-sm text-gray-600">
//                                                         Database Cluster : {t.summary}
//                                                     </p>
//                                                     <p className="text-sm text-gray-600 truncate max-w-[40%] text-right">
//                                                         Description : {t.description}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>

//                                     {tickets.length > 3 && (
//                                         <div className="flex justify-center pt-4 flex-shrink-0">
//                                             <button
//                                                 onClick={() => setShowAll(!showAll)}
//                                                 className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
//                                             >
//                                                 {showAll ? "Show Less" : "More"}
//                                             </button>
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>


//             {showpopup && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//                 onClick={() => setShowPopup(null)}
//                 >
//                     <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">

//                         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
//                             <div className="flex flex-row items-center justify-between">
//                                 <h3 className="text-xl font-bold text-white">Ticket : {showpopup.ticketId}</h3>
//                                 <button
//                                     className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/20 transition-colors"
//                                     onClick={() => setShowPopup(null)}
//                                 >
//                                     <X size={24} className="text-white" />
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="p-6">
//                             <div className="flex flex-col gap-4">
//                                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                                     <span className="text-xs font-semibold text-gray-500 uppercase">Email Services</span>
//                                     <span className="font-semibold text-gray-800">{showpopup.useremail}</span>
//                                 </div>

//                                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                                     <span className="text-xs font-semibold text-gray-500 uppercase">VPN Gateway</span>
//                                     <span className="font-semibold text-gray-800">{showpopup.category}</span>
//                                 </div>

//                                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                                     <span className="text-xs font-semibold text-gray-500 uppercase">Database Cluster</span>
//                                     <span className="font-semibold text-gray-800">{showpopup.summary}</span>
//                                 </div>

//                                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4  ">
//                                     <span className="text-xs font-semibold text-gray-500 uppercase">Description</span>
//                                     <p className="font-semibold text-gray-800 whitespace-pre-wrap">{showpopup.description}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ITsupport;




//*****Add on new admin approve*****//


// import * as React from "react";
// import { useState, useMemo } from "react";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/site-users/web";
// import "@pnp/sp/site-groups";

// import { MoreVertical, X,  Headphones, Send,} from "lucide-react";

// interface approvel {
//   id: number;
//   name: string;
//   email: string;
// }


// interface Support {
//     id?: number;
//     ticketId?: string;
//     useremail: string;
//     username: string;
//     category: string;
//     summary: string;
//     description: string
//     status: string;
//     managerId:number | null,
  
// }

// const ITsupport: React.FC<IIntranetPortalProps> = ({ sp, context }) => {

//     const UserEmail = context.pageContext.user.email;
//     const UserName = context.pageContext.user.displayName;

//     const initialize: Support = {
//         username: UserName,
//         useremail: UserEmail,
//         category: "",
//         summary: "",
//         description: "",
//         status: "Pending",
//          managerId: null,
        
//     };
//   const [managers, setManagers] = React.useState<approvel[]>([]);
//     const [list, setList] = React.useState<Support>(initialize);
//     const [tickets, setTickets] = React.useState<Support[]>([]);
//     const [showpopup, setShowPopup] = React.useState<Support | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [showAll, setShowAll] = React.useState(false);
   
//     const [activeTab, setActiveTab] = React.useState<"Request" | "Approve" | "Action">("Request")

//     const handleChange = (
//         e: React.ChangeEvent<
//             HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//         >
//     ) => {
//         const { name, value } = e.target;
//         setList((prev) => ({ ...prev, [name]: value }));
//     };



// //     const submitTicket = async (e:React.FormEvent) => {
// //         e.preventDefault()
// //     if (!list.category || !list.summary) return;

// //     try {
// //         setLoading(true);

// //         const items = await sp.web.lists
// //             .getByTitle("ITsupport")
// //             .items.select("Title")
// //             .orderBy("ID", false)
// //             .top(1)();

// //         let nextNumber = 1;

// //         if (items.length > 0) {
            
// //             const lastTitle = items[0].Title;
// //             const lastNumber = parseInt(lastTitle.split("-")[1], 10);
// //             if (!isNaN(lastNumber)) {
// //                 nextNumber = lastNumber + 1;
// //             }
// //         }

      
// //         const result = await sp.web.lists.getByTitle("ITsupport").items.add({
// //             UserName: list.username,
// //             UserEmail: list.useremail,
// //             Category: list.category,
// //             Summary: list.summary,
// //             Description: list.description,
// //             Status: list.status,
// //             ApproveBy:list.managerId,
// //         });

// //         const itmeId = result.Id;
// //         const year = new Date().getFullYear();

        
// //         const customId = `TCK${year}-${String(nextNumber).padStart(4, "0")}`;

// //         await sp.web.lists.getByTitle("ITsupport").items.getById(itmeId).update({
// //             Title: customId,
// //         });

// //         setList(initialize);
// //         alert(`Ticket ${customId} submitted successfully`);
// //     } catch (error) {
// //       console.log(error);
// //         alert("Error submitting ticket");
// //     } finally {
// //         setLoading(false);
// //     }
// // };

// const submitTicket = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!list.category || !list.summary) return;

//     try {
//         setLoading(true);

//         // Fetch the last item to determine the next number
//         const items = await sp.web.lists
//             .getByTitle("ITsupport")
//             .items.select("Title")
//             .orderBy("ID", false)
//             .top(1)();

//         let nextNumber = 1;
//         const currentYear = new Date().getFullYear();

//         if (items.length > 0) {
//             const lastTitle = items[0].Title;
//             if (lastTitle && lastTitle.startsWith("TCK")) {
//                 const parts = lastTitle.split("-");
//                 if (parts.length === 2) {
//                     const lastYear = parseInt(parts[0].substring(3), 10); // Extract year from "TCK2023"
//                     const lastNumber = parseInt(parts[1], 10);
//                     if (!isNaN(lastYear) && !isNaN(lastNumber) && lastNumber > 0) {
                  
//                         nextNumber = lastYear === currentYear ? lastNumber + 1 : 1;
//                     }
//                 }
//             }
//         }

//         // Add the new item
//         const result = await sp.web.lists.getByTitle("ITsupport").items.add({
//             UserName: list.username,
//             UserEmail: list.useremail,
//             Category: list.category,
//             Summary: list.summary,
//             Description: list.description,
//             Status: list.status,
//             ApproveBy: list.managerId,
//         });

//         const itemId = result.Id;

//         // Generate and set the custom ID
//         const customId = `TCK${currentYear}-${String(nextNumber).padStart(4, "0")}`;
//         await sp.web.lists.getByTitle("ITsupport").items.getById(itemId).update({
//             Title: customId,
//         });

//         setList(initialize);
//         alert(`Ticket ${customId} submitted successfully`);
//     } catch (error) {
//         console.error("Error submitting ticket:", error);
      
        
//         alert(`Error submitting ticket: `);
//     } finally {
//         setLoading(false);
//     }
// };

//  const fetchApprover = async () => {
//       try {
//         const items = await sp.web.lists
//           .getByTitle("AdminApproval")
//           .items.select(
//             "Admin/Id",
//             "Admin/Title",
//             "Admin/EMail"
//           )
//           .expand("Admin")();

//         const mapped: approvel[] = items
//           .filter((i: any) => i.Admin)
//           .map((i: any) => ({
//             id: i.Admin.Id,
//             name: i.Admin.Title,
//             email: i.Admin.EMail,
//           }));

//         setManagers(mapped);
//       } catch (error) {
//         console.error("Error fetching approvers", error);
//       }
//     };


//       const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const selectedEmail = e.target.value;

//     const selectedManager: approvel | undefined =
//       managers.filter((m) => m.email === selectedEmail)[0];

//     setList((prev) => ({
//       ...prev, managerId: selectedManager ? selectedManager.id : null,
//     }))
//   };



//     const fetchTickets = async () => {
//         try {
//             const currentUser = await sp.web.currentUser();
//             const userEmail = currentUser.Email;

//             const items = await sp.web.lists
//                 .getByTitle("ITsupport")
//                 .items.select("Id", "Title", "UserEmail", "Category", "Summary", "Description", "Status","ApproveBy/Id","ApproveBy/Title")
//                 .expand("ApproveBy")
//                 .filter(`UserEmail eq '${userEmail}'`).orderBy("Id", false)();

//             const mapped: Support[] = items.map((i: any) => ({
//                 id: i.Id,
//                 ticketId: i.Title,
//                 useremail: i.UserEmail,
//                 category: i.Category,
//                 summary: i.Summary,
//                 description: i.Description,
//                 username: i.UserName,
//                 status: i.Status,
//                 managerId: i.ApprovedBy,

               
//             }));
//             setTickets(mapped);
//         } catch (error) {
//             console.error("Error fetching tickets:", error);
//         }
//     }


//     React.useEffect(() => {
//         void fetchTickets();
//        void fetchApprover()
     
//     }, [sp]);


//     const filterTickets = useMemo(() => {
//         switch (activeTab) {
//             case "Action":
//                 return tickets.filter(t => t.status === "Pending");
//             case "Approve":
//                 return tickets.filter(t => t.status === "Completed");
//             default:
//                 return tickets;
//         }

//     }, [tickets, activeTab])






//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6"
//         >

//             {/* Hero Section */}
//             <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-3xl py-16 mb-10 shadow-2xl mx-4">
//                 <div className="absolute inset-0 opacity-10">
//                     <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
//                     <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
//                 </div>
//                 <div className="relative flex flex-col items-center justify-center text-center px-6">
//                     <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-5">
//                         <Headphones size={32} className="text-white" />
//                     </div>
//                     <h1 className="text-4xl md:text-5xl font-bold mb-4">Technology Support</h1>
//                     <p className="text-lg md:text-xl text-white/90 max-w-2xl">
//                         Need help with your hardware, software, or network? We are here to help 24/7.
//                     </p>
//                 </div>
//             </div>

//             {/* Main Content - Flex Row */}
//             <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto   px-4"
//             >

//                 {/* Left Column - Form (Fixed Height) */}
//                 <div className="w-full lg:w-1/2 ">
//                     <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl h-[750px] flex flex-col">

//                         {/* Form Header */}
//                         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex-shrink-0">
//                             <div className="flex flex-row items-center gap-4">
//                                 <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
//                                     <Send size={22} className="text-white" />
//                                 </div>
//                                 <h2 className="text-xl font-bold text-white">Open a New Ticket</h2>
//                             </div>
//                         </div>

//                         {/* Form Body */}
//                         <div className="p-8 flex-1 ">
//                             <div className="flex flex-col gap-6">

//                                 {/* Priority Level */}
//                                 <div className="flex flex-col gap-2">
//                                     <label className="text-sm font-semibold text-gray-700">
//                                         Priority Level
//                                     </label>
//                                     <select
//                                         name="category"

//                                         value={list.category}
//                                         onChange={handleChange}
//                                         className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
//                                     >
//                                         <option value="">-- Select --</option>
//                                         <option value="P3 - Standard">P3 - Standard</option>
//                                         <option value="P2 - High">P2 - High</option>
//                                         <option value="P1 - Critical">P1 - Critical</option>
//                                     </select>

//                                     <label className="text-sm font-semibold text-gray-700">Manager</label>
//                                 <select
//                                     required
//                                     className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
//                                     onChange={handleManagerChange}

//                                 >
//                                     <option >-- Select Manager --</option>
//                                     {managers.map((m, i) => (
//                                         <option key={i} value={m.email}>
//                                             {m.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 </div>
                                


//                                 {/* Issue Summary */}
//                                 <div className="flex flex-col gap-2">
//                                     <label className="text-sm font-semibold text-gray-700">
//                                         Issue Summary
//                                     </label>
//                                     <input
//                                         name="summary"
                                     
//                                         value={list.summary}
//                                         onChange={handleChange}
//                                         placeholder="Short title of the problem"
//                                         className="w-full  rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
//                                     />
//                                 </div>


//                                 <div className="flex flex-col gap-2">
//                                     <label className="text-sm font-semibold text-gray-700">
//                                         Detailed Description
//                                     </label>
//                                     <textarea
//                                         name="description"
//                                         rows={4}
//                                         value={list.description}
//                                         onChange={handleChange}
//                                         placeholder="Describe your issue in detail"
//                                         className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
//                                     />
//                                 </div>

//                                 {/* Submit Button */}
//                                 <button
//                                     onClick={submitTicket}
//                                     disabled={loading}
//                                     className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex flex-row items-center justify-center gap-3"
//                                 >
//                                     {loading ? (
//                                         <>
//                                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                                             <span>Submitting...</span>
//                                         </>
//                                     ) : (
//                                         <>
//                                             <Send size={20} />
//                                             <span>Submit Ticket</span>
//                                         </>
//                                     )}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Column - Tickets (Fixed Height with Scroll) */}
//                 <div className="w-full lg:w-1/2">
//                     <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[600px] flex flex-col">

//                         {/* Tickets Header */}


//                         <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6 flex-shrink-0">
//                             <div className="flex items-center justify-between">
//                                 {/* <h2 className="text-xl font-bold text-white">System Status</h2> */}
//                                 {["Request", "Action", "Approve"].map(tab => (
//                                     <button
//                                         key={tab}
//                                         onClick={() => setActiveTab(tab as any)}
//                                         className={`font-bold  text-white ${activeTab === tab ? "text-white  bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-2" : ""
//                                             }`}
//                                     >
//                                         {tab}
//                                     </button>
//                                 ))}

//                                 <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
//                                     <p className="text-sm font-semibold text-white">Total Ticket</p>
//                                     <span className="text-white font-bold text-sm">{tickets.length}</span>

//                                 </div>
//                             </div>
//                         </div>


//                         {/* Tickets Body - Scrollable */}
//                         <div className="p-6 flex-1 overflow-y-auto flex flex-col">
//                             {filterTickets.length === 0 ? (
//                                 <div className="flex flex-col items-center justify-center flex-1">
//                                     <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
//                                         <Send size={28} className="text-gray-400" />
//                                     </div>
//                                     <p className="text-gray-500 text-center">No tickets submitted yet.</p>
//                                 </div>
//                             ) : (
//                                 <>
//                                     <div className="flex flex-col gap-4 flex-1">
//                                         {(showAll ? filterTickets : filterTickets.slice(0, 3)).map((t) => (
//                                             <div
//                                                 key={t.id}
//                                                 onClick={() => setShowPopup(t)}
//                                                 className="bg-gradient-to-br from-gray-50 to-white cursor-pointer rounded-2xl p-5 border-2 border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 flex-shrink-0"
//                                             >

//                                                 <div className="flex flex-row items-center justify-between mb-3"
//                                                 >
//                                                     <h4 className="text-lg font-bold text-indigo-600">
//                                                         Ticket : {t.ticketId}

//                                                     </h4>

//                                                     <h5 className={`text-sm font-samibold p-2  ${t.status === "Pending" ? "text-yellow-500" : t.status === "Completed" ? "text-green-500" : ""}`}>
//                                                         {t.status}

//                                                     </h5>
//                                                     <MoreVertical
//                                                         size={20}
//                                                         className="text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors"
//                                                         onClick={() => setShowPopup(t)}
//                                                     />
//                                                 </div>

//                                                 <div className="flex flex-row justify-between items-center p-1 bg-gray-50 rounded-lg mb-2">
//                                                     <p className="font-semibold text-gray-700 text-sm">
//                                                         Email Services : {t.useremail}
//                                                     </p>
//                                                     <p className="font-semibold text-gray-700 text-sm">
//                                                         VPN Gateway : {t.category}
//                                                     </p>
//                                                 </div>

//                                                 <div className="flex flex-row items-center justify-between p-1 gap-4">
//                                                     <p className="text-sm text-gray-600">
//                                                         Database Cluster : {t.summary}
//                                                     </p>
//                                                     <p className="text-sm text-gray-600 truncate max-w-[40%] text-right">
//                                                         Description : {t.description}
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>

//                                     {filterTickets.length > 3 && (
//                                         <div className="flex justify-center pt-4 flex-shrink-0">
//                                             <button
//                                                 onClick={() => setShowAll(!showAll)}
//                                                 className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
//                                             >
//                                                 {showAll ? "Show Less" : "More"}
//                                             </button>
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>


//             {showpopup && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//                     onClick={() => setShowPopup(null)}
//                 >
//                     <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">

//                         <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
//                             <div className="flex flex-row items-center justify-between">
//                                 <h3 className="text-xl font-bold text-white">Ticket : {showpopup.ticketId}</h3>
//                                 <button
//                                     className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/20 transition-colors"
//                                     onClick={() => setShowPopup(null)}
//                                 >
//                                     <X size={24} className="text-white" />
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="p-6">
//                             <div className="flex flex-col gap-4">
//                                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                                     <span className="text-xs font-semibold text-gray-500 uppercase">Email Services</span>
//                                     <span className="font-semibold text-gray-800">{showpopup.useremail}</span>
//                                 </div>

//                                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                                     <span className="text-xs font-semibold text-gray-500 uppercase">VPN Gateway</span>
//                                     <span className="font-semibold text-gray-800">{showpopup.category}</span>
//                                 </div>

//                                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                                     <span className="text-xs font-semibold text-gray-500 uppercase">Database Cluster</span>
//                                     <span className="font-semibold text-gray-800">{showpopup.summary}</span>
//                                 </div>

//                                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4  ">
//                                     <span className="text-xs font-semibold text-gray-500 uppercase">Description</span>
//                                     <p className="font-semibold text-gray-800 whitespace-pre-wrap">{showpopup.description}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ITsupport;




// import * as React from "react";
// import { useState, useMemo, useEffect } from "react";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";
// import { MoreVertical, X, Headphones, Send } from "lucide-react";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/site-users/web";
// import "@pnp/sp/site-groups";



// interface Approver {
//   id: number;
//   name: string;
//   email: string;
// }

// interface Support {
//   id?: number;
//   ticketId?: string;
//   useremail: string;
//   username: string;
//   category: string;
//   summary: string;
//   description: string;
//   status: string;
//   managerId?: number; 
//   managerName?: string;  
// }

// const ITsupport: React.FC<IIntranetPortalProps> = ({ sp, context }) => {
//   const UserEmail = context.pageContext.user.email;
//   const UserName = context.pageContext.user.displayName;

//   const initialize: Support = {
//     username: UserName,
//     useremail: UserEmail,
//     category: "",
//     summary: "",
//     description: "",
//     status: "Pending",
//     managerId: undefined,
//     managerName: "",
//   };


//   const [managers, setManagers] = React.useState<Approver[]>([]);
//   const [list, setList] = React.useState<Support>(initialize);
//   const [tickets, setTickets] = React.useState<Support[]>([]);
//   const [showpopup, setShowPopup] = React.useState<Support | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [showAll, setShowAll] = React.useState(false);

//   const [activeTab, setActiveTab] = React.useState<"Request" | "Approve" | "Action">("Request");

 
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setList((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const val = e.target.value;
//     setList((prev) => ({
//       ...prev,
//       managerId: val ? parseInt(val, 10) : undefined,
//     }));
//   };

//   const fetchApprover = async () => {
//     try {
    
//       const items = await sp.web.lists
//         .getByTitle("EmployeeDirectory")
//         .items
//         .select("Id", "Email", "Email/EMail", "Manager/EMail", "Manager/Title")
//         .expand("Email", "Manager")
//         .filter(`Email/EMail eq '${list.useremail}'`)();

//       const approverList: Approver[] = [];
//       if (items.length > 0 && items[0].Manager?.EMail) {
//         const managerEmail = items[0].Manager.EMail;
//         const managerName = items[0].Manager.Title;

   
//         const siteUser = await sp.web.ensureUser(managerEmail);

//         approverList.push({
//           id: siteUser.Id,
//           name: managerName,
//           email: managerEmail,
//         });
//       }

//       setManagers(approverList);
//     } catch (error) {
//       console.error("Error fetching approvers", error);
//     }
//   };

//   const submitTicket = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!list.category || !list.summary) {
//         alert("Please fill in required fields");
//         return;
//     }

//     try {
//       setLoading(true);

//       // Generate Custom ID Logic
//       const items = await sp.web.lists
//         .getByTitle("ITsupport")
//         .items.select("Title")
//         .orderBy("ID", false)
//         .top(1)();

//       let nextNumber = 1;
//       const currentYear = new Date().getFullYear();

//       if (items.length > 0) {
//         const lastTitle = items[0].Title;
//         if (lastTitle && lastTitle.startsWith("TCK")) {
//           const parts = lastTitle.split("-");
//           if (parts.length === 2) {
//             const lastYear = parseInt(parts[0].substring(3), 10);
//             const lastNumber = parseInt(parts[1], 10);
//             if (!isNaN(lastYear) && !isNaN(lastNumber) && lastNumber > 0) {
//               nextNumber = lastYear === currentYear ? lastNumber + 1 : 1;
//             }
//           }
//         }
//       }

//       const customId = `TCK${currentYear}-${String(nextNumber).padStart(4, "0")}`;

      
//       await sp.web.lists.getByTitle("ITsupport").items.add({
//         Title: customId,
//         UserName: list.username,
//         UserEmail: list.useremail,
//         Category: list.category,
//         Summary: list.summary,
//         Description: list.description,
//         Status: list.status,
//         ManagerId: list.managerId || null 

//       });

//       console.log("Submitted Ticket", customId);
//       setList(initialize);
//       alert(`Ticket ${customId} submitted successfully`);
      
     
//     } catch (error) {
//       console.error("Error submitting ticket:", error);
//       alert(`Error submitting ticket.`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchTickets = async () => {
//     try {
//       const currentUser = await sp.web.currentUser();
//       const userEmail = currentUser.Email;

//       const items = await sp.web.lists
//         .getByTitle("ITsupport")
//         .items.select(
//           "Id",
//           "Title",
//           "UserEmail",
//           "Category",
//           "Summary",
//           "Description",
//           "Status",
//           "Manager/Id",
//           "Manager/Title"
//         )
//         .expand("Manager")
//         .filter(`UserEmail eq '${userEmail}'`)
//         .orderBy("Id", false)();

//       const mapped: Support[] = items.map((i: any) => ({
//         id: i.Id,
//         ticketId: i.Title,
//         useremail: i.UserEmail,
//         category: i.Category,
//         summary: i.Summary,
//         description: i.Description,
//         username: i.UserName,
//         status: i.Status,
//         managerId: i.Manager ? i.Manager.Id : null,
//         managerName: i.Manager ? i.Manager.Title : "",
//       }));
//       setTickets(mapped);
//     } catch (error) {
//       console.error("Error fetching tickets:", error);
//     }
//   };

//   useEffect(() => {
//     void fetchTickets();
//     void fetchApprover();
//   }, [sp]);

//   const filterTickets = useMemo(() => {
//     switch (activeTab) {
//       case "Action":
//         return tickets.filter((t) => t.status === "Pending");
//       case "Approve":
//         return tickets.filter((t) => t.status === "Completed");
//       default:
//         return tickets;
//     }
//   }, [tickets, activeTab]);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
//       {/* Hero Section */}
//       <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-3xl py-16 mb-10 shadow-2xl mx-4">
//         <div className="absolute inset-0 opacity-10">
//           <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
//           <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
//         </div>
//         <div className="relative flex flex-col items-center justify-center text-center px-6">
//           <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-5">
//             <Headphones size={32} className="text-white" />
//           </div>
//           <h1 className="text-4xl md:text-5xl font-bold mb-4">Technology Support</h1>
//           <p className="text-lg md:text-xl text-white/90 max-w-2xl">
//             Need help with your hardware, software, or network? We are here to help 24/7.
//           </p>
//         </div>
//       </div>

//       {/* Main Content - Flex Row */}
//       <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4">
//         {/* Left Column - Form */}
//         <div className="w-full lg:w-1/2">
//           <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl h-[750px] flex flex-col">
//             {/* Form Header */}
//             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex-shrink-0">
//               <div className="flex flex-row items-center gap-4">
//                 <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
//                   <Send size={22} className="text-white" />
//                 </div>
//                 <h2 className="text-xl font-bold text-white">Open a New Ticket</h2>
//               </div>
//             </div>

//             {/* Form Body */}
//             <div className="p-8 flex-1 ">
//               <div className="flex flex-col gap-6">
//                 {/* Priority Level */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-gray-700">Priority Level</label>
//                   <select
//                     name="category"
//                     value={list.category}
//                     onChange={handleChange}
//                     className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
//                   >
//                     <option value="">-- Select --</option>
//                     <option value="P3 - Standard">P3 - Standard</option>
//                     <option value="P2 - High">P2 - High</option>
//                     <option value="P1 - Critical">P1 - Critical</option>
//                   </select>
//                 </div>

//                 {/* Manager Select */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-gray-700">Manager</label>
//                   <select
//                     required
//                     name="managerId"
//                     value={list.managerId || ""}
//                     onChange={handleManagerChange}
//                     className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
//                   >
//                     <option value="">-- Select Manager --</option>
//                     {/* Safe mapping because managers is initialized as empty array */}
//                     {managers.map((m) => (
//                       <option key={m.id} value={m.id}>
//                         {m.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Issue Summary */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-gray-700">Issue Summary</label>
//                   <input
//                     name="summary"
//                     value={list.summary}
//                     onChange={handleChange}
//                     placeholder="Short title of the problem"
//                     className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
//                   />
//                 </div>

//                 {/* Detailed Description */}
//                 <div className="flex flex-col gap-2">
//                   <label className="text-sm font-semibold text-gray-700">
//                     Detailed Description
//                   </label>
//                   <textarea
//                     name="description"
//                     rows={4}
//                     value={list.description}
//                     onChange={handleChange}
//                     placeholder="Describe your issue in detail"
//                     className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
//                   />
//                 </div>

//                 {/* Submit Button */}
//                 <button
//                   onClick={submitTicket}
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex flex-row items-center justify-center gap-3"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                       <span>Submitting...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Send size={20} />
//                       <span>Submit Ticket</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Tickets */}
//         <div className="w-full lg:w-1/2">
//           <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[600px] flex flex-col">
//             <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6 flex-shrink-0">
//               <div className="flex items-center justify-between">
//                 {["Request", "Action", "Approve"].map((tab) => (
//                   <button
//                     key={tab}
//                     onClick={() => setActiveTab(tab as any)}
//                     className={`font-bold text-white ${
//                       activeTab === tab
//                         ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-2"
//                         : ""
//                     }`}
//                   >
//                     {tab}
//                   </button>
//                 ))}

//                 <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
//                   <p className="text-sm font-semibold text-white">Total Ticket</p>
//                   <span className="text-white font-bold text-sm">{tickets.length}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 flex-1 overflow-y-auto flex flex-col">
//               {filterTickets.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center flex-1">
//                   <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
//                     <Send size={28} className="text-gray-400" />
//                   </div>
//                   <p className="text-gray-500 text-center">No tickets submitted yet.</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="flex flex-col gap-4 flex-1">
//                     {(showAll ? filterTickets : filterTickets.slice(0, 3)).map((t) => (
//                       <div
//                         key={t.id}
//                         onClick={() => setShowPopup(t)}
//                         className="bg-gradient-to-br from-gray-50 to-white cursor-pointer rounded-2xl p-5 border-2 border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 flex-shrink-0"
//                       >
//                         <div className="flex flex-row items-center justify-between mb-3">
//                           <h4 className="text-lg font-bold text-indigo-600">
//                             Ticket : {t.ticketId}
//                           </h4>

//                           <h5
//                             className={`text-sm font-samibold p-2 ${
//                               t.status === "Pending"
//                                 ? "text-yellow-500"
//                                 : t.status === "Completed"
//                                 ? "text-green-500"
//                                 : ""
//                             }`}
//                           >
//                             {t.status}
//                           </h5>
//                           <MoreVertical
//                             size={20}
//                             className="text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors"
//                             onClick={() => setShowPopup(t)}
//                           />
//                         </div>

//                         <div className="flex flex-row justify-between items-center p-1 bg-gray-50 rounded-lg mb-2">
//                           <p className="font-semibold text-gray-700 text-sm">
//                             Email Services : {t.useremail}
//                           </p>
//                           <p className="font-semibold text-gray-700 text-sm">
//                             Category : {t.category}
//                           </p>
//                         </div>

//                         <div className="flex flex-row items-center justify-between p-1 gap-4">
//                           <p className="text-sm text-gray-600">Summary : {t.summary}</p>
//                           <p className="text-sm text-gray-600 truncate max-w-[40%] text-right">
//                             {t.description}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {filterTickets.length > 3 && (
//                     <div className="flex justify-center pt-4 flex-shrink-0">
//                       <button
//                         onClick={() => setShowAll(!showAll)}
//                         className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
//                       >
//                         {showAll ? "Show Less" : "More"}
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {showpopup && (
//         <div
//           className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//           onClick={() => setShowPopup(null)}
//         >
//           <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
//             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
//               <div className="flex flex-row items-center justify-between">
//                 <h3 className="text-xl font-bold text-white">Ticket : {showpopup.ticketId}</h3>
//                 <button
//                   className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/20 transition-colors"
//                   onClick={() => setShowPopup(null)}
//                 >
//                   <X size={24} className="text-white" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               <div className="flex flex-col gap-4">
//                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                   <span className="text-xs font-semibold text-gray-500 uppercase">
//                     Email Services
//                   </span>
//                   <span className="font-semibold text-gray-800">{showpopup.useremail}</span>
//                 </div>
//                   <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                   <span className="text-xs font-semibold text-gray-500 uppercase">Manager</span>
//                   <span className="font-semibold text-gray-800">{showpopup.managerName }</span>
//                 </div>

//                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                   <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
//                   <span className="font-semibold text-gray-800">{showpopup.category}</span>
//                 </div>

//                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
//                   <span className="text-xs font-semibold text-gray-500 uppercase">Summary</span>
//                   <span className="font-semibold text-gray-800">{showpopup.summary}</span>
//                 </div>

//                 <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4  ">
//                   <span className="text-xs font-semibold text-gray-500 uppercase">
//                     Description
//                   </span>
//                   <p className="font-semibold text-gray-800 whitespace-pre-wrap">
//                     {showpopup.description}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ITsupport;




//---- Full working Code---//

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { IIntranetPortalProps } from "../IIntranetPortalProps";
import { MoreVertical, X, Headphones, Send, CheckCircle, XCircle } from "lucide-react";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";

interface Approver {
  id: number;
  name: string;
  email: string;
}

interface Support {
  id?: number;
  ticketId?: string;
  useremail: string;
  username: string;
  category: string;
  summary: string;
  description: string;
  status: string;
  managerId?: number;
  managerName?: string;
  managerEmail?: string; 
}

const ITsupport: React.FC<IIntranetPortalProps> = ({ sp, context }) => {
  // Normalize email to lowercase for comparison safety
  const UserEmail = context.pageContext.user.email?.toLowerCase();
  const UserName = context.pageContext.user.displayName;

  const initialize: Support = {
    username: UserName,
    useremail: UserEmail,
    category: "",
    summary: "",
    description: "",
    status: "Pending",
    managerId: undefined,
    managerName: "",
    managerEmail: "",
  };

  const [managers, setManagers] = React.useState<Approver[]>([]);
  const [list, setList] = React.useState<Support>(initialize);
  const [tickets, setTickets] = React.useState<Support[]>([]);
  const [showpopup, setShowPopup] = React.useState<Support | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = React.useState(false);

  const [activeTab, setActiveTab] = React.useState<"Request" | "Approve" | "Action">("Request");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setList((prev) => ({ ...prev, [name]: value }));
  };

  const handleManagerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const SelectManager = e.target.value;
    setList((prev) => ({
      ...prev,
      managerId: SelectManager ? parseInt(SelectManager, 10) : undefined,
    }));
  };

  const fetchApprover = async () => {
    try {
      const items = await sp.web.lists
        .getByTitle("EmployeeDirectory")
        .items.select("Id", "Email/EMail", "Manager/EMail", "Manager/Title")
        .expand("Email", "Manager")
        .filter(`Email/EMail eq '${list.useremail}'`)();

      const approverList: Approver[] = [];
      if (items.length > 0 && items[0].Manager?.EMail) {
        const managerEmail = items[0].Manager.EMail;
        const managerName = items[0].Manager.Title;

        const siteUser = await sp.web.ensureUser(managerEmail);

        approverList.push({
          id: siteUser.Id,
          name: managerName,
          email: managerEmail,
        });
      }

      setManagers(approverList);
    } catch (error) {
      console.error("Error fetching approvers", error);
    }
  };

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!list.category || !list.summary) {
      alert("Please fill in required fields");
      return;
    }

    try {
      setLoading(true);

      const items = await sp.web.lists
        .getByTitle("ITsupport")
        .items.select("Title")
        .orderBy("ID", false)
        .top(1)();

      let nextNumber = 1;
      const currentYear = new Date().getFullYear();

      if (items.length > 0) {
        const lastTitle = items[0].Title;
        if (lastTitle && lastTitle.startsWith("TCK")) {
          const parts = lastTitle.split("-");
          if (parts.length === 2) {
            const lastYear = parseInt(parts[0].substring(3), 10);
            const lastNumber = parseInt(parts[1], 10);
            if (!isNaN(lastYear) && !isNaN(lastNumber) && lastNumber > 0) {
              nextNumber = lastYear === currentYear ? lastNumber + 1 : 1;
            }
          }
        }
      }

      const customId = `TCK${currentYear}-${String(nextNumber).padStart(4, "0")}`;

      await sp.web.lists.getByTitle("ITsupport").items.add({
        Title: customId,
        UserName: list.username,
        UserEmail: list.useremail,
        Category: list.category,
        Summary: list.summary,
        Description: list.description,
        Status: list.status,
        ManagerId: list.managerId || null,
      });

      console.log("Submitted Ticket", customId);
      setList(initialize);
      alert(`Ticket ${customId} submitted successfully`);
      
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert(`Error submitting ticket.`);
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
    
      
      const items = await sp.web.lists
        .getByTitle("ITsupport")
        .items.select(
          "Id",
          "Title",
          "UserEmail",
          "Category",
          "Summary",
          "Description",
          "Status",
          "Manager/Id",
          "Manager/Title",
          "Manager/EMail" 
        )
        .expand("Manager")
        
        .filter(`UserEmail eq '${UserEmail}' or Manager/EMail eq '${UserEmail}'`)
        .orderBy("Id", false)();

      const mapped: Support[] = items.map((i: any) => ({
        id: i.Id,
        ticketId: i.Title,
        useremail: i.UserEmail,
        category: i.Category,
        summary: i.Summary,
        description: i.Description,
        username: i.UserName,
        status: i.Status,
        managerId: i.Manager ? i.Manager.Id : null,
        managerName: i.Manager ? i.Manager.Title : "",
        managerEmail: i.Manager ? i.Manager.EMail : "", 
      }));
      setTickets(mapped);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const UpdateTicketStatus = async (id: number, status: "Completed" | "Rejected") => {
    try {
      await sp.web.lists.getByTitle("ITSupport").items.getById(id).update({ Status: status });
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      setShowPopup(null);
    } catch (error) {
      console.log(error);
      alert("Error updating status");
    }
  };

  useEffect(() => {
    void fetchTickets();
    void fetchApprover();
  }, [sp]);

  const filterTickets = useMemo(() => {
    switch (activeTab) {
      case "Action":
        return tickets.filter((t) => t.status === "Pending");
      case "Approve":
        return tickets.filter((t) => t.status === "Completed");
      default:
        return tickets;
    }
  }, [tickets, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-3xl py-16 mb-10 shadow-2xl mx-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative flex flex-col items-center justify-center text-center px-6">
          <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-5">
            <Headphones size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Technology Support</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl whitespace-nowrap">
            Need help with your hardware, software, or network? We are here to help 24/7.
          </p>
        </div>
      </div>

      {/* Main Content - Flex Row */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4">
        {/* Left Column - Form */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl h-[750px] flex flex-col">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex-shrink-0">
              <div className="flex flex-row items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                  <Send size={22} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Open a New Ticket</h2>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-8 flex-1 ">
              <div className="flex flex-col gap-6">
                {/* Priority Level */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Priority Level</label>
                  <select
                    name="category"
                    value={list.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
                  >
                    <option value="">-- Select --</option>
                    <option value="P3 - Standard">P3 - Standard</option>
                    <option value="P2 - High">P2 - High</option>
                    <option value="P1 - Critical">P1 - Critical</option>
                  </select>
                </div>

                {/* Manager Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Manager</label>
                  <select
                    required
                    name="managerId"
                    value={list.managerId || ""}
                    onChange={handleManagerChange}
                    className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white font-medium text-gray-700"
                  >
                    <option value="">-- Select Manager --</option>

                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Issue Summary */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">Issue Summary</label>
                  <input
                    name="summary"
                    value={list.summary}
                    onChange={handleChange}
                    placeholder="Short title of the problem"
                    className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Detailed Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Detailed Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={list.description}
                    onChange={handleChange}
                    placeholder="Describe your issue in detail"
                    className="w-full rounded-xl border-2 border-gray-200 p-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={submitTicket}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex flex-row items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tickets */}
        <div className="w-full lg:w-1/2">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[750px] flex flex-col">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                {["Request", "Action", "Approve"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`font-bold text-white ${
                      activeTab === tab
                        ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-2"
                        : ""
                    }`}
                  >
                    {tab}
                  </button>
                ))}

                <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <p className="text-sm font-semibold text-white">Total Ticket</p>
                  <span className="text-white font-bold text-sm">{tickets.length}</span>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto flex flex-col">
              {filterTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Send size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-center">No tickets found.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 flex-1">
                    {(showAll ? filterTickets : filterTickets.slice(0, 3)).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setShowPopup(t)}
                        className="bg-gradient-to-br from-gray-50 to-white cursor-pointer rounded-2xl p-5 border-2 border-gray-100 transition-all duration-300 hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 flex-shrink-0"
                      >
                        <div className="flex flex-row items-center justify-between mb-3">
                          <h4 className="text-lg font-bold text-indigo-600">
                            Ticket : {t.ticketId}
                          </h4>

                          <h5
                            className={`text-sm font-samibold p-2 rounded-lg ${
                              t.status === "Pending"
                                ? "text-yellow-600 bg-yellow-100"
                                : t.status === "Completed"
                                ? "text-green-600 bg-green-100"
                                : "text-red-600 bg-red-100"
                            }`}
                          >
                            {t.status}
                          </h5>
                          <MoreVertical
                            size={20}
                            className="text-indigo-600 cursor-pointer hover:text-indigo-800 transition-colors"
                            onClick={() => setShowPopup(t)}
                          />
                        </div>

                        <div className="flex flex-row justify-between items-center p-1 bg-gray-50 rounded-lg mb-2">
                          <p className="font-semibold text-gray-700 text-sm">
                            Email Services : {t.useremail}
                          </p>
                          <p className="font-semibold text-gray-700 text-sm">
                            Category : {t.category}
                          </p>
                        </div>

                        <div className="flex flex-row items-center justify-between p-1 gap-4">
                          <p className="text-sm text-gray-600">Summary : {t.summary}</p>
                          <p className="text-sm text-gray-600 truncate max-w-[40%] text-right">
                            {t.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filterTickets.length > 3 && (
                    <div className="flex justify-center pt-4 flex-shrink-0">
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
                      >
                        {showAll ? "Show Less" : "More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showpopup && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowPopup(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <div className="flex flex-row items-center justify-between">
                <h3 className="text-xl font-bold text-white">Ticket : {showpopup.ticketId}</h3>
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-white/20 transition-colors"
                  onClick={() => setShowPopup(null)}
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Email Services
                  </span>
                  <span className="font-semibold text-gray-800">{showpopup.useremail}</span>
                </div>
                <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Manager</span>
                  <span className="font-semibold text-gray-800">{showpopup.managerName}</span>
                </div>

                <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
                  <span className="font-semibold text-gray-800">{showpopup.category}</span>
                </div>

                <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Summary</span>
                  <span className="font-semibold text-gray-800">{showpopup.summary}</span>
                </div>

                <div className="flex flex-col gap-1 bg-gray-50 rounded-xl p-4  ">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Description
                  </span>
                  <p className="font-semibold text-gray-800 whitespace-pre-wrap">
                    {showpopup.description}
                  </p>
                </div>
              </div>

              {/* 3. Logic: Only show buttons if Status is Pending AND Logged In User Email == Manager Email */}
              {showpopup.status === "Pending" &&
                showpopup.managerEmail &&
                UserEmail &&
                showpopup.managerEmail.toLowerCase() === UserEmail.toLowerCase() && (
                  <div className="flex gap-4 pt-4 border-t border-gray-100 mt-4">
                    <button
                      onClick={() => UpdateTicketStatus(showpopup.id!, "Completed")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => UpdateTicketStatus(showpopup.id!, "Rejected")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITsupport;