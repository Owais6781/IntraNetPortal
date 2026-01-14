
import * as React from "react";
import { NavLink } from "react-router-dom";
import { SPFI } from "@pnp/sp";
import { GraphFI } from "@pnp/graph";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/graph/users";
import "@pnp/graph/photos";
import logo from "../../assets/commItlogo.png"

interface IHeaderProps {
  sp: SPFI;
  graph: GraphFI;
}

const Header: React.FC<IHeaderProps> = ({ sp, graph }) => {

  const [userName, setUserName] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [userPhoto, setUserPhoto] = React.useState("");
  const [loading, setLoading] = React.useState(true);



   const loadUser = async () => {
      try {
       
   
      
        const spUser = await sp.web.currentUser();

        setUserName(spUser.Title);
        setUserPhoto(
          `/_layouts/15/userphoto.aspx?size=L&accountname=${spUser.Email}`
        );

    
  
      
        const graphUser = await graph.me();
        setJobTitle(graphUser.jobTitle || ""); 

      } catch (error) {
        console.error("User Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

  React.useEffect(() => {
   
    void loadUser();
  }, [sp, graph]);

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Organization", path: "/organization" },
    { label: "News", path: "/news" },
    { label: "Knowledge", path: "/knowledge" },
    { label: "Directory", path: "/directory" },
    { label: "Workplace", path: "/workplace" },
    { label: "IT Support", path: "/it-support" },
    { label: "Engineering", path: "/engineering" },
  ];

  return (
    <div className="w-full bg-white font-sans border-b ">

      {/* TOP BAR */}
      <div className="flex items-center justify-between px-8 py-2">

        {/* LEFT LOGO */}
        <NavLink to="/dashboard" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl
                         
                          shadow-lg shadow-indigo-200 text-white
                          transition-transform group-hover:scale-105">
         <img src={logo}/>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900 leading-tight">
              Internet
            </span>
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.15em] uppercase">
              Portal
            </span>
          </div>
        </NavLink>

        {/* SEARCH */}
        {/* <div className="flex-1 max-w-2xl mx-12 hidden md:block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              readOnly
              className="block w-full pl-12 pr-4 py-3.5 bg-indigo-50/50
                         rounded-full text-sm font-medium text-gray-900"
              placeholder="Search resources, people, or news..."
            />
          </div>
        </div> */}

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-6">

          {/* NOTIFICATION */}
          <button className="relative p-1 hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-yellow-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C10.34 2 9 3.34 9 5V6.28C7.06 7.02 5.5 8.95 5.5 11.25V16.5L4 18V19H20V18L18.5 16.5V11.25C18.5 8.95 16.94 7.02 15 6.28V5C15 3.34 13.66 2 12 2ZM10 20C10 21.1 10.9 22 12 22C13.1 22 14 21.1 14 20H10Z" />
            </svg>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* PROFILE */}
          <div className="flex items-center pl-1.5 pr-4 py-1.5 rounded-full
                          border border-gray-200 hover:shadow-md transition-all">

            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center
                            justify-center overflow-hidden mr-3">
              {userPhoto && (
                <img
                  src={userPhoto}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="hidden lg:block">
              <p className="text-sm font-bold text-gray-800 leading-none">
                {loading ? "Loading..." : userName}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {jobTitle}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div className="px-8 pb-4 ml-28">
        <nav className="flex items-center gap-2 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `px-6 py-2.5 rounded-lg text-sm font-bold transition-all
                ${isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

    </div>
  );
};

export default Header;
