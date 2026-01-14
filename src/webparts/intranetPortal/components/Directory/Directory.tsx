import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "./Directory.css";

interface IProps {
  sp: SPFI;
}
// use model
interface IUserInfo {
  id: number;
  empCode: string;
  name: string;
  email: string;
  emailId: string;
  designation: string;
  manager: string;
  joiningDate?: string;
  status: string;
  imageurl: string;
}
// use components
const Directory: React.FC<IProps> = ({ sp }) => {
  // use vsrisble trough usestate state
  const [users, setUsers] = useState<IUserInfo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // if user have empty image then
  const fallbackImage =
    "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff";

  const loadEmployeeDetails = async () => {
    try {
      const items: any[] = await sp.web.lists
        .getByTitle("EmployeeDirectory")
        .items.select(
          "ID",
          "Title",
          "Email/Title",
          "Email/EMail",
          "Emailid",
          "Degination",
          "Manager",
          "Joiningdate",
          "Status"
        )
        .expand("Email")();

      const userData: IUserInfo[] = items.map((item) => {
        const person = item.Email || {};
        const primaryEmail = person.EMail || item.Emailid || "";

        const joiningDateStr = item.Joiningdate
          ? new Date(item.Joiningdate).toLocaleDateString()
          : "";

        return {
          id: item.ID,
          empCode: item.Title || "", // EMP-001
          name: person.Title || item.Title || "Unknown",
          email: primaryEmail,
          emailId: item.Emailid || "",
          designation: item.Degination || "Not Specified",
          manager: item.Manager || "Not Specified",
          joiningDate: joiningDateStr,
          status: item.Status || "NA",
          imageurl: primaryEmail
            ? `/_layouts/15/userphoto.aspx?size=L&accountname=${primaryEmail}`
            : fallbackImage,
        };
      });
      // define allUsers correctly
      const allUsers: IUserInfo[] = userData;

      // Filter only 'Active' users
      const activeUsers: IUserInfo[] = allUsers.filter(
        (u: IUserInfo) => u.status && u.status.trim().toLowerCase() === "active"
      );
      // use activeUsers so TS error disappears
      setUsers(activeUsers);
      setFilteredUsers(activeUsers);
    } catch (err) {
      console.error("EmployeeDirectory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeDetails().catch(() => {});
  }, []);

  // same search behavior as your 
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const results = users.filter(
      (u) =>
        u.name.toLowerCase().includes(term)  
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    name: string
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=0D8ABC&color=fff`;
  };

  return (
    <div className="directory-container">
      <header className="directory-header">
        <h1 className="title">People Directory</h1>
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by name or role..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="no-results">
          <p>No employees found matching "{searchTerm}".</p>
        </div>
      ) : (
        <div className="card-grid">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="user-card"
              onClick={() => setSelectedUser(u)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === "Enter" && setSelectedUser(u)}
            >
              <div className="card-header">
                <img
                  src={u.imageurl || fallbackImage}
                  alt={u.name}
                  className="avatar"
                  onError={(e) => handleImageError(e, u.name)}
                />
              </div>

              <div className="card-body">
                {/* FIRST PAGE UI – EXACTLY LIKE YOUR SCREENSHOT */}
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

      {/* MODAL – enhanced design, show all list data, no "Send Email" button */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedUser(null)}>
              &times;
            </button>

            <div className="modal-header">
              <img
                src={selectedUser.imageurl || fallbackImage}
                className="modal-avatar"
                alt={selectedUser.name}
                onError={(e) => handleImageError(e, selectedUser.name)}
              />
              <div className="header-text">
                <h2 className="modal-name">{selectedUser.name}</h2>
                <p className="modal-designation">{selectedUser.designation}</p>
                <p className="modal-empcode">{selectedUser.empCode}</p>
              </div>
              <span
                className={`status-pill ${selectedUser.status
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {selectedUser.status}
              </span>
            </div>

            <div className="modal-body">
              <div className="modal-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Employee Code</span>
                  <span className="detail-value">
                    {selectedUser.empCode || "-"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email (User)</span>
                  <span className="detail-value">
                    {selectedUser.email || "-"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Email Id</span>
                  <span className="detail-value">
                    {selectedUser.emailId || "-"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Manager</span>
                  <span className="detail-value">
                    {selectedUser.manager || "-"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Joining Date</span>
                  <span className="detail-value">
                    {selectedUser.joiningDate || "-"}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    {selectedUser.status || "-"}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="action-btn secondary"
                  onClick={() => setSelectedUser(null)}
                >
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
