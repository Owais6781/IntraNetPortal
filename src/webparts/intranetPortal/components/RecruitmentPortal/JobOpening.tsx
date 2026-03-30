import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  SPService,
  IJobOpening,
  IRecruitmentApplication,
} from "./RecruitmentPortal";
import styles from "./RecruitmentPortal.module.scss";

interface IJobOpeningProps {
  service: SPService;
  initialJobIdFilter?: string;
  onClearFilter?: () => void;
}

const JobOpening: React.FC<IJobOpeningProps> = ({
  service,
  initialJobIdFilter = "",
  onClearFilter,
}) => {
  const [jobs, setJobs] = useState<IJobOpening[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showApplyForm, setShowApplyForm] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<IJobOpening | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Filter state
  const [jobIdFilter, setJobIdFilter] = useState<string>(initialJobIdFilter);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Mode states
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(true);
  const [showAttachmentSection, setShowAttachmentSection] =
    useState<boolean>(false);

  // File attachment state for application
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File attachment state for job form
  const [jobAttachmentFile, setJobAttachmentFile] = useState<File | null>(null);
  const jobFileInputRef = useRef<HTMLInputElement>(null);

  // Hover states for action buttons
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  // Job Form State
  const [jobForm, setJobForm] = useState<IJobOpening>({
    Title: "",
    JobId: "",
    Department: "",
    Experience: "",
    Description: "",
    Location: "",
    Status: "Open",
    CreatedOn: new Date().toISOString().split("T")[0],
    EndingDate: "",
    Attachment: "",
    Opening: 1,
    SalaryRange: "",
    NoticePeriod: "",
  });

  // Application Form State
  const [applicationForm, setApplicationForm] =
    useState<IRecruitmentApplication>({
      JobDetailsId: "",
      JobId: "",
      Title: "",
      Department: "",
      Experience: "",
      Location: "",
      CreatedOn: "",
      ApplicationDeadline: "",
      Status: "Open",
      Description: "",
      Attachments: "",
      SalaryRange: "",
      NoticePeriod: "",
    });

  const loadJobs = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await service.getJobs();
      setJobs(data);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (initialJobIdFilter) {
      setJobIdFilter(initialJobIdFilter);
      setCurrentPage(1);
    }
  }, [initialJobIdFilter]);

  const handleClearFilter = (): void => {
    setJobIdFilter("");
    setCurrentPage(1);
    if (onClearFilter) {
      onClearFilter();
    }
  };

  const getFilteredJobs = (): IJobOpening[] => {
    if (!jobIdFilter) {
      return jobs;
    }
    return jobs.filter((job) =>
      job.JobId?.toLowerCase().includes(jobIdFilter.toLowerCase()),
    );
  };

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

  const handlePreviousPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const resetJobForm = (): void => {
    setJobForm({
      Title: "",
      JobId: "",
      Department: "",
      Experience: "",
      Description: "",
      Location: "",
      Status: "Open",
      CreatedOn: new Date().toISOString().split("T")[0],
      EndingDate: "",
      Attachment: "",
      Opening: 1,
      SalaryRange: "",
      NoticePeriod: "",
    });
    setJobAttachmentFile(null);
    if (jobFileInputRef.current) {
      jobFileInputRef.current.value = "";
    }
  };

  const resetApplicationForm = (): void => {
    setApplicationForm({
      JobDetailsId: "",
      JobId: "",
      Title: "",
      Department: "",
      Experience: "",
      Location: "",
      CreatedOn: "",
      ApplicationDeadline: "",
      Status: "Open",
      Description: "",
      Attachments: "",
      SalaryRange: "",
      NoticePeriod: "",
    });
    setAttachmentFile(null);
    setShowAttachmentSection(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddClick = (): void => {
    resetJobForm();
    setShowForm(true);
    setShowApplyForm(false);
    setSelectedJob(null);
    setIsEditMode(false);
  };

  const handleEdit = (job: IJobOpening): void => {
    setSelectedJob(job);
    setShowForm(true);
    setShowApplyForm(false);
    setIsEditMode(true);
    setJobForm({
      Title: job.Title || "",
      JobId: job.JobId || "",
      Department: job.Department || "",
      Experience: job.Experience || "",
      Description: job.Description || "",
      Location: job.Location || "",
      Status: job.Status || "Open",
      CreatedOn: job.CreatedOn || "",
      EndingDate: job.EndingDate || "",
      Attachment: job.Attachment || "",
      Opening: job.Opening || 1,
      SalaryRange: job.SalaryRange || "",
      NoticePeriod: job.NoticePeriod || "",
    });
  };

  const handleView = (job: IJobOpening): void => {
    setSelectedJob(job);
    setShowApplyForm(true);
    setShowForm(false);
    setIsViewMode(true);
    setShowAttachmentSection(false);
    resetApplicationForm();
    setApplicationForm({
      JobDetailsId: "",
      JobId: job.JobId || "",
      Title: job.Title || "",
      Department: job.Department || "",
      Experience: job.Experience || "",
      Location: job.Location || "",
      CreatedOn: job.CreatedOn || "",
      ApplicationDeadline: job.EndingDate || "",
      Status: "Open",
      Description: job.Description || "",
      Attachments: "",
      SalaryRange: job.SalaryRange || "",
      NoticePeriod: job.NoticePeriod || "",
    });
  };

  const handleApplyClick = (): void => {
    setIsViewMode(false);
    setShowAttachmentSection(true);
  };

  const handleJobFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setJobAttachmentFile(files[0]);
    }
  };

  const handleRemoveJobFile = (): void => {
    setJobAttachmentFile(null);
    if (jobFileInputRef.current) {
      jobFileInputRef.current.value = "";
    }
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

  const handleClose = (): void => {
    setSelectedJob(null);
    setShowApplyForm(false);
    setShowForm(false);
    setIsEditMode(false);
    setIsViewMode(true);
    setShowAttachmentSection(false);
    resetApplicationForm();
    resetJobForm();
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!jobForm.Department) {
      alert("Please select a Department!");
      return;
    }
    setSubmitting(true);
    try {
      if (isEditMode && selectedJob?.Id) {
        await service.updateJob(
          selectedJob.Id,
          jobForm,
          jobAttachmentFile || undefined,
        );
        alert("Job updated successfully!");
      } else {
        await service.createJob(jobForm, jobAttachmentFile || undefined);
        alert("✅ Job posting created successfully.");
      }
      setShowForm(false);
      resetJobForm();
      setIsEditMode(false);
      setCurrentPage(1);
      void loadJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Error saving job!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!attachmentFile) {
      alert("Please select an attachment file!");
      return;
    }
    setSubmitting(true);
    try {
      await service.createRecruitmentApplication(
        applicationForm,
        attachmentFile,
      );
      alert("Application submitted successfully!");
      handleClose();
      void loadJobs();
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application!");
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

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
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

  // Icon-only Action Button Component
  const ActionButton: React.FC<{
    icon: string;
    tooltip: string;
    onClick: () => void;
    variant: "view" | "edit" | "delete";
    rowId: number;
  }> = ({ icon, tooltip, onClick, variant, rowId }) => {
    const isHovered = hoveredRow === rowId && hoveredAction === variant;

    const getButtonStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        border: "1px solid",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
      };

      switch (variant) {
        case "view":
          return {
            ...baseStyles,
            background: isHovered ? "#1e40af" : "#f8fafc",
            borderColor: isHovered ? "#1e40af" : "#e2e8f0",
            color: isHovered ? "#ffffff" : "#475569",
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
            boxShadow: isHovered
              ? "0 4px 12px rgba(30, 64, 175, 0.25)"
              : "none",
          };
        case "edit":
          return {
            ...baseStyles,
            background: isHovered ? "#ca8a04" : "#f8fafc",
            borderColor: isHovered ? "#ca8a04" : "#e2e8f0",
            color: isHovered ? "#ffffff" : "#475569",
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
            boxShadow: isHovered
              ? "0 4px 12px rgba(202, 138, 4, 0.25)"
              : "none",
          };
        case "delete":
          return {
            ...baseStyles,
            background: isHovered ? "#dc2626" : "#f8fafc",
            borderColor: isHovered ? "#dc2626" : "#e2e8f0",
            color: isHovered ? "#ffffff" : "#475569",
            transform: isHovered ? "translateY(-2px)" : "translateY(0)",
            boxShadow: isHovered
              ? "0 4px 12px rgba(220, 38, 38, 0.25)"
              : "none",
          };
        default:
          return baseStyles;
      }
    };

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          style={getButtonStyles()}
          onClick={onClick}
          onMouseEnter={() => {
            setHoveredRow(rowId);
            setHoveredAction(variant);
          }}
          onMouseLeave={() => {
            setHoveredRow(null);
            setHoveredAction(null);
          }}
          title={tooltip}
        >
          {icon}
        </button>
        {/* Tooltip */}
        {isHovered && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#1e293b",
              color: "#ffffff",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 500,
              whiteSpace: "nowrap",
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              animation: "fadeIn 0.15s ease",
            }}
          >
            {tooltip}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #1e293b",
              }}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
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
            Loading Jobs...
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
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(4px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
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
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            💼
          </span>
          Job Openings
        </h1>
        {!showForm && !showApplyForm && (
          <button className={styles.addBtn} onClick={handleAddClick}>
            <span style={{ fontSize: "18px", fontWeight: 300 }}>+</span>
            Add New Job
          </button>
        )}
      </div>

      {/* Filter Badge */}
      {!showForm && !showApplyForm && jobIdFilter && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
            padding: "14px 20px",
            background: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#f0f9ff",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🔍
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "2px",
              }}
            >
              Filtered Result
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#1e293b",
              }}
            >
              {jobIdFilter}
            </div>
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            {filteredJobs.length}{" "}
            {filteredJobs.length === 1 ? "result" : "results"}
          </div>
          <button
            onClick={handleClearFilter}
            style={{
              background: "#f8fafc",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.borderColor = "#fecaca";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* ADD/EDIT JOB FORM */}
      {showForm && !showApplyForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  background: isEditMode
                    ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    : "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                  fontSize: "16px",
                }}
              >
                {isEditMode ? "✏️" : "📝"}
              </span>
              {isEditMode ? "Edit Job Opening" : "Create New Job Opening"}
            </h3>
            <button className={styles.closeBtn} onClick={handleClose}>
              ✕
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)}>
            {isEditMode && (
              <div className={styles.formGroup}>
                <label>Job ID</label>
                <input
                  type="text"
                  value={jobForm.JobId}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
            )}

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Job Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Senior React Developer"
                  value={jobForm.Title}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, Title: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Department *</label>
                <select
                  value={jobForm.Department}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, Department: e.target.value })
                  }
                  required
                  disabled={isEditMode}
                >
                  <option value="">-- Select Department --</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Experience Required *</label>
                <input
                  type="text"
                  placeholder="e.g., 3-5 years"
                  value={jobForm.Experience}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, Experience: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Location *</label>
                <input
                  type="text"
                  placeholder="e.g., Bangalore, India"
                  value={jobForm.Location}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, Location: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Salary Range *</label>
                <input
                  type="text"
                  placeholder="e.g., ₹8,00,000 - ₹12,00,000 LPA"
                  value={jobForm.SalaryRange}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, SalaryRange: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Notice Period *</label>
                <select
                  value={jobForm.NoticePeriod}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, NoticePeriod: e.target.value })
                  }
                  required
                >
                  <option value="">-- Select Notice Period --</option>
                  <option value="Immediate">Immediate</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="45 Days">45 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>No. of Openings *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 5"
                  value={jobForm.Opening}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      Opening: parseInt(e.target.value) || 1,
                    })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                {isEditMode ? (
                  <select
                    value={jobForm.Status}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, Status: e.target.value })
                    }
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="OnHold">On Hold</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value="Open"
                    readOnly
                    className={styles.readOnlyInput}
                  />
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Created On *</label>
                <input
                  type="date"
                  value={formatDateForInput(jobForm.CreatedOn)}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, CreatedOn: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Application Deadline *</label>
                <input
                  type="date"
                  value={formatDateForInput(jobForm.EndingDate)}
                  onChange={(e) =>
                    setJobForm({ ...jobForm, EndingDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Attachment (Job Description Document)</label>
              <div className={styles.attachmentSection}>
                <input
                  type="file"
                  ref={jobFileInputRef}
                  onChange={handleJobFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  className={styles.fileInput}
                />
                {jobAttachmentFile && (
                  <div className={styles.fileInfo}>
                    <span>📄 {jobAttachmentFile.name}</span>
                    <span className={styles.fileSize}>
                      ({(jobAttachmentFile.size / 1024).toFixed(2)} KB)
                    </span>
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={handleRemoveJobFile}
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className={styles.fileHint}>
                  Supported: PDF, DOC, DOCX, JPG, PNG, XLSX (Max 10MB)
                </p>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Job Description *</label>
              <textarea
                placeholder="Enter detailed job description, responsibilities, requirements..."
                value={jobForm.Description}
                onChange={(e) =>
                  setJobForm({ ...jobForm, Description: e.target.value })
                }
                rows={6}
                required
              />
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
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : isEditMode
                    ? "Update Job"
                    : "Create Job"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW/APPLY FORM */}
      {showApplyForm && selectedJob && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  background:
                    "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                  fontSize: "16px",
                }}
              >
                {isViewMode ? "👁️" : "📋"}
              </span>
              {isViewMode ? " Job Details " : "Submit Application"}
            </h3>
            <button className={styles.closeBtn} onClick={handleClose}>
              ✕
            </button>
          </div>

          <form onSubmit={(e) => void handleApplicationSubmit(e)}>
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
                  value={applicationForm.Title}
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Department</label>
                <input
                  type="text"
                  value={applicationForm.Department}
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
                rows={6}
                style={{ resize: "none" }}
              />
            </div>

            {showAttachmentSection && (
              <div className={styles.formGroup}>
                <label>Upload Your Resume/CV *</label>
                <div className={styles.attachmentSection}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
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
                    Supported: PDF, DOC, DOCX, JPG, PNG, XLSX (Max 10MB)
                  </p>
                </div>
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={handleClose}
                disabled={submitting}
              >
                {isViewMode ? "Close" : "Cancel"}
              </button>

              {isViewMode && !showAttachmentSection && (
                <button
                  type="button"
                  className={styles.applyBtn}
                  onClick={handleApplyClick}
                >
                  Apply for this Job
                </button>
              )}

              {showAttachmentSection && (
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={submitting || !attachmentFile}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* JOBS TABLE */}
      {!showForm && !showApplyForm && (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "110px" }}>Job ID</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Salary Range</th>
                  <th>Notice Period</th>
                  <th style={{ width: "80px", textAlign: "center" }}>
                    Openings
                  </th>
                  <th>Posted On</th>
                  <th>Deadline</th>
                  <th style={{ width: "90px" }}>Status</th>
                  <th style={{ width: "100px", textAlign: "center" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className={styles.noData}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "40px 20px",
                        }}
                      >
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            background: "#f1f5f9",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "36px",
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
                            margin: "0 0 16px",
                          }}
                        >
                          {jobIdFilter
                            ? `No job found with ID: ${jobIdFilter}`
                            : "No job openings found"}
                        </p>
                        {jobIdFilter ? (
                          <button
                            onClick={handleClearFilter}
                            style={{
                              background: "#1e40af",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "10px 20px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            Clear Filter & Show All Jobs
                          </button>
                        ) : (
                          <button
                            onClick={handleAddClick}
                            style={{
                              background: "#1e40af",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "10px 20px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: 600,
                            }}
                          >
                            Add First Job
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentJobs.map((job) => (
                    <tr
                      key={job.Id}
                      style={{
                        background:
                          jobIdFilter && job.JobId === jobIdFilter
                            ? "#f0f9ff"
                            : hoveredRow === job.Id
                              ? "#f8fafc"
                              : "transparent",
                        transition: "background 0.15s ease",
                      }}
                      onMouseEnter={() =>
                        !hoveredAction && setHoveredRow(job.Id || null)
                      }
                      onMouseLeave={() => !hoveredAction && setHoveredRow(null)}
                    >
                      {/* Job ID */}
                      <td>
                        <span
                          style={{
                            fontFamily: "'SF Mono', 'Consolas', monospace",
                            fontSize: "12px",
                            fontWeight: 600,
                            color:
                              jobIdFilter && job.JobId === jobIdFilter
                                ? "#1e40af"
                                : "#475569",
                            background:
                              jobIdFilter && job.JobId === jobIdFilter
                                ? "#dbeafe"
                                : "#f1f5f9",
                            padding: "5px 10px",
                            borderRadius: "6px",
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

                      {/* Salary Range - Simple */}
                      <td>
                        <span style={{ fontSize: "13px", color: "#374151" }}>
                          {job.SalaryRange || "-"}
                        </span>
                      </td>

                      {/* Notice Period - Simple */}
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
                            width: "28px",
                            height: "28px",
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

                      {/* Posted On */}
                      <td style={{ color: "#64748b", fontSize: "13px" }}>
                        {formatDate(job.CreatedOn)}
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

                      {/* Status - Simple with dot */}
                      <td>{getStatusIndicator(job.Status)}</td>

                      {/* Actions - Icon only */}
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ActionButton
                            icon="👁️"
                            tooltip="View Details"
                            onClick={() => handleView(job)}
                            variant="view"
                            rowId={job.Id || 0}
                          />
                          <ActionButton
                            icon="✏️"
                            tooltip="Edit Job"
                            onClick={() => handleEdit(job)}
                            variant="edit"
                            rowId={job.Id || 0}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredJobs.length > itemsPerPage && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredJobs.length)} of{" "}
                {filteredJobs.length} jobs
                {jobIdFilter && (
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "#64748b",
                      fontSize: "12px",
                    }}
                  >
                    (filtered)
                  </span>
                )}
              </div>
              <div className={styles.paginationControls}>
                <button
                  className={styles.paginationBtn}
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  title="Previous Page"
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
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  title="Next Page"
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

export default JobOpening;
