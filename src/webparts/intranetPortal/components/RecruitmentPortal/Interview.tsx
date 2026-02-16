import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { SPService, IInterview, IRecruitmentApplication } from "./RecruitmentPortal";
import styles from "./Interview.module.scss";

interface IInterviewProps {
  service: SPService;
  onNavigateToJob?: (jobId: string) => void;           // NEW - Navigate to Job Opening
  onNavigateToApplicant?: (jobDetailsId: string) => void; // NEW - Navigate to Applicants
}

const Interview: React.FC<IInterviewProps> = ({ service, onNavigateToJob, onNavigateToApplicant }) => {
  // ==================== STATE ====================
  const [shortlistedCandidates, setShortlistedCandidates] = useState<IRecruitmentApplication[]>([]);
  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // View states
  const [activeTab, setActiveTab] = useState<"candidates" | "interviews">("candidates");
  const [selectedCandidate, setSelectedCandidate] = useState<IRecruitmentApplication | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<IInterview | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Interview form state
  const [interviewForm, setInterviewForm] = useState({
    Round1Date: "",
    Round1StartTime: "",
    Round1EndTime: "",
    Round1Interviewer: "",
    Round1Status: "Pending",
    Round1Comments: "",
    Round2Date: "",
    Round2StartTime: "",
    Round2EndTime: "",
    Round2Interviewer: "",
    Round2Status: "Pending",
    Round2Comments: "",
    FinalStatus: "Pending",
    FinalComments: "",
  });

  // ==================== DATA LOADING ====================
  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [candidatesData, interviewsData] = await Promise.all([
        service.getShortlistedRecruitments(),
        service.getInterviews(),
      ]);
      setShortlistedCandidates(candidatesData);
      setInterviews(interviewsData);
      console.log("✅ Data loaded - Shortlisted:", candidatesData.length, "Interviews:", interviewsData.length);
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

  // ==================== NAVIGATION HANDLERS - NEW ====================
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
    interviews.forEach((i) => i.Department && depts.add(i.Department));
    return Array.from(depts).sort();
  };

  const getExistingInterview = (jobDetailsId: string): IInterview | undefined => {
    return interviews.find((i) => i.Title === jobDetailsId);
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
    
    if (statusFilter === "Scheduled") {
      filtered = filtered.filter((c) => getExistingInterview(c.JobDetailsId));
    } else if (statusFilter === "Not Scheduled") {
      filtered = filtered.filter((c) => !getExistingInterview(c.JobDetailsId));
    }
    
    return filtered;
  };

  const getFilteredInterviews = (): IInterview[] => {
    let filtered = [...interviews];
    
    if (departmentFilter !== "All") {
      filtered = filtered.filter((i) => i.Department === departmentFilter);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.CandidateName?.toLowerCase().includes(search) ||
          i.Title?.toLowerCase().includes(search) ||
          i.JobId?.toLowerCase().includes(search) ||
          i.EmailId?.toLowerCase().includes(search)
      );
    }
    
    if (statusFilter !== "All") {
      filtered = filtered.filter((i) => i.FinalStatus === statusFilter);
    }
    
    return filtered;
  };

  const filteredData = activeTab === "candidates" ? getFilteredCandidates() : getFilteredInterviews();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const resetForm = (): void => {
    setInterviewForm({
      Round1Date: "",
      Round1StartTime: "",
      Round1EndTime: "",
      Round1Interviewer: "",
      Round1Status: "Pending",
      Round1Comments: "",
      Round2Date: "",
      Round2StartTime: "",
      Round2EndTime: "",
      Round2Interviewer: "",
      Round2Status: "Pending",
      Round2Comments: "",
      FinalStatus: "Pending",
      FinalComments: "",
    });
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

  const getProgress = (int: IInterview): number => {
    let p = 0;
    if (int.Round1Status === "Passed" || int.Round1Status === "Failed") p += 33;
    else if (int.Round1Status === "Scheduled") p += 15;
    if (int.Round2Status === "Passed" || int.Round2Status === "Failed") p += 33;
    else if (int.Round2Status === "Scheduled") p += 15;
    if (int.FinalStatus === "Selected" || int.FinalStatus === "Rejected") p += 34;
    return Math.min(p, 100);
  };

  const getStatusText = (int: IInterview): string => {
    if (int.FinalStatus === "Selected") return "✅ Selected";
    if (int.FinalStatus === "Rejected") return "❌ Rejected";
    if (int.Round2Status === "Passed") return "HR Passed";
    if (int.Round2Status === "Scheduled") return "HR Scheduled";
    if (int.Round2Status === "Failed") return "HR Failed";
    if (int.Round1Status === "Passed") return "Tech Passed";
    if (int.Round1Status === "Scheduled") return "Tech Scheduled";
    if (int.Round1Status === "Failed") return "Tech Failed";
    return "Not Started";
  };

  // ==================== CLICKABLE ID STYLES - NEW ====================
  const clickableJobIdStyle: React.CSSProperties = {
    cursor: "pointer",
    color: "#1976d2",
    fontWeight: 600,
    textDecoration: "underline",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    display: "inline-block",
    background: "transparent",
  };

  const clickableJobDetailsIdStyle: React.CSSProperties = {
    cursor: "pointer",
    color: "#7b1fa2",
    fontWeight: 600,
    textDecoration: "underline",
    padding: "4px 8px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
    display: "inline-block",
    background: "transparent",
  };

  // ==================== EVENT HANDLERS ====================
  const handleViewCandidate = async (candidate: IRecruitmentApplication): Promise<void> => {
    setSelectedCandidate(candidate);
    setSelectedInterview(null);
    setViewMode("detail");

    const existingInterview = await service.checkInterviewExists(candidate.JobDetailsId);
    
    if (existingInterview) {
      setSelectedInterview(existingInterview);
      setInterviewForm({
        Round1Date: existingInterview.Round1Date || "",
        Round1StartTime: existingInterview.Round1StartTime || "",
        Round1EndTime: existingInterview.Round1EndTime || "",
        Round1Interviewer: existingInterview.Round1Interviewer || "",
        Round1Status: existingInterview.Round1Status || "Pending",
        Round1Comments: existingInterview.Round1Comments || "",
        Round2Date: existingInterview.Round2Date || "",
        Round2StartTime: existingInterview.Round2StartTime || "",
        Round2EndTime: existingInterview.Round2EndTime || "",
        Round2Interviewer: existingInterview.Round2Interviewer || "",
        Round2Status: existingInterview.Round2Status || "Pending",
        Round2Comments: existingInterview.Round2Comments || "",
        FinalStatus: existingInterview.FinalStatus || "Pending",
        FinalComments: existingInterview.FinalComments || "",
      });
      console.log("✅ Loaded existing interview for:", candidate.JobDetailsId);
    } else {
      resetForm();
      console.log("ℹ️ No interview found for:", candidate.JobDetailsId);
    }
  };

  const handleViewInterview = (interview: IInterview): void => {
    setSelectedInterview(interview);
    setSelectedCandidate(null);
    setViewMode("detail");
    setInterviewForm({
      Round1Date: interview.Round1Date || "",
      Round1StartTime: interview.Round1StartTime || "",
      Round1EndTime: interview.Round1EndTime || "",
      Round1Interviewer: interview.Round1Interviewer || "",
      Round1Status: interview.Round1Status || "Pending",
      Round1Comments: interview.Round1Comments || "",
      Round2Date: interview.Round2Date || "",
      Round2StartTime: interview.Round2StartTime || "",
      Round2EndTime: interview.Round2EndTime || "",
      Round2Interviewer: interview.Round2Interviewer || "",
      Round2Status: interview.Round2Status || "Pending",
      Round2Comments: interview.Round2Comments || "",
      FinalStatus: interview.FinalStatus || "Pending",
      FinalComments: interview.FinalComments || "",
    });
  };

  const handleBack = (): void => {
    setViewMode("list");
    setSelectedCandidate(null);
    setSelectedInterview(null);
    resetForm();
  };

  const handleCreateInterview = async (): Promise<void> => {
    if (!selectedCandidate) return;
    
    setUpdating(true);
    try {
      await service.createInterviewFromRecruitment(selectedCandidate);
      alert("✅ Interview record created successfully!\n\nYou can now schedule interview rounds.");
      
      await loadData();
      
      const newInterview = await service.checkInterviewExists(selectedCandidate.JobDetailsId);
      if (newInterview) {
        setSelectedInterview(newInterview);
        console.log("✅ Interview created with Title (JobDetailsId):", selectedCandidate.JobDetailsId);
      }
    } catch (error) {
      console.error("❌ Error creating interview:", error);
      alert("❌ Error creating interview record!");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveRound1 = async (): Promise<void> => {
    if (!selectedInterview?.Id) return;
    
    if (!interviewForm.Round1Date || !interviewForm.Round1StartTime || !interviewForm.Round1Interviewer.trim()) {
      alert("⚠️ Please fill in:\n• Interview Date\n• Start Time\n• Interviewer Name");
      return;
    }
    
    setUpdating(true);
    try {
      await service.updateInterviewRound1(selectedInterview.Id, {
        Round1Date: interviewForm.Round1Date,
        Round1StartTime: interviewForm.Round1StartTime,
        Round1EndTime: interviewForm.Round1EndTime,
        Round1Interviewer: interviewForm.Round1Interviewer,
        Round1Status: interviewForm.Round1Status,
        Round1Comments: interviewForm.Round1Comments,
      });
      alert("✅ Round 1 (Technical Interview) saved successfully!");
      
      await loadData();
      const updated = await service.checkInterviewExists(selectedInterview.Title);
      if (updated) setSelectedInterview(updated);
    } catch (error) {
      console.error("❌ Error saving Round 1:", error);
      alert("❌ Error saving Round 1!");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveRound2 = async (): Promise<void> => {
    if (!selectedInterview?.Id) return;
    
    if (!interviewForm.Round2Date || !interviewForm.Round2StartTime || !interviewForm.Round2Interviewer.trim()) {
      alert("⚠️ Please fill in:\n• Interview Date\n• Start Time\n• HR Interviewer Name");
      return;
    }
    
    setUpdating(true);
    try {
      await service.updateInterviewRound2(selectedInterview.Id, {
        Round2Date: interviewForm.Round2Date,
        Round2StartTime: interviewForm.Round2StartTime,
        Round2EndTime: interviewForm.Round2EndTime,
        Round2Interviewer: interviewForm.Round2Interviewer,
        Round2Status: interviewForm.Round2Status,
        Round2Comments: interviewForm.Round2Comments,
      });
      alert("✅ Round 2 (HR Interview) saved successfully!");
      
      await loadData();
      const updated = await service.checkInterviewExists(selectedInterview.Title);
      if (updated) setSelectedInterview(updated);
    } catch (error) {
      console.error("❌ Error saving Round 2:", error);
      alert("❌ Error saving Round 2!");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveFinal = async (): Promise<void> => {
    if (!selectedInterview?.Id) return;
    
    if (interviewForm.FinalStatus === "Pending") {
      alert("⚠️ Please select a Final Status (Selected or Rejected)");
      return;
    }
    if (!interviewForm.FinalComments.trim()) {
      alert("⚠️ Please add Final Comments explaining the decision");
      return;
    }
    
    setUpdating(true);
    try {
      await service.updateInterviewFinalStatus(
        selectedInterview.Id,
        interviewForm.FinalStatus,
        interviewForm.FinalComments
      );
      alert(`✅ Final decision saved!\n\nCandidate: ${selectedInterview.CandidateName}\nStatus: ${interviewForm.FinalStatus}`);
      
      await loadData();
      const updated = await service.checkInterviewExists(selectedInterview.Title);
      if (updated) setSelectedInterview(updated);
    } catch (error) {
      console.error("❌ Error saving final status:", error);
      alert("❌ Error saving final status!");
    } finally {
      setUpdating(false);
    }
  };

  const handleForwardOnboarding = (): void => {
    if (selectedInterview?.FinalStatus !== "Selected") {
      alert("⚠️ Only Selected candidates can be forwarded to Onboarding");
      return;
    }
    
    if (confirm(`Forward ${selectedInterview.CandidateName} to Onboarding?\n\nJob Details ID: ${selectedInterview.Title}`)) {
      alert(`✅ ${selectedInterview.CandidateName} has been forwarded to Onboarding!\n\nJob Details ID: ${selectedInterview.Title}\nDepartment: ${selectedInterview.Department}`);
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

  const handleDelete = async (id: number): Promise<void> => {
    const interview = interviews.find((i) => i.Id === id);
    if (!interview) return;
    
    if (confirm(`⚠️ Delete interview record for ${interview.CandidateName}?\n\nThis action cannot be undone.`)) {
      try {
        await service.deleteInterview(id);
        alert("✅ Interview record deleted successfully!");
        await loadData();
        if (selectedInterview?.Id === id) {
          handleBack();
        }
      } catch (error) {
        console.error("❌ Error deleting interview:", error);
        alert("❌ Error deleting interview record!");
      }
    }
  };

  // ==================== RENDER: LOADING ====================
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading interview data...</p>
      </div>
    );
  }

  // ==================== RENDER: DETAIL VIEW ====================
  if (viewMode === "detail") {
    const data = selectedCandidate || selectedInterview;
    const int = selectedInterview;
    const jobDetailsId = selectedCandidate?.JobDetailsId || int?.Title || "";
    const jobId = selectedCandidate?.JobId || int?.JobId || "";

    return (
      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.detailHeader}>
          <button className={styles.backBtn} onClick={handleBack}>
            ← Back to List
          </button>
          <h1>📋 {data?.CandidateName || "Candidate Details"}</h1>
        </div>

        {/* Candidate Information Card */}
        <div className={styles.infoCard}>
          <div className={styles.infoHeader}>
            <h3>👤 Candidate Information</h3>
            {int && (
              <span className={styles.titleBadge}>
                Interview Record: {int.Title}
              </span>
            )}
          </div>
          <div className={styles.infoGrid}>
            {/* Job Details ID - CLICKABLE */}
            <div className={styles.infoItem}>
              <label>📝 Job Details ID</label>
              <span
                style={clickableJobDetailsIdStyle}
                onClick={() => handleJobDetailsIdClick(jobDetailsId)}
                title="Click to view in Applicants"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f3e5f5";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                🔗 {jobDetailsId}
              </span>
            </div>
            {/* Job ID - CLICKABLE */}
            <div className={styles.infoItem}>
              <label>🔢 Job ID</label>
              <span
                style={clickableJobIdStyle}
                onClick={() => handleJobIdClick(jobId)}
                title="Click to view in Job Openings"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e3f2fd";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                🔗 {jobId}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>👤 Candidate Name</label>
              <span className={styles.nameValue}>
                {selectedCandidate?.CandidateName || int?.CandidateName || "-"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>📞 Phone Number</label>
              <span>{selectedCandidate?.PhoneNumber || int?.PhoneNumber || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>📧 Email ID</label>
              <span>{selectedCandidate?.EmailId || int?.EmailId || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>🏢 Department</label>
              <span>{selectedCandidate?.Department || int?.Department || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>💼 Job Title</label>
              <span>{selectedCandidate?.Title || int?.JobTitle || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>📍 Location</label>
              <span>{selectedCandidate?.Location || int?.Location || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>⏱️ Experience</label>
              <span>{selectedCandidate?.Experience || int?.Experience || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <label>👤 Reviewed By</label>
              <span>{selectedCandidate?.ReviewedByName || int?.ReviewedBy || "-"}</span>
            </div>
          </div>
          <button
            className={styles.resumeBtn}
            onClick={() => void handleOpenResume(jobDetailsId)}
          >
            📄 View Resume
          </button>
        </div>

        {/* NO INTERVIEW EXISTS - Show Create Button */}
        {!int && selectedCandidate && (
          <div className={styles.createSection}>
            <div className={styles.createIcon}>📅</div>
            <h3>No Interview Record Found</h3>
            <p>
              This candidate is <strong>Shortlisted</strong> but no interview has been scheduled yet.
              <br />
              Click below to create an interview record and schedule rounds.
            </p>
            <button
              className={styles.createBtn}
              onClick={() => void handleCreateInterview()}
              disabled={updating}
            >
              {updating ? "⏳ Creating..." : "➕ Create Interview Record"}
            </button>
          </div>
        )}

        {/* INTERVIEW EXISTS - Show Interview Management */}
        {int && (
          <>
            {/* Progress Section */}
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <h4>📊 Interview Progress</h4>
                <span className={styles.progressPercent}>{getProgress(int)}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={`${styles.progressFill} ${
                    int.FinalStatus === "Selected"
                      ? styles.success
                      : int.FinalStatus === "Rejected"
                      ? styles.danger
                      : ""
                  }`}
                  style={{ width: `${getProgress(int)}%` }}
                />
              </div>
              <div className={styles.progressSteps}>
                <div className={`${styles.step} ${int.Round1Status !== "Pending" ? styles.completed : ""}`}>
                  <span className={styles.stepIcon}>🔧</span>
                  <span>Technical</span>
                  <small>{int.Round1Status}</small>
                </div>
                <div className={`${styles.step} ${int.Round2Status !== "Pending" ? styles.completed : ""}`}>
                  <span className={styles.stepIcon}>👔</span>
                  <span>HR</span>
                  <small>{int.Round2Status}</small>
                </div>
                <div className={`${styles.step} ${int.FinalStatus !== "Pending" ? styles.completed : ""}`}>
                  <span className={styles.stepIcon}>🏆</span>
                  <span>Final</span>
                  <small>{int.FinalStatus}</small>
                </div>
              </div>
            </div>

            {/* Round 1 - Technical Interview */}
            <div className={styles.roundCard}>
              <div className={styles.roundHeader}>
                <h3>🔧 Round 1 - Technical Interview</h3>
                <span className={`${styles.badge} ${getStatusClass(interviewForm.Round1Status)}`}>
                  {interviewForm.Round1Status}
                </span>
              </div>
              <div className={styles.roundForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>📅 Interview Date *</label>
                    <input
                      type="date"
                      value={interviewForm.Round1Date}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round1Date: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>🕐 Start Time *</label>
                    <input
                      type="time"
                      value={interviewForm.Round1StartTime}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round1StartTime: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>🕐 End Time</label>
                    <input
                      type="time"
                      value={interviewForm.Round1EndTime}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round1EndTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>👤 Technical Interviewer Name *</label>
                    <input
                      type="text"
                      value={interviewForm.Round1Interviewer}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round1Interviewer: e.target.value })
                      }
                      placeholder="Enter technical interviewer name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>📊 Round Status</label>
                    <select
                      value={interviewForm.Round1Status}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round1Status: e.target.value })
                      }
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Scheduled">📅 Scheduled</option>
                      <option value="Passed">✅ Passed</option>
                      <option value="Failed">❌ Failed</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>💬 Technical Feedback / Comments</label>
                  <textarea
                    value={interviewForm.Round1Comments}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, Round1Comments: e.target.value })
                    }
                    rows={3}
                    placeholder="Enter technical round feedback, observations, and recommendations..."
                  />
                </div>
                <button
                  className={styles.saveBtn}
                  onClick={() => void handleSaveRound1()}
                  disabled={updating}
                >
                  {updating ? "⏳ Saving..." : "💾 Save Round 1"}
                </button>
              </div>
            </div>

            {/* Round 2 - HR Interview */}
            <div className={styles.roundCard}>
              <div className={styles.roundHeader}>
                <h3>👔 Round 2 - HR Interview</h3>
                <span className={`${styles.badge} ${getStatusClass(interviewForm.Round2Status)}`}>
                  {interviewForm.Round2Status}
                </span>
              </div>
              <div className={styles.roundForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>📅 Interview Date *</label>
                    <input
                      type="date"
                      value={interviewForm.Round2Date}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round2Date: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>🕐 Start Time *</label>
                    <input
                      type="time"
                      value={interviewForm.Round2StartTime}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round2StartTime: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>🕐 End Time</label>
                    <input
                      type="time"
                      value={interviewForm.Round2EndTime}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round2EndTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>👤 HR Interviewer Name *</label>
                    <input
                      type="text"
                      value={interviewForm.Round2Interviewer}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round2Interviewer: e.target.value })
                      }
                      placeholder="Enter HR interviewer name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>📊 Round Status</label>
                    <select
                      value={interviewForm.Round2Status}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, Round2Status: e.target.value })
                      }
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Scheduled">📅 Scheduled</option>
                      <option value="Passed">✅ Passed</option>
                      <option value="Failed">❌ Failed</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>💬 HR Feedback / Comments</label>
                  <textarea
                    value={interviewForm.Round2Comments}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, Round2Comments: e.target.value })
                    }
                    rows={3}
                    placeholder="Enter HR round feedback, salary discussion, and cultural fit observations..."
                  />
                </div>
                <button
                  className={styles.saveBtn}
                  onClick={() => void handleSaveRound2()}
                  disabled={updating}
                >
                  {updating ? "⏳ Saving..." : "💾 Save Round 2"}
                </button>
              </div>
            </div>

            {/* Final Decision */}
            <div className={`${styles.roundCard} ${styles.finalCard}`}>
              <div className={styles.roundHeader}>
                <h3>🏆 Final Decision</h3>
                <span className={`${styles.badge} ${getStatusClass(interviewForm.FinalStatus)}`}>
                  {interviewForm.FinalStatus}
                </span>
              </div>
              <div className={styles.roundForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>🎯 Final Status *</label>
                    <select
                      value={interviewForm.FinalStatus}
                      onChange={(e) =>
                        setInterviewForm({ ...interviewForm, FinalStatus: e.target.value })
                      }
                      className={styles.finalSelect}
                    >
                      <option value="Pending">⏳ Pending Decision</option>
                      <option value="Selected">✅ Selected - Offer to be made</option>
                      <option value="Rejected">❌ Rejected - Not suitable</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>💬 Final Decision Comments *</label>
                  <textarea
                    value={interviewForm.FinalComments}
                    onChange={(e) =>
                      setInterviewForm({ ...interviewForm, FinalComments: e.target.value })
                    }
                    rows={4}
                    placeholder="Enter final decision justification, offer details, or rejection reasons..."
                  />
                </div>
                <div className={styles.finalActions}>
                  <button
                    className={styles.saveFinalBtn}
                    onClick={() => void handleSaveFinal()}
                    disabled={updating}
                  >
                    {updating ? "⏳ Saving..." : "💾 Save Final Decision"}
                  </button>
                  {int.FinalStatus === "Selected" && (
                    <button className={styles.onboardBtn} onClick={handleForwardOnboarding}>
                      🚀 Forward to Onboarding
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className={styles.dangerZone}>
              <h4>⚠️ Danger Zone</h4>
              <p>Deleting this interview record will remove all interview data permanently.</p>
              <button
                className={styles.deleteBtn}
                onClick={() => void handleDelete(int.Id!)}
              >
                🗑️ Delete Interview Record
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ==================== RENDER: LIST VIEW ====================
  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1>🗓️ Interview Management</h1>
        <p>Manage interviews for shortlisted candidates in Resume Screening.</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.blue}`}>
          <span className={styles.statIcon}>👥</span>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{shortlistedCandidates.length}</span>
            <span className={styles.statLabel}>Shortlisted</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.purple}`}>
          <span className={styles.statIcon}>📅</span>
          <div className={styles.statContent}>
            <span className={styles.statNum}>{interviews.length}</span>
            <span className={styles.statLabel}>Interviews</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.orange}`}>
          <span className={styles.statIcon}>⏳</span>
          <div className={styles.statContent}>
            <span className={styles.statNum}>
              {interviews.filter((i) => i.FinalStatus === "Pending").length}
            </span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.green}`}>
          <span className={styles.statIcon}>✅</span>
          <div className={styles.statContent}>
            <span className={styles.statNum}>
              {interviews.filter((i) => i.FinalStatus === "Selected").length}
            </span>
            <span className={styles.statLabel}>Selected</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.red}`}>
          <span className={styles.statIcon}>❌</span>
          <div className={styles.statContent}>
            <span className={styles.statNum}>
              {interviews.filter((i) => i.FinalStatus === "Rejected").length}
            </span>
            <span className={styles.statLabel}>Rejected</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "candidates" ? styles.active : ""}`}
          onClick={() => {
            setActiveTab("candidates");
            setStatusFilter("All");
          }}
        >
          👥 Shortlisted Candidates ({shortlistedCandidates.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "interviews" ? styles.active : ""}`}
          onClick={() => {
            setActiveTab("interviews");
            setStatusFilter("All");
          }}
        >
          📅 Interview Records ({interviews.length})
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label>🔍</label>
          <input
            type="text"
            placeholder="Search by name, ID, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filterItem}>
          <label>🏢</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {getUniqueDepartments().map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>📊</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {activeTab === "candidates" ? (
              <>
                <option value="All">All Status</option>
                <option value="Scheduled">Interview Scheduled</option>
                <option value="Not Scheduled">Not Scheduled</option>
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
        </div>
      </div>

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        <span>
          Showing {paginatedData.length} of {filteredData.length} records
        </span>
        {totalPages > 1 && (
          <span> | Page {currentPage} of {totalPages}</span>
        )}
      </div>

      {/* Data Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Job Details ID</th>
              <th>Job ID</th>
              <th>Candidate Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Department</th>
              <th>Reviewed By</th>
              {activeTab === "interviews" && <th>Interview Status</th>}
              <th>Resume</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={activeTab === "interviews" ? 11 : 10}
                  className={styles.noData}
                >
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📭</span>
                    <p>No records found</p>
                    <small>Try adjusting your search or filters</small>
                  </div>
                </td>
              </tr>
            ) : activeTab === "candidates" ? (
              // ==================== SHORTLISTED CANDIDATES TABLE ====================
              (paginatedData as IRecruitmentApplication[]).map((candidate, index) => {
                const existingInterview = getExistingInterview(candidate.JobDetailsId);
                const hasInterviewRecord = !!existingInterview;
                
                return (
                  <tr 
                    key={candidate.Id} 
                    className={hasInterviewRecord ? styles.hasInterview : styles.noInterview}
                  >
                    <td>{startIndex + index + 1}</td>
                    {/* Job Details ID - CLICKABLE */}
                    <td>
                      <span
                        style={clickableJobDetailsIdStyle}
                        onClick={() => handleJobDetailsIdClick(candidate.JobDetailsId)}
                        title="Click to view in Applicants"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f3e5f5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        🔗 {candidate.JobDetailsId}
                      </span>
                    </td>
                    {/* Job ID - CLICKABLE */}
                    <td>
                      <span
                        style={clickableJobIdStyle}
                        onClick={() => handleJobIdClick(candidate.JobId)}
                        title="Click to view in Job Openings"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#e3f2fd";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        🔗 {candidate.JobId}
                      </span>
                    </td>
                    <td>
                      <strong>{candidate.CandidateName || "-"}</strong>
                    </td>
                    <td>{candidate.PhoneNumber || "-"}</td>
                    <td>{candidate.EmailId || "-"}</td>
                    <td>{candidate.Department || "-"}</td>
                    <td>{candidate.ReviewedByName || "-"}</td>
                    <td>
                      {candidate.HasAttachment ? (
                        <button
                          className={styles.resumeLink}
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
                        className={`${styles.actionBtn} ${
                          hasInterviewRecord ? styles.manage : styles.schedule
                        }`}
                        onClick={() => void handleViewCandidate(candidate)}
                      >
                        {hasInterviewRecord ? "📋 Manage" : "📅 Schedule"}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              // ==================== INTERVIEW RECORDS TABLE ====================
              (paginatedData as IInterview[]).map((interview, index) => (
                <tr
                  key={interview.Id}
                  className={
                    interview.FinalStatus === "Selected"
                      ? styles.selectedRow
                      : interview.FinalStatus === "Rejected"
                      ? styles.rejectedRow
                      : ""
                  }
                >
                  <td>{startIndex + index + 1}</td>
                  {/* Job Details ID - CLICKABLE */}
                  <td>
                    <span
                      style={clickableJobDetailsIdStyle}
                      onClick={() => handleJobDetailsIdClick(interview.Title)}
                      title="Click to view in Applicants"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f3e5f5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      🔗 {interview.Title}
                    </span>
                  </td>
                  {/* Job ID - CLICKABLE */}
                  <td>
                    <span
                      style={clickableJobIdStyle}
                      onClick={() => handleJobIdClick(interview.JobId)}
                      title="Click to view in Job Openings"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e3f2fd";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      🔗 {interview.JobId}
                    </span>
                  </td>
                  <td>
                    <strong>{interview.CandidateName || "-"}</strong>
                  </td>
                  <td>{interview.PhoneNumber || "-"}</td>
                  <td>{interview.EmailId || "-"}</td>
                  <td>{interview.Department || "-"}</td>
                  <td>{interview.ReviewedBy || "-"}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusClass(interview.FinalStatus)}`}>
                      {getStatusText(interview)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.resumeLink}
                      onClick={() => void handleOpenResume(interview.Title)}
                      title="View Resume"
                    >
                      📄
                    </button>
                  </td>
                  <td>
                    <button
                      className={`${styles.actionBtn} ${styles.view}`}
                      onClick={() => handleViewInterview(interview)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            title="First Page"
          >
            ⏮️
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            title="Previous Page"
          >
            ◀️
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            title="Next Page"
          >
            ▶️
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            title="Last Page"
          >
            ⏭️
          </button>
        </div>
      )}
    </div>
  );
};

export default Interview;