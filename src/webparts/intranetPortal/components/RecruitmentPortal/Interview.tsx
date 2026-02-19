import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  SPService,
  IInterviewLog,
  IInterviewSummary,
  IRecruitmentApplication,
  ISiteUser,
} from "./RecruitmentPortal";
import styles from "./Interview.module.scss";

interface IInterviewProps {
  service: SPService;
  onNavigateToJob?: (jobId: string) => void;
  onNavigateToApplicant?: (jobDetailsId: string) => void;
}

const Interview: React.FC<IInterviewProps> = ({ service, onNavigateToJob, onNavigateToApplicant }) => {
  // ==================== STATE ====================
  const [shortlistedCandidates, setShortlistedCandidates] = useState<IRecruitmentApplication[]>([]);
  const [interviewSummaries, setInterviewSummaries] = useState<IInterviewSummary[]>([]);
  const [siteUsers, setSiteUsers] = useState<ISiteUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // View states
  const [activeTab, setActiveTab] = useState<"candidates" | "interviews">("candidates");
  const [selectedCandidate, setSelectedCandidate] = useState<IRecruitmentApplication | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<IInterviewSummary | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

  // New Round Form state
  const [showAddRoundForm, setShowAddRoundForm] = useState<boolean>(false);
  const [editingRound, setEditingRound] = useState<IInterviewLog | null>(null);
  const [roundForm, setRoundForm] = useState({
    RoundType: "Round 1",
    InterviewDate: "",
    StartTime: "",
    EndTime: "",
    SelectedUserIds: [] as number[],
    Status: "Scheduled",
    Comments: "",
  });

  // Final Decision state
  const [showFinalDecision, setShowFinalDecision] = useState<boolean>(false);
  const [finalForm, setFinalForm] = useState({
    FinalStatus: "Pending",
    FinalComments: "",
  });

  // People picker state
  const [userSearchTerm, setUserSearchTerm] = useState<string>("");
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);

  // ==================== DATA LOADING ====================
  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [candidatesData, summariesData, usersData] = await Promise.all([
        service.getShortlistedRecruitments(),
        service.getInterviewSummaries(),
        service.getSiteUsers(),
      ]);
      setShortlistedCandidates(candidatesData);
      setInterviewSummaries(summariesData);
      setSiteUsers(usersData);
      console.log(
        "✅ Data loaded - Shortlisted:",
        candidatesData.length,
        "Summaries:",
        summariesData.length,
        "Users:",
        usersData.length
      );
    } catch (error) {
      console.error("❌ Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, departmentFilter, statusFilter]);

  // ==================== NAVIGATION HANDLERS ====================
  const handleJobIdClick = (jobId: string): void => {
    if (onNavigateToJob && jobId) {
      onNavigateToJob(jobId);
    }
  };

  const handleJobDetailsIdClick = (jobDetailsId: string): void => {
    if (onNavigateToApplicant && jobDetailsId) {
      onNavigateToApplicant(jobDetailsId);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const getUniqueDepartments = (): string[] => {
    const depts = new Set<string>();
    shortlistedCandidates.forEach((c) => c.Department && depts.add(c.Department));
    interviewSummaries.forEach((i) => i.Department && depts.add(i.Department));
    return Array.from(depts).sort();
  };

  const getExistingSummary = (jobDetailsId: string): IInterviewSummary | undefined => {
    return interviewSummaries.find((s) => s.JobDetailsId === jobDetailsId);
  };

  const getFilteredCandidates = (): IRecruitmentApplication[] => {
    let filtered = [...shortlistedCandidates];

    if (departmentFilter !== "All") {
      filtered = filtered.filter((c) => c.Department === departmentFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.CandidateName?.toLowerCase().includes(search) ||
          c.JobDetailsId?.toLowerCase().includes(search) ||
          c.JobId?.toLowerCase().includes(search) ||
          c.EmailId?.toLowerCase().includes(search) ||
          c.PhoneNumber?.includes(search)
      );
    }

    if (statusFilter === "Has Interviews") {
      filtered = filtered.filter((c) => getExistingSummary(c.JobDetailsId));
    } else if (statusFilter === "No Interviews") {
      filtered = filtered.filter((c) => !getExistingSummary(c.JobDetailsId));
    }

    return filtered;
  };

  const getFilteredSummaries = (): IInterviewSummary[] => {
    let filtered = [...interviewSummaries];

    if (departmentFilter !== "All") {
      filtered = filtered.filter((i) => i.Department === departmentFilter);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.CandidateName?.toLowerCase().includes(search) ||
          i.JobDetailsId?.toLowerCase().includes(search) ||
          i.JobId?.toLowerCase().includes(search) ||
          i.EmailId?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((i) => i.FinalStatus === statusFilter);
    }

    return filtered;
  };

  const hasActiveFilters = (): boolean => {
    return searchTerm !== "" || departmentFilter !== "All" || statusFilter !== "All";
  };

  const clearAllFilters = (): void => {
    setSearchTerm("");
    setDepartmentFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const filteredData =
    activeTab === "candidates" ? getFilteredCandidates() : getFilteredSummaries();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const resetRoundForm = (): void => {
    setRoundForm({
      RoundType: "Round 1",
      InterviewDate: "",
      StartTime: "",
      EndTime: "",
      SelectedUserIds: [],
      Status: "Scheduled",
      Comments: "",
    });
    setUserSearchTerm("");
    setShowUserDropdown(false);
    setEditingRound(null);
  };

  const getStatusClass = (status: string): string => {
    const map: Record<string, string> = {
      pending: styles.statusPending,
      scheduled: styles.statusScheduled,
      passed: styles.statusPassed,
      failed: styles.statusFailed,
      selected: styles.statusSelected,
      rejected: styles.statusRejected,
    };
    return map[status?.toLowerCase()] || styles.statusPending;
  };

  const getRoundIcon = (roundType: string): string => {
    if (roundType.includes("1")) return "🔧";
    if (roundType.includes("2")) return "👨‍💼";
    if (roundType.toLowerCase().includes("hr")) return "👔";
    return "📋";
  };

  const getRoundColor = (roundType: string): string => {
    if (roundType.includes("1")) return "#2196f3";
    if (roundType.includes("2")) return "#9c27b0";
    if (roundType.toLowerCase().includes("hr")) return "#ff9800";
    return "#607d8b";
  };

  // Check if round is completed (Passed or Failed)
  const isRoundCompleted = (status: string): boolean => {
    return status === "Passed" || status === "Failed";
  };

  const getProgress = (summary: IInterviewSummary): number => {
    const totalRounds = 3;
    const completedRounds = summary.Rounds.filter(
      (r) => r.Status === "Passed" || r.Status === "Failed"
    ).length;
    const scheduledRounds = summary.Rounds.filter((r) => r.Status === "Scheduled").length;

    let progress = (completedRounds / totalRounds) * 80;
    progress += (scheduledRounds / totalRounds) * 20;

    if (summary.FinalStatus === "Selected" || summary.FinalStatus === "Rejected") {
      progress = 100;
    }

    return Math.min(progress, 100);
  };

  const getInterviewStatus = (summary: IInterviewSummary): string => {
    if (summary.FinalStatus === "Selected") return "✅ Selected";
    if (summary.FinalStatus === "Rejected") return "❌ Rejected";

    const rounds = summary.Rounds;
    if (rounds.length === 0) return "No Rounds";

    const lastRound = rounds[rounds.length - 1];
    return `${lastRound.RoundType}: ${lastRound.Status}`;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return "";
    try {
      const [hours, minutes] = timeStr.split(":");
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  // ==================== PEOPLE PICKER HELPERS ====================
  const filteredUsers = siteUsers.filter(
    (u) =>
      u.Title.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.Email.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const selectedUsers = siteUsers.filter((u) => roundForm.SelectedUserIds.includes(u.Id));

  const handleAddInterviewer = (user: ISiteUser): void => {
    if (!roundForm.SelectedUserIds.includes(user.Id)) {
      setRoundForm({
        ...roundForm,
        SelectedUserIds: [...roundForm.SelectedUserIds, user.Id],
      });
    }
    setUserSearchTerm("");
    setShowUserDropdown(false);
  };

  const handleRemoveInterviewer = (userId: number): void => {
    setRoundForm({
      ...roundForm,
      SelectedUserIds: roundForm.SelectedUserIds.filter((id) => id !== userId),
    });
  };

  // ==================== EVENT HANDLERS ====================
  const handleViewCandidate = async (candidate: IRecruitmentApplication): Promise<void> => {
    setSelectedCandidate(candidate);
    setViewMode("detail");

    const existingSummary = getExistingSummary(candidate.JobDetailsId);
    if (existingSummary) {
      setSelectedSummary(existingSummary);
      setFinalForm({
        FinalStatus: existingSummary.FinalStatus,
        FinalComments: existingSummary.FinalComments,
      });
    } else {
      setSelectedSummary(null);
      setFinalForm({ FinalStatus: "Pending", FinalComments: "" });
    }

    setShowAddRoundForm(false);
    setShowFinalDecision(false);
    resetRoundForm();
  };

  const handleViewSummary = (summary: IInterviewSummary): void => {
    setSelectedSummary(summary);
    setSelectedCandidate(null);
    setViewMode("detail");
    setFinalForm({
      FinalStatus: summary.FinalStatus,
      FinalComments: summary.FinalComments,
    });
    setShowAddRoundForm(false);
    setShowFinalDecision(false);
    resetRoundForm();
  };

  const handleBack = (): void => {
    setViewMode("list");
    setSelectedCandidate(null);
    setSelectedSummary(null);
    setShowAddRoundForm(false);
    setShowFinalDecision(false);
    resetRoundForm();
  };

  const handleAddRound = (): void => {
    setShowAddRoundForm(true);
    setEditingRound(null);

    const existingRounds = selectedSummary?.Rounds || [];
    const roundTypes = existingRounds.map((r) => r.RoundType);

    let nextRoundType = "Round 1";
    if (!roundTypes.includes("Round 1")) {
      nextRoundType = "Round 1";
    } else if (!roundTypes.includes("Round 2")) {
      nextRoundType = "Round 2";
    } else if (!roundTypes.includes("HR Round")) {
      nextRoundType = "HR Round";
    }

    setRoundForm({
      ...roundForm,
      RoundType: nextRoundType,
      SelectedUserIds: [],
    });
  };

  const handleEditRound = (round: IInterviewLog): void => {
    if (isRoundCompleted(round.Status)) {
      alert("⚠️ Cannot edit a completed round (Passed/Failed)");
      return;
    }

    setEditingRound(round);
    setShowAddRoundForm(true);

    const existingInterviewerIds = round.InterviewerIds || [];

    setRoundForm({
      RoundType: round.RoundType,
      InterviewDate: round.InterviewDate,
      StartTime: round.StartTime,
      EndTime: round.EndTime,
      SelectedUserIds: existingInterviewerIds,
      Status: round.Status,
      Comments: round.Comments,
    });
  };

  const handleCancelRoundForm = (): void => {
    setShowAddRoundForm(false);
    resetRoundForm();
  };

  const handleSaveRound = async (): Promise<void> => {
    if (!roundForm.InterviewDate || !roundForm.StartTime || roundForm.SelectedUserIds.length === 0) {
      alert("⚠️ Please fill in:\n• Interview Date\n• Start Time\n• At least one Interviewer");
      return;
    }

    const candidate = selectedCandidate;
    const summary = selectedSummary;

    if (!candidate && !summary) {
      alert("⚠️ No candidate selected");
      return;
    }

    const jobDetailsId = candidate?.JobDetailsId || summary?.JobDetailsId || "";
    const jobId = candidate?.JobId || summary?.JobId || "";

    setUpdating(true);
    try {
      if (editingRound?.Id) {
        await service.updateInterviewLog(editingRound.Id, {
          InterviewDate: roundForm.InterviewDate,
          StartTime: roundForm.StartTime,
          EndTime: roundForm.EndTime,
          InterviewerIds: roundForm.SelectedUserIds,
          Status: roundForm.Status,
          Comments: roundForm.Comments,
        });
        alert("✅ Interview round updated successfully!");
      } else {
        await service.createInterviewLog({
          JobDetailsId: jobDetailsId,
          JobId: jobId,
          CandidateName: candidate?.CandidateName || summary?.CandidateName || "",
          PhoneNumber: candidate?.PhoneNumber || summary?.PhoneNumber || "",
          EmailId: candidate?.EmailId || summary?.EmailId || "",
          Department: candidate?.Department || summary?.Department || "",
          Location: candidate?.Location || summary?.Location || "",
          Experience: candidate?.Experience || summary?.Experience || "",
          JobTitle: candidate?.Title || summary?.JobTitle || "",
          RoundType: roundForm.RoundType,
          InterviewDate: roundForm.InterviewDate,
          StartTime: roundForm.StartTime,
          EndTime: roundForm.EndTime,
          InterviewerIds: roundForm.SelectedUserIds,
          Status: roundForm.Status,
          Comments: roundForm.Comments,
          ReviewedBy: candidate?.ReviewedByName || summary?.ReviewedBy || "",
        });
        alert(`✅ ${roundForm.RoundType} scheduled successfully!`);
      }

      await loadData();

      const updatedSummary = (await service.getInterviewSummaries()).find(
        (s) => s.JobDetailsId === jobDetailsId
      );
      if (updatedSummary) {
        setSelectedSummary(updatedSummary);
      }

      setShowAddRoundForm(false);
      resetRoundForm();
    } catch (error) {
      console.error("❌ Error saving round:", error);
      alert("❌ Error saving interview round!");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRound = async (round: IInterviewLog): Promise<void> => {
    if (!round.Id) return;

    if (isRoundCompleted(round.Status)) {
      alert("⚠️ Cannot delete a completed round (Passed/Failed)");
      return;
    }

    if (
      confirm(
        `⚠️ Delete ${round.RoundType} for ${round.CandidateName}?\n\nThis action cannot be undone.`
      )
    ) {
      try {
        await service.deleteInterviewLog(round.Id);
        alert("✅ Interview round deleted successfully!");
        await loadData();

        const jobDetailsId = selectedCandidate?.JobDetailsId || selectedSummary?.JobDetailsId || "";
        const updatedSummary = (await service.getInterviewSummaries()).find(
          (s) => s.JobDetailsId === jobDetailsId
        );
        setSelectedSummary(updatedSummary || null);
      } catch (error) {
        console.error("❌ Error deleting round:", error);
        alert("❌ Error deleting interview round!");
      }
    }
  };

  const handleSaveFinalDecision = async (): Promise<void> => {
    const jobDetailsId = selectedCandidate?.JobDetailsId || selectedSummary?.JobDetailsId || "";

    if (!jobDetailsId) {
      alert("⚠️ No candidate selected");
      return;
    }

    if (finalForm.FinalStatus === "Pending") {
      alert("⚠️ Please select a Final Status (Selected or Rejected)");
      return;
    }

    if (!finalForm.FinalComments.trim()) {
      alert("⚠️ Please add Final Comments explaining the decision");
      return;
    }

    setUpdating(true);
    try {
      await service.updateInterviewLogFinalStatus(
        jobDetailsId,
        finalForm.FinalStatus,
        finalForm.FinalComments
      );
      alert(
        `✅ Final decision saved!\n\nCandidate: ${selectedCandidate?.CandidateName || selectedSummary?.CandidateName
        }\nStatus: ${finalForm.FinalStatus}`
      );

      await loadData();

      const updatedSummary = (await service.getInterviewSummaries()).find(
        (s) => s.JobDetailsId === jobDetailsId
      );
      if (updatedSummary) {
        setSelectedSummary(updatedSummary);
      }

      setShowFinalDecision(false);
    } catch (error) {
      console.error("❌ Error saving final decision:", error);
      alert("❌ Error saving final decision!");
    } finally {
      setUpdating(false);
    }
  };

  const handleForwardOnboarding = (): void => {
    const summary = selectedSummary;
    if (!summary || summary.FinalStatus !== "Selected") {
      alert("⚠️ Only Selected candidates can be forwarded to Onboarding");
      return;
    }

    if (
      confirm(
        `Forward ${summary.CandidateName} to Onboarding?\n\nReferBy Id: ${summary.JobDetailsId}`
      )
    ) {
      alert(
        `✅ ${summary.CandidateName} has been forwarded to Onboarding!\n\nReferBy Id: ${summary.JobDetailsId}\nDepartment: ${summary.Department}`
      );
    }
  };

  const handleOpenResume = async (jobDetailsId: string): Promise<void> => {
    try {
      const candidate = shortlistedCandidates.find((c) => c.JobDetailsId === jobDetailsId);
      if (candidate?.Id) {
        const attachments = await service.getRecruitmentAttachments(candidate.Id);
        if (attachments.length > 0) {
          window.open(attachments[0].ServerRelativeUrl, "_blank");
        } else {
          alert("📄 No resume attachment found for this candidate.");
        }
      } else {
        alert("⚠️ Candidate not found in shortlisted list.");
      }
    } catch (error) {
      console.error("❌ Error opening resume:", error);
      alert("❌ Error opening resume!");
    }
  };

  const handleDeleteAllRounds = async (): Promise<void> => {
    const jobDetailsId = selectedCandidate?.JobDetailsId || selectedSummary?.JobDetailsId || "";
    const candidateName = selectedCandidate?.CandidateName || selectedSummary?.CandidateName || "";

    if (!jobDetailsId) return;

    if (
      confirm(
        `⚠️ Delete ALL interview records for ${candidateName}?\n\nThis will remove all rounds and cannot be undone.`
      )
    ) {
      try {
        await service.deleteAllInterviewLogsForCandidate(jobDetailsId);
        alert("✅ All interview records deleted successfully!");
        await loadData();
        handleBack();
      } catch (error) {
        console.error("❌ Error deleting all rounds:", error);
        alert("❌ Error deleting interview records!");
      }
    }
  };

  // ==================== RENDER: LOADING ====================
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner} />
          <h3>Loading Interview Data</h3>
          <p>Please wait while we fetch the latest information...</p>
        </div>
      </div>
    );
  }

  // ==================== RENDER: DETAIL VIEW ====================
  if (viewMode === "detail") {
    const candidate = selectedCandidate;
    const summary = selectedSummary;
    const jobDetailsId = candidate?.JobDetailsId || summary?.JobDetailsId || "";
    const jobId = candidate?.JobId || summary?.JobId || "";
    const candidateName = candidate?.CandidateName || summary?.CandidateName || "";
    const rounds = summary?.Rounds || [];

    return (
      <div className={styles.pageContainer}>
        {/* Compact Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "12px 16px",
            background: "#ffffff",
            borderRadius: "10px",
            marginBottom: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={handleBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              background: "#f1f5f9",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              color: "#475569",
            }}
          >
            ← Back
          </button>
         
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#1e293b" }}>
              {candidateName || "Candidate Details"}
            </h2>
            
          </div>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              background: summary?.FinalStatus === "Selected" ? "#dcfce7" :
                summary?.FinalStatus === "Rejected" ? "#fee2e2" : "#fef9c3",
              color: summary?.FinalStatus === "Selected" ? "#166534" :
                summary?.FinalStatus === "Rejected" ? "#991b1b" : "#854d0e",
            }}
          >
            {summary?.FinalStatus || "Pending"}
          </span>
        </div>

        {/* Compact Quick Stats - Horizontal */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          {[
            { icon: "📅", value: rounds.length, label: "Rounds" },
            { icon: "✅", value: rounds.filter((r) => r.Status === "Passed").length, label: "Passed" },
            { icon: "⏳", value: rounds.filter((r) => r.Status === "Scheduled" || r.Status === "Pending").length, label: "Pending" },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                background: "#ffffff",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <span style={{ fontSize: "18px" }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Candidate Information Card - Compact */}
        <div className={styles.sectionCard} style={{ marginBottom: "12px", padding: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>👤</span> Candidate Information
            </h3>
            <button
              onClick={() => void handleOpenResume(jobDetailsId)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 10px",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
                color: "#475569",
              }}
            >
              📄 View Resume
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "12px",
            }}
          >
            {[
              { label: "ReferBy Id", value: jobDetailsId, clickable: true, onClick: () => handleJobDetailsIdClick(jobDetailsId) },
              { label: "Job ID", value: jobId, clickable: true, onClick: () => handleJobIdClick(jobId) },
              { label: "Full Name", value: candidateName || "-" },
              { label: "Phone", value: candidate?.PhoneNumber || summary?.PhoneNumber || "-" },
              { label: "Email", value: candidate?.EmailId || summary?.EmailId || "-" },
              { label: "Department", value: candidate?.Department || summary?.Department || "-" },
              { label: "Job Title", value: candidate?.Title || summary?.JobTitle || "-" },
              { label: "Location", value: candidate?.Location || summary?.Location || "-" },
              { label: "Experience", value: candidate?.Experience || summary?.Experience || "-" },
              { label: "Reviewed By", value: candidate?.ReviewedByName || summary?.ReviewedBy || "-" },
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ fontSize: "10px", fontWeight: 500, color: "#64748b", textTransform: "uppercase", marginBottom: "2px" }}>
                  {item.label}
                </div>
                {item.clickable ? (
                  <span
                    onClick={item.onClick}
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#1e40af",
                      cursor: "pointer",
                    }}
                  >
                    {item.value}
                  </span>
                ) : (
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#1e293b" }}>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Section - Compact */}
        {summary && rounds.length > 0 && (
          <div className={styles.sectionCard} style={{ marginBottom: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>📊</span> Interview Progress
              </h3>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e40af" }}>
                {Math.round(getProgress(summary))}%
              </span>
            </div>
            <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${getProgress(summary)}%`,
                  height: "100%",
                  background: summary.FinalStatus === "Selected" ? "#22c55e" :
                    summary.FinalStatus === "Rejected" ? "#ef4444" : "#1e40af",
                  borderRadius: "3px",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Interview Rounds Section */}
        <div className={styles.sectionCard} style={{ marginBottom: "12px", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🎯</span> Interview Rounds
            </h3>
            {!showAddRoundForm && (
              <button
                onClick={handleAddRound}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 12px",
                  background: "#1e40af",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#ffffff",
                }}
              >
                + Schedule Round
              </button>
            )}
          </div>

          {/* Inline Add/Edit Round Form */}
          {showAddRoundForm && (
            <div className={styles.inlineFormContainer}>
              <div className={styles.inlineFormHeader}>
                <h4>{editingRound ? "✏️ Edit Interview Round" : "📅 Schedule New Round"}</h4>
                <button className={styles.closeFormBtn} onClick={handleCancelRoundForm}>
                  ×
                </button>
              </div>
              <div className={styles.inlineFormBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Round Type <span className={styles.required}>*</span></label>
                    <select
                      value={roundForm.RoundType}
                      onChange={(e) => setRoundForm({ ...roundForm, RoundType: e.target.value })}
                      disabled={!!editingRound}
                      className={styles.selectInput}
                    >
                      <option value="Round 1">🔧 Round 1 - Technical</option>
                      <option value="Round 2">👨‍💼 Round 2 - Technical/Managerial</option>
                      <option value="HR Round">👔 HR Round</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Status <span className={styles.required}>*</span></label>
                    <select
                      value={roundForm.Status}
                      onChange={(e) => setRoundForm({ ...roundForm, Status: e.target.value })}
                      className={styles.selectInput}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Scheduled">📅 Scheduled</option>
                      <option value="Passed">✅ Passed</option>
                      <option value="Failed">❌ Failed</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Interview Date <span className={styles.required}>*</span></label>
                    <input
                      type="date"
                      value={roundForm.InterviewDate}
                      onChange={(e) => setRoundForm({ ...roundForm, InterviewDate: e.target.value })}
                      className={styles.dateInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Start Time <span className={styles.required}>*</span></label>
                    <input
                      type="time"
                      value={roundForm.StartTime}
                      onChange={(e) => setRoundForm({ ...roundForm, StartTime: e.target.value })}
                      className={styles.timeInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>End Time</label>
                    <input
                      type="time"
                      value={roundForm.EndTime}
                      onChange={(e) => setRoundForm({ ...roundForm, EndTime: e.target.value })}
                      className={styles.timeInput}
                    />
                  </div>
                </div>

                {/* People Picker */}
                <div className={styles.formGroup}>
                  <label>Interviewers <span className={styles.required}>*</span></label>
                  <div className={styles.peoplePicker}>
                    {selectedUsers.length > 0 && (
                      <div className={styles.selectedPeople}>
                        {selectedUsers.map((user) => (
                          <div key={user.Id} className={styles.personChip}>
                            <span className={styles.personAvatar}>{user.Title.charAt(0)}</span>
                            <span className={styles.personName}>{user.Title}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveInterviewer(user.Id)}
                              className={styles.removePersonBtn}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className={styles.searchContainer}>
                      <input
                        type="text"
                        placeholder="Search for interviewers..."
                        value={userSearchTerm}
                        onChange={(e) => {
                          setUserSearchTerm(e.target.value);
                          setShowUserDropdown(true);
                        }}
                        onFocus={() => setShowUserDropdown(true)}
                        className={styles.searchInput}
                      />
                      {showUserDropdown && userSearchTerm && (
                        <div className={styles.searchDropdown}>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.slice(0, 8).map((user) => (
                              <div
                                key={user.Id}
                                className={`${styles.searchItem} ${roundForm.SelectedUserIds.includes(user.Id) ? styles.selected : ""
                                  }`}
                                onClick={() => handleAddInterviewer(user)}
                              >
                                <span className={styles.itemAvatar}>{user.Title.charAt(0)}</span>
                                <div className={styles.itemInfo}>
                                  <span className={styles.itemName}>{user.Title}</span>
                                  <span className={styles.itemEmail}>{user.Email}</span>
                                </div>
                                {roundForm.SelectedUserIds.includes(user.Id) && (
                                  <span className={styles.checkMark}>✓</span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className={styles.noResults}>No users found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Comments / Feedback</label>
                  <textarea
                    value={roundForm.Comments}
                    onChange={(e) => setRoundForm({ ...roundForm, Comments: e.target.value })}
                    rows={2}
                    placeholder="Enter interview feedback..."
                    className={styles.textareaInput}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={handleCancelRoundForm}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.submitBtn}
                    onClick={() => void handleSaveRound()}
                    disabled={updating}
                  >
                    {updating ? "Saving..." : editingRound ? "Update" : "Schedule"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {rounds.length === 0 && !showAddRoundForm ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "#64748b",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>📅</div>
              <p style={{ margin: "0 0 12px", fontSize: "14px" }}>No Interview Rounds Scheduled</p>
              <button
                onClick={handleAddRound}
                style={{
                  padding: "8px 16px",
                  background: "#1e40af",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              >
                📅 Schedule First Round
              </button>
            </div>
          ) : rounds.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {rounds.map((round, index) => (
                <div
                  key={round.Id || index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: getRoundColor(round.RoundType),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                    }}
                  >
                    {getRoundIcon(round.RoundType)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontWeight: 600, fontSize: "13px", color: "#1e293b" }}>
                        {round.RoundType}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: round.Status === "Passed" ? "#dcfce7" :
                            round.Status === "Failed" ? "#fee2e2" :
                              round.Status === "Scheduled" ? "#dbeafe" : "#fef9c3",
                          color: round.Status === "Passed" ? "#166534" :
                            round.Status === "Failed" ? "#991b1b" :
                              round.Status === "Scheduled" ? "#1e40af" : "#854d0e",
                        }}
                      >
                        {round.Status}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                      <span>📅 {formatDate(round.InterviewDate)}</span>
                      <span>🕐 {formatTime(round.StartTime)} - {formatTime(round.EndTime) || "N/A"}</span>
                      <span>👥 {round.InterviewerNames || "-"}</span>
                    </div>
                  </div>
                  {!isRoundCompleted(round.Status) ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleEditRound(round)}
                        style={{
                          padding: "6px 10px",
                          background: "#f1f5f9",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => void handleDeleteRound(round)}
                        style={{
                          padding: "6px 10px",
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                      🔒 Completed
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Final Decision Section - Compact */}
        {rounds.length > 0 && (
          <div className={styles.sectionCard} style={{ marginBottom: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🏆</span> Final Decision
              </h3>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: summary?.FinalStatus === "Selected" ? "#dcfce7" :
                    summary?.FinalStatus === "Rejected" ? "#fee2e2" : "#fef9c3",
                  color: summary?.FinalStatus === "Selected" ? "#166534" :
                    summary?.FinalStatus === "Rejected" ? "#991b1b" : "#854d0e",
                }}
              >
                {summary?.FinalStatus || "Pending"}
              </span>
            </div>

            {!showFinalDecision ? (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {summary?.FinalStatus !== "Pending" && (
                  <div style={{ flex: 1, padding: "10px", background: "#f8fafc", borderRadius: "6px", fontSize: "13px" }}>
                    <span>{summary?.FinalStatus === "Selected" ? "🎉" : "😔"}</span>
                    <span style={{ marginLeft: "6px" }}>{summary?.FinalComments}</span>
                  </div>
                )}
                <button
                  onClick={() => setShowFinalDecision(true)}
                  style={{
                    padding: "8px 14px",
                    background: "#1e40af",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {summary?.FinalStatus === "Pending" ? "🎯 Make Decision" : "✏️ Edit"}
                </button>
                {summary?.FinalStatus === "Selected" && (
                  <button
                    onClick={handleForwardOnboarding}
                    style={{
                      padding: "8px 14px",
                      background: "#22c55e",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    🚀 Forward to Onboarding
                  </button>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                  <label
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "6px",
                      border: `2px solid ${finalForm.FinalStatus === "Selected" ? "#22c55e" : "#e2e8f0"}`,
                      background: finalForm.FinalStatus === "Selected" ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="radio"
                      name="finalStatus"
                      value="Selected"
                      checked={finalForm.FinalStatus === "Selected"}
                      onChange={(e) => setFinalForm({ ...finalForm, FinalStatus: e.target.value })}
                    />
                    <span>✅ Selected</span>
                  </label>
                  <label
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "6px",
                      border: `2px solid ${finalForm.FinalStatus === "Rejected" ? "#ef4444" : "#e2e8f0"}`,
                      background: finalForm.FinalStatus === "Rejected" ? "#fef2f2" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="radio"
                      name="finalStatus"
                      value="Rejected"
                      checked={finalForm.FinalStatus === "Rejected"}
                      onChange={(e) => setFinalForm({ ...finalForm, FinalStatus: e.target.value })}
                    />
                    <span>❌ Rejected</span>
                  </label>
                </div>
                <textarea
                  value={finalForm.FinalComments}
                  onChange={(e) => setFinalForm({ ...finalForm, FinalComments: e.target.value })}
                  rows={2}
                  placeholder="Enter decision comments..."
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setShowFinalDecision(false)}
                    disabled={updating}
                    style={{
                      padding: "8px 14px",
                      background: "#f1f5f9",
                      color: "#475569",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => void handleSaveFinalDecision()}
                    disabled={updating}
                    style={{
                      padding: "8px 14px",
                      background: "#1e40af",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {updating ? "Saving..." : "Save Decision"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Danger Zone - Compact */}
        {rounds.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "#fef2f2",
              borderRadius: "8px",
              border: "1px solid #fecaca",
            }}
          >
            <div>
              <span style={{ fontWeight: 600, fontSize: "13px", color: "#991b1b" }}>⚠️ Danger Zone</span>
              <span style={{ fontSize: "12px", color: "#b91c1c", marginLeft: "10px" }}>
                Permanently delete all interview records
              </span>
            </div>
            <button
              onClick={() => void handleDeleteAllRounds()}
              style={{
                padding: "6px 12px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              Delete All
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==================== RENDER: LIST VIEW ====================
  return (
    <div className={styles.pageContainer}>
      {/* Compact Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            🎯
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>
              Interview Management
            </h1>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              Manage schedules and track progress
            </p>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards - Horizontal */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {[
          { icon: "👥", value: shortlistedCandidates.length, label: "Shortlisted", color: "#3b82f6" },
          { icon: "📋", value: interviewSummaries.length, label: "Interviews", color: "#8b5cf6" },
          { icon: "⏳", value: interviewSummaries.filter((s) => s.FinalStatus === "Pending").length, label: "In Progress", color: "#f59e0b" },
          { icon: "✅", value: interviewSummaries.filter((s) => s.FinalStatus === "Selected").length, label: "Selected", color: "#22c55e" },
          { icon: "❌", value: interviewSummaries.filter((s) => s.FinalStatus === "Rejected").length, label: "Rejected", color: "#ef4444" },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              flex: "1 1 auto",
              minWidth: "120px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <span
              style={{
                width: "32px",
                height: "32px",
                background: `${stat.color}15`,
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
              }}
            >
              {stat.icon}
            </span>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#1e293b" }}>{stat.value}</div>
              <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Compact Tabs + Filters in One Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 14px",
          background: "#ffffff",
          borderRadius: "10px",
          marginBottom: "12px",
          border: "1px solid #e2e8f0",
          flexWrap: "wrap",
        }}
      >
        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginRight: "auto" }}>
          <button
            onClick={() => {
              setActiveTab("candidates");
              setStatusFilter("All");
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              background: activeTab === "candidates" ? "#1e40af" : "#f1f5f9",
              color: activeTab === "candidates" ? "#ffffff" : "#475569",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            👥 Candidates
            <span
              style={{
                padding: "1px 6px",
                borderRadius: "8px",
                fontSize: "10px",
                background: activeTab === "candidates" ? "rgba(255,255,255,0.2)" : "#e2e8f0",
              }}
            >
              {shortlistedCandidates.length}
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("interviews");
              setStatusFilter("All");
            }}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 600,
              background: activeTab === "interviews" ? "#1e40af" : "#f1f5f9",
              color: activeTab === "interviews" ? "#ffffff" : "#475569",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📋 Interviews
            <span
              style={{
                padding: "1px 6px",
                borderRadius: "8px",
                fontSize: "10px",
                background: activeTab === "interviews" ? "rgba(255,255,255,0.2)" : "#e2e8f0",
              }}
            >
              {interviewSummaries.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: "200px", flex: "1" }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px 7px 32px",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              fontSize: "12px",
              background: "#f8fafc",
              boxSizing: "border-box",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            🔍
          </span>
        </div>

        {/* Department Filter */}
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
          {getUniqueDepartments().map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          {activeTab === "candidates" ? (
            <>
              <option value="All">All Status</option>
              <option value="Has Interviews">Has Interviews</option>
              <option value="No Interviews">No Interviews</option>
            </>
          ) : (
            <>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </>
          )}
        </select>

        {/* Clear Button */}
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            style={{
              padding: "7px 10px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 500,
              color: "#dc2626",
              whiteSpace: "nowrap",
            }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className={styles.tableCard}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>ReferBy Id</th>
              <th>Job ID</th>
              <th>Candidate Name</th>
              <th>Contact</th>
              <th>Department</th>
              {activeTab === "interviews" && <th>Rounds</th>}
              {activeTab === "interviews" && <th>Status</th>}
              <th>Resume</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={activeTab === "interviews" ? 10 : 8}>
                  <div className={styles.tableEmptyState}>
                    <div className={styles.emptyIcon}>📭</div>
                    <h4>No Records Found</h4>
                    <p>Try adjusting your search or filters.</p>
                    {hasActiveFilters() && (
                      <button
                        onClick={clearAllFilters}
                        style={{
                          marginTop: "10px",
                          padding: "8px 16px",
                          background: "#1e40af",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "13px",
                        }}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : activeTab === "candidates" ? (
              (paginatedData as IRecruitmentApplication[]).map((candidate, index) => {
                const existingSummary = getExistingSummary(candidate.JobDetailsId);
                const hasInterviews = !!existingSummary;

                return (
                  <tr key={candidate.Id} className={hasInterviews ? styles.hasInterview : ""}>
                    <td>{startIndex + index + 1}</td>
                    <td>
                      <span
                        className={styles.idLink}
                        onClick={() => handleJobDetailsIdClick(candidate.JobDetailsId)}
                      >
                        {candidate.JobDetailsId}
                      </span>
                    </td>
                    <td>
                      <span
                        className={styles.idLinkSecondary}
                        onClick={() => handleJobIdClick(candidate.JobId)}
                      >
                        {candidate.JobId}
                      </span>
                    </td>
                    <td>
                      <div className={styles.candidateCell}>
                        
                        <span className={styles.name}>{candidate.CandidateName || "-"}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactCell}>
                        <span className={styles.phone}>{candidate.PhoneNumber || "-"}</span>
                        <span className={styles.email}>{candidate.EmailId || "-"}</span>
                      </div>
                    </td>
                    <td>{candidate.Department || "-"}</td>
                    <td>
                      {candidate.HasAttachment ? (
                        <button
                          className={styles.resumeIconBtn}
                          onClick={() => void handleOpenResume(candidate.JobDetailsId)}
                          title="View Resume"
                        >
                          📄
                        </button>
                      ) : (
                        <span className={styles.noResume}>-</span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`${styles.actionButton} ${hasInterviews ? styles.view : styles.schedule}`}
                        onClick={() => void handleViewCandidate(candidate)}
                      >
                        {hasInterviews ? (
                          <>📋 View ({existingSummary?.Rounds.length})</>
                        ) : (
                          <>📅 Schedule</>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              (paginatedData as IInterviewSummary[]).map((summary, index) => (
                <tr
                  key={summary.JobDetailsId}
                  className={
                    summary.FinalStatus === "Selected"
                      ? styles.selectedRow
                      : summary.FinalStatus === "Rejected"
                        ? styles.rejectedRow
                        : ""
                  }
                >
                  <td>{startIndex + index + 1}</td>
                  <td>
                    <span
                      className={styles.idLink}
                      onClick={() => handleJobDetailsIdClick(summary.JobDetailsId)}
                    >
                      {summary.JobDetailsId}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.idLinkSecondary}
                      onClick={() => handleJobIdClick(summary.JobId)}
                    >
                      {summary.JobId}
                    </span>
                  </td>
                  <td>
                    <div className={styles.candidateCell}>
                      <span className={styles.avatar}>{summary.CandidateName?.charAt(0) || "?"}</span>
                      <span className={styles.name}>{summary.CandidateName || "-"}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactCell}>
                      <span className={styles.phone}>{summary.PhoneNumber || "-"}</span>
                      <span className={styles.email}>{summary.EmailId || "-"}</span>
                    </div>
                  </td>
                  <td>{summary.Department || "-"}</td>
                  <td>
                    <span className={styles.roundsCount}>
                      {summary.Rounds.length} round{summary.Rounds.length !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(summary.FinalStatus)}`}>
                      {getInterviewStatus(summary)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.resumeIconBtn}
                      onClick={() => void handleOpenResume(summary.JobDetailsId)}
                      title="View Resume"
                    >
                      📄
                    </button>
                  </td>
                  <td>
                    <button
                      className={`${styles.actionButton} ${styles.view}`}
                      onClick={() => handleViewSummary(summary)}
                    >
                      📋 View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            marginTop: "12px",
            padding: "10px",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            style={{
              padding: "6px 10px",
              background: currentPage === 1 ? "#f1f5f9" : "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontSize: "12px",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ⏮️
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            style={{
              padding: "6px 10px",
              background: currentPage === 1 ? "#f1f5f9" : "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontSize: "12px",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ◀️
          </button>
          <span style={{ padding: "0 10px", fontSize: "12px", color: "#64748b" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            style={{
              padding: "6px 10px",
              background: currentPage === totalPages ? "#f1f5f9" : "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontSize: "12px",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            ▶️
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            style={{
              padding: "6px 10px",
              background: currentPage === totalPages ? "#f1f5f9" : "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontSize: "12px",
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            ⏭️
          </button>
        </div>
      )}
    </div>
  );
};

export default Interview;