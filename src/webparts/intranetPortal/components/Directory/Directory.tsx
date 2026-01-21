import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "./Directory.css";

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
    loadEmployeeDetails().catch(() => {});
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
    <div className="directory-container">
      <header className="directory-header">
        <div className="header-text-group">
          <h1 className="title">People Directory</h1>
          <p className="subtitle">Find and connect with colleagues.</p>
        </div>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by name..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="user-card"
              onClick={() => setSelectedUser(u)}
            >
              <div className="card-header">
                <img
                  src={u.imageurl}
                  alt={u.name}
                  className="avatar"
                  onError={(e) => handleImageError(e, u.name)}
                />
              </div>
              <div className="card-body">
                <h3 className="user-name">{u.name}</h3>
                <p className="user-role">{u.designation}</p>
                <div className="card-footer">
                  <span className="contact-link">View Profile</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedUser(null)}>
              &times;
            </button>

            <div className="modal-header">
              <img
                src={selectedUser.imageurl}
                className="modal-avatar"
                alt={selectedUser.name}
                onError={(e) => handleImageError(e, selectedUser.name)}
              />
              <div className="header-text">
                <h2 className="modal-name">{selectedUser.name}</h2>
                <p className="modal-designation">{selectedUser.designation}</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-details-grid">
                
                <div className="detail-item">
                  <span className="detail-label">Employee Code</span>
                  <span className="detail-value">{selectedUser.empCode}</span>
                </div>

             
                <div 
                  className={`detail-item clickable-item ${copiedEmailId === selectedUser.id ? 'copied-active' : ''}`} 
                  onClick={() => handleCopyEmail(selectedUser.email, selectedUser.id)}
                >
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">
                    {copiedEmailId === selectedUser.id ? (
                      <span className="copied-success">✅ Copied!</span>
                    ) : (
                      <>
                        {selectedUser.email || "-"} <span className="copy-icon">📋</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Reporting Manager</span>
                  <span className="detail-value">{selectedUser.manager}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Joining Date</span>
                  <span className="detail-value">{selectedUser.joiningDate}</span>
                </div>

              </div>

              <div className="modal-actions">
                <button className="action-btn secondary" onClick={() => setSelectedUser(null)}>
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