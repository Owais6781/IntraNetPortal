import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  SPService,
  IRecruitmentApplication,
  IScreeningChecklist,
} from "./RecruitmentPortal";
import styles from "./RecruitmentPortal.module.scss";

interface IApplicantProps {
  service: SPService;
  onNavigateToJob?: (jobId: string) => void;
  initialJobDetailsIdFilter?: string;
  onClearFilter?: () => void;
}

const Applicant: React.FC<IApplicantProps> = ({
  service,
  onNavigateToJob,
  initialJobDetailsIdFilter = "",
  onClearFilter,
}) => {
  const [recruitments, setRecruitments] = useState<IRecruitmentApplication[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecruitment, setSelectedRecruitment] =
    useState<IRecruitmentApplication | null>(null);
  const [attachments, setAttachments] = useState<
    { FileName: string; ServerRelativeUrl: string }[]
  >([]);
  const [updating, setUpdating] = useState<boolean>(false);

  // Current User State
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [currentUserName, setCurrentUserName] = useState<string>("");

  // Basic Filters
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // REFERBY ID Filter (from navigation)
  const [jobDetailsIdFilter, setJobDetailsIdFilter] = useState<string>(
    initialJobDetailsIdFilter,
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Hover states
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // HR Screening State
  const [screeningChecklist, setScreeningChecklist] =
    useState<IScreeningChecklist>({
      ResumeReviewed: false,
      ExperienceVerified: false,
      SkillsMatched: false,
      QualificationChecked: false,
      LocationSuitable: false,
      SalaryExpectationOk: false,
      AvailabilityConfirmed: false,
      BackgroundCheckOk: false,
    });
  const [hrComments, setHrComments] = useState<string>("");
  const [actionTaken, setActionTaken] = useState<boolean>(false);

  // Pending Action State
  const [pendingAction, setPendingAction] = useState<string>("");

  // Candidate Details State
  const [candidateName, setCandidateName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [emailId, setEmailId] = useState<string>("");

  // View Mode
  const [viewMode, setViewMode] = useState<"page" | "modal" | null>(null);

  // Load Current User
  const loadCurrentUser = useCallback(async (): Promise<void> => {
    try {
      const userInfo = await service.getCurrentUserInfo();
      if (userInfo) {
        setCurrentUserId(userInfo.id);
        setCurrentUserName(userInfo.name);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  }, [service]);

  // Load Recruitments
  const loadRecruitments = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await service.getRecruitmentsWithAttachments();
      setRecruitments(data);
    } catch (error) {
      console.error("Error loading recruitments:", error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void loadCurrentUser();
    void loadRecruitments();
  }, [loadCurrentUser, loadRecruitments]);

  useEffect(() => {
    if (initialJobDetailsIdFilter) {
      setJobDetailsIdFilter(initialJobDetailsIdFilter);
      setSearchTerm(initialJobDetailsIdFilter);
      setCurrentPage(1);
    }
  }, [initialJobDetailsIdFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusFilter,
    departmentFilter,
    locationFilter,
    searchTerm,
    jobDetailsIdFilter,
  ]);

  // Navigation Handlers
  const handleJobIdClick = (jobId: string): void => {
    if (onNavigateToJob && jobId) {
      onNavigateToJob(jobId);
    }
  };

  const handleClearJobDetailsIdFilter = (): void => {
    setJobDetailsIdFilter("");
    setSearchTerm("");
    setCurrentPage(1);
    if (onClearFilter) {
      onClearFilter();
    }
  };

  // Basic Filters
  const getFilteredRecruitments = (): IRecruitmentApplication[] => {
    let filtered = [...recruitments];

    if (statusFilter !== "All") {
      filtered = filtered.filter((r) => r.Status === statusFilter);
    }

    if (departmentFilter !== "All") {
      filtered = filtered.filter((r) => r.Department === departmentFilter);
    }

    if (locationFilter !== "All") {
      filtered = filtered.filter((r) =>
        r.Location?.toLowerCase().includes(locationFilter.toLowerCase()),
      );
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.Title?.toLowerCase().includes(search) ||
          r.JobId?.toLowerCase().includes(search) ||
          r.JobDetailsId?.toLowerCase().includes(search) ||
          r.Department?.toLowerCase().includes(search) ||
          r.Description?.toLowerCase().includes(search) ||
          r.CandidateName?.toLowerCase().includes(search) ||
          r.EmailId?.toLowerCase().includes(search),
      );
    }

    return filtered;
  };

  const hasActiveFilters = (): boolean => {
    return (
      searchTerm !== "" ||
      statusFilter !== "All" ||
      departmentFilter !== "All" ||
      locationFilter !== "All"
    );
  };

  const clearAllFilters = (): void => {
    setSearchTerm("");
    setStatusFilter("All");
    setDepartmentFilter("All");
    setLocationFilter("All");
    setCurrentPage(1);
  };

  // Pagination
  const filteredData = getFilteredRecruitments();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

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

  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Get unique values for filters
  const getUniqueDepartments = (): string[] => {
    const depsMap: { [key: string]: boolean } = {};
    recruitments.forEach((r) => {
      if (r.Department) {
        depsMap[r.Department] = true;
      }
    });
    return Object.keys(depsMap);
  };

  const getUniqueLocations = (): string[] => {
    const locsMap: { [key: string]: boolean } = {};
    recruitments.forEach((r) => {
      if (r.Location) {
        locsMap[r.Location] = true;
      }
    });
    return Object.keys(locsMap);
  };

  const getUniqueStatuses = (): string[] => {
    const statusMap: { [key: string]: boolean } = {};
    recruitments.forEach((r) => {
      if (r.Status) {
        statusMap[r.Status] = true;
      }
    });
    return Object.keys(statusMap);
  };

  // Screening Handlers
  const handleChecklistChange = (field: keyof IScreeningChecklist): void => {
    if (actionTaken) return;
    setScreeningChecklist((prev: IScreeningChecklist) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getScreeningProgress = (): number => {
    const checkedCount =
      Object.values(screeningChecklist).filter(Boolean).length;
    return Math.round((checkedCount / 8) * 100);
  };

  const isScreeningComplete = (): boolean => {
    return Object.values(screeningChecklist).every(Boolean);
  };

  const resetScreeningState = (): void => {
    setScreeningChecklist({
      ResumeReviewed: false,
      ExperienceVerified: false,
      SkillsMatched: false,
      QualificationChecked: false,
      LocationSuitable: false,
      SalaryExpectationOk: false,
      AvailabilityConfirmed: false,
      BackgroundCheckOk: false,
    });
    setHrComments("");
    setActionTaken(false);
    setPendingAction("");
    setCandidateName("");
    setPhoneNumber("");
    setEmailId("");
  };

  // ✅ FIXED: loadScreeningData - No auto-ticking for Open status
  const loadScreeningData = (recruitment: IRecruitmentApplication): void => {
    // Load candidate details
    setCandidateName(recruitment.CandidateName || "");
    setPhoneNumber(recruitment.PhoneNumber || "");
    setEmailId(recruitment.EmailId || "");

    // For "Open" status - ALWAYS start with all checkboxes UNCHECKED
    // User must manually click to check each item
    if (recruitment.Status === "Open") {
      setScreeningChecklist({
        ResumeReviewed: false,
        ExperienceVerified: false,
        SkillsMatched: false,
        QualificationChecked: false,
        LocationSuitable: false,
        SalaryExpectationOk: false,
        AvailabilityConfirmed: false,
        BackgroundCheckOk: false,
      });
      setHrComments("");
    } 
    // For "Draft" status - Load saved values so user can continue from where they left
    else if (recruitment.Status === "Draft") {
      setScreeningChecklist({
        ResumeReviewed: recruitment.ResumeReviewed || false,
        ExperienceVerified: recruitment.ExperienceVerified || false,
        SkillsMatched: recruitment.SkillsMatched || false,
        QualificationChecked: recruitment.QualificationChecked || false,
        LocationSuitable: recruitment.LocationSuitable || false,
        SalaryExpectationOk: recruitment.SalaryExpectationOk || false,
        AvailabilityConfirmed: recruitment.AvailabilityConfirmed || false,
        BackgroundCheckOk: recruitment.BackgroundCheckOk || false,
      });
      setHrComments(recruitment.HRComments || "");
    }
    // For "Shortlisted" or "Rejected" status - Load saved values (view only, disabled)
    else {
      setScreeningChecklist({
        ResumeReviewed: recruitment.ResumeReviewed || false,
        ExperienceVerified: recruitment.ExperienceVerified || false,
        SkillsMatched: recruitment.SkillsMatched || false,
        QualificationChecked: recruitment.QualificationChecked || false,
        LocationSuitable: recruitment.LocationSuitable || false,
        SalaryExpectationOk: recruitment.SalaryExpectationOk || false,
        AvailabilityConfirmed: recruitment.AvailabilityConfirmed || false,
        BackgroundCheckOk: recruitment.BackgroundCheckOk || false,
      });
      setHrComments(recruitment.HRComments || "");
    }
  };

  // Handlers
  const handleStatusDropdownChange = async (
    recruitment: IRecruitmentApplication,
    newStatus: string,
  ): Promise<void> => {
    if (newStatus === "Open" || newStatus === "Draft") {
      try {
        await service.updateRecruitmentStatus(recruitment.Id!, newStatus);
        alert(`Status updated to ${newStatus}!`);
        void loadRecruitments();
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Error updating status!");
      }
    } else if (newStatus === "Shortlisted" || newStatus === "Rejected") {
      resetScreeningState();
      setPendingAction(newStatus);
      setSelectedRecruitment(recruitment);
      setViewMode("modal");

      setCandidateName(recruitment.CandidateName || "");
      setPhoneNumber(recruitment.PhoneNumber || "");
      setEmailId(recruitment.EmailId || "");

      loadScreeningData(recruitment);

      try {
        const attachmentFiles = await service.getRecruitmentAttachments(
          recruitment.Id!,
        );
        setAttachments(attachmentFiles);
      } catch (error) {
        console.error("Error loading attachments:", error);
        setAttachments([]);
      }
    }
  };

  const handleView = async (
    recruitment: IRecruitmentApplication,
  ): Promise<void> => {
    resetScreeningState();
    setSelectedRecruitment(recruitment);
    setViewMode("page");
    setPendingAction("");

    setCandidateName(recruitment.CandidateName || "");
    setPhoneNumber(recruitment.PhoneNumber || "");
    setEmailId(recruitment.EmailId || "");

    if (
      recruitment.Status === "Shortlisted" ||
      recruitment.Status === "Rejected"
    ) {
      setActionTaken(true);
    } else {
      setActionTaken(false);
    }

    loadScreeningData(recruitment);

    try {
      const attachmentFiles = await service.getRecruitmentAttachments(
        recruitment.Id!,
      );
      setAttachments(attachmentFiles);
    } catch (error) {
      console.error("Error loading attachments:", error);
      setAttachments([]);
    }
  };

  const handleCloseView = (): void => {
    setSelectedRecruitment(null);
    setAttachments([]);
    setViewMode(null);
    resetScreeningState();
  };

  const handleSaveAsDraft = async (): Promise<void> => {
    if (!selectedRecruitment?.Id) return;

    setUpdating(true);
    try {
      await service.updateRecruitmentWithScreening(
        selectedRecruitment.Id,
        "Draft",
        hrComments,
        screeningChecklist,
        currentUserId,
        candidateName || undefined,
        phoneNumber || undefined,
        emailId || undefined,
      );

      alert("📝 Draft Saved Successfully!");

      setSelectedRecruitment({
        ...selectedRecruitment,
        Status: "Draft",
        CandidateName: candidateName,
        PhoneNumber: phoneNumber,
        EmailId: emailId,
        HRComments: hrComments,
      });

      void loadRecruitments();
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Error saving draft! Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleShortlisted = async (): Promise<void> => {
    if (!selectedRecruitment?.Id) return;

    if (!candidateName.trim()) {
      alert("⚠️ Please enter the Candidate Name.");
      return;
    }
    if (!phoneNumber.trim()) {
      alert("⚠️ Please enter the Phone Number.");
      return;
    }
    const phoneRegex = /^[\d\s\-+()]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      alert("⚠️ Please enter a valid Phone Number (10-15 digits).");
      return;
    }
    if (!emailId.trim()) {
      alert("⚠️ Please enter the Email ID.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailId.trim())) {
      alert("⚠️ Please enter a valid Email ID.");
      return;
    }

    if (!isScreeningComplete()) {
      alert("⚠️ Please complete ALL screening checks before Shortlisting.");
      return;
    }

    if (!hrComments.trim()) {
      alert("⚠️ Please add HR comments before taking action.");
      return;
    }

    setUpdating(true);
    try {
      await service.updateRecruitmentWithScreening(
        selectedRecruitment.Id,
        "Shortlisted",
        hrComments,
        screeningChecklist,
        currentUserId,
        candidateName,
        phoneNumber,
        emailId,
      );
      alert("✅ Candidate has been Shortlisted!");
      setActionTaken(true);
      setPendingAction("");
      setSelectedRecruitment({
        ...selectedRecruitment,
        Status: "Shortlisted",
        ReviewedByName: currentUserName,
        CandidateName: candidateName,
        PhoneNumber: phoneNumber,
        EmailId: emailId,
      });
      void loadRecruitments();
    } catch (error) {
      console.error("Error updating to Shortlisted:", error);
      alert("Error updating status!");
    } finally {
      setUpdating(false);
    }
  };

  const handleRejected = async (): Promise<void> => {
    if (!selectedRecruitment?.Id) return;

    if (!candidateName.trim()) {
      alert("⚠️ Please enter the Candidate Name.");
      return;
    }
    if (!phoneNumber.trim()) {
      alert("⚠️ Please enter the Phone Number.");
      return;
    }
    if (!emailId.trim()) {
      alert("⚠️ Please enter the Email ID.");
      return;
    }

    if (!hrComments.trim()) {
      alert("⚠️ Please add HR comments before rejecting the candidate.");
      return;
    }

    setUpdating(true);
    try {
      await service.updateRecruitmentWithScreening(
        selectedRecruitment.Id,
        "Rejected",
        hrComments,
        screeningChecklist,
        currentUserId,
        candidateName,
        phoneNumber,
        emailId,
      );
      alert("❌ Candidate has been Rejected!");
      setActionTaken(true);
      setPendingAction("");
      setSelectedRecruitment({
        ...selectedRecruitment,
        Status: "Rejected",
        ReviewedByName: currentUserName,
        CandidateName: candidateName,
        PhoneNumber: phoneNumber,
        EmailId: emailId,
      });
      void loadRecruitments();
    } catch (error) {
      console.error("Error updating to Rejected:", error);
      alert("Error updating status!");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenAttachment = async (recruitmentId: number): Promise<void> => {
    try {
      const attachmentFiles =
        await service.getRecruitmentAttachments(recruitmentId);
      if (attachmentFiles.length > 0) {
        window.open(attachmentFiles[0].ServerRelativeUrl, "_blank");
      } else {
        alert("No attachment found for this application.");
      }
    } catch (error) {
      console.error("Error opening attachment:", error);
      alert("Error opening attachment!");
    }
  };

  // Utility Functions
  const formatDate = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // Status Indicator with dot
  const getStatusIndicator = (status: string): JSX.Element => {
    const statusLower = status?.toLowerCase() || "open";
    let dotColor = "#3b82f6";
    let textColor = "#1e40af";

    if (statusLower === "shortlisted" || statusLower === "selected") {
      dotColor = "#22c55e";
      textColor = "#166534";
    } else if (statusLower === "rejected") {
      dotColor = "#ef4444";
      textColor = "#991b1b";
    } else if (
      statusLower === "draft" ||
      statusLower === "onhold" ||
      statusLower === "pending"
    ) {
      dotColor = "#f59e0b";
      textColor = "#92400e";
    } else if (statusLower === "closed") {
      dotColor = "#6b7280";
      textColor = "#374151";
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
          {status || "Open"}
        </span>
      </div>
    );
  };

  const isActionCompleted = (status: string): boolean => {
    return status === "Shortlisted" || status === "Rejected";
  };

  // View Button Style
  const getViewButtonStyle = (isHovered: boolean): React.CSSProperties => {
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
            Loading Applications...
          </span>
        </div>
      </div>
    );
  }

  // Screening Items
  const screeningItems: { key: keyof IScreeningChecklist; label: string }[] = [
    { key: "ResumeReviewed", label: "📄 Resume Reviewed" },
    { key: "ExperienceVerified", label: "💼 Experience Verified" },
    { key: "SkillsMatched", label: "🎯 Skills Matched" },
    { key: "QualificationChecked", label: "🎓 Qualification Checked" },
    { key: "LocationSuitable", label: "📍 Location Suitable" },
    { key: "SalaryExpectationOk", label: "💰 Salary Expectation OK" },
    { key: "AvailabilityConfirmed", label: "📅 Availability Confirmed" },
    { key: "BackgroundCheckOk", label: "✅ Background Check OK" },
  ];

  // Render Details Content
  const renderDetailsContent = (): React.ReactNode => {
    if (!selectedRecruitment) return null;

    return (
      <>
        {/* Status Badge Section */}
        <div
          style={{
            background: "#f8fafc",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0",
                color: "#1e293b",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              {selectedRecruitment.Title || "Application"}
            </h2>
          </div>
          {getStatusIndicator(selectedRecruitment.Status || "Open")}
        </div>

        {/* Application Details */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h4
            style={{
              margin: "0 0 16px",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📝 Application Details
          </h4>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>REFERBY ID</label>
              <input
                type="text"
                value={selectedRecruitment.JobDetailsId || "N/A"}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Job ID</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={selectedRecruitment.JobId || "N/A"}
                  readOnly
                  className={styles.readOnlyInput}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={() => handleJobIdClick(selectedRecruitment.JobId)}
                  style={{
                    padding: "8px 12px",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#475569",
                    transition: "all 0.2s ease",
                  }}
                  title="View Job Details"
                >
                  View →
                </button>
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Job Title</label>
              <input
                type="text"
                value={selectedRecruitment.Title || ""}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Department</label>
              <input
                type="text"
                value={selectedRecruitment.Department || ""}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Experience</label>
              <input
                type="text"
                value={selectedRecruitment.Experience || ""}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                value={selectedRecruitment.Location || ""}
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
                value={selectedRecruitment.SalaryRange || "Not specified"}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Notice Period</label>
              <input
                type="text"
                value={selectedRecruitment.NoticePeriod || "Not specified"}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Applied On</label>
              <input
                type="text"
                value={formatDate(selectedRecruitment.CreatedOn)}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Deadline</label>
              <input
                type="text"
                value={formatDate(selectedRecruitment.ApplicationDeadline)}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
          </div>
        </div>

        {/* Attachments Section */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h4
            style={{
              margin: "0 0 16px",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            📎 Resume / Attachments
          </h4>
          <div
            style={{
              padding: "12px",
              background: "#f8fafc",
              borderRadius: "8px",
            }}
          >
            {attachments.length > 0 ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {attachments.map((att, index) => (
                  <a
                    key={index}
                    href={att.ServerRelativeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 14px",
                      background: "#ffffff",
                      borderRadius: "6px",
                      textDecoration: "none",
                      color: "#1e40af",
                      border: "1px solid #e2e8f0",
                      fontWeight: 500,
                      fontSize: "13px",
                    }}
                  >
                    📄 {att.FileName}
                  </a>
                ))}
              </div>
            ) : (
              <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                No attachments available
              </span>
            )}
          </div>
        </div>

        {/* Candidate Details Section */}
        <div
          style={{
            background: "#f8fafc",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h4
            style={{
              margin: "0 0 16px",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            👤 Candidate Details
            {!actionTaken && (
              <span style={{ color: "#ef4444", marginLeft: "4px" }}>*</span>
            )}
          </h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "6px",
                  fontSize: "13px",
                }}
              >
                Candidate Name *
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter candidate name"
                disabled={actionTaken}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  background: actionTaken ? "#f1f5f9" : "#ffffff",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "6px",
                  fontSize: "13px",
                }}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                disabled={actionTaken}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  background: actionTaken ? "#f1f5f9" : "#ffffff",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 500,
                  color: "#475569",
                  marginBottom: "6px",
                  fontSize: "13px",
                }}
              >
                Email ID *
              </label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="Enter email address"
                disabled={actionTaken}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "14px",
                  background: actionTaken ? "#f1f5f9" : "#ffffff",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        </div>

        {/* HR Screening Checklist */}
        <div
          style={{
            background: "#f8fafc",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h4
              style={{
                margin: 0,
                color: "#1e293b",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              📋 HR Screening Checklist
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "120px",
                  height: "6px",
                  background: "#e2e8f0",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${getScreeningProgress()}%`,
                    height: "100%",
                    background:
                      getScreeningProgress() === 100 ? "#22c55e" : "#f59e0b",
                    borderRadius: "3px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: getScreeningProgress() === 100 ? "#22c55e" : "#f59e0b",
                }}
              >
                {getScreeningProgress()}%
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {screeningItems.map((item, index) => (
              <label
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: screeningChecklist[item.key]
                    ? "#f0fdf4"
                    : "#ffffff",
                  borderRadius: "6px",
                  cursor: actionTaken ? "not-allowed" : "pointer",
                  border: screeningChecklist[item.key]
                    ? "1px solid #86efac"
                    : "1px solid #e2e8f0",
                  opacity: actionTaken ? 0.7 : 1,
                  transition: "all 0.2s ease",
                }}
                onClick={() => !actionTaken && handleChecklistChange(item.key)}
              >
                <input
                  type="checkbox"
                  checked={screeningChecklist[item.key]}
                  onChange={() => handleChecklistChange(item.key)}
                  disabled={actionTaken}
                  style={{
                    width: "16px",
                    height: "16px",
                    accentColor: "#22c55e",
                    cursor: actionTaken ? "not-allowed" : "pointer",
                  }}
                />
                <span
                  style={{
                    fontWeight: 500,
                    color: screeningChecklist[item.key] ? "#166534" : "#475569",
                    fontSize: "13px",
                  }}
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* HR Comments */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "10px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h4
            style={{
              margin: "0 0 12px",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            💬 HR Comments{" "}
            {!actionTaken && <span style={{ color: "#ef4444" }}>*</span>}
          </h4>
          <textarea
            value={hrComments}
            onChange={(e) => setHrComments(e.target.value)}
            placeholder="Enter your review comments..."
            disabled={actionTaken}
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "12px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "vertical",
              fontFamily: "inherit",
              background: actionTaken ? "#f8fafc" : "#ffffff",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Reviewed By Info */}
        {actionTaken && (
          <div
            style={{
              background: "#f8fafc",
              padding: "16px 20px",
              borderRadius: "10px",
              marginBottom: "24px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Reviewed By
                </label>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1e293b",
                    marginTop: "4px",
                  }}
                >
                  {selectedRecruitment.ReviewedByName || currentUserName || "-"}
                </div>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  Reviewed On
                </label>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#475569",
                    marginTop: "4px",
                  }}
                >
                  {selectedRecruitment.ReviewedOn
                    ? formatDateTime(selectedRecruitment.ReviewedOn)
                    : formatDateTime(new Date().toISOString())}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #e2e8f0",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={handleCloseView}
            disabled={updating}
            style={{
              padding: "10px 20px",
              background: "#f1f5f9",
              color: "#475569",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            ← {viewMode === "modal" ? "Close" : "Back"}
          </button>

          <button
            onClick={() => void handleSaveAsDraft()}
            disabled={updating || actionTaken}
            style={{
              padding: "10px 20px",
              background: actionTaken ? "#e2e8f0" : "#f59e0b",
              color: actionTaken ? "#94a3b8" : "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: actionTaken ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 600,
              opacity: actionTaken ? 0.6 : 1,
            }}
          >
            {updating ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={() => void handleShortlisted()}
            disabled={updating || actionTaken}
            style={{
              padding: "10px 20px",
              background: actionTaken ? "#e2e8f0" : "#22c55e",
              color: actionTaken ? "#94a3b8" : "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: actionTaken ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 600,
              opacity: actionTaken ? 0.6 : 1,
            }}
          >
            {updating ? "Processing..." : "✓ Shortlist"}
          </button>

          <button
            onClick={() => void handleRejected()}
            disabled={updating || actionTaken}
            style={{
              padding: "10px 20px",
              background: actionTaken ? "#e2e8f0" : "#ef4444",
              color: actionTaken ? "#94a3b8" : "#ffffff",
              border: "none",
              borderRadius: "6px",
              cursor: actionTaken ? "not-allowed" : "pointer",
              fontSize: "14px",
              fontWeight: 600,
              opacity: actionTaken ? 0.6 : 1,
            }}
          >
            {updating ? "Processing..." : "✕ Reject"}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* CSS Animation Keyframes */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
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
            👥
          </span>
          Applicants
        </h1>
      </div>

      {/* Modal View */}
      {viewMode === "modal" && selectedRecruitment && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
            overflow: "auto",
          }}
          onClick={handleCloseView}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
              animation: "slideIn 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: "#1e40af",
                padding: "16px 20px",
                borderRadius: "12px 12px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                HR Screening - {pendingAction}
              </h3>
              <button
                onClick={handleCloseView}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "white",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "24px" }}>{renderDetailsContent()}</div>
          </div>
        </div>
      )}

      {/* Page View */}
      {viewMode === "page" && selectedRecruitment && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>Application Details</h3>
            <button className={styles.closeBtn} onClick={handleCloseView}>
              ✕
            </button>
          </div>
          <div className={styles.detailsContent}>{renderDetailsContent()}</div>
        </div>
      )}

      {/* Filter Badge - When filtered from Interviews */}
      {!viewMode && jobDetailsIdFilter && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
            padding: "12px 16px",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#f0f9ff",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
            }}
          >
            🔍
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}
            >
              Filtered by REFERBY ID
            </div>
            <div
              style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}
            >
              {jobDetailsIdFilter}
            </div>
          </div>
          <span style={{ fontSize: "12px", color: "#64748b" }}>
            {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={handleClearJobDetailsIdFilter}
            style={{
              background: "#f8fafc",
              color: "#64748b",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Compact Filters - Always Visible */}
      {!viewMode && (
        <>
          <div
            style={{
              background: "#ffffff",
              padding: "14px 16px",
              borderRadius: "10px",
              marginBottom: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Single Row: Search + Filters + Clear */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {/* Search Input */}
              <div
                style={{ position: "relative", flex: "1", minWidth: "200px" }}
              >
                <input
                  type="text"
                  placeholder="Search by name, title, ID, email..."
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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "13px",
                  background: "#ffffff",
                  cursor: "pointer",
                  minWidth: "120px",
                }}
              >
                <option value="All">All Status</option>
                {getUniqueStatuses().map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "13px",
                  background: "#ffffff",
                  cursor: "pointer",
                  minWidth: "140px",
                }}
              >
                <option value="All">All Departments</option>
                {getUniqueDepartments().map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>

              {/* Location Filter */}
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "13px",
                  background: "#ffffff",
                  cursor: "pointer",
                  minWidth: "130px",
                }}
              >
                <option value="All">All Locations</option>
                {getUniqueLocations().map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>

              {/* Clear All Button - Only when filters active */}
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
          </div>

          {/* Table */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>REFERBY ID</th>
                  <th>Job ID</th>
                  <th>Title</th>
                  <th>Candidate</th>
                  <th>Department</th>
                  <th>Applied On</th>
                  <th style={{ width: "100px" }}>Status</th>
                  <th>Resume</th>
                  <th style={{ width: "80px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
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
                          No applications found
                        </p>
                        {(hasActiveFilters() || jobDetailsIdFilter) && (
                          <button
                            onClick={() => {
                              clearAllFilters();
                              handleClearJobDetailsIdFilter();
                            }}
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
                  paginatedData.map((recruitment, index) => {
                    const isRowHovered = hoveredRow === recruitment.Id;

                    return (
                      <tr
                        key={recruitment.Id}
                        style={{
                          background: isRowHovered ? "#f8fafc" : "transparent",
                          transition: "background 0.15s ease",
                        }}
                        onMouseEnter={() =>
                          setHoveredRow(recruitment.Id || null)
                        }
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#64748b",
                            }}
                          >
                            {startIndex + index + 1}
                          </span>
                        </td>

                        {/* REFERBY ID */}
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
                            {recruitment.JobDetailsId}
                          </span>
                        </td>

                        {/* Job ID - Clickable */}
                        <td>
                          <button
                            onClick={() => handleJobIdClick(recruitment.JobId)}
                            style={{
                              fontFamily: "'SF Mono', 'Consolas', monospace",
                              fontSize: "12px",
                              fontWeight: 600,
                              color: "#1e40af",
                              background: "#f0f9ff",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              border: "none",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#1e40af";
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#f0f9ff";
                              e.currentTarget.style.color = "#1e40af";
                            }}
                            title="Click to view job"
                          >
                            {recruitment.JobId}
                          </button>
                        </td>

                        <td>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>
                            {recruitment.Title}
                          </span>
                        </td>

                        {/* Candidate Info */}
                        <td>
                          {recruitment.CandidateName ? (
                            <div style={{ fontSize: "12px" }}>
                              <div
                                style={{ fontWeight: 600, color: "#1e293b" }}
                              >
                                {recruitment.CandidateName}
                              </div>
                              {recruitment.EmailId && (
                                <div
                                  style={{ color: "#64748b", marginTop: "2px" }}
                                >
                                  {recruitment.EmailId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              style={{ color: "#94a3b8", fontSize: "12px" }}
                            >
                              -
                            </span>
                          )}
                        </td>

                        <td style={{ color: "#475569" }}>
                          {recruitment.Department}
                        </td>

                        <td style={{ color: "#64748b", fontSize: "13px" }}>
                          {formatDate(recruitment.CreatedOn)}
                        </td>

                        {/* Status */}
                        <td>
                          {isActionCompleted(recruitment.Status || "Open") ? (
                            getStatusIndicator(recruitment.Status || "Open")
                          ) : (
                            <select
                              value={recruitment.Status || "Open"}
                              onChange={(e) =>
                                void handleStatusDropdownChange(
                                  recruitment,
                                  e.target.value,
                                )
                              }
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                cursor: "pointer",
                                fontWeight: 500,
                                fontSize: "12px",
                                background: "#ffffff",
                                minWidth: "100px",
                              }}
                            >
                              <option value="Open">Open</option>
                              <option value="Draft">Draft</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          )}
                        </td>

                        {/* Resume */}
                        <td>
                          {recruitment.HasAttachment ? (
                            <button
                              onClick={() =>
                                void handleOpenAttachment(recruitment.Id!)
                              }
                              style={{
                                background: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                borderRadius: "6px",
                                padding: "6px 10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "12px",
                                color: "#475569",
                                fontWeight: 500,
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#1e40af";
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.style.borderColor = "#1e40af";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#f1f5f9";
                                e.currentTarget.style.color = "#475569";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                              }}
                              title="View Resume"
                            >
                                 📄
                            </button>
                          ) : (
                            <span
                              style={{ color: "#94a3b8", fontSize: "12px" }}
                            >
                              -
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td style={{ textAlign: "center" }}>
                          <button
                            onClick={() => void handleView(recruitment)}
                            style={getViewButtonStyle(isRowHovered)}
                            title="View Details"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

export default Applicant;