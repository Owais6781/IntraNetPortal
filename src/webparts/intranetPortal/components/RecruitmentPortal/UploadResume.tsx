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

  // Metadata Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [experienceFilter, setExperienceFilter] = useState<string>("All");
  const [noticePeriodFilter, setNoticePeriodFilter] = useState<string>("All");
  const [salaryRangeFilter, setSalaryRangeFilter] = useState<string>("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // File attachment state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Candidate Name
  const [candidateName, setCandidateName] = useState<string>("");

  // Hover states
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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
      const openJobs = data.filter(
        (job) => job.Status.toLowerCase() === "open",
      );
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

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    departmentFilter,
    locationFilter,
    experienceFilter,
    noticePeriodFilter,
    salaryRangeFilter,
  ]);

  // Get unique values for filters
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

  // Apply metadata filters
  const getFilteredJobs = (): IJobOpening[] => {
    let filtered = [...jobs];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.Title?.toLowerCase().includes(search) ||
          job.JobId?.toLowerCase().includes(search) ||
          job.Department?.toLowerCase().includes(search) ||
          job.Location?.toLowerCase().includes(search) ||
          job.Description?.toLowerCase().includes(search),
      );
    }

    if (departmentFilter !== "All") {
      filtered = filtered.filter((job) => job.Department === departmentFilter);
    }

    if (locationFilter !== "All") {
      filtered = filtered.filter((job) => job.Location === locationFilter);
    }

    if (experienceFilter !== "All") {
      filtered = filtered.filter((job) => job.Experience === experienceFilter);
    }

    if (noticePeriodFilter !== "All") {
      filtered = filtered.filter(
        (job) => job.NoticePeriod === noticePeriodFilter,
      );
    }

    if (salaryRangeFilter !== "All") {
      filtered = filtered.filter(
        (job) => job.SalaryRange === salaryRangeFilter,
      );
    }

    return filtered;
  };

  const clearAllFilters = (): void => {
    setSearchTerm("");
    setDepartmentFilter("All");
    setLocationFilter("All");
    setExperienceFilter("All");
    setNoticePeriodFilter("All");
    setSalaryRangeFilter("All");
    setCurrentPage(1);
  };

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

  // Pagination calculations
  const filteredJobs = getFilteredJobs();
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

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
      alert(
        "Unable to identify your profile. Please refresh the page and try again.",
      );
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
        attachmentFile,
      );

      alert(
        `✅ Resume uploaded successfully!\n\n` +
          `📋 Application ID: ${applicantId}\n` +
          `🧑‍💼 Candidate Name: ${candidateName.trim()}\n` +
          `💼 Job: ${applicationForm.JobTitle}`,
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

  // Professional Status Indicator
  const getStatusIndicator = (status: string): JSX.Element => {
    const statusLower = status.toLowerCase();
    let dotColor = "#22c55e";
    let textColor = "#166534";

    if (statusLower === "closed") {
      dotColor = "#ef4444";
      textColor = "#991b1b";
    } else if (statusLower === "onhold") {
      dotColor = "#f59e0b";
      textColor = "#92400e";
    }

    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: dotColor,
            display: "inline-block",
            animation: statusLower === "open" ? "pulse 2s infinite" : "none",
          }}
        />
        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: textColor,
            textTransform: "capitalize",
          }}
        >
          {status}
        </span>
      </div>
    );
  };

  // Apply Button Styles
  const getApplyButtonStyle = (
    disabled: boolean,
    isHovered: boolean,
  ): React.CSSProperties => {
    if (disabled) {
      return {
        padding: "8px 14px",
        fontSize: "12px",
        fontWeight: 600,
        border: "none",
        borderRadius: "6px",
        cursor: "not-allowed",
        background: "#e2e8f0",
        color: "#94a3b8",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        opacity: 0.7,
        transition: "all 0.2s ease",
      };
    }

    return {
      padding: "8px 14px",
      fontSize: "12px",
      fontWeight: 600,
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      background: isHovered ? "#1e40af" : "#f1f5f9",
      color: isHovered ? "#ffffff" : "#475569",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      transform: isHovered ? "translateY(-1px)" : "translateY(0)",
      boxShadow: isHovered ? "0 4px 12px rgba(30, 64, 175, 0.25)" : "none",
      transition: "all 0.2s ease",
    };
  };

  if (loading || userLoading) {
    return (
      <div className={styles.loading}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "3px solid #e2e8f0",
              borderTopColor: "#1e40af",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ color: "#64748b", fontWeight: 500 }}>
            {userLoading ? "Loading user profile..." : "Loading jobs..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* CSS Animation Keyframes */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            📄
          </span>
          Upload Resume
        </h1>
      </div>

      {/* User Error Alert */}
      {!currentUser && userError && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 20px",
            background: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #fecaca",
            borderLeft: "4px solid #ef4444",
            marginBottom: "16px",
          }}
        >
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <div>
            <div
              style={{ fontSize: "14px", fontWeight: 600, color: "#991b1b" }}
            >
              Profile Error
            </div>
            <div style={{ fontSize: "13px", color: "#b91c1c" }}>
              {userError}. Please refresh the page or contact IT support.
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD RESUME FORM */}
      {showUploadForm && selectedJob && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                📝
              </span>
              Apply for {applicationForm.JobTitle || "Job Position"}
            </h3>
            <button className={styles.closeBtn} onClick={handleClose}>
              ✕
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)}>
            {/* Candidate Name Field */}
            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1e293b",
                    marginBottom: "8px",
                  }}
                >
                  <span>👤</span>
                  Candidate Name
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Enter the full name of the candidate"
                  required
                  style={{
                    border: "2px solid #e2e8f0",
                    background: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 500,
                    padding: "12px 14px",
                    borderRadius: "8px",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#1e40af")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            </div>

            {/* Job Details Section */}
            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Job Details
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Job ID</label>
                  <input
                    type="text"
                    value={applicationForm.JobId}
                    readOnly
                    className={styles.readOnlyInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={applicationForm.JobTitle}
                    readOnly
                    className={styles.readOnlyInput}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Department</label>
                  <input
                    type="text"
                    value={selectedJob.Department}
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
                  <label>Experience Required</label>
                  <input
                    type="text"
                    value={applicationForm.Experience}
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

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Salary Range</label>
                  <input
                    type="text"
                    value={applicationForm.SalaryRange || "Not specified"}
                    readOnly
                    className={styles.readOnlyInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Notice Period</label>
                  <input
                    type="text"
                    value={applicationForm.NoticePeriod || "Not specified"}
                    readOnly
                    className={styles.readOnlyInput}
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div
              style={{
                background: "#faf5ff",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "20px",
                border: "1px solid #e9d5ff",
              }}
            >
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1e293b",
                    marginBottom: "8px",
                  }}
                >
                  <span>📎</span>
                  Upload Resume/CV
                  <span style={{ color: "#ef4444" }}>*</span>
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
                disabled={
                  submitting ||
                  !attachmentFile ||
                  !currentUser ||
                  !candidateName.trim()
                }
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COMPACT FILTERS - Always Visible */}
      {!showUploadForm && (
        <>
          <div
            style={{
              background: "#ffffff",
              padding: "12px 16px",
              borderRadius: "10px",
              marginBottom: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Row 1: Search + Clear */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "10px",
              }}
            >
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search by job title, ID, department, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    background: "#f8fafc",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#1e40af";
                    e.target.style.background = "#ffffff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.background = "#f8fafc";
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: "14px",
                    color: "#94a3b8",
                  }}
                >
                  🔍
                </span>
              </div>

              {/* Clear All Button */}
              {hasActiveFilters() && (
                <button
                  onClick={clearAllFilters}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "8px 12px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#dc2626",
                    whiteSpace: "nowrap",
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Row 2: All Filter Dropdowns */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              {/* Department */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  background: "#ffffff",
                  cursor: "pointer",
                  minWidth: "130px",
                }}
              >
                <option value="All">All Departments</option>
                {getUniqueDepartments().map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Location */}
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  background: "#ffffff",
                  cursor: "pointer",
                  minWidth: "120px",
                }}
              >
                <option value="All">All Locations</option>
                {getUniqueLocations().map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Experience */}
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  background: "#ffffff",
                  cursor: "pointer",
                  minWidth: "110px",
                }}
              >
                <option value="All">All Experience</option>
                {getUniqueExperiences().map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>

              {/* Notice Period */}
              <select
                value={noticePeriodFilter}
                onChange={(e) => setNoticePeriodFilter(e.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  background: "#ffffff",
                  cursor: "pointer",
                  minWidth: "120px",
                }}
              >
                <option value="All">All Notice Periods</option>
                {getUniqueNoticePeriods().map((np) => (
                  <option key={np} value={np}>
                    {np}
                  </option>
                ))}
              </select>

              {/* Salary Range */}
              <select
                value={salaryRangeFilter}
                onChange={(e) => setSalaryRangeFilter(e.target.value)}
                style={{
                  padding: "7px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  background: "#ffffff",
                  cursor: "pointer",
                  minWidth: "120px",
                }}
              >
                <option value="All">All Salary Ranges</option>
                {getUniqueSalaryRanges().map((sr) => (
                  <option key={sr} value={sr}>
                    {sr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* JOBS TABLE */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>Job ID</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Salary Range</th>
                  <th>Notice Period</th>
                  <th style={{ width: "80px", textAlign: "center" }}>
                    Openings
                  </th>
                  <th>Deadline</th>
                  <th style={{ width: "80px" }}>Status</th>
                  <th style={{ width: "90px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "48px 20px",
                        }}
                      >
                        <div
                          style={{
                            width: "72px",
                            height: "72px",
                            background: "#f1f5f9",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "32px",
                            marginBottom: "16px",
                          }}
                        >
                          📭
                        </div>
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "15px",
                            fontWeight: 500,
                            margin: "0 0 12px",
                          }}
                        >
                          {hasActiveFilters()
                            ? "No jobs match your filters"
                            : "No open positions available"}
                        </p>
                        {hasActiveFilters() && (
                          <button
                            onClick={clearAllFilters}
                            style={{
                              background: "#1e40af",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "8px 16px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 500,
                            }}
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentJobs.map((job) => {
                    const isDisabled =
                      isDeadlinePassed(job.EndingDate) || !currentUser;
                    const isRowHovered = hoveredRow === job.Id;

                    return (
                      <tr
                        key={job.Id}
                        style={{
                          background: isRowHovered ? "#f8fafc" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={() => setHoveredRow(job.Id || null)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        {/* Job ID */}
                        <td>
                          <span
                            style={{
                              fontFamily: "'SF Mono', 'Consolas', monospace",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#475569",
                              background: "#f1f5f9",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              display: "inline-block",
                            }}
                          >
                            {job.JobId || "N/A"}
                          </span>
                        </td>

                        {/* Title */}
                        <td>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>
                            {job.Title}
                          </span>
                        </td>

                        {/* Department */}
                        <td style={{ color: "#475569" }}>{job.Department}</td>

                        {/* Location */}
                        <td style={{ color: "#475569" }}>{job.Location}</td>

                        {/* Salary Range */}
                        <td>
                          <span style={{ fontSize: "13px", color: "#374151" }}>
                            {job.SalaryRange || "-"}
                          </span>
                        </td>

                        {/* Notice Period */}
                        <td>
                          <span style={{ fontSize: "13px", color: "#374151" }}>
                            {job.NoticePeriod || "-"}
                          </span>
                        </td>

                        {/* Openings */}
                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "26px",
                              height: "26px",
                              borderRadius: "6px",
                              background: "#f1f5f9",
                              color: "#334155",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            {job.Opening || 1}
                          </span>
                        </td>

                        {/* Deadline */}
                        <td>
                          <span
                            style={{
                              fontSize: "13px",
                              color: isDeadlinePassed(job.EndingDate)
                                ? "#dc2626"
                                : "#64748b",
                              fontWeight: isDeadlinePassed(job.EndingDate)
                                ? 500
                                : 400,
                            }}
                          >
                            {formatDate(job.EndingDate)}
                          </span>
                        </td>

                        {/* Status */}
                        <td>{getStatusIndicator(job.Status)}</td>

                        {/* Action - Apply Button */}
                        <td style={{ textAlign: "center" }}>
                          <button
                            style={getApplyButtonStyle(
                              isDisabled,
                              isRowHovered && !isDisabled,
                            )}
                            onClick={() =>
                              !isDisabled && handleUploadResume(job)
                            }
                            disabled={isDisabled}
                            title={
                              isDeadlinePassed(job.EndingDate)
                                ? "Application deadline passed"
                                : !currentUser
                                  ? "Please login to apply"
                                  : "Apply for this position"
                            }
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "16px",
                padding: "12px",
                background: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div className={styles.paginationControls}>
                <button
                  className={styles.paginationBtn}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ← Prev
                </button>

                <div className={styles.pageNumbers}>
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`${styles.pageNumber} ${
                        page === currentPage ? styles.activePage : ""
                      } ${page === "..." ? styles.ellipsis : ""}`}
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
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