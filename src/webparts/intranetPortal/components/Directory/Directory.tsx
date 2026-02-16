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
  contactNumber: string;
  bloodGroup: string;
}

const Directory: React.FC<IProps> = ({ sp }) => {
  const [users, setUsers] = useState<IUserInfo[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedEmailId, setCopiedEmailId] = useState<number | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  // Active/Inactive Filter State - Active is checked by default
  const [showActive, setShowActive] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=0D8ABC&color=fff&size=128`;
  };

  const handleCopyEmail = async (email: string, id: number) => {
    if (!email || email === "-") return;
    setCopiedEmailId(id);
    try {
      await navigator.clipboard.writeText(email);
      setTimeout(() => {
        setCopiedEmailId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
      setCopiedEmailId(null);
    }
  };

  const handleCopyPhone = async (phone: string, id: number) => {
    if (!phone || phone === "-") return;
    setCopiedPhoneId(id);
    try {
      await navigator.clipboard.writeText(phone);
      setTimeout(() => {
        setCopiedPhoneId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy phone:", err);
      setCopiedPhoneId(null);
    }
  };

  // Function to sort users alphabetically by name (A-Z)
  const sortUsersByName = (usersList: IUserInfo[]): IUserInfo[] => {
    return [...usersList].sort((a, b) => {
      const nameA = a.name.toLowerCase().trim();
      const nameB = b.name.toLowerCase().trim();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
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
          "Designation",
          "Manager/Title",
          "Joiningdate",
          "Status",
          "ContactNumber",
          "BloodGroup"
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
            empCode: item.Title || "-",
            name: displayName,
            email: primaryEmail,
            designation: item.Designation || "Not Specified",
            manager: managerObj.Title || "Not Specified",
            joiningDate: formattedDate,
            status: item.Status || "NA",
            imageurl: primaryEmail
              ? `/_layouts/15/userphoto.aspx?size=L&accountname=${primaryEmail}`
              : getAvatarUrl(displayName),
            contactNumber: item.ContactNumber || "-",
            bloodGroup: item.BloodGroup || "-",
          };
        });

      // Sort users alphabetically by name (A-Z)
      const sortedUsers = sortUsersByName(userData);
      setUsers(sortedUsers);
    } catch (err) {
      console.error("Error loading directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeDetails().catch(() => {});
  }, []);

  // Filter users based on search term and active/inactive status
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const results = users.filter((u) => {
      // Search filter
      const matchesSearch = u.name.toLowerCase().includes(term);

      // Status filter
      const userStatus = u.status?.trim().toLowerCase();
      const isActive = userStatus === "active";
      const isInactive = userStatus === "inactive" || userStatus === "na" || !u.status;

      let matchesStatus = false;

      if (showActive && showInactive) {
        // Both checked - show all users
        matchesStatus = true;
      } else if (showActive && !showInactive) {
        // Only Active checked - show active users
        matchesStatus = isActive;
      } else if (!showActive && showInactive) {
        // Only Inactive checked - show inactive users
        matchesStatus = isInactive;
      } else {
        // NONE checked - DEFAULT to showing Active users
        matchesStatus = isActive;
      }

      return matchesSearch && matchesStatus;
    });

    setFilteredUsers(results);
    setCurrentPage(1); 
  }, [searchTerm, users, showActive, showInactive]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    name: string
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = getAvatarUrl(name);
  };

  const getBloodGroupColor = (bloodGroup: string): string => {
    const group = bloodGroup.toUpperCase().trim();
    switch (group) {
      case "A+":
      case "A-":
        return "#3b82f6";
      case "B+":
      case "B-":
        return "#10b981";
      case "AB+":
      case "AB-":
        return "#8b5cf6";
      case "O+":
      case "O-":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Handle Active checkbox change
  const handleActiveChange = () => {
    setShowActive(!showActive);
  };

  // Handle Inactive checkbox change
  const handleInactiveChange = () => {
    setShowInactive(!showInactive);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };



  // Get current filter status text
  const getFilterStatusText = (): string => {
    if (showActive && showInactive) {
      return "All";
    } else if (showActive) {
      return "Active";
    } else if (showInactive) {
      return "Inactive";
    } else {
      return "Active";
    }
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

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-left">
          <div className="filter-label">Filter by Status:</div>
          <div className="filter-checkboxes">
            <label className={`filter-checkbox ${showActive ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={showActive}
                onChange={handleActiveChange}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">Active</span>
              <span className="status-count active-count">
                {users.filter(u => u.status?.trim().toLowerCase() === "active").length}
              </span>
            </label>

            <label className={`filter-checkbox ${showInactive ? 'inactive' : ''}`}>
              <input
                type="checkbox"
                checked={showInactive}
                onChange={handleInactiveChange}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">Inactive</span>
              <span className="status-count inactive-count">
                {users.filter(u => {
                  const status = u.status?.trim().toLowerCase();
                  return status === "inactive" || status === "na" || !u.status;
                }).length}
              </span>
            </label>
          </div>

          {/* Show default indicator when both unchecked */}
          {!showActive && !showInactive && (
            <div className="default-filter-indicator">
            </div>
          )}
        </div>

        <div className="filter-right">
          {/* Results count */}
          <div className="results-count">
            Showing {filteredUsers.length} {filteredUsers.length === 1 ? 'employee' : 'employees'}
            <span className="filter-status">({getFilterStatusText()})</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <p>No employees found</p>
          <span className="no-results-hint">
            {searchTerm ? `Try a different search term` : `No users match the current filter`}
          </span>
        </div>
      ) : (
        <>
          <div className="card-flex">
            {currentUsers.map((u, index) => {
              
           
             

              return (
                <div
                  key={u.id}
                  className="user-card"
                  onClick={() => setSelectedUser(u)}
                >
                  {/* Status indicator */}
                  <div className={`status-indicator ${u.status?.trim().toLowerCase() === 'active' ? 'active' : 'inactive'}`}></div>

                  

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
                    <p className="user-empcode">{u.empCode}</p>
                    <div className="card-footer">
                      <span className="contact-link">View Profile</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Page {currentPage} of {totalPages}
              </div>

              <div className="pagination">
                <button
                  className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>

                <div className="pagination-pages">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`pagination-btn page-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                      onClick={() => typeof page === 'number' && goToPage(page)}
                      disabled={page === '...'}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
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
                <div className="modal-name-row">
                  <h2 className="modal-name">{selectedUser.name}</h2>
                  <span className={`modal-status-badge ${selectedUser.status?.trim().toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                    {selectedUser.status?.trim().toLowerCase() === 'active' ? '● Active' : '● Inactive'}
                  </span>
                </div>
                <div className="modal-designation-row">
                  <span className="modal-designation">{selectedUser.designation}</span>
                  <span className="modal-separator">•</span>
                  <span className="modal-empcode">{selectedUser.empCode}</span>
                </div>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-details-flex">

                {/* Email Address - Clickable to Copy */}
                <div
                  className={`detail-item clickable-item ${copiedEmailId === selectedUser.id ? 'copied-active' : ''}`}
                  onClick={() => handleCopyEmail(selectedUser.email, selectedUser.id)}
                  title="Click to copy email"
                >
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">
                    {copiedEmailId === selectedUser.id ? (
                      <span className="copied-success">✅ Copied!</span>
                    ) : (
                      <>
                        {selectedUser.email || "-"}
                        {selectedUser.email && selectedUser.email !== "-" && (
                          <span className="copy-icon">📋</span>
                        )}
                      </>
                    )}
                  </span>
                </div>

                {/* Contact Number - Clickable to Copy */}
                <div
                  className={`detail-item clickable-item ${copiedPhoneId === selectedUser.id ? 'copied-active' : ''}`}
                  onClick={() => handleCopyPhone(selectedUser.contactNumber, selectedUser.id)}
                  title="Click to copy phone number"
                >
                  <span className="detail-label">Contact Number</span>
                  <span className="detail-value">
                    {copiedPhoneId === selectedUser.id ? (
                      <span className="copied-success">✅ Copied!</span>
                    ) : (
                      <>
                        <span className="phone-icon">📞</span> {selectedUser.contactNumber}
                        {selectedUser.contactNumber && selectedUser.contactNumber !== "-" && (
                          <span className="copy-icon">📋</span>
                        )}
                      </>
                    )}
                  </span>
                </div>

                {/* Blood Group with Badge */}
                <div className="detail-item">
                  <span className="detail-label">Blood Group</span>
                  <span className="detail-value">
                    {selectedUser.bloodGroup && selectedUser.bloodGroup !== "-" ? (
                      <span
                        className="blood-group-badge"
                        style={{ backgroundColor: getBloodGroupColor(selectedUser.bloodGroup) }}
                      >
                        🩸 {selectedUser.bloodGroup}
                      </span>
                    ) : (
                      "-"
                    )}
                  </span>
                </div>

                {/* Reporting Manager */}
                <div className="detail-item">
                  <span className="detail-label">Reporting Manager</span>
                  <span className="detail-value">
                    <span className="manager-icon">👤</span> {selectedUser.manager}
                  </span>
                </div>

                {/* Joining Date */}
                <div className="detail-item">
                  <span className="detail-label">Joining Date</span>
                  <span className="detail-value">
                    <span className="date-icon">📅</span> {selectedUser.joiningDate}
                  </span>
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