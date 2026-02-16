import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { SPService, IJobOpening, ICurrentUser } from "./RecruitmentPortal";
import styles from "./RecruitmentPortal.module.scss";

interface IUploadResumeProps {
  service: SPService;
}

interface IResumeApplication {
  ApplicantId: string;
  JobId: string;
  JobTitle: string;
  Department: string;
  Experience: string;
  Location: string;
  CreatedOn: string;
  ApplicationDeadline: string;
  Status: string;
  Description: string;
  SalaryRange: string;
  NoticePeriod: string;
  CandidateName: string;
}

const UploadResume: React.FC<IUploadResumeProps> = ({ service }) => {
  const [jobs, setJobs] = useState<IJobOpening[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<IJobOpening | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Current logged-in user
  const [currentUser, setCurrentUser] = useState<ICurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<string>("");

  // ==================== METADATA FILTERS ====================
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [experienceFilter, setExperienceFilter] = useState<string>("All");
  const [noticePeriodFilter, setNoticePeriodFilter] = useState<string>("All");
  const [salaryRangeFilter, setSalaryRangeFilter] = useState<string>("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // File attachment state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Candidate Name
  const [candidateName, setCandidateName] = useState<string>("");

  // Application Form State
  const [applicationForm, setApplicationForm] = useState<IResumeApplication>({
    ApplicantId: "",
    JobId: "",
    JobTitle: "",
    Department: "",
    Experience: "",
    Location: "",
    CreatedOn: "",
    ApplicationDeadline: "",
    Status: "Open",
    Description: "",
    SalaryRange: "",
    NoticePeriod: "",
    CandidateName: "",
  });

  // Load current user
  const loadCurrentUser = useCallback(async (): Promise<void> => {
    setUserLoading(true);
    setUserError("");
    try {
      const user = await service.getCurrentUserFromEmployeeDirectory();
      if (user) {
        setCurrentUser(user);
      } else {
        setUserError("Unable to load user profile");
      }
    } catch (error) {
      console.error("Error loading current user:", error);
      setUserError("Error loading user profile");
    } finally {
      setUserLoading(false);
    }
  }, [service]);

  const loadJobs = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await service.getJobs();
      const openJobs = data.filter((job) => job.Status.toLowerCase() === "open");
      setJobs(openJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void loadJobs();
    void loadCurrentUser();
  }, [loadJobs, loadCurrentUser]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, locationFilter, experienceFilter, noticePeriodFilter, salaryRangeFilter]);

  // ==================== GET UNIQUE VALUES FOR FILTERS ====================
  const getUniqueDepartments = (): string[] => {
    const depts = new Set<string>();
    jobs.forEach((job) => job.Department && depts.add(job.Department));
    return Array.from(depts).sort();
  };

  const getUniqueLocations = (): string[] => {
    const locs = new Set<string>();
    jobs.forEach((job) => job.Location && locs.add(job.Location));
    return Array.from(locs).sort();
  };

  const getUniqueExperiences = (): string[] => {
    const exps = new Set<string>();
    jobs.forEach((job) => job.Experience && exps.add(job.Experience));
    return Array.from(exps).sort();
  };

  const getUniqueNoticePeriods = (): string[] => {
    const notices = new Set<string>();
    jobs.forEach((job) => job.NoticePeriod && notices.add(job.NoticePeriod));
    return Array.from(notices).sort();
  };

  const getUniqueSalaryRanges = (): string[] => {
    const salaries = new Set<string>();
    jobs.forEach((job) => job.SalaryRange && salaries.add(job.SalaryRange));
    return Array.from(salaries).sort();
  };

  // ==================== APPLY METADATA FILTERS ====================
  const getFilteredJobs = (): IJobOpening[] => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.Title?.toLowerCase().includes(search) ||
          job.JobId?.toLowerCase().includes(search) ||
          job.Department?.toLowerCase().includes(search) ||
          job.Location?.toLowerCase().includes(search) ||
          job.Description?.toLowerCase().includes(search)
      );
    }

    // Department filter
    if (departmentFilter !== "All") {
      filtered = filtered.filter((job) => job.Department === departmentFilter);
    }

    // Location filter
    if (locationFilter !== "All") {
      filtered = filtered.filter((job) => job.Location === locationFilter);
    }

    // Experience filter
    if (experienceFilter !== "All") {
      filtered = filtered.filter((job) => job.Experience === experienceFilter);
    }

    // Notice Period filter
    if (noticePeriodFilter !== "All") {
      filtered = filtered.filter((job) => job.NoticePeriod === noticePeriodFilter);
    }

    // Salary Range filter
    if (salaryRangeFilter !== "All") {
      filtered = filtered.filter((job) => job.SalaryRange === salaryRangeFilter);
    }

    return filtered;
  };

  // Clear all filters
  const clearAllFilters = (): void => {
    setSearchTerm("");
    setDepartmentFilter("All");
    setLocationFilter("All");
    setExperienceFilter("All");
    setNoticePeriodFilter("All");
    setSalaryRangeFilter("All");
    setCurrentPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters = (): boolean => {
    return (
      searchTerm !== "" ||
      departmentFilter !== "All" ||
      locationFilter !== "All" ||
      experienceFilter !== "All" ||
      noticePeriodFilter !== "All" ||
      salaryRangeFilter !== "All"
    );
  };

  // Get active filter count
  const getActiveFilterCount = (): number => {
    let count = 0;
    if (searchTerm) count++;
    if (departmentFilter !== "All") count++;
    if (locationFilter !== "All") count++;
    if (experienceFilter !== "All") count++;
    if (noticePeriodFilter !== "All") count++;
    if (salaryRangeFilter !== "All") count++;
    return count;
  };

  // Pagination calculations
  const filteredJobs = getFilteredJobs();
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const resetForm = (): void => {
    setApplicationForm({
      ApplicantId: "",
      JobId: "",
      JobTitle: "",
      Department: "",
      Experience: "",
      Location: "",
      CreatedOn: "",
      ApplicationDeadline: "",
      Status: "Open",
      Description: "",
      SalaryRange: "",
      NoticePeriod: "",
      CandidateName: "",
    });
    setAttachmentFile(null);
    setCandidateName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadResume = (job: IJobOpening): void => {
    setSelectedJob(job);
    setShowUploadForm(true);
    resetForm();

    setApplicationForm({
      ApplicantId: "",
      JobId: job.JobId || "",
      JobTitle: job.Title || "",
      Department: job.Department || "",
      Experience: job.Experience || "",
      Location: job.Location || "",
      CreatedOn: job.CreatedOn || "",
      ApplicationDeadline: job.EndingDate || "",
      Status: "Open",
      Description: job.Description || "",
      SalaryRange: job.SalaryRange || "",
      NoticePeriod: job.NoticePeriod || "",
      CandidateName: "",
    });
  };

  const handleClose = (): void => {
    setSelectedJob(null);
    setShowUploadForm(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachmentFile(files[0]);
    }
  };

  const handleRemoveFile = (): void => {
    setAttachmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!currentUser) {
      alert("Unable to identify your profile. Please refresh the page and try again.");
      return;
    }

    if (!attachmentFile) {
      alert("Please upload the candidate's resume!");
      return;
    }

    if (!candidateName.trim()) {
      alert("Please enter the Candidate Name!");
      return;
    }

    setSubmitting(true);
    try {
      const applicantId = await service.createResumeApplication(
        {
          ...applicationForm,
          CandidateName: candidateName.trim(),
        },
        currentUser,
        attachmentFile
      );

      alert(
        `✅ Resume uploaded successfully!\n\n` +
        `📋 Application ID: ${applicantId}\n` +
        `🧑‍💼 Candidate Name: ${candidateName.trim()}\n` +
        `💼 Job: ${applicationForm.JobTitle}`
      );
      handleClose();
      void loadJobs();
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("❌ Error uploading resume! Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isDeadlinePassed = (endDate: string): boolean => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  // ==================== INLINE STYLES ====================
  const filterContainerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    padding: "24px",
    borderRadius: "16px",
    marginBottom: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e2e8f0",
  };

  const filterHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  };

  const filterTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const filterBadgeStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
  };

  const clearFiltersBtnStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
  };

  const filterGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  };

  const filterItemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const filterLabelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const filterInputStyle: React.CSSProperties = {
    padding: "10px 14px",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    transition: "all 0.2s ease",
    background: "white",
    outline: "none",
  };

  const searchInputStyle: React.CSSProperties = {
    ...filterInputStyle,
    gridColumn: "span 2",
    paddingLeft: "40px",
    background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%2394a3b8\"><path d=\"M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z\"/></svg>') no-repeat 12px center",
    backgroundSize: "20px",
  };

  const resultsInfoStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    borderRadius: "12px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#475569",
  };

  const resultsBadgeStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    const statusLower = status.toLowerCase();
    let textColor = "#065f46";
    let borderColor = "rgba(16, 185, 129, 0.2)";
    let background = "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)";

    if (statusLower === "closed") {
      textColor = "#991b1b";
      borderColor = "rgba(239, 68, 68, 0.2)";
      background = "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)";
    } else if (statusLower === "onhold") {
      textColor = "#92400e";
      borderColor = "rgba(245, 158, 11, 0.2)";
      background = "linear-gradient(135deg, #fffbeb 0%, #fde68a 100%)";
    }

    return {
      background: background,
      color: textColor,
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      display: "inline-block",
      border: `1px solid ${borderColor}`,
      textTransform: "capitalize" as const,
    };
  };

  const applyBtnStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap" as const,
  };

  const applyBtnDisabledStyle: React.CSSProperties = {
    ...applyBtnStyle,
    background: "#cbd5e1",
    cursor: "not-allowed",
    opacity: 0.6,
  };

  if (loading || userLoading) {
    return (
      <div className={styles.loading}>
        <div>Loading...</div>
        <div style={{ fontSize: "14px", marginTop: "10px", color: "#6b7280" }}>
          {userLoading ? "Loading user profile..." : "Loading jobs..."}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>📄 Upload Resume</h1>
       

        {!currentUser && userError && (
          <div
            style={{
              background: "linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)",
              padding: "14px 24px",
              borderRadius: "12px",
              marginTop: "16px",
              display: "inline-block",
              color: "#991b1b",
              fontWeight: "500",
            }}
          >
            ⚠️ {userError}. Please refresh the page or contact IT support.
          </div>
        )}
      </div>

      {/* UPLOAD RESUME FORM */}
      {showUploadForm && selectedJob && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>📝 Application for {applicationForm.JobTitle || "Job Position"}</h3>
            <button className={styles.closeBtn} onClick={handleClose}>
              ✕
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)}>
            {/* CANDIDATE NAME FIELD */}
            <div className={styles.formGroup}>
              <label>
                🧑‍💼 Candidate Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter the name of the candidate"
                required
                style={{
                  border: "2px solid #3b82f6",
                  background: "#f0f9ff",
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Job ID</label>
              <input
                type="text"
                value={applicationForm.JobId}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Job Title</label>
                <input
                  type="text"
                  value={applicationForm.JobTitle}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Job Department</label>
                <input
                  type="text"
                  value={selectedJob.Department}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Experience Required</label>
                <input
                  type="text"
                  value={applicationForm.Experience}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Location</label>
                <input
                  type="text"
                  value={applicationForm.Location}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>💰 Salary Range</label>
                <input
                  type="text"
                  value={applicationForm.SalaryRange || "Not specified"}
                  readOnly
                  className={styles.readOnlyInput}
                  style={{
                    background: applicationForm.SalaryRange ? "#d1fae5" : "#f3f4f6",
                    color: applicationForm.SalaryRange ? "#065f46" : "#6b7280",
                    fontWeight: 600,
                  }}
                />
              </div>
              <div className={styles.formGroup}>
                <label>⏰ Notice Period</label>
                <input
                  type="text"
                  value={applicationForm.NoticePeriod || "Not specified"}
                  readOnly
                  className={styles.readOnlyInput}
                  style={{
                    background: applicationForm.NoticePeriod ? "#fef3c7" : "#f3f4f6",
                    color: applicationForm.NoticePeriod ? "#92400e" : "#6b7280",
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Posted On</label>
                <input
                  type="text"
                  value={formatDate(applicationForm.CreatedOn)}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Application Deadline</label>
                <input
                  type="text"
                  value={formatDate(applicationForm.ApplicationDeadline)}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Job Description</label>
              <textarea
                value={applicationForm.Description}
                readOnly
                className={styles.readOnlyInput}
                rows={4}
                style={{ resize: "none" }}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                📎 Upload Candidates Resume/CV <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div className={styles.attachmentSection}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className={styles.fileInput}
                />
                {attachmentFile && (
                  <div className={styles.fileInfo}>
                    <span>📄 {attachmentFile.name}</span>
                    <span className={styles.fileSize}>
                      ({(attachmentFile.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={handleRemoveFile}
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className={styles.fileHint}>
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting || !attachmentFile || !currentUser || !candidateName.trim()}
              >
                {submitting ? "⏳ Submitting..." : "📤 Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* METADATA FILTERS SECTION */}
      {!showUploadForm && (
        <>
          <div style={filterContainerStyle}>
            <div style={filterHeaderStyle}>
              <div style={filterTitleStyle}>
                <span>🔍</span>
                <span>Filter Jobs</span>
                {hasActiveFilters() && (
                  <span style={filterBadgeStyle}>
                    {getActiveFilterCount()} Active
                  </span>
                )}
              </div>
              {hasActiveFilters() && (
                <button
                  style={clearFiltersBtnStyle}
                  onClick={clearAllFilters}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ✕ Clear All Filters
                </button>
              )}
            </div>

            <div style={filterGridStyle}>
              {/* Search Input */}
              <div style={{ ...filterItemStyle, gridColumn: "span 2" }}>
                <label style={filterLabelStyle}>🔍 Search</label>
                <input
                  type="text"
                  placeholder="Search by job title, ID, department, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={searchInputStyle}
                />
              </div>

              {/* Department Filter */}
              <div style={filterItemStyle}>
                <label style={filterLabelStyle}>🏢 Department</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  style={filterInputStyle}
                >
                  <option value="All">All Departments</option>
                  {getUniqueDepartments().map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div style={filterItemStyle}>
                <label style={filterLabelStyle}>📍 Location</label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  style={filterInputStyle}
                >
                  <option value="All">All Locations</option>
                  {getUniqueLocations().map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div style={filterItemStyle}>
                <label style={filterLabelStyle}>⏱️ Experience</label>
                <select
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  style={filterInputStyle}
                >
                  <option value="All">All Experience Levels</option>
                  {getUniqueExperiences().map((exp) => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Notice Period Filter */}
              <div style={filterItemStyle}>
                <label style={filterLabelStyle}>⏰ Notice Period</label>
                <select
                  value={noticePeriodFilter}
                  onChange={(e) => setNoticePeriodFilter(e.target.value)}
                  style={filterInputStyle}
                >
                  <option value="All">All Notice Periods</option>
                  {getUniqueNoticePeriods().map((np) => (
                    <option key={np} value={np}>{np}</option>
                  ))}
                </select>
              </div>

              {/* Salary Range Filter */}
              <div style={filterItemStyle}>
                <label style={filterLabelStyle}>💰 Salary Range</label>
                <select
                  value={salaryRangeFilter}
                  onChange={(e) => setSalaryRangeFilter(e.target.value)}
                  style={filterInputStyle}
                >
                  <option value="All">All Salary Ranges</option>
                  {getUniqueSalaryRanges().map((sr) => (
                    <option key={sr} value={sr}>{sr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div style={resultsInfoStyle}>
            <span>
              📋 Showing {filteredJobs.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
              {hasActiveFilters() && ` (filtered from ${jobs.length} total)`}
            </span>
            {totalPages > 1 && (
              <span style={resultsBadgeStyle}>
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          {/* JOBS TABLE */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Salary Range</th>
                  <th>Notice Period</th>
                  <th>Openings</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className={styles.noData}>
                      <span style={{ fontSize: "48px" }}>📭</span>
                      <p style={{ fontSize: "16px", fontWeight: 600, margin: "12px 0 8px" }}>
                        {hasActiveFilters() ? "No jobs match your filters" : "No open positions available"}
                      </p>
                      {hasActiveFilters() && (
                        <button
                          onClick={clearAllFilters}
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            marginTop: "8px",
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  currentJobs.map((job) => (
                    <tr key={job.Id} style={{ height: "56px", verticalAlign: "middle" }}>
                      <td style={{ verticalAlign: "middle" }}>
                        <span
                          style={{
                            background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
                            color: "#0369a1",
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          {job.JobId || "N/A"}
                        </span>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <strong>{job.Title}</strong>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>{job.Department}</td>
                      <td style={{ verticalAlign: "middle" }}>{job.Location}</td>
                      <td style={{ verticalAlign: "middle" }}>
                        <span
                          style={{
                            background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
                            color: "#065f46",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {job.SalaryRange || "Not specified"}
                        </span>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <span
                          style={{
                            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                            color: "#92400e",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {job.NoticePeriod || "Not specified"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <span className={styles.openingBadge}>{job.Opening || 1}</span>
                      </td>
                      <td style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <span
                          style={{
                            color: isDeadlinePassed(job.EndingDate) ? "#dc2626" : "#374151",
                            fontWeight: isDeadlinePassed(job.EndingDate) ? 600 : 400,
                          }}
                        >
                          {formatDate(job.EndingDate)}
                        </span>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <span style={getStatusStyle(job.Status)}>{job.Status}</span>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <button
                          style={
                            isDeadlinePassed(job.EndingDate) || !currentUser
                              ? applyBtnDisabledStyle
                              : applyBtnStyle
                          }
                          onClick={() => handleUploadResume(job)}
                          disabled={isDeadlinePassed(job.EndingDate) || !currentUser}
                          onMouseEnter={(e) => {
                            if (!isDeadlinePassed(job.EndingDate) && currentUser) {
                              e.currentTarget.style.transform = "translateY(-2px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          📝 Apply
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {startIndex + 1} - {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
              <div className={styles.paginationControls}>
                <button
                  className={styles.paginationBtn}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className={styles.pageNumbers}>
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`${styles.pageNumber} ${
                        page === currentPage ? styles.activePage : ""
                      } ${page === "..." ? styles.ellipsis : ""}`}
                      onClick={() => typeof page === "number" && handlePageChange(page)}
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className={styles.paginationBtn}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UploadResume;