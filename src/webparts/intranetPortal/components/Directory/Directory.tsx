import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";


interface IProps {
  sp: SPFI;
}

interface IUserInfo {
  id: number;
  empCode: string;
  name: string;
  email: string;
  designation: string;
  manager: string;
  joiningDate?: string;
  status: string;
  imageurl: string;
}

const Directory: React.FC<IProps> = ({ sp }) => {
  const [users, setUsers] = useState<IUserInfo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedEmailId, setCopiedEmailId] = useState<number | null>(null);

  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=0D8ABC&color=fff&size=128`;
  };

  const handleCopyEmail = async (email: string, id: number) => {
    if (!email || email === "-") return;
    setCopiedEmailId(id);
    try {
      // copy perform
      await navigator.clipboard.writeText(email);
      setTimeout(() => {
        setCopiedEmailId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
      setCopiedEmailId(null); // Reset 
    }
  };

  const loadEmployeeDetails = async () => {
    try {
      const items: any[] = await sp.web.lists
        .getByTitle("EmployeeDirectory")
        .items.select(
          "ID",
          "Title",
          "Email/Title",
          "Email/EMail",
          "Degination",
          "Manager/Title",
          "Joiningdate",
          "Status"
        )
        .expand("Email", "Manager")();

      const userData: IUserInfo[] = items
        .filter((item) => item.Email)
        .map((item) => {
          const person = item.Email || {};
          const managerObj = item.Manager || {};
          const displayName = person.Title || "Unknown";
          const primaryEmail = person.EMail || "";

          let formattedDate = "-";
          if (item.Joiningdate) {
            const dateObj = new Date(item.Joiningdate);
            const day = String(dateObj.getDate()).padStart(2, "0");
            const month = String(dateObj.getMonth() + 1).padStart(2, "0");
            const year = dateObj.getFullYear();
            formattedDate = `${day}/${month}/${year}`;
          }

          return {
            id: item.ID,
            empCode: item.Title || "",
            name: displayName,
            email: primaryEmail,
            designation: item.Degination || "Not Specified",
            manager: managerObj.Title || "Not Specified",
            joiningDate: formattedDate,
            status: item.Status || "NA",
            imageurl: primaryEmail
              ? `/_layouts/15/userphoto.aspx?size=L&accountname=${primaryEmail}`
              : getAvatarUrl(displayName),
          };
        });

      const activeUsers = userData.filter(
        (u) => u.status && u.status.trim().toLowerCase() === "active"
      );

      setUsers(activeUsers);
      setFilteredUsers(activeUsers);
    } catch (err) {
      console.error("Error loading directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeDetails().catch(() => { });
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = users.filter((u) => u.name.toLowerCase().includes(term));
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    name: string
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = getAvatarUrl(name);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-surface-900">People Directory</h1>
          <p className="text-surface-500 mt-1">Find and connect with colleagues.</p>
        </div>

        <div className="w-full md:w-96">
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-surface-500 gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-2xl p-6 border border-surface-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group text-center flex flex-col items-center"
              onClick={() => setSelectedUser(u)}
            >
              <div className="mb-4 relative">
                <img
                  src={u.imageurl}
                  alt={u.name}
                  className="w-24 h-24 rounded-full border-4 border-surface-50 shadow-md object-cover bg-surface-100"
                  onError={(e) => handleImageError(e, u.name)}
                />
              </div>
              <div className="w-full">
                <h3 className="text-lg font-bold text-surface-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">{u.name}</h3>
                <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide mb-4 line-clamp-1">{u.designation}</p>
                <div className="mt-auto pt-4 w-full border-t border-surface-100">
                  <span className="text-sm font-medium text-surface-500 group-hover:text-primary-600 transition-colors">View Profile</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10 text-2xl leading-none" onClick={() => setSelectedUser(null)}>
              &times;
            </button>

            <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white flex items-center gap-6 relative">
              <img
                src={selectedUser.imageurl}
                className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg object-cover bg-primary-700"
                alt={selectedUser.name}
                onError={(e) => handleImageError(e, selectedUser.name)}
              />
              <div className="min-w-0">
                <h2 className="text-2xl font-bold truncate">{selectedUser.name}</h2>
                <p className="text-primary-100 font-medium truncate text-sm">{selectedUser.designation}</p>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-3">

                <div className="bg-surface-50 rounded-xl p-4 flex justify-between items-center border border-surface-100">
                  <span className="text-xs font-bold text-surface-500 uppercase tracking-wide">Employee Code</span>
                  <span className="font-semibold text-surface-900 text-sm">{selectedUser.empCode}</span>
                </div>


                <div
                  className={`bg-surface-50 rounded-xl p-4 flex justify-between items-center border border-surface-100 cursor-pointer hover:bg-surface-100 transition-colors ${copiedEmailId === selectedUser.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                  onClick={() => handleCopyEmail(selectedUser.email, selectedUser.id)}
                >
                  <span className="text-xs font-bold text-surface-500 uppercase tracking-wide">Email Address</span>
                  <span className="font-semibold text-surface-900 text-sm flex items-center gap-2">
                    {copiedEmailId === selectedUser.id ? (
                      <span className="text-emerald-600 font-bold">✅ Copied!</span>
                    ) : (
                      <>
                        {selectedUser.email || "-"} <span className="text-surface-400">📋</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="bg-surface-50 rounded-xl p-4 flex justify-between items-center border border-surface-100">
                  <span className="text-xs font-bold text-surface-500 uppercase tracking-wide">Reporting Manager</span>
                  <span className="font-semibold text-surface-900 text-sm">{selectedUser.manager}</span>
                </div>

                <div className="bg-surface-50 rounded-xl p-4 flex justify-between items-center border border-surface-100">
                  <span className="text-xs font-bold text-surface-500 uppercase tracking-wide">Joining Date</span>
                  <span className="font-semibold text-surface-900 text-sm">{selectedUser.joiningDate}</span>
                </div>

              </div>

              <div className="mt-8 flex justify-end">
                <button className="px-6 py-2.5 rounded-xl bg-surface-100 text-surface-700 font-semibold hover:bg-surface-200 transition-colors" onClick={() => setSelectedUser(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;