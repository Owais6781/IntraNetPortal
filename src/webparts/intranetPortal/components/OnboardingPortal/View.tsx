

// import * as React from "react";
// import { useState, useEffect } from "react";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";
// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/attachments";

// import {
//   CheckCircle,
//   Clock,
//   Upload,
//   User,
//   // Briefcase,
//   ClipboardCheck,
//   ShieldCheck,
//   // ArrowLeft
// } from "lucide-react";
// import { 
//   //useNavigate, 
//   useParams } from "react-router-dom";

// interface OnboardingItem {
//   id: number;
//   title: string;
//   firstName: string;
//   lastName: string;
//   dob: string;
//   gender: string;
//   job: string;
//   department: string;
//   mobile: string;
//   email: string;
//   presentAddress: string;
//   permenentAddress: string;
// }

// interface verifyState {
//   profile: boolean;
//   education: boolean;
//   identity: boolean;
//   companyName: string;
//   Verifier: string;
//   date: string;
// }

// interface DocumentFech {
//   id: number;
//   title: string;
//   documentCategory: string;
// }

// // const processFlow = [
// //   { title: "Interviews", icon: <Briefcase />, status: "completed" },
// //   { title: "Assessment", icon: <ClipboardCheck />, status: "completed" },
// //   { title: "Verification", icon: <ShieldCheck />, status: "pending" },
// //   { title: "Onboarding", icon: <User />, status: "in-progress" },
// // ];

// /* ================= COMPONENT ================= */


// const ViewForm: React.FC<IIntranetPortalProps> = ({ sp, context }) => {
//   //  const navigate=useNavigate()
//   const { id } = useParams<{ id: string }>();
//   const ViewId = Number(id);
//   const [recruitmentDetails, setRecruitmentDetails] = useState<OnboardingItem[]>([]);
//   const [documents, setDocument] = useState<DocumentFech[]>([]);
//   const [files, setFiles] = useState<Record<string, File | null>>({});
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [loading, setLoading] = useState(true);

//   const [verificationBy, setVerificationBy] = useState("");
//   const [verify, setVerify] = useState<verifyState>({
//     profile: false,
//     education: false,
//     identity: false,
//     companyName: "",
//     Verifier: "",
//     date: "",
//   });




//  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     e.preventDefault();
//     const { name, files } = e.target;
//     if (!files || files.length === 0) return;
//     console.log("Selected file for", name, ":", files);
//     setFiles((prev) => ({ ...prev, [name]: files[0] }));
//   };



//     const UpdateDocument = async (file: File, title: string, documentCategory: string) => {
//     try {
//       const exitingItem = await sp.web.lists
//         .getByTitle("OnboardingAttachment")
//         .items.filter(`Title  eq '${title}' and  DocumentCategory   eq '${documentCategory}'`)();

//       let itemId: number;

//       if (exitingItem.length > 0) {
//         itemId = exitingItem[0].Id;

//         const attchment = await sp.web.lists.getByTitle("OnboardingAttachment").items.getById(itemId).attachmentFiles();

//         for (const att of attchment) {
//           await sp.web.lists
//             .getByTitle("OnboardingAttachment")
//             .items.getById(itemId)
//             .attachmentFiles.getByName(att.FileName)
//             .delete();
//         }
//       } else {
//         const addresult = await sp.web.lists.getByTitle("OnboardingAttachment").items.add({
//           Title: title,
//           DocumentCategory: documentCategory,
//         });
//         itemId = addresult.Id;
//       }
//       await sp.web.lists.getByTitle("OnboardingAttachment").items.getById(itemId).attachmentFiles.add(file.name, file);
//     } catch (error) {
//       console.error("Update document failed:", error);
//     }
//   };


//   const handleVerification = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setVerify((prev) => ({ ...prev, [name]: value }));
//   };


//   const handleCheckbox = (key: "profile" | "education" | "identity") => {
//     setVerify((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };



//    const handleVerifecationSubmit = async () => {
//     try {
//       if (recruitmentDetails.length === 0) {
//         return;
//       }
//       const itmeId = recruitmentDetails[0].id;

//       await sp.web.lists
//         .getByTitle("Onboarding")
//         .items.getById(itmeId)
//         .update({
//           Verification: verificationBy,
//           VerifyDate: verify.date || null,
//           CompanyName: verificationBy === "ThirdParty" ? verify.companyName : "",
//           VerifyBy: verificationBy === "ThirdParty" ? verify.Verifier : "",
//           ProfileInfo: verify.profile === true ? "Yes" : "No",
//           EducationDocuments: verify.education === true ? "Yes" : "No",
//           IdentityDocuments: verify.identity === true ? "Yes" : "No",
//         });
//       alert(" verification check");
//     } catch (error) {
//       console.log(error);
//       alert(" verification error");
//     }
//   };




// const Docomentfetch = async (title: string) => {
//   if (!title) return;

//   try {
//     const items = await sp.web.lists
//       .getByTitle("OnboardingAttachment")
//       .items
//       .filter(`Title eq '${title}'`)   // 🔥 match title
//       .select("Id", "Title", "DocumentCategory")();

//     const mapped: DocumentFech[] = items.map((i:any) => ({
//       id: i.Id,
//       title: i.Title,
//       documentCategory: i.DocumentCategory,
//     }));

//     setDocument(mapped);
//   } catch (error) {
//     console.error("SharePoint Fetch Error Document fetching:", error);
//   }
// };


//   const fetchData = async () => {
//     if (!ViewId) return;
//     try {
//       const item = await sp.web.lists
//         .getByTitle("Onboarding")
//         .items.getById(ViewId)
//         .select(
//           "Id",
//           "Title",
//           "FirstName",
//           "LastName",
//           "DateofBirth",
//           "Gender",
//           "Mobile",
//           "Email",
//           "Job",
//           "Department",
//           "PresentAddress",
//           "PermanentAddress",
//           "Verification",
//           "VerifyDate",
//           "CompanyName",
//           "VerifyBy",
//           "ProfileInfo",
//           "EducationDocuments",
//           "IdentityDocuments"
//         )();
//       console.log("SharePoint Fetch :", item);

//       if (!item) {
//         setRecruitmentDetails([]);
//         return;
//       }

//         await Docomentfetch(item.Title);

//       setVerify({

//         date: item.VerifyDate ? new Date(item.VerifyDate).toISOString().split("T")[0] : "",
//         companyName: item.CompanyName || "",
//         Verifier: item.VerifyBy || "",
//         profile: item.ProfileInfo === "Yes",
//         education: item.EducationDocuments === "Yes",
//         identity: item.IdentityDocuments === "Yes",
//       });

//       setVerificationBy(item.Verification || "");

//       setRecruitmentDetails([
//         {
//           id: item.Id,
//           title: item.Title,
//           firstName: item.FirstName,
//           lastName: item.LastName,
//           dob: item.DateofBirth,
//           gender: item.Gender,
//           department: item.Department,
//           job: item.Job,
//           mobile: item.Mobile,
//           email: item.Email,
//           presentAddress: item.PresentAddress,
//           permenentAddress: item.PermanentAddress,
//         },
//       ]);
//     } catch (error) {
//       console.error("SharePoint Fetch Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };




//   const handleSubmit = async () => {
//     if (recruitmentDetails.length === 0) return;

//     setLoading(true);

//     const empId = recruitmentDetails[0].title;
//     try {
//       for (const key in files) {
//         if (files[key]) {
//           await UpdateDocument(files[key]!, empId, key);
//         }
//       }


//       alert("All documents uploaded successfully ✅");
//     } catch (error) {
//       console.log(error);
//       alert("Document upload failed ❌");
//     }
//   }

//   useEffect(() => {
//     void fetchData();
//      void Docomentfetch("title");

//   }, [sp, ViewId]);

//   const isDocument = (category: string) => {
//     return documents.some((doc) => doc.documentCategory === category);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading data...</p>
//         </div>
//       </div>
//     );
//   }

//   const educationDocuments = [
//     { label: "10th Marksheet", name: "marksheet10" },
//     { label: "12th (10+2) Marksheet", name: "marksheet12" },
//     { label: "Graduation Certificate", name: "graduation" },
//     { label: "Post Graduation Certificate", name: "postGraduation" },
//     { label: "Resume", name: "resume" },
//     { label: "Experience Certificate", name: "experienceCertificate" },
//   ];

//   const identityDocuments = [
//     { label: "Photograph", name: "photo" },
//     { label: "Pan Card", name: "panCard" },
//     { label: "Aadhaar Card / Passport", name: "aadhaarPassport" },
//     { label: "Voter Card", name: "voterCard" },
//   ];



// const currentEmpId = recruitmentDetails.length > 0 ? recruitmentDetails[0].title?.trim() :"" ;

//   const AllCetogory = [...educationDocuments.map((d) => d.name), ...identityDocuments.map((d) => d.name)];


// const filteredDocuments = documents.filter( (doc) => doc.title === currentEmpId);

// const isAllDocumentsUploaded =
//   AllCetogory.length > 0 &&
//   AllCetogory.every((cat) =>
//     filteredDocuments.some(
//       (doc) => doc.documentCategory?.trim() === cat.trim()
//     )
//   );

//   const isProfile =
//     recruitmentDetails.length > 0 &&
//     recruitmentDetails.every(
//       (item) =>
//         item.firstName &&
//         item.lastName &&
//         item.email &&
//         item.mobile &&
//         item.dob &&
//         item.presentAddress &&
//         item.permenentAddress &&
//         item.job
//     );

//   const AllVerify = verify.profile === true && verify.education === true && verify.identity === true;

//   const isFinalApproval=isProfile&&isAllDocumentsUploaded&&AllVerify;
//   const steps = [
//     { title: "Profile Information", status: isProfile ? "completed" : "pending" },
//     { title: "Document Upload", status: isAllDocumentsUploaded ? "completed" : "pending" },
//     { title: "Verification", status: AllVerify ? "completed" : "pending" },
//     { title: "Final Approval", status: isFinalApproval ? "completed" : "pending" },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4 lg:p-8">
//       <div className="max-w-6xl mx-auto space-y-8">

//         {/* HEADER */}
//         <div className="text-center lg:text-left">
//           <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
//             Employee Onboarding Portal
//           </h1>
//           <p className="text-gray-600 text-lg">Streamline your candidate onboarding process</p>
//         </div>

//         {/* STATUS CARD */}
//         {/* <div className="bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-white/50">
//           <div className="flex justify-between items-center">
//             <h2 className="text-2xl font-bold text-gray-800">Application Status</h2>
//             <span className="px-6 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-semibold shadow-lg">
//               In Progress
//             </span>
//           </div>
//         </div> */}

//         {/* CANDIDATE DETAILS */}
//         {recruitmentDetails.map((section) => (
//           <div
//             key={section.id}
//             className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50"
//           >
//             <div className="flex justify-between items-start mb-8">
//                  {/* <button 
//                className="flex items-center justify-center "
//                onClick={()=>navigate(-1)}> 
//                   <ArrowLeft className="w-5 h-5" />
//                   </button> */}
//               <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3  mr-10">
//                 <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white">
//                   <User size={24} />
//                 </div>
//                 Candidate Details
//               </h2>
//               <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-full font-semibold">
//                 ID: {section.title}
//               </span>
//             </div>

//             <div className="flex flex-col   gap-6">

//               <div className=" flex gap-2">
//                 <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
//                      Name
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl font-medium text-gray-800 border border-gray-200">
//                     {section.firstName}   {section.lastName}
//                   </div>
//                 </div>
//                 {/* <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
//                     Last Name
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl font-medium text-gray-800 border border-gray-200">
//                     {section.lastName}
//                   </div>

//                 </div> */}
//                 <div className=" flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
//                     Date of Birth
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.dob}
//                   </div>
//                 </div>
//                 <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
//                     Gender
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.gender}
//                   </div>
//                 </div>
//                   <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
//                     Department
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.department}
//                   </div>
//                 </div>

//               </div>


//               <div className=" flex gap-2">
//                 {/* <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                     Gender
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.gender}
//                   </div>
//                 </div> */}
//                 {/* <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                     Department
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.department}
//                   </div>
//                 </div> */}
//                 <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                     Job Role
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.job}
//                   </div>
//                 </div>
//                  <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                     Mobile
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.mobile}
//                   </div>
//                 </div>
//                  <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                     Email
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.email}
//                   </div>
//                 </div>

//               </div>

//               {/* <div className=" flex gap-2">
//                 <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
//                     Mobile
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.mobile}
//                   </div>
//                 </div>
//                 <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
//                     Email
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.email}
//                   </div>
//                 </div>
//                    <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
//                     Other(Optinal)
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.email}
//                   </div>
//                 </div>
//               </div> */}


//               <div className=" flex gap-2">
//                 <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
//                     Present Address
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.presentAddress}
//                   </div>
//                 </div>

//                 <div className="flex-1">
//                   <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                     <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
//                     Permanent Address
//                   </label>
//                   <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-gray-800 border border-gray-200">
//                     {section.permenentAddress}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}

//         {/* DOCUMENTS SECTION */}
//         <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-8">

//           {/* Education Documents */}
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white">
//               <ClipboardCheck size={24} />
//             </div>
//             Education Documents
//           </h2>

//           <div className="flex flex-wrap gap-4 mb-8">
//             {educationDocuments.map((doc) => {
//               const uploaded = isDocument(doc.name);
//               return (
//                 <div key={doc.name}   className="w-full md:w-[48%] group" >
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     {doc.label}
//                   </label>
//                   <label
//                     className={`flex items-center justify-center gap-3 cursor-pointer
//                       border-2 border-dashed rounded-2xl px-6 py-4
//                       transition-all duration-300 hover:shadow-lg
//                       ${
//                         uploaded || files[doc.name]
//                           ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
//                           : "border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200"
//                       }`}
//                   >
//                     {!isEditMode && (
//                       uploaded ? (
//                         <span className="flex items-center gap-2 text-green-600 font-medium">
//                           <CheckCircle size={20} className="animate-pulse" />
//                           Uploaded   {doc.name}
//                         </span>
//                       ) : (
//                         <span className="flex items-center gap-2 text-amber-600 font-medium">
//                           <Clock size={20} className="animate-pulse" />
//                           Pending
//                         </span>
//                       )
//                     )}

//                     {isEditMode && (
//                       <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium">
//                         <Upload size={18} />
//                         <input
//                           type="file"
//                           name={doc.name}
//                           className="hidden"
//                           onChange={handleFileChange}
//                         />
//                         {files[doc.name]
//                           ? files[doc.name]!.name
//                           : uploaded
//                           ? "Replace file"
//                           : "Upload file"}
//                       </label>
//                     )}
//                   </label>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Identity Documents */}
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white">
//               <ShieldCheck size={24} />
//             </div>
//             Identity Documents
//           </h2>

//           <div className=" flex flex-wrap gap-4">
//             {identityDocuments.map((doc) => {
//               const uploaded = isDocument(doc.name);
//               return (
//                 <div key={doc.name} className="w-full md:w-[48%] group">
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     {doc.label}
//                   </label>

//                   <label
//                     className={`flex items-center justify-center gap-3 cursor-pointer
//                       border-2 border-dashed rounded-2xl px-6 py-4
//                       transition-all duration-300 hover:shadow-lg
//                       ${
//                         uploaded || files[doc.name]
//                           ? "border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
//                           : "border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200"
//                       }`}
//                   >
//                     {!isEditMode && (
//                       uploaded ? (
//                         <span className="flex items-center gap-2 text-green-600 font-medium">
//                           <CheckCircle size={20} className="animate-pulse" />
//                           Uploaded  {doc.name}
//                         </span>
//                       ) : (
//                         <span className="flex items-center gap-2 text-amber-600 font-medium">
//                           <Clock size={20} className="animate-pulse" />
//                           Pending
//                         </span>
//                       )
//                     )}

//                     {isEditMode && (
//                       <label className="cursor-pointer text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium">
//                         <Upload size={18} />
//                         <input
//                           type="file"
//                           name={doc.name}
//                           className="hidden"
//                           onChange={handleFileChange}
//                         />
//                         {files[doc.name]
//                           ? files[doc.name]!.name
//                           : uploaded
//                           ? "Replace file"
//                           : "Upload file"}
//                       </label>
//                     )}
//                   </label>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Action Buttons */}
//           {isEditMode ? (
//             <div className="flex justify-end gap-4 mt-8">
//               <button
//                 onClick={() => {
//                   setIsEditMode(false);
//                   setFiles({});
//                 }}
//                 className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-300 hover:shadow-lg"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleSubmit}
//                 className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:shadow-xl transform hover:scale-105"
//               >
//                 Save Documents
//               </button>
//             </div>
//           ) : (
//             <div className="flex justify-end gap-4 mt-8">
//               <button
//                 onClick={() => setIsEditMode(true)}
//                               className="px-4 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"

//                 // className="px-6 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-xl font-semibold hover:from-indigo-200 hover:to-purple-200 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
//               >
//                 Edit Documents
//               </button>
//             </div>
//           )}
//         </div>

//         {/* VERIFICATION SECTION */}
//         <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
//               <ShieldCheck size={24} />
//             </div>
//             Verification Process
//           </h2>

//           <div className="flex flex-wrap gap-2 mb-6">

//               <div className="flex-1">
//               <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                 <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
//                 Select Verification Type
//               </label>
//               <select
//                 value={verificationBy}
//                 onChange={(e) => setVerificationBy(e.target.value)}
//                 className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-300"
//               >
//                 <option value="">-- Select --</option>
//                 <option value="HR">HR Department</option>
//                 <option value="ThirdParty">Third Party Agency</option>
//               </select>
//             </div>


//             <div className="flex-1">
//               <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                 <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
//                 Verification Date
//               </label>
//               <input
//                 type="date"
//                 name="date"
//                 value={verify.date}
//                 onChange={handleVerification}
//                 className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-300"
//               />
//             </div>
//           </div>

//           {verificationBy === "ThirdParty" && (
//             <div className="flex flex-wrap gap-6 mb-6 animate-fadeIn">
//               <div className="flex-1">
//                 <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                   <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
//                   Company Name
//                 </label>
//                 <input
//                   type="text"
//                   name="companyName"
//                   value={verify.companyName}
//                   onChange={handleVerification}
//                   placeholder="Enter company name"
//                   className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-300"
//                 />
//               </div>

//               <div className="flex-1">
//                 <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
//                   <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
//                   Verified By
//                 </label>
//                 <input
//                   type="text"
//                   name="Verifier"
//                   value={verify.Verifier}
//                   onChange={handleVerification}
//                   placeholder="Enter verifier name"
//                   className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-300"
//                 />
//               </div>
//             </div>
//           )}

//           {(verificationBy === "HR" || verificationBy === "ThirdParty") && (
//             <div className="border-2 border-purple-200 rounded-2xl p-6 bg-gradient-to-r from-purple-50 to-pink-50">
//               <h3 className="font-bold text-gray-800 mb-4">
//                 Verify Candidate Details
//               </h3>

//               <div className="flex-1">
//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <input
//                     type="checkbox"
//                     checked={verify.profile}
//                     onChange={() => handleCheckbox("profile")}
//                     className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
//                   />
//                   <span className="text-gray-700 group-hover:text-purple-700 transition-colors font-medium">
//                     Profile Information
//                   </span>
//                 </label>

//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <input
//                     type="checkbox"
//                     checked={verify.education}
//                     onChange={() => handleCheckbox("education")}
//                     className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
//                   />
//                   <span className="text-gray-700 group-hover:text-purple-700 transition-colors font-medium">
//                     Education Documents
//                   </span>
//                 </label>

//                 <label className="flex items-center gap-3 cursor-pointer group">
//                   <input
//                     type="checkbox"
//                     checked={verify.identity}
//                     onChange={() => handleCheckbox("identity")}
//                     className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
//                   />
//                   <span className="text-gray-700 group-hover:text-purple-700 transition-colors font-medium">
//                     Identity Documents
//                   </span>
//                 </label>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-end mt-6">
//             <button
//               onClick={handleVerifecationSubmit}
//               disabled={loading}
//               className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? "Submitting..." : "Submit Verification"}
//             </button>
//           </div>
//         </div>

//         {/* ONBOARDING PROGRESS */}
//         <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white">
//               <ClipboardCheck size={24} />
//             </div>
//             Onboarding Progress
//           </h2>

//           <div className="space-y-4">
//             {steps.map((step, i) => (
//               <div
//                 key={i}
//                 className={`flex justify-between items-center border-2 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg
//                   ${
//                     step.status === "completed"
//                       ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50"
//                       : step.status === "in-progress"
//                       ? "border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50"
//                       : "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
//                   }`}
//               >
//                 <span className="font-semibold text-gray-800">{step.title}</span>
//                 {step.status === "completed" ? (
//                   <CheckCircle className="text-green-500" size={24} />
//                 ) : (
//                   <Clock className="text-yellow-500" size={24} />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* HIRING PROCESS FLOW */}
//         {/* <div className="bg-white/80 backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-white/50">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white">
//               <Briefcase size={24} />
//             </div>
//             Hiring Process Timeline
//           </h2>

//           <div className="space-y-4">
//             {processFlow.map((step, i) => (
//               <div
//                 key={i}
//                 className={`border-2 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-lg
//                   ${
//                     step.status === "completed"
//                       ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50"
//                       : step.status === "in-progress"
//                       ? "border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50 animate-pulse"
//                       : "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100"
//                   }`}
//               >
//                 <div className={`text-2xl ${
//                   step.status === "completed" ? "text-green-600" :
//                   step.status === "in-progress" ? "text-blue-600" :
//                   "text-gray-400"
//                 }`}>
//                   {step.icon}
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="font-bold text-gray-800 text-lg">{step.title}</h3>
//                   {step.status === "completed" && (
//                     <span className="text-green-600 text-sm font-semibold">✓ Completed</span>
//                   )}
//                   {step.status === "in-progress" && (
//                     <span className="text-blue-600 text-sm font-semibold">• In Progress</span>
//                   )}
//                   {step.status === "pending" && (
//                     <span className="text-gray-500 text-sm">Pending</span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default ViewForm;







import * as React from "react";
import { useState, useEffect } from "react";
import { IIntranetPortalProps } from "../IIntranetPortalProps";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
//  import "./ViewForm.css";
import "./View.css";


import {
  CheckCircle,
  Clock,
  Upload,
  User,
  ClipboardCheck,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  useParams,
  // useNavigate
} from "react-router-dom";

interface OnboardingItem {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  job: string;
  department: string;
  mobile: string;
  email: string;
  presentAddress: string;
  permenentAddress: string;
}

interface VerifyState {
  profile: boolean;
  education: boolean;
  identity: boolean;
  companyName: string;
  Verifier: string;
  date: string;
}

interface DocumentFech {
  id: number;
  title: string;
  documentCategory: string;
  fileName?: string;
}

const ViewForm: React.FC<IIntranetPortalProps> = ({ sp }) => {
  //  const navigate=useNavigate()
  const { id } = useParams<{ id: string }>();
  const ViewId = Number(id);

  const [recruitmentDetails, setRecruitmentDetails] = useState<OnboardingItem[]>([]);
  const [documents, setDocument] = useState<DocumentFech[]>([]);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [verificationBy, setVerificationBy] = useState("");
  const [verify, setVerify] = useState<VerifyState>({
    profile: false,
    education: false,
    identity: false,
    companyName: "",
    Verifier: "",
    date: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { name, files } = e.target;
    if (!files || files.length === 0) return;
    setFiles((prev) => ({ ...prev, [name]: files[0] }));
  };

  const UpdateDocument = async (file: File, title: string, documentCategory: string) => {
    try {
      const exitingItem = await sp.web.lists
        .getByTitle("OnboardingAttachment")
        .items.filter(`Title eq '${title}' and DocumentCategory eq '${documentCategory}'`)();

      let itemId: number;

      if (exitingItem.length > 0) {
        itemId = exitingItem[0].Id;

        const attchment = await sp.web.lists
          .getByTitle("OnboardingAttachment")
          .items.getById(itemId)
          .attachmentFiles();

        for (const att of attchment) {
          await sp.web.lists
            .getByTitle("OnboardingAttachment")
            .items.getById(itemId)
            .attachmentFiles.getByName(att.FileName)
            .delete();
        }
      } else {
        const addresult = await sp.web.lists.getByTitle("OnboardingAttachment").items.add({
          Title: title,
          DocumentCategory: documentCategory,
        });
        itemId = addresult.Id;
      }

      await sp.web.lists
        .getByTitle("OnboardingAttachment")
        .items.getById(itemId)
        .attachmentFiles.add(file.name, file);
    } catch (error) {
      console.error("Update document failed:", error);
    }
  };

  const handleVerification = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setVerify((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (key: "profile" | "education" | "identity") => {
    setVerify((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleVerifecationSubmit = async () => {
    try {
      if (recruitmentDetails.length === 0) return;

      const itemId = recruitmentDetails[0].id;

      await sp.web.lists
        .getByTitle("Onboarding")
        .items.getById(itemId)
        .update({
          Verification: verificationBy,
          VerifyDate: verify.date || null,
          CompanyName: verificationBy === "ThirdParty" ? verify.companyName : "",
          VerifyBy: verificationBy === "ThirdParty" ? verify.Verifier : "",
          ProfileInfo: verify.profile ? "Yes" : "No",
          EducationDocuments: verify.education ? "Yes" : "No",
          IdentityDocuments: verify.identity ? "Yes" : "No",
        });

      // alert("verification check");
      const result = window.confirm("Verification check. Continue?");

      if (result) {
        console.log("User clicked OK");
      } else {
        console.log("User clicked Cancel");
      }
    } catch (error) {
      console.log(error);
      alert("verification error");
    }
  };

  // const Docomentfetch = async (title: string) => {
  //   if (!title) return;

  //   try {
  //     const items = await sp.web.lists
  //       .getByTitle("OnboardingAttachment")
  //       .items.filter(`Title eq '${title}'`)
  //       .select("Id", "Title", "DocumentCategory")();

  //     const mapped: DocumentFech[] = items.map((i: any) => ({
  //       id: i.Id,
  //       title: i.Title,
  //       documentCategory: i.DocumentCategory,
  //     }));

  //     setDocument(mapped);
  //   } catch (error) {
  //     console.error("SharePoint Fetch Error Document fetching:", error);
  //   }
  // };


  const Docomentfetch = async (title: string) => {
    if (!title) return;

    try {
      const items = await sp.web.lists
        .getByTitle("OnboardingAttachment")
        .items.filter(`Title eq '${title}'`)
        .select("Id", "Title", "DocumentCategory")();

      const mapped: DocumentFech[] = await Promise.all(
        items.map(async (i: any) => {
          const attachments = await sp.web.lists
            .getByTitle("OnboardingAttachment")
            .items.getById(i.Id)
            .attachmentFiles();

          return {
            id: i.Id,
            title: i.Title,
            documentCategory: i.DocumentCategory,
            fileName: attachments.length > 0 ? attachments[0].FileName : "",
          };
        })
      );

      setDocument(mapped);
    } catch (error) {
      console.error("SharePoint Fetch Error Document fetching:", error);
    }
  };



  const getUploadedFileName = (category: string) => {
    const found = documents.find((doc) => doc.documentCategory === category);
    return found?.fileName || "";
  };



  const fetchData = async () => {
    if (!ViewId) return;

    try {
      const item = await sp.web.lists
        .getByTitle("Onboarding")
        .items.getById(ViewId)
        .select(
          "Id",
          "Title",
          "FirstName",
          "LastName",
          "DateofBirth",
          "Gender",
          "Mobile",
          "Email",
          "Job",
          "Department",
          "PresentAddress",
          "PermanentAddress",
          "Verification",
          "VerifyDate",
          "CompanyName",
          "VerifyBy",
          "ProfileInfo",
          "EducationDocuments",
          "IdentityDocuments"
        )();

      if (!item) {
        setRecruitmentDetails([]);
        return;
      }

      await Docomentfetch(item.Title);

      setVerify({
        date: item.VerifyDate ? new Date(item.VerifyDate).toISOString().split("T")[0] : "",
        companyName: item.CompanyName || "",
        Verifier: item.VerifyBy || "",
        profile: item.ProfileInfo === "Yes",
        education: item.EducationDocuments === "Yes",
        identity: item.IdentityDocuments === "Yes",
      });

      setVerificationBy(item.Verification || "");

      setRecruitmentDetails([
        {
          id: item.Id,
          title: item.Title,
          firstName: item.FirstName,
          lastName: item.LastName,
          dob: item.DateofBirth,
          gender: item.Gender,
          department: item.Department,
          job: item.Job,
          mobile: item.Mobile,
          email: item.Email,
          presentAddress: item.PresentAddress,
          permenentAddress: item.PermanentAddress,
        },
      ]);
    } catch (error) {
      console.error("SharePoint Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (recruitmentDetails.length === 0) return;

    setLoading(true);
 setIsEditMode(false);
    const empId = recruitmentDetails[0].title;

    try {
      for (const key in files) {
        if (files[key]) {
          await UpdateDocument(files[key]!, empId, key);
        }
      }

      // alert("All documents uploaded successfully ✅");

      //  navigate(`/view-form/${id}`, { state: { refresh: Date.now() } });
    } catch (error) {
      console.log(error);
      alert("Document upload failed ❌");
    } finally {
      setLoading(false);
    }
  };




  const removeDocument = async (category: string) => {
    try {
      const currentEmpId =
        recruitmentDetails.length > 0 ? recruitmentDetails[0].title : "";

      if (!currentEmpId) {
        alert("Employee ID not found");
        return;
      }

      const items = await sp.web.lists
        .getByTitle("OnboardingAttachment")
        .items.filter(
          `Title eq '${currentEmpId}' and DocumentCategory eq '${category}'`
        )
        .select("Id")();

      if (!items || items.length === 0) {
        alert("Document not found");
        return;
      }

      await sp.web.lists
        .getByTitle("OnboardingAttachment")
        .items.getById(items[0].Id)
        .delete();


      setFiles((prev) => ({
        ...prev,
        [category]: null,
      }));

      await Docomentfetch(currentEmpId);

      // alert(`${category} document removed successfully`);
    } catch (error) {
      console.error("Remove document failed:", error);
      alert("Document remove failed");
    }
  };







  useEffect(() => {
    void fetchData();
  }, [sp, ViewId]);

  const isDocument = (category: string) => {
    return documents.some((doc) => doc.documentCategory === category);
  };

  if (loading) {
    return (
      <div className="vf-loading-page">
        <div className="vf-loading-box">
          <div className="vf-spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  const educationDocuments = [
    { label: "10th Marksheet", name: "marksheet10" },
    { label: "12th Marksheet", name: "marksheet12" },
    { label: "Graduation Certificate", name: "graduation" },
    { label: "Post Graduation Certificate", name: "postGraduation" },
    { label: "Resume", name: "resume" },
    { label: "Experience Certificate", name: "experienceCertificate" },
  ];

  const identityDocuments = [
    { label: "Photograph", name: "photo" },
    { label: "Pan Card", name: "panCard" },
    { label: "Aadhaar Card / Passport", name: "aadhaarPassport" },
    { label: "Voter Card", name: "voterCard" },
  ];




  const currentEmpId = recruitmentDetails.length > 0 ? recruitmentDetails[0].title?.trim() : "";

  const allCetogory = [
    ...educationDocuments.map((d) => d.name),
    ...identityDocuments.map((d) => d.name),
  ];

  const filteredDocuments = documents.filter((doc) => doc.title === currentEmpId);

  const isAllDocumentsUploaded =
    allCetogory.length > 0 &&
    allCetogory.every((cat) =>
      filteredDocuments.some((doc) => doc.documentCategory?.trim() === cat.trim())
    );

  const isProfile =
    recruitmentDetails.length > 0 &&
    recruitmentDetails.every(
      (item) =>
        item.firstName &&
        item.lastName &&
        item.email &&
        item.mobile &&
        item.dob &&
        item.presentAddress &&
        item.permenentAddress &&
        item.job
    );

  const allVerify = verify.profile && verify.education && verify.identity;
  const isFinalApproval = isProfile && isAllDocumentsUploaded && allVerify;

  const steps = [
    { title: "Profile Information", status: isProfile ? "completed" : "pending" },
    { title: "Document Upload", status: isAllDocumentsUploaded ? "completed" : "pending" },
    { title: "Verification", status: allVerify ? "completed" : "pending" },
    { title: "Final Approval", status: isFinalApproval ? "completed" : "pending" },
  ];

  return (
    <div className="vf-page">
      <div className="vf-container">
        <div className="vf-header">
          <h1 className="vf-main-title">Employee Onboarding Portal</h1>
          <p className="vf-subtitle">Streamline your candidate onboarding process</p>
        </div>

        {recruitmentDetails.map((section) => (
          <div key={section.id} className="vf-card">
            <div className="vf-card-top">
              <h2 className="vf-section-title">
                <span className="vf-icon-box vf-purple">
                  <User size={22} />
                </span>
                Candidate Details
              </h2>
              <span className="vf-badge">ID: {section.title}</span>
            </div>

            <div className="vf-info-group">
              <div className="vf-row">
                <div className="vf-field">
                  <label>Name</label>
                  <div className="vf-field-box">
                    {section.firstName} {section.lastName}
                  </div>
                </div>
                <div className="vf-field">
                  <label>Date of Birth</label>
                  <div className="vf-field-box">{section.dob}</div>
                </div>
                <div className="vf-field">
                  <label>Gender</label>
                  <div className="vf-field-box">{section.gender}</div>
                </div>
                <div className="vf-field">
                  <label>Department</label>
                  <div className="vf-field-box">{section.department}</div>
                </div>
              </div>

              <div className="vf-row">
                <div className="vf-field">
                  <label>Job Role</label>
                  <div className="vf-field-box">{section.job}</div>
                </div>
                <div className="vf-field">
                  <label>Mobile</label>
                  <div className="vf-field-box">{section.mobile}</div>
                </div>
                <div className="vf-field">
                  <label>Email</label>
                  <div className="vf-field-box">{section.email}</div>
                </div>
              </div>

              <div className="vf-row">
                <div className="vf-field">
                  <label>Present Address</label>
                  <div className="vf-field-box">{section.presentAddress}</div>
                </div>
                <div className="vf-field">
                  <label>Permanent Address</label>
                  <div className="vf-field-box">{section.permenentAddress}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="vf-card">
          <h2 className="vf-section-title vf-mb">
            <span className="vf-icon-box vf-green">
              <ClipboardCheck size={22} />
            </span>
            Education Documents
          </h2>

          <div className="vf-doc-grid">
            {educationDocuments.map((doc) => {
              const uploaded = isDocument(doc.name);
              const existingFileName = getUploadedFileName(doc.name);
              return (
                <div key={doc.name} className="vf-doc-item">
                  <label className="vf-doc-label">{doc.label}</label>

                  <label className={`vf-doc-box ${uploaded || files[doc.name] ? "uploaded" : ""}`}>
                    {!isEditMode &&
                      (uploaded ? (
                        <span className="vf-status success">
                          <CheckCircle size={18} />
                          {existingFileName || `Uploaded ${doc.name}`}
                        </span>
                      ) : (
                        <span className="vf-status pending">
                          <Clock size={18} />
                          Pending
                        </span>
                      ))}

                    {isEditMode && (
                      <div className="vf-edit-file-row">
                        <span className="vf-upload-label">
                          <Upload size={18} />
                          <input
                            type="file"
                            name={doc.name}
                            className="vf-hidden-input"
                            onChange={handleFileChange}
                          />
                          {files[doc.name]
                            ? files[doc.name]!.name
                            : uploaded
                              ? existingFileName
                              : "Upload file"}
                        </span>
                        {(uploaded || files[doc.name]) && (
                          <button
                            type="button"
                            className="vf-remove-btn"
                            onClick={async () => {
                              if (files[doc.name]) {
                                setFiles((prev) => ({ ...prev, [doc.name]: null }));
                                return;
                              }

                              const ok = window.confirm("Are you sure you want to remove this  document?");
                              if (ok) {
                                await removeDocument(doc.name);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </label>

                </div>
              );
            })}
          </div>

          <h2 className="vf-section-title vf-mb vf-mt">
            <span className="vf-icon-box vf-blue">
              <ShieldCheck size={22} />
            </span>
            Identity Documents
          </h2>

        

          <div className="vf-doc-grid">
            {identityDocuments.map((doc) => {
              const uploaded = isDocument(doc.name);
              const existingFileName = getUploadedFileName(doc.name);

              return (
                <div key={doc.name} className="vf-doc-item">
                  <label className="vf-doc-label">{doc.label}</label>

                  <div className={`vf-doc-box ${uploaded || files[doc.name] ? "uploaded" : ""}`}>
                    {!isEditMode &&
                      (uploaded ? (
                        <span className="vf-status success">
                          <CheckCircle size={18} />
                          {existingFileName || `Uploaded ${doc.name}`}
                        </span>
                      ) : (
                        <span className="vf-status pending">
                          <Clock size={18} />
                          Pending
                        </span>
                      ))}

                    {isEditMode && (
                      <div className="vf-edit-file-row">
                        <label className="vf-upload-label">
                          <Upload size={18} />
                          <input
                            type="file"
                            name={doc.name}
                            className="vf-hidden-input"
                            onChange={handleFileChange}
                          />
                          {files[doc.name]
                            ? files[doc.name]!.name
                            : uploaded
                              ? existingFileName
                              : "Upload file"}
                        </label>

                        {(uploaded || files[doc.name]) && (
                          <button
                            type="button"
                            className="vf-remove-btn"
                            onClick={async () => {
                              if (files[doc.name]) {
                                setFiles((prev) => ({ ...prev, [doc.name]: null }));
                                return;
                              }

                              const ok = window.confirm(`Are you sure you want to remove this  document?`);
                              if (ok) {
                                await removeDocument(doc.name);
                              }
                            }}
                          >
                           <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isEditMode ? (
            <div className="vf-actions">
              <button
                onClick={() => {
                  setIsEditMode(false);
                  setFiles({});
                }}
                className="vf-btn vf-btn-cancel"
              >
                Cancel
              </button>

              <button onClick={handleSubmit} className="vf-btn vf-btn-save">
                Save Documents
              </button>
            </div>
          ) : (
            <div className="vf-actions">
              <button onClick={() => setIsEditMode(true)} className="vf-btn vf-btn-edit">
                Edit Documents
              </button>
            </div>
          )}
        </div>

        <div className="vf-card">
          <h2 className="vf-section-title vf-mb">
            <span className="vf-icon-box vf-pink">
              <ShieldCheck size={22} />
            </span>
            Verification Process
          </h2>

          <div className="vf-row">
            <div className="vf-field">
              <label>Select Verification Type</label>
              <select
                value={verificationBy}
                onChange={(e) => setVerificationBy(e.target.value)}
                className="vf-input"
              >
                <option value="">-- Select --</option>
                <option value="HR">HR Department</option>
                <option value="ThirdParty">Third Party Agency</option>
              </select>
            </div>

            <div className="vf-field">
              <label>Verification Date</label>
              <input
                type="date"
                name="date"
                value={verify.date}
                onChange={handleVerification}
                className="vf-input"
              />
            </div>
          </div>

          {verificationBy === "ThirdParty" && (
            <div className="vf-row">
              <div className="vf-field">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={verify.companyName}
                  onChange={handleVerification}
                  placeholder="Enter company name"
                  className="vf-input"
                />
              </div>

              <div className="vf-field">
                <label>Verified By</label>
                <input
                  type="text"
                  name="Verifier"
                  value={verify.Verifier}
                  onChange={handleVerification}
                  placeholder="Enter verifier name"
                  className="vf-input"
                />
              </div>
            </div>
          )}

          {(verificationBy === "HR" || verificationBy === "ThirdParty") && (
            <div className="vf-verify-box">
              <h3 className="vf-verify-title">Verify Candidate Details</h3>

              <label className="vf-check-row">
                <input
                  type="checkbox"
                  checked={verify.profile}
                  onChange={() => handleCheckbox("profile")}
                />
                <span>Profile Information</span>
              </label>

              <label className="vf-check-row">
                <input
                  type="checkbox"
                  checked={verify.education}
                  onChange={() => handleCheckbox("education")}
                />
                <span>Education Documents</span>
              </label>

              <label className="vf-check-row">
                <input
                  type="checkbox"
                  checked={verify.identity}
                  onChange={() => handleCheckbox("identity")}
                />
                <span>Identity Documents</span>
              </label>
            </div>
          )}

          <div className="vf-actions">
            <button
              onClick={handleVerifecationSubmit}
              disabled={loading}
              className="vf-btn vf-btn-submit"
            >
              {loading ? "Submitting..." : "Submit Verification"}
            </button>
          </div>
        </div>

        <div className="vf-card">
          <h2 className="vf-section-title vf-mb">
            <span className="vf-icon-box vf-green">
              <ClipboardCheck size={22} />
            </span>
            Onboarding Progress
          </h2>

          <div className="vf-progress-list">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`vf-progress-item ${step.status === "completed" ? "completed" : "pending"
                  }`}
              >
                <span>{step.title}</span>
                {step.status === "completed" ? (
                  <CheckCircle className="vf-icon-success" size={22} />
                ) : (
                  <Clock className="vf-icon-pending" size={22} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewForm;
