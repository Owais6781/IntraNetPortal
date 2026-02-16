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
  initialJobIdFilter?: string;  // NEW PROP
  onClearFilter?: () => void;   // NEW PROP
}

const JobOpening: React.FC<IJobOpeningProps> = ({ 
  service, 
  initialJobIdFilter = "",
  onClearFilter 
}) => {
  const [jobs, setJobs] = useState<IJobOpening[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showApplyForm, setShowApplyForm] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<IJobOpening | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Filter state - NEW
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

  // Update filter when prop changes - NEW
  useEffect(() => {
    if (initialJobIdFilter) {
      setJobIdFilter(initialJobIdFilter);
      setCurrentPage(1);
    }
  }, [initialJobIdFilter]);

  // Clear filter handler - NEW
  const handleClearFilter = (): void => {
    setJobIdFilter("");
    setCurrentPage(1);
    if (onClearFilter) {
      onClearFilter();
    }
  };

  // Filter jobs based on jobIdFilter - NEW
  const getFilteredJobs = (): IJobOpening[] => {
    if (!jobIdFilter) {
      return jobs;
    }
    return jobs.filter((job) => 
      job.JobId?.toLowerCase().includes(jobIdFilter.toLowerCase())
    );
  };

  // Get filtered jobs
  const filteredJobs = getFilteredJobs();

  // Pagination calculations - Updated to use filteredJobs
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
    e: React.ChangeEvent<HTMLInputElement>
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
          jobAttachmentFile || undefined
        );
        alert("Job updated successfully!");
      } else {
        await service.createJob(jobForm, jobAttachmentFile || undefined);
        alert("Job created successfully!");
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
        attachmentFile
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

  // Inline button styles for table row actions
  const viewBtnStyle: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 600,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#ffffff",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };

  const editBtnStyle: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 600,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#ffffff",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  };

  if (loading) {
    return <div className={styles.loading}>Loading Jobs...</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <h1>💼 Job Openings</h1>
        {!showForm && !showApplyForm && (
          <button className={styles.addBtn} onClick={handleAddClick}>
            <span>+</span> Add New Job
          </button>
        )}
      </div>

      {/* FILTER BADGE - NEW */}
      {!showForm && !showApplyForm && jobIdFilter && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
            padding: "16px 20px",
            background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
            borderRadius: "12px",
            border: "2px solid #0ea5e9",
            boxShadow: "0 4px 12px rgba(14, 165, 233, 0.15)",
          }}
        >
          <span style={{ fontSize: "20px" }}>🔗</span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                color: "#0369a1",
                fontWeight: 500,
                marginBottom: "2px",
              }}
            >
              Filtered from Applicants
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0c4a6e",
              }}
            >
              Job ID: {jobIdFilter}
            </div>
          </div>
          <div
            style={{
              background: "#0ea5e9",
              color: "white",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {filteredJobs.length} {filteredJobs.length === 1 ? "Job" : "Jobs"} Found
          </div>
          <button
            onClick={handleClearFilter}
            style={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title="Clear filter and show all jobs"
          >
            ✕ Clear Filter
          </button>
        </div>
      )}

      {/* ADD/EDIT JOB FORM */}
      {showForm && !showApplyForm && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>
              {isEditMode ? "✏️ Edit Job Opening" : "📝 Create New Job Opening"}
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

            {/* Salary Range & Notice Period */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>💰 Salary Range *</label>
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
                <label>⏰ Notice Period *</label>
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
              {isViewMode ? "👁️ Job Details" : "📋 Submit Application"}
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

            {/* Salary Range & Notice Period in View */}
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
              <label>Status</label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="text"
                  value={applicationForm.Status || "Open"}
                  readOnly
                  className={styles.readOnlyInput}
                  style={{ flex: 1 }}
                />
                <span style={getStatusStyle(applicationForm.Status || "Open")}>
                  {applicationForm.Status || "Open"}
                </span>
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

      {/* JOBS TABLE - WITH INLINE ROW ACTION BUTTONS */}
      {!showForm && !showApplyForm && (
        <>
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
                  <th>Posted On</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className={styles.noData}>
                      <span>📭</span>
                      <p>
                        {jobIdFilter 
                          ? `No job found with ID: ${jobIdFilter}` 
                          : "No job openings found"
                        }
                      </p>
                      {jobIdFilter ? (
                        <button onClick={handleClearFilter}>
                          Clear Filter & Show All Jobs
                        </button>
                      ) : (
                        <button onClick={handleAddClick}>Add First Job</button>
                      )}
                    </td>
                  </tr>
                ) : (
                  currentJobs.map((job) => (
                    <tr
                      key={job.Id}
                      style={{
                        height: "56px",
                        verticalAlign: "middle",
                        // Highlight the filtered job
                        background: jobIdFilter && job.JobId === jobIdFilter
                          ? "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
                          : "transparent",
                      }}
                    >
                      <td style={{ verticalAlign: "middle" }}>
                        <span 
                          className={styles.jobIdCell}
                          style={{
                            // Highlight Job ID if it matches filter
                            background: jobIdFilter && job.JobId === jobIdFilter
                              ? "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                              : undefined,
                            color: jobIdFilter && job.JobId === jobIdFilter
                              ? "white"
                              : undefined,
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
                            display: "inline-block",
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
                            display: "inline-block",
                          }}
                        >
                          {job.NoticePeriod || "Not specified"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                        <span className={styles.openingBadge}>
                          {job.Opening || 1}
                        </span>
                      </td>
                      <td style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        {formatDate(job.CreatedOn)}
                      </td>
                      <td style={{ verticalAlign: "middle", whiteSpace: "nowrap" }}>
                        <span
                          className={
                            isDeadlinePassed(job.EndingDate)
                              ? styles.expiredDate
                              : ""
                          }
                        >
                          {formatDate(job.EndingDate)}
                        </span>
                      </td>
                      <td style={{ verticalAlign: "middle" }}>
                        <span style={getStatusStyle(job.Status)}>
                          {job.Status}
                        </span>
                      </td>
                      {/* ACTION BUTTONS - INLINE IN ROW */}
                      <td style={{ verticalAlign: "middle" }}>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            style={viewBtnStyle}
                            onClick={() => handleView(job)}
                            title="View job details"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            👁️ View
                          </button>
                          <button
                            style={editBtnStyle}
                            onClick={() => handleEdit(job)}
                            title="Edit this job"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-1px)";
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION - Updated to use filteredJobs */}
          {filteredJobs.length > itemsPerPage && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {startIndex + 1} - {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
                {jobIdFilter && (
                  <span style={{ marginLeft: "8px", color: "#0ea5e9", fontWeight: 600 }}>
                    (Filtered)
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