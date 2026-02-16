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

// ==================== MAIN COMPONENT ====================
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

  // Job Details ID Filter (from navigation)
  const [jobDetailsIdFilter, setJobDetailsIdFilter] = useState<string>(
    initialJobDetailsIdFilter,
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

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

  // Handle filter prop changes
  useEffect(() => {
    if (initialJobDetailsIdFilter) {
      setJobDetailsIdFilter(initialJobDetailsIdFilter);
      setSearchTerm(initialJobDetailsIdFilter);
      setCurrentPage(1);
    }
  }, [initialJobDetailsIdFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusFilter,
    departmentFilter,
    locationFilter,
    searchTerm,
    jobDetailsIdFilter,
  ]);

  // ==================== NAVIGATION HANDLERS ====================
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

  // ==================== BASIC FILTERS ====================
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

  // ==================== PAGINATION ====================
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

  // ==================== SCREENING HANDLERS ====================
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

  const loadScreeningData = (recruitment: IRecruitmentApplication): void => {
    setCandidateName(recruitment.CandidateName || "");
    setPhoneNumber(recruitment.PhoneNumber || "");
    setEmailId(recruitment.EmailId || "");

    if (
      recruitment.Status === "Shortlisted" ||
      recruitment.Status === "Rejected"
    ) {
      setScreeningChecklist({
        ResumeReviewed: true,
        ExperienceVerified: true,
        SkillsMatched: true,
        QualificationChecked: true,
        LocationSuitable: true,
        SalaryExpectationOk: true,
        AvailabilityConfirmed: true,
        BackgroundCheckOk: true,
      });
      setHrComments(recruitment.HRComments || "Action completed by HR.");
    } else {
      // Load partial screening data for Draft/Open status
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

  // ==================== HANDLERS ====================
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

      // Load existing screening data
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

  // ==================== SAVE AS DRAFT ====================
  const handleSaveAsDraft = async (): Promise<void> => {
    if (!selectedRecruitment?.Id) return;

    setUpdating(true);
    try {
      // Save all data with Draft status (no final action taken)
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

      alert(
        "📝 Draft Saved Successfully!\n\n" +
          "All screening data has been saved.\n" +
          "You can continue reviewing later.\n\n" +
          "Status: Draft (No final action taken)",
      );

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

    // Validate candidate details
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
      alert(
        "⚠️ Please complete ALL screening checks before Shortlisting.\n\nAll 8 checkboxes must be checked.",
      );
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
      alert(
        "✅ Candidate has been Shortlisted!\n\nData saved to SharePoint list.",
      );
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

    // Validate candidate details
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
      alert(
        "❌ Candidate has been Rejected!\n\nData saved to SharePoint list.",
      );
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

  // ==================== UTILITY FUNCTIONS ====================
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

  const getStatusStyle = (status: string): React.CSSProperties => {
    const colors: { [key: string]: string } = {
      open: "#2196f3",
      draft: "#ff9800",
      active: "#2196f3",
      closed: "#9e9e9e",
      onhold: "#ff9800",
      pending: "#ff9800",
      "in review": "#9c27b0",
      shortlisted: "#4caf50",
      interview: "#673ab7",
      selected: "#4caf50",
      rejected: "#f44336",
    };
    return {
      backgroundColor: colors[status?.toLowerCase()] || "#2196f3",
      color: "white",
      padding: "6px 14px",
      borderRadius: "16px",
      fontSize: "12px",
      fontWeight: 600,
      display: "inline-block",
      textAlign: "center",
      minWidth: "80px",
    };
  };

  const isActionCompleted = (status: string): boolean => {
    return status === "Shortlisted" || status === "Rejected";
  };

  if (loading) {
    return <div className={styles.loading}>Loading Applications...</div>;
  }

  // ==================== INLINE STYLES ====================
  const filterRowStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "20px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  };

  const filterItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const filterLabelStyle: React.CSSProperties = {
    fontWeight: 600,
    color: "#666",
    fontSize: "13px",
    whiteSpace: "nowrap",
  };

  const filterInputStyle: React.CSSProperties = {
    padding: "8px 14px",
    border: "2px solid #e8e8e8",
    borderRadius: "8px",
    fontSize: "14px",
    minWidth: "150px",
  };

  const searchInputStyle: React.CSSProperties = {
    ...filterInputStyle,
    minWidth: "250px",
  };

  // Beautiful Job ID Link Style
  const jobIdLinkStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
    border: "2px solid #64b5f6",
    borderRadius: "20px",
    color: "#1565c0",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none",
    boxShadow: "0 2px 6px rgba(33, 150, 243, 0.2)",
  };

  // Beautiful Job Details ID Style
  const jobDetailsIdStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 12px",
    background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
    border: "2px solid #ba68c8",
    borderRadius: "20px",
    color: "#7b1fa2",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "default",
    boxShadow: "0 2px 6px rgba(156, 39, 176, 0.2)",
  };

  const shortlistedBtnStyle: React.CSSProperties = {
    padding: "14px 35px",
    background: actionTaken
      ? "#bdbdbd"
      : "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: actionTaken ? "not-allowed" : "pointer",
    fontSize: "16px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    opacity: actionTaken ? 0.6 : 1,
  };

  const rejectedBtnStyle: React.CSSProperties = {
    padding: "14px 35px",
    background: actionTaken
      ? "#bdbdbd"
      : "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: actionTaken ? "not-allowed" : "pointer",
    fontSize: "16px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    opacity: actionTaken ? 0.6 : 1,
  };

  const draftBtnStyle: React.CSSProperties = {
    padding: "14px 35px",
    background: actionTaken
      ? "#bdbdbd"
      : "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: actionTaken ? "not-allowed" : "pointer",
    fontSize: "16px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
    opacity: actionTaken ? 0.6 : 1,
    boxShadow: "0 4px 12px rgba(255, 152, 0, 0.3)",
  };

  const backBtnStyle: React.CSSProperties = {
    padding: "14px 35px",
    background: "linear-gradient(135deg, #9e9e9e 0%, #757575 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const checkboxContainerStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "20px",
  };

  const checkboxItemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 15px",
    background: "#f8f9fa",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    border: "2px solid #e0e0e0",
  };

  const checkboxItemCheckedStyle: React.CSSProperties = {
    ...checkboxItemStyle,
    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
    border: "2px solid #4caf50",
  };

  const checkboxItemDisabledStyle: React.CSSProperties = {
    ...checkboxItemStyle,
    opacity: 0.6,
    cursor: "not-allowed",
  };

  const paginationContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "24px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  };

  const pageButtonStyle: React.CSSProperties = {
    padding: "8px 14px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    background: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 600,
    color: "#666",
    transition: "all 0.3s ease",
    minWidth: "40px",
  };

  const activePageButtonStyle: React.CSSProperties = {
    ...pageButtonStyle,
    background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
    color: "white",
    border: "2px solid #1976d2",
  };

  const navButtonStyle: React.CSSProperties = {
    ...pageButtonStyle,
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const disabledNavButtonStyle: React.CSSProperties = {
    ...navButtonStyle,
    opacity: 0.5,
    cursor: "not-allowed",
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
    overflow: "auto",
  };

  const modalContentStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "16px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 25px 80px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 15px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  };

  const inputDisabledStyle: React.CSSProperties = {
    ...inputStyle,
    background: "#f5f5f5",
    cursor: "not-allowed",
  };

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

  // ==================== RENDER DETAILS CONTENT ====================
  const renderDetailsContent = (): React.ReactNode => {
    if (!selectedRecruitment) return null;

    return (
      <>
        {/* Status Badge Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "2px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <div>
            <h2 style={{ margin: "0", color: "#1a237e", fontSize: "20px" }}>
              {selectedRecruitment.Title || "Application"}
            </h2>
          </div>
          <span style={getStatusStyle(selectedRecruitment.Status || "Open")}>
            {selectedRecruitment.Status || "Open"}
          </span>
        </div>

        {/* Application Details */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "1px solid #e0e0e0",
          }}
        >
          <h4
            style={{
              margin: "0 0 15px",
              color: "#1a237e",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📝 Application Details
          </h4>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>📌 Job Details ID</label>
              <div style={jobDetailsIdStyle}>
                <span>📋</span>
                {selectedRecruitment.JobDetailsId || "N/A"}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>🔖 Job ID</label>
              <div
                style={jobIdLinkStyle}
                onClick={() => handleJobIdClick(selectedRecruitment.JobId)}
                title="Click to view this job in Job Openings"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(33, 150, 243, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(33, 150, 243, 0.2)";
                }}
              >
                <span>🔗</span>
                {selectedRecruitment.JobId || "N/A"}
                <span style={{ fontSize: "10px" }}>→</span>
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>💼 Job Title</label>
              <input
                type="text"
                value={selectedRecruitment.Title || ""}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>🏢 Department</label>
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
              <label>⏱️ Experience</label>
              <input
                type="text"
                value={selectedRecruitment.Experience || ""}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>📍 Location</label>
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
              <label>💰 Salary Range</label>
              <input
                type="text"
                value={selectedRecruitment.SalaryRange || "Not specified"}
                readOnly
                className={styles.readOnlyInput}
                style={{
                  background: selectedRecruitment.SalaryRange
                    ? "#d1fae5"
                    : "#f5f5f5",
                  color: selectedRecruitment.SalaryRange
                    ? "#065f46"
                    : "#6b7280",
                  fontWeight: 600,
                }}
              />
            </div>
            <div className={styles.formGroup}>
              <label>⏰ Notice Period</label>
              <input
                type="text"
                value={selectedRecruitment.NoticePeriod || "Not specified"}
                readOnly
                className={styles.readOnlyInput}
                style={{
                  background: selectedRecruitment.NoticePeriod
                    ? "#fef3c7"
                    : "#f5f5f5",
                  color: selectedRecruitment.NoticePeriod
                    ? "#92400e"
                    : "#6b7280",
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>📅 Applied On</label>
              <input
                type="text"
                value={formatDate(selectedRecruitment.CreatedOn)}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>⏰ Deadline</label>
              <input
                type="text"
                value={formatDate(selectedRecruitment.ApplicationDeadline)}
                readOnly
                className={styles.readOnlyInput}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>📝 Description</label>
            <textarea
              value={selectedRecruitment.Description || ""}
              readOnly
              className={styles.readOnlyInput}
              rows={3}
            />
          </div>
        </div>

        {/* Attachments Section */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "1px solid #e0e0e0",
          }}
        >
          <h4
            style={{
              margin: "0 0 15px",
              color: "#1a237e",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📎 Resume / Attachments
          </h4>
          <div
            style={{
              padding: "15px",
              background: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            {attachments.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
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
                      padding: "12px 15px",
                      background:
                        "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                      borderRadius: "8px",
                      textDecoration: "none",
                      color: "#1976d2",
                      border: "1px solid #90caf9",
                      fontWeight: 600,
                    }}
                  >
                    📄 {att.FileName}
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      Click to open →
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <span style={{ color: "#999" }}>No attachments available</span>
            )}
          </div>
        </div>

        {/* Candidate Details Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "2px solid #81c784",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h4
              style={{
                margin: 0,
                color: "#2e7d32",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              👤 Candidate Details
              {!actionTaken && (
                <span style={{ color: "#f44336", fontSize: "14px" }}>
                  * Required for final action
                </span>
              )}
            </h4>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "15px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#2e7d32",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                👤 Candidate Name *
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="Enter candidate name"
                disabled={actionTaken}
                style={actionTaken ? inputDisabledStyle : inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#2e7d32",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                📞 Phone Number *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                disabled={actionTaken}
                style={actionTaken ? inputDisabledStyle : inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  color: "#2e7d32",
                  marginBottom: "8px",
                  fontSize: "13px",
                }}
              >
                📧 Email ID *
              </label>
              <input
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                placeholder="Enter email address"
                disabled={actionTaken}
                style={actionTaken ? inputDisabledStyle : inputStyle}
              />
            </div>
          </div>
        </div>

        {/* HR Screening Checklist */}
        <div
          style={{
            background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "2px solid #ffb74d",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h4
              style={{
                margin: 0,
                color: "#e65100",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              📋 HR Screening Checklist
              {!actionTaken && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    fontWeight: "normal",
                  }}
                >
                  (Required 100% for Shortlisting)
                </span>
              )}
            </h4>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "150px",
                  height: "8px",
                  background: "#e0e0e0",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${getScreeningProgress()}%`,
                    height: "100%",
                    background:
                      getScreeningProgress() === 100
                        ? "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)"
                        : "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                    borderRadius: "4px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: getScreeningProgress() === 100 ? "#4caf50" : "#ff9800",
                }}
              >
                {getScreeningProgress()}%
              </span>
            </div>
          </div>

          <div style={checkboxContainerStyle}>
            {screeningItems.map((item, index) => (
              <label
                key={index}
                style={
                  actionTaken
                    ? checkboxItemDisabledStyle
                    : screeningChecklist[item.key]
                      ? checkboxItemCheckedStyle
                      : checkboxItemStyle
                }
                onClick={() => !actionTaken && handleChecklistChange(item.key)}
              >
                <input
                  type="checkbox"
                  checked={screeningChecklist[item.key]}
                  onChange={() => handleChecklistChange(item.key)}
                  disabled={actionTaken}
                  style={{
                    width: "20px",
                    height: "20px",
                    accentColor: "#4caf50",
                    cursor: actionTaken ? "not-allowed" : "pointer",
                  }}
                />
                <span
                  style={{
                    fontWeight: 500,
                    color: screeningChecklist[item.key] ? "#2e7d32" : "#666",
                  }}
                >
                  {item.label}
                </span>
              </label>
            ))}
          </div>

          {!actionTaken && (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(255,255,255,0.8)",
                borderRadius: "8px",
                border: "1px solid #ffcc80",
                fontSize: "13px",
              }}
            >
              <strong>💡 Note:</strong>
              <ul style={{ margin: "8px 0 0 20px", padding: 0 }}>
                <li>
                  ✅ <strong>Shortlisting:</strong> Requires 100% checklist
                  completion + HR comments
                </li>
                <li>
                  ❌ <strong>Rejection:</strong> Requires HR comments only
                </li>
                <li>
                  📝 <strong>Draft:</strong> Save progress without final
                  decision
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* HR Comments */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "2px solid #90caf9",
          }}
        >
          <h4
            style={{
              margin: "0 0 15px",
              color: "#1565c0",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            💬 HR Comments{" "}
            {!actionTaken && (
              <span style={{ color: "#f44336", fontSize: "14px" }}>*</span>
            )}
          </h4>
          <textarea
            value={hrComments}
            onChange={(e) => setHrComments(e.target.value)}
            placeholder="Enter your review comments, observations, and recommendation here..."
            disabled={actionTaken}
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "15px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              resize: "vertical",
              fontFamily: "inherit",
              background: actionTaken ? "#f5f5f5" : "#fff",
              cursor: actionTaken ? "not-allowed" : "text",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Reviewed By Info - Show for completed actions */}
        {actionTaken && (
          <div
            style={{
              background: "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "25px",
              border: "2px solid #7986cb",
            }}
          >
            <h4
              style={{
                margin: "0 0 15px",
                color: "#3949ab",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              👤 Reviewed By
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: "#666",
                    marginBottom: "5px",
                    fontSize: "13px",
                  }}
                >
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={
                    selectedRecruitment.ReviewedByName || currentUserName || "-"
                  }
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    background: "#f5f5f5",
                    fontWeight: 600,
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    color: "#666",
                    marginBottom: "5px",
                    fontSize: "13px",
                  }}
                >
                  Reviewed On
                </label>
                <input
                  type="text"
                  value={
                    selectedRecruitment.ReviewedOn
                      ? formatDateTime(selectedRecruitment.ReviewedOn)
                      : formatDateTime(new Date().toISOString())
                  }
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    background: "#f5f5f5",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Status Message */}
        {actionTaken && (
          <div
            style={{
              padding: "15px 20px",
              background:
                selectedRecruitment.Status === "Shortlisted"
                  ? "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)"
                  : "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
              borderRadius: "8px",
              marginBottom: "20px",
              border:
                selectedRecruitment.Status === "Shortlisted"
                  ? "2px solid #4caf50"
                  : "2px solid #f44336",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color:
                  selectedRecruitment.Status === "Shortlisted"
                    ? "#2e7d32"
                    : "#c62828",
              }}
            >
              {selectedRecruitment.Status === "Shortlisted"
                ? "✅ This candidate has been SHORTLISTED"
                : selectedRecruitment.Status === "Rejected"
                  ? "❌ This candidate has been REJECTED"
                  : `📌 Status: ${selectedRecruitment.Status}`}
            </span>
          </div>
        )}

        {/* Draft Status Message */}
        {selectedRecruitment.Status === "Draft" && !actionTaken && (
          <div
            style={{
              padding: "15px 20px",
              background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "2px solid #ff9800",
              textAlign: "center",
            }}
          >
            <span
              style={{ fontSize: "16px", fontWeight: 600, color: "#e65100" }}
            >
              📝 This application is saved as DRAFT - No final action taken yet
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginTop: "30px",
            paddingTop: "25px",
            borderTop: "2px solid #e0e0e0",
            flexWrap: "wrap",
          }}
        >
          <button
            style={backBtnStyle}
            onClick={handleCloseView}
            disabled={updating}
          >
            ← {viewMode === "modal" ? "Close" : "Back to List"}
          </button>

          {/* Draft Button - NEW */}
          <button
            style={draftBtnStyle}
            onClick={() => void handleSaveAsDraft()}
            disabled={updating || actionTaken}
            title="Save all data as draft without final decision"
            onMouseEnter={(e) => {
              if (!actionTaken) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(255, 152, 0, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(255, 152, 0, 0.3)";
            }}
          >
            {updating ? "⏳ Saving..." : "📝 Save as Draft"}
          </button>

          <button
            style={shortlistedBtnStyle}
            onClick={() => void handleShortlisted()}
            disabled={updating || actionTaken}
            title={
              actionTaken
                ? "Action already taken"
                : !isScreeningComplete()
                  ? "Complete all screening checks to shortlist"
                  : "Shortlist this candidate"
            }
            onMouseEnter={(e) => {
              if (!actionTaken) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(76, 175, 80, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {updating ? "⏳ Processing..." : "✅ Shortlisted"}
          </button>

          <button
            style={rejectedBtnStyle}
            onClick={() => void handleRejected()}
            disabled={updating || actionTaken}
            title={
              actionTaken ? "Action already taken" : "Reject this candidate"
            }
            onMouseEnter={(e) => {
              if (!actionTaken) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(244, 67, 54, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {updating ? "⏳ Processing..." : "❌ Rejected"}
          </button>
        </div>

        {actionTaken && (
          <div
            style={{
              textAlign: "center",
              marginTop: "15px",
              fontSize: "13px",
              color: "#999",
            }}
          >
            🔒 Actions are locked after final decision is made
          </div>
        )}

        {!actionTaken && (
          <div
            style={{
              textAlign: "center",
              marginTop: "15px",
              fontSize: "13px",
              color: "#666",
            }}
          >
            💡 Use <strong>Save as Draft</strong> to save your progress and
            continue later
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <h1>👥 Applicants Dashboard - HR Screening</h1>
        {currentUserName && (
          <div
            style={{
              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
              padding: "8px 16px",
              borderRadius: "20px",
              marginTop: "10px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
            }}
          >
            <span>👤</span>
            <strong>Logged in as: {currentUserName}</strong>
          </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {viewMode === "modal" && selectedRecruitment && (
        <div style={modalOverlayStyle} onClick={handleCloseView}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                background:
                  pendingAction === "Shortlisted"
                    ? "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)"
                    : pendingAction === "Rejected"
                      ? "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"
                      : "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
                padding: "20px 25px",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: "white",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                📋 HR Screening - {pendingAction} Action
              </h3>
              <button
                onClick={handleCloseView}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "25px" }}>{renderDetailsContent()}</div>
          </div>
        </div>
      )}

      {/* PAGE VIEW */}
      {viewMode === "page" && selectedRecruitment && (
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h3>📋 Application Details - View Mode</h3>
            <button className={styles.closeBtn} onClick={handleCloseView}>
              ✕
            </button>
          </div>
          <div className={styles.detailsContent}>{renderDetailsContent()}</div>
        </div>
      )}

      {/* FILTER BADGE - When filtered from Interviews */}
      {!viewMode && jobDetailsIdFilter && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
            padding: "16px 20px",
            background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
            borderRadius: "12px",
            border: "2px solid #ab47bc",
            boxShadow: "0 4px 12px rgba(171, 71, 188, 0.15)",
          }}
        >
          <span style={{ fontSize: "24px" }}>🔗</span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "12px",
                color: "#7b1fa2",
                fontWeight: 500,
                marginBottom: "2px",
              }}
            >
              Filtered from Interviews
            </div>
            <div
              style={{ fontSize: "16px", fontWeight: 700, color: "#4a148c" }}
            >
              Job Details ID: {jobDetailsIdFilter}
            </div>
          </div>
          <div
            style={{
              background: "#ab47bc",
              color: "white",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            {filteredData.length}{" "}
            {filteredData.length === 1 ? "Record" : "Records"} Found
          </div>
          <button
            onClick={handleClearJobDetailsIdFilter}
            style={{
              background: "linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)",
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
            title="Clear filter and show all applicants"
          >
            ✕ Clear Filter
          </button>
        </div>
      )}

      {/* FILTERS */}
      {!viewMode && (
        <>
          <div style={filterRowStyle}>
            <div style={filterItemStyle}>
              <label style={filterLabelStyle}>🔍 Search:</label>
              <input
                type="text"
                placeholder="Search by name, title, ID, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            <div style={filterItemStyle}>
              <label style={filterLabelStyle}>📊 Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={filterInputStyle}
              >
                <option value="All">All Status</option>
                {getUniqueStatuses().map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div style={filterItemStyle}>
              <label style={filterLabelStyle}>🏢 Department:</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={filterInputStyle}
              >
                <option value="All">All Departments</option>
                {getUniqueDepartments().map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
            <div style={filterItemStyle}>
              <label style={filterLabelStyle}>📍 Location:</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={filterInputStyle}
              >
                <option value="All">All Locations</option>
                {getUniqueLocations().map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "20px",
              padding: "12px 20px",
              background: "#f5f5f5",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            <span>
              📋 Showing {filteredData.length > 0 ? startIndex + 1 : 0}-
              {Math.min(endIndex, filteredData.length)} of {filteredData.length}{" "}
              applications
            </span>
            {totalPages > 1 && (
              <span
                style={{
                  background: "#e3f2fd",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#1976d2",
                }}
              >
                Page {currentPage} of {totalPages}
              </span>
            )}
          </div>

          {/* TABLE - Delete button removed from Actions */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Job Details ID</th>
                  <th>Job ID</th>
                  <th>Title</th>
                  <th>Candidate</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Reviewed By</th>
                  <th>Resume</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className={styles.noData}>
                      <span>📭</span>
                      <p>No applications found</p>
                      {jobDetailsIdFilter && (
                        <button
                          onClick={handleClearJobDetailsIdFilter}
                          style={{
                            marginTop: "10px",
                            padding: "8px 16px",
                            background: "#ab47bc",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          Clear Filter & Show All
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((recruitment, index) => (
                    <tr
                      key={recruitment.Id}
                      style={{
                        background:
                          recruitment.Status === "Shortlisted"
                            ? "linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)"
                            : recruitment.Status === "Rejected"
                              ? "linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)"
                              : recruitment.Status === "Draft"
                                ? "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)"
                                : jobDetailsIdFilter &&
                                    recruitment.JobDetailsId ===
                                      jobDetailsIdFilter
                                  ? "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)"
                                  : "transparent",
                      }}
                    >
                      <td>
                        <span
                          style={{
                            background: "#e3f2fd",
                            padding: "4px 10px",
                            borderRadius: "50%",
                            fontWeight: 600,
                            color: "#1976d2",
                          }}
                        >
                          {startIndex + index + 1}
                        </span>
                      </td>
                      {/* Job Details ID - Beautiful Badge */}
                      <td>
                        <div
                          style={{
                            ...jobDetailsIdStyle,
                            background:
                              jobDetailsIdFilter &&
                              recruitment.JobDetailsId === jobDetailsIdFilter
                                ? "linear-gradient(135deg, #ab47bc 0%, #7b1fa2 100%)"
                                : jobDetailsIdStyle.background,
                            color:
                              jobDetailsIdFilter &&
                              recruitment.JobDetailsId === jobDetailsIdFilter
                                ? "white"
                                : jobDetailsIdStyle.color,
                            borderColor:
                              jobDetailsIdFilter &&
                              recruitment.JobDetailsId === jobDetailsIdFilter
                                ? "#7b1fa2"
                                : "#ba68c8",
                          }}
                        >
                          <span>📋</span>
                          {recruitment.JobDetailsId}
                        </div>
                      </td>
                      {/* Job ID - Clickable Beautiful Badge */}
                      <td>
                        <div
                          style={jobIdLinkStyle}
                          onClick={() => handleJobIdClick(recruitment.JobId)}
                          title={`Click to view Job ${recruitment.JobId} in Job Openings`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(33, 150, 243, 0.4)";
                            e.currentTarget.style.background =
                              "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)";
                            e.currentTarget.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 6px rgba(33, 150, 243, 0.2)";
                            e.currentTarget.style.background =
                              "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)";
                            e.currentTarget.style.color = "#1565c0";
                          }}
                        >
                          <span>🔗</span>
                          {recruitment.JobId}
                          <span style={{ fontSize: "10px" }}>→</span>
                        </div>
                      </td>
                      <td>
                        <strong>{recruitment.Title}</strong>
                      </td>
                      <td>
                        {recruitment.CandidateName ? (
                          <div style={{ fontSize: "12px" }}>
                            <div style={{ fontWeight: 600 }}>
                              {recruitment.CandidateName}
                            </div>
                            {recruitment.EmailId && (
                              <div style={{ color: "#666" }}>
                                📧 {recruitment.EmailId}
                              </div>
                            )}
                            {recruitment.PhoneNumber && (
                              <div style={{ color: "#666" }}>
                                📞 {recruitment.PhoneNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#999", fontSize: "12px" }}>
                            Not provided
                          </span>
                        )}
                      </td>
                      <td>{recruitment.Department}</td>
                      <td>{recruitment.Location}</td>
                      <td>{formatDate(recruitment.CreatedOn)}</td>
                      <td>
                        {isActionCompleted(recruitment.Status || "Open") ? (
                          <span
                            style={getStatusStyle(recruitment.Status || "Open")}
                          >
                            {recruitment.Status}
                          </span>
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
                              padding: "8px 12px",
                              borderRadius: "8px",
                              border: "2px solid #e0e0e0",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "13px",
                              background:
                                recruitment.Status === "Draft"
                                  ? "#fff3e0"
                                  : "#fff",
                              minWidth: "120px",
                            }}
                          >
                            <option value="Open">Open</option>
                            <option value="Draft">📝 Draft</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        )}
                      </td>
                      <td>
                        {recruitment.ReviewedByName ? (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            👤 {recruitment.ReviewedByName}
                          </span>
                        ) : (
                          <span style={{ color: "#999", fontSize: "12px" }}>
                            -
                          </span>
                        )}
                      </td>
                      <td>
                        {recruitment.HasAttachment ? (
                          <button
                            onClick={() =>
                              void handleOpenAttachment(recruitment.Id!)
                            }
                            style={{
                              background:
                                "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                              border: "1px solid #90caf9",
                              borderRadius: "6px",
                              padding: "6px 12px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "13px",
                              color: "#1976d2",
                              fontWeight: 600,
                            }}
                            title="Click to open resume"
                          >
                            📄 View
                          </button>
                        ) : (
                          <span style={{ color: "#999", fontSize: "12px" }}>
                            No Resume
                          </span>
                        )}
                      </td>
                      {/* Actions - Only View button, Delete removed */}
                      <td>
                        <button
                          onClick={() => void handleView(recruitment)}
                          title="View Details"
                          style={{
                            padding: "8px 16px",
                            background:
                              "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(33, 150, 243, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          👁️ View
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
            <div style={paginationContainerStyle}>
              <button
                style={
                  currentPage === 1 ? disabledNavButtonStyle : navButtonStyle
                }
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                ⏮️ First
              </button>
              <button
                style={
                  currentPage === 1 ? disabledNavButtonStyle : navButtonStyle
                }
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ◀️ Prev
              </button>
              <div style={{ display: "flex", gap: "6px", margin: "0 10px" }}>
                {getPageNumbers().map((page, index) =>
                  typeof page === "number" ? (
                    <button
                      key={index}
                      style={
                        page === currentPage
                          ? activePageButtonStyle
                          : pageButtonStyle
                      }
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={index}
                      style={{
                        padding: "8px 12px",
                        color: "#999",
                        fontWeight: 600,
                      }}
                    >
                      {page}
                    </span>
                  ),
                )}
              </div>
              <button
                style={
                  currentPage === totalPages
                    ? disabledNavButtonStyle
                    : navButtonStyle
                }
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next ▶️
              </button>
              <button
                style={
                  currentPage === totalPages
                    ? disabledNavButtonStyle
                    : navButtonStyle
                }
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last ⏭️
              </button>
            </div>
          )}
        </>
      )}

      {/* CSS Animation */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Applicant;
