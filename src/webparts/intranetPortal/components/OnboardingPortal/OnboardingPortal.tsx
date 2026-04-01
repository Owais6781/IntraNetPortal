


// import * as React from "react";
// import { useEffect, useState } from "react";

// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import {
//   Search,
//   Users,
//   Inbox,
//   User,
//   Building2,
//   Mail,
//   Phone,
//   Zap,
//   AtSign,
//   Smartphone,
//   Eye,
//   ChevronLeft,
//   ChevronRight,
//   ShieldCheck,
//   CheckCircle,
//   Clock,
//   ArrowLeft
// } from "lucide-react";

// import { useNavigate } from "react-router-dom";
// import { IIntranetPortalProps } from "../IIntranetPortalProps";

// interface IItem {
//   Id: number;
//   Title: string;
//   FirstName: string;
//   LastName: string;
//   Department: string;
//   Email: string;
//   Mobile: string;
//   Verification: string;
// }

// const OnboardingPortal: React.FC<IIntranetPortalProps> = ({ sp }) => {
//   const navigate = useNavigate();
//   const [data, setData] = useState<IItem[]>([]);
//   const [search, setSearch] = useState<string>("");
//   const [open, setOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [loading, setLoading] = useState<boolean>(false);

//   const perPageRecord = 5;

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       const items = await sp.web.lists
//         .getByTitle("Onboarding")
//         .items.select(
//           "Id",
//           "Title",
//           "FirstName",
//           "LastName",
//           "Department",
//           "Email",
//           "Mobile",
//           "Verification"

//         )();

//       setData(items);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   const handleView = (itemId: number) => {
//     // navigate(`/view-form/${itemId}`);
//       navigate(`/form-verify/${itemId}`);
//   };

//   useEffect(() => {
//     void fetchData();
//     setCurrentPage(1);
//   }, [search]);

//   const filterData = data.filter((item) => {
//     const fullname = `${item.FirstName}${item.LastName}`.toLowerCase();

//     return (
//       fullname.includes(search.toLowerCase()) ||
//       item.Title?.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
//       item.Email?.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
//       item.Department?.toLocaleLowerCase().includes(search.toLocaleLowerCase())||
//       item.Verification?.toLocaleLowerCase().includes(search.toLocaleLowerCase())
//     );
//   });

//   const LastRecord = currentPage * perPageRecord;
//   const FirstRecord = LastRecord - perPageRecord;
//   const currentRecord = filterData.slice(FirstRecord, LastRecord);
//   const totalPage = Math.ceil(filterData.length / perPageRecord);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="mb-8 text-center lg:text-left">
//           <h1 className="pb-2 text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
//             Onboarding Portal
//           </h1>
//           <p className="text-gray-600 text-lg">
//             Manage your team's onboarding process efficiently
//           </p>
//         </div>

//         {/* Main Card */}
//         <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-gray-100 overflow-hidden">
//           {/* Card Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 sm:px-8 sm:py-6">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//               <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
//                <button 
//                className="flex items-center gap-2 "
//                onClick={()=>navigate(-1)}> 
//                   <ArrowLeft className="w-5 h-5" />
//                   </button>
               
//                 <Users className="w-6 h-6" />
                
//                 Employee Directory
//               </h2>

//               <span className="mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur">
//                 {data.length} Total Records
//               </span>
//             </div>
//           </div>

//           {/* Content Area */}
//           <div className="p-4 sm:p-8">
//             <div className="flex items-center relative justify-end">
//               <div
//                 className={`transition-all duration-500 overflow-hidden ${open ? "w-72 mr-2 opacity-100" : "w-0 opacity-0"
//                   }`}
//               >
//                 <input
//                   type="text"
//                   placeholder="Search by name, email or department..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-72 px-4 py-2 mb-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none"
//                 />
//               </div>

//               <button
//                 onClick={() => setOpen(!open)}
//                 className="p-2 mb-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
//               >
//                 <Search size={20} />
//               </button>
//             </div>

//             {loading ? (
//               <div className="flex flex-col items-center justify-center py-20">
//                 <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
//                 <p className="text-gray-500 font-medium">
//                   Loading employee data...
//                 </p>
//               </div>
//             ) : filterData.length === 0 ? (
//               <div className="text-center py-20">
//                 <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
//                   <Inbox className="w-12 h-12 text-gray-400" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                   No Data Available
//                 </h3>
//                 <p className="text-gray-500">
//                   Start by adding new employees to the system
//                 </p>
//               </div>
//             ) : (
//               <div className="overflow-hidden">
//                 <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
//                       <tr>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                           <div className="flex items-center gap-2">
//                             <span className="text-purple-600">#</span>
//                             ID
//                           </div>
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                           <div className="flex items-center gap-2">
//                             <User className="w-4 h-4 text-purple-600" />
//                             Full Name
//                           </div>
//                         </th>

//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                           <div className="flex items-center gap-2">
//                             <Mail className="w-4 h-4 text-purple-600" />
//                             Email
//                           </div>
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                           <div className="flex items-center gap-2">
//                             <Phone className="w-4 h-4 text-purple-600" />
//                             Mobile
//                           </div>
//                         </th>
//                         <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
//                           <div className="flex items-center gap-2">
//                             <Building2 className="w-4 h-4 text-purple-600" />
//                             Department
//                           </div>
//                         </th>
//                         <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
//                           <div className="flex items-center justify-center gap-2">
//                             <ShieldCheck className="w-4 h-4 text-purple-600" />
//                             Verification

//                           </div>
//                         </th>
//                         <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
//                           <div className="flex items-center justify-center gap-2">
//                             <Zap className="w-4 h-4 text-purple-600" />
//                             Actions
//                           </div>
//                         </th>
//                       </tr>
//                     </thead>

//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {currentRecord.map((item) => (
//                         <tr
//                           key={item.Id}
//                           className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 group"
//                         >
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center font-medium text-gray-900">
//                               {item.Title}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="ml-4">
//                                 <div className="text-sm font-medium text-gray-900">
//                                   {item.FirstName} {item.LastName}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
//                               <AtSign className="w-4 h-4 mr-2 text-gray-400" />
//                               {item.Email}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
//                               <Smartphone className="w-4 h-4 mr-2 text-gray-400" />
//                               {item.Mobile}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-center">
//                             <span className="inline-flex items-center px-2.5 py-0.5   rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800">
//                               {item.Department}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">

//                               {item.Verification ? (<>

//                                 <span className="text-green-600 font-medium p-2 text-center ">{item.Verification}</span>
//                                 <CheckCircle className="w-4 h-4 text-green-600" />
//                               </>) : (<>

//                                 <span className="text-yellow-600 font-medium p-2 text-center ">Pending</span>
//                                 <Clock className="w-4 h-4 text-yellow-600" />
//                               </>)}
//                             </div>
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap text-center">
//                             <button
//                               onClick={() => handleView(item.Id)}
//                               className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
//                             >
//                               <Eye className="w-4 h-4" />
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination */}
//                 <div className="flex justify-between items-center mt-6">
//                   <p className="text-sm text-gray-600">
//                     Showing {FirstRecord + 1} to{" "}
//                     {Math.min(LastRecord, filterData.length)} <br /> Total{" "}
//                     {filterData.length} entries
//                   </p>

//                   <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
//                     <button
//                       disabled={currentPage === 1}
//                       onClick={() => setCurrentPage((prev) => prev - 1)}
//                       className={`px-3 py-2 rounded flex items-center gap-1 ${currentPage === 1
//                         ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : "bg-purple-500 text-white hover:bg-purple-600"
//                         }`}
//                     >
//                       <ChevronLeft className="w-4 h-4" />
//                       Prev
//                     </button>

//                     {[...Array(totalPage)].map((_, index) => {
//                       const pageNumber = index + 1;
//                       return (
//                         <button
//                           key={index}
//                           onClick={() => setCurrentPage(pageNumber)}
//                           className={`px-3 py-1 rounded ${currentPage === pageNumber
//                             ? "bg-purple-600 text-white"
//                             : "bg-gray-200 text-black hover:bg-gray-300"
//                             }`}
//                         >
//                           {pageNumber}
//                         </button>
//                       );
//                     })}

//                     <button
//                       disabled={currentPage === totalPage || totalPage === 0}
//                       onClick={() => setCurrentPage((prev) => prev + 1)}
//                       className={`px-3 py-2 rounded flex items-center gap-1 ${currentPage === totalPage || totalPage === 0
//                         ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : "bg-purple-500 text-white hover:bg-purple-600"
//                         }`}
//                     >
//                       Next
//                       <ChevronRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );


// };

// export default OnboardingPortal;








import * as React from "react";
import { useEffect, useMemo, useState } from "react";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import {
  Users,
  ArrowLeft,
  Eye,
  CheckCircle,
  Clock,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { IIntranetPortalProps } from "../IIntranetPortalProps";

import MUIDataTable, {
  MUIDataTableColumn,
  MUIDataTableOptions,
} from "mui-datatables";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

interface IItem {
  Id: number;
  Title: string;
  FirstName: string;
  LastName: string;
  Department: string;
  Email: string;
  Mobile: string;
  Verification: string;
}

const OnboardingPortal: React.FC<IIntranetPortalProps> = ({ sp }) => {
  const navigate = useNavigate();

  const [data, setData] = useState<IItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (): Promise<void> => {
    try {
      setLoading(true);

      const items: IItem[] = await sp.web.lists
        .getByTitle("Onboarding")
        .items.select(
          "Id",
          "Title",
          "FirstName",
          "LastName",
          "Department",
          "Email",
          "Mobile",
          "Verification"
        )();

      setData(items || []);
    } catch (error) {
      console.error("Error fetching onboarding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (itemId: number): void => {
    navigate(`/view-form/${itemId}`);
  };

  useEffect(() => {
    void fetchData();
  }, []);

  const tableData = useMemo(() => {
    return data.map((item) => ({
      Id: item.Id,
      FullName: `${item.FirstName || ""} ${item.LastName || ""}`.trim(),
      Email: item.Email || "",
      Mobile: item.Mobile || "",
      Department: item.Department || "",
      Verification: item.Verification || "",
      itemId: item.Id,
    }));
  }, [data]);

  const columns: MUIDataTableColumn[] = [
    {
      name: "Id",
      label: "ID",
      options: {
        sort: true,
        filter: false,
      },
    },
    {
      name: "FullName",
      label: "Full Name",
      options: {
        sort: true,
        filter: true,
      },
    },
    {
      name: "Email",
      label: "Email",
      options: {
        sort: true,
        filter: true,
      },
    },
    {
      name: "Mobile",
      label: "Mobile",
      options: {
        sort: false,
        filter: true,
      },
    },
    {
      name: "Department",
      label: "Department",
      options: {
        sort: true,
        filter: true,
        customBodyRender: (value: string) => (
          <Chip
            label={value || "N/A"}
            color="success"
            variant="outlined"
            size="small"
          />
        ),
      },
    },
    {
      name: "Verification",
      label: "Verification",
      options: {
        sort: true,
        filter: true,
        customBodyRender: (value: string) => {
          const isVerified =
            value &&
            value.toLowerCase() !== "pending" &&
            value.toLowerCase() !== "false";

          return isVerified ? (
            <Chip
              icon={<CheckCircle size={14} />}
              label={value}
              color="success"
              size="small"
            />
          ) : (
            <Chip
              icon={<Clock size={14} />}
              label="Pending"
              color="warning"
              size="small"
            />
          );
        },
      },
    },
    {
      name: "itemId",
      label: "Actions",
      options: {
        sort: false,
        filter: false,
        download: false,
        print: false,
        customBodyRender: (value: number) => (
          <IconButton color="primary" onClick={() => handleView(value)}>
            <Eye size={18} />
          </IconButton>
        ),
      },
    },
  ];

  const options: MUIDataTableOptions = {
    selectableRows: "none",
    filter: true,
    search: true,
    download: true,
    print: true,
    viewColumns: true,
    responsive: "standard",
    pagination: true,
    rowsPerPage: 5,
    rowsPerPageOptions: [5, 10, 15, 20],
    elevation: 0,
    sort: true,
    searchPlaceholder: "Search by name, email, mobile, department...",
    textLabels: {
      body: {
        noMatch: loading ? "Loading data..." : "No matching records found",
        toolTip: "Sort",
        columnHeaderTooltip: (column) => `Sort for ${column.label}`,
      },
      pagination: {
        next: "Next Page",
        previous: "Previous Page",
        rowsPerPage: "Rows per page:",
        displayRows: "of",
      },
      toolbar: {
        search: "Search",
        downloadCsv: "Download CSV",
        print: "Print",
        viewColumns: "View Columns",
        filterTable: "Filter Table",
      },
      filter: {
        all: "All",
        title: "FILTERS",
        reset: "RESET",
      },
      viewColumns: {
        title: "Show Columns",
        titleAria: "Show/Hide Table Columns",
      },
      selectedRows: {
        text: "row(s) selected",
        delete: "Delete",
        deleteAria: "Delete Selected Rows",
      },
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #f5f3ff 100%)",
        p: { xs: 2, sm: 3, lg: 4 },
      }}
    >
      <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              textAlign: "center",
              background: "linear-gradient(90deg, #2563eb, #9333ea)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Onboarding Portal
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "text.secondary", textAlign: "center" }}
          >
            Manage your team&apos;s onboarding process efficiently
          </Typography>
        </Box>

        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.9)",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 2,
              color: "white",
              background: "linear-gradient(90deg, #2563eb, #9333ea)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconButton onClick={() => navigate(-1)} sx={{ color: "white" }}>
                <ArrowLeft size={20} />
              </IconButton>

              <Users size={24} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Employee Directory
              </Typography>
            </Box>

            <Chip
              label={`${data.length} Total Records`}
              sx={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {loading ? (
              <Box
                sx={{
                  py: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress />
                <Typography sx={{ mt: 2, color: "text.secondary" }}>
                  Loading employee data...
                </Typography>
              </Box>
            ) : (
              <MUIDataTable
                title={""}
                data={tableData}
                columns={columns}
                options={options}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default OnboardingPortal;