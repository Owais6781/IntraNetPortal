import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups/web";
import { SPFI } from "@pnp/sp";

interface FormData {
  applyingFor: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface WorkplaceProps {
  sp: SPFI;
}

interface LeaveItem {
  Id: number;
  Title: string;
  LeaveCategory?: string;
  FromDate?: string;
  ToDate?: string;
  Reason?: string;
  Status?: string;
  Remark?: string;
  Created?: string;

  AuthorId?: number;
  ManagerId?: number;

  // ✅ ApprovedBy is Single line of text (store Name)
  ApprovedBy?: string;

  Author?: { EMail: string };
  Manager?: { EMail: string };

  // allow extra dynamic fields (safe)
  [key: string]: any;
}

const Workplace: React.FC<WorkplaceProps> = ({ sp }) => {
  const LIST_NAME = "IntranetLeave";
  const HR_GROUP_NAME = "IntranetRequest";

  // SharePoint column display name
  const APPROVED_BY_TITLE = "ApprovedBy";

  const emptyForm: FormData = {
    applyingFor: "",
    startDate: "",
    endDate: "",
    description: "",
  };

  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const [leaveList, setLeaveList] = useState<LeaveItem[]>([]);
  const [activeTab, setActiveTab] = useState<"my" | "approval" | "action">("my");

  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [currentUserName, setCurrentUserName] = useState(""); // ✅ store display name

  // For submitting: employee's manager
  const [managerId, setManagerId] = useState<number | null>(null);

  // Roles
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);

  const [loadingList, setLoadingList] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveItem | undefined>(
    undefined
  );
  const [remarks, setRemarks] = useState("");

  // ✅ internal name resolver for ApprovedBy (because internal name can differ)
  const [approvedByInternalName, setApprovedByInternalName] =
    useState<string>(APPROVED_BY_TITLE);

  const canSeeWorkflowTabs = isHR || isManager;

  const userRole: "Employee" | "Manager" | "HR" = isHR
    ? "HR"
    : isManager
      ? "Manager"
      : "Employee";

  const odataString = (s: string) => (s || "").replace(/'/g, "''");

  const statusOf = (it?: LeaveItem) => (it?.Status?.trim() || "Pending").trim();

  const statusBadgeClass = (status: string) => {
    const s = (status || "Pending").trim();
    if (s === "Pending") return "bg-[#FFF4CC] text-[#7A5A00]";
    if (s === "Approved") return "bg-green-100 text-green-700";
    if (s === "Rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const fmtDate = (d?: string) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const toDateInputValue = (d?: string) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toISOString().split("T")[0];
  };

  const tabClass = (tab: string) =>
    `px-3 py-2 rounded-xl text-xs font-bold ${activeTab === tab
      ? "bg-indigo-500 text-white"
      : "bg-gray-100 text-gray-700"
    }`;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ): void => {
    const { name, value } = e.target;

    if (name === "startDate" && value < today) {
      alert("Please choose a valid date");
      return;
    }

    if (name === "endDate" && value < formData.startDate) {
      alert("Please choose a valid date");
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  const fetchLeaveList = async (
    approvedFieldName?: string
  ): Promise<void> => {
    const approvedField = approvedFieldName || approvedByInternalName;

    setLoadingList(true);
    try {
      const selectFields: string[] = [
        "Id",
        "Title",
        "LeaveCategory",
        "FromDate",
        "ToDate",
        "Reason",
        "Status",
        "Remark",
        "Created",
        "AuthorId",
        "ManagerId",
        "Author/EMail",
        "Manager/EMail",
      ];

      // ✅ ApprovedBy text column
      if (approvedField) selectFields.push(approvedField);

      const items: LeaveItem[] = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select(...selectFields)
        .expand("Author", "Manager")
        .orderBy("Id", false)();

      // ✅ Normalize ApprovedBy into a fixed property for UI
      const normalized = items.map((it) => ({
        ...it,
        ApprovedBy: (it as any)[approvedField] || it.ApprovedBy || "",
      }));

      setLeaveList(normalized);
    } catch (error) {
      console.error("Unable to fetch items from IntranetLeave list", error);
      alert('Unable to fetch items from "IntranetLeave" list.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const user = await sp.web.currentUser();
      setCurrentUserEmail((user.Email || "").toLowerCase());
      setCurrentUserId(user.Id);
      setCurrentUserName(user.Title || ""); // ✅ name

      // ✅ resolve ApprovedBy internal name
      let approvedInternal = APPROVED_BY_TITLE;
      try {
        const f: any = await sp.web.lists
          .getByTitle(LIST_NAME)
          .fields.getByInternalNameOrTitle(APPROVED_BY_TITLE)();

        approvedInternal = f.InternalName || APPROVED_BY_TITLE;
      } catch (e) {
        console.warn(
          "ApprovedBy internal name resolve failed. Using 'ApprovedBy'.",
          e
        );
      }
      setApprovedByInternalName(approvedInternal);

      // HR: SharePoint group membership
      try {
        const groups = await sp.web.currentUser.groups.select("Title")();
        const hr = groups.some(
          (g) => (g.Title || "").toLowerCase() === HR_GROUP_NAME.toLowerCase()
        );
        setIsHR(hr);
      } catch (e) {
        console.warn("Could not read currentUser groups. HR check skipped.", e);
        setIsHR(false);
      }

      // Manager: has at least 1 direct report in EmployeeDirectory (ManagerId eq currentUserId)
      try {
        const directReports = await sp.web.lists
          .getByTitle("EmployeeDirectory")
          .items.select("Id")
          .filter(`ManagerId eq ${user.Id}`)
          .top(1)();
        setIsManager(directReports.length > 0);
      } catch (e) {
        console.warn(
          "Could not check direct reports in EmployeeDirectory. Manager check skipped.",
          e
        );
        setIsManager(false);
      }

      // Employee's manager for submission (EmployeeDirectory: Email person field + Manager person field)
      try {
        const emp = await sp.web.lists
          .getByTitle("EmployeeDirectory")
          .items.select("Id", "Email/EMail", "Manager/EMail")
          .expand("Email", "Manager")
          .filter(`Email/EMail eq '${odataString(user.Email || "")}'`)();

        if (emp.length > 0 && emp[0].Manager?.EMail) {
          const mgrEmail = emp[0].Manager.EMail;


          const ensuredUser = await sp.web.ensureUser(mgrEmail);
          setManagerId(ensuredUser.Id);
        } else {
          setManagerId(null);
        }
      } catch (e) {
        console.warn(
          "Could not resolve employee manager from EmployeeDirectory.",
          e
        );
        setManagerId(null);
      }

      await fetchLeaveList(approvedInternal);
    };

    void init();
  }, []);

  // ✅ If user is NOT Manager/HR, keep ONLY "My Requests"
  useEffect(() => {
    if (!canSeeWorkflowTabs && activeTab !== "my") setActiveTab("my");
  }, [canSeeWorkflowTabs, activeTab]);

  const filteredList = useMemo(() => {
    const meEmail = (currentUserEmail || "").toLowerCase();
    const meId = currentUserId;

    return leaveList.filter((i) => {
      const authorEmail = (i.Author?.EMail || "").toLowerCase();

      if (activeTab === "my") {
        return authorEmail === meEmail;
      }

      if (activeTab === "approval") {
        if (isHR) return statusOf(i) === "Pending";
        if (isManager && meId != null)
          return statusOf(i) === "Pending" && i.ManagerId === meId;
        return false;
      }

      if (activeTab === "action") {
        if (isHR) return statusOf(i) !== "Pending";
        if (isManager && meId != null)
          return statusOf(i) !== "Pending" && i.ManagerId === meId;
        return false;
      }

      return false;
    });
  }, [leaveList, activeTab, currentUserEmail, currentUserId, isHR, isManager]);

  const openPopup = (item: LeaveItem) => {
    setSelectedItem(item);
    setRemarks("");
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(undefined);
    setRemarks("");
  };

  const canApprove =
    statusOf(selectedItem) === "Pending" &&
    (isHR ||
      (isManager &&
        currentUserId != null &&
        selectedItem?.ManagerId === currentUserId));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!managerId) {
      alert("Manager not found for your profile.");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const prefix = `ESC-${now.getMonth() + 1}-${now.getFullYear()}`;

      const existing: Array<{ Title: string }> = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select("Title")
        .filter(`startswith(Title,'${odataString(prefix)}-')`)();

      const nextNo =
        existing.length > 0
          ? Math.max(
            ...existing
              .map((i) => Number(i.Title.split("-").pop()))
              .filter((n) => Number.isFinite(n))
          ) + 1
          : 1;

      await sp.web.lists.getByTitle(LIST_NAME).items.add({
        Title: `${prefix}-${nextNo}`,
        LeaveCategory: formData.applyingFor,
        FromDate: formData.startDate,
        ToDate: formData.endDate,
        Reason: formData.description,
        Status: "Pending",
        ManagerId: managerId,
      });

      alert("Leave submitted successfully");
      setFormData(emptyForm);
      await fetchLeaveList();
    } catch (err) {
      console.error(err);
      alert("Error submitting leave");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ ApprovedBy (Single line text): store FIRST approver name only once
  const handleDecision = async (status: "Approved" | "Rejected") => {
    if (!selectedItem) return;

    const allowed =
      statusOf(selectedItem) === "Pending" &&
      (isHR ||
        (isManager &&
          currentUserId != null &&
          selectedItem.ManagerId === currentUserId));

    if (!allowed) {
      alert("You are not allowed to approve/reject this request.");
      return;
    }

    if (!remarks.trim()) {
      alert("Remarks required");
      return;
    }

    try {
      const itemRef = sp.web.lists
        .getByTitle(LIST_NAME)
        .items.getById(selectedItem.Id);

      const current: any = await itemRef.select(approvedByInternalName)();
      const existingApprovedBy = (current?.[approvedByInternalName] || "")
        .toString()
        .trim();

      const payload: any = {
        Status: status,
        Remark: remarks,
      };

      // Only first time set ApprovedBy
      if (!existingApprovedBy) {
        payload[approvedByInternalName] =
          (currentUserName || "").trim() || currentUserEmail;
      }

      await itemRef.update(payload);

      closePopup();
      await fetchLeaveList();
    } catch (e) {
      console.error("Failed to update leave status", e);
      alert("Failed to update leave status. Please check permissions.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fb] p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT: FORM */}
        <div className="flex-1 basis-0 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-indigo-600 mb-2">
            Employee Service Center
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Manage your benefits, leave, and professional records securely.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-5 flex flex-col">
              <label className="text-sm font-semibold text-black mb-2">
                What are you applying for?
              </label>
              <select
                name="applyingFor"
                value={formData.applyingFor}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm text-black bg-indigo-50/30
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="">Choose an option...</option>
                <option value="Annual Leave(Paid)">Annual Leave(Paid)</option>
                <option value="Sick/Medical Leave">Sick/Medical Leave</option>
                <option value="Parental Leave">Parental Leave</option>
                <option value="Componsatory Off">Componsatory Off</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-black mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30
                             focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-black mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30
                             focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="mb-6 flex flex-col">
              <label className="text-sm font-semibold text-black mb-2">
                Tell us more (Optional)
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe the purpose of your leave..."
                className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full block px-8 py-3 rounded-xl font-bold text-white
             bg-gradient-to-r from-orange-400 to-pink-500
             hover:scale-105 transition-transform shadow-lg disabled:opacity-60"
            >
              Submit
            </button>
          </form>
        </div>

        {/* RIGHT: LIST */}
        <div className="flex-1 basis-0 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-indigo-600">
              My Recent Activity
            </h3>
            <div className="text-xs text-gray-500 font-semibold">
              Role: {userRole}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              className={tabClass("my")}
              onClick={() => setActiveTab("my")}
            >
              My Requests
            </button>

            {canSeeWorkflowTabs && (
              <button
                type="button"
                className={tabClass("approval")}
                onClick={() => setActiveTab("approval")}
                title="Approvals"
              >
                My Approvals
              </button>
            )}

            {canSeeWorkflowTabs && (
              <button
                type="button"
                className={tabClass("action")}
                onClick={() => setActiveTab("action")}
              >
                Action Taken
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2">
            {loadingList && (
              <div className="text-sm text-gray-500">Loading...</div>
            )}

            {!loadingList && filteredList.length === 0 && (
              <div className="text-sm text-gray-500">No recent activity</div>
            )}

            {!loadingList &&
              filteredList.map((item) => (
                <div
                  key={item.Id}
                  className="bg-gray-50 rounded-xl p-4 flex justify-between items-start gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">{item.Title}</p>

                    <p className="text-xs text-gray-500">
                      {item.Created ? fmtDate(item.Created) : "-"}
                    </p>

                    <div className="mt-[15px]">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${statusBadgeClass(
                          statusOf(item)
                        )}`}
                      >
                        {statusOf(item)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="shrink-0 text-sm font-bold text-indigo-500 cursor-pointer"
                    onClick={() => openPopup(item)}
                    type="button"
                  >
                    View
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* POPUP */}
      {isPopupOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={closePopup} />

          <div className="relative bg-white rounded-2xl shadow-lg w-[700px] max-w-[98vw] max-h-[90vh] overflow-y-auto p-8">
            <button
              type="button"
              onClick={closePopup}
              className="absolute right-4 top-4 text-indigo-500 hover:text-indigo-700"
              aria-label="Close"
              title="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-indigo-600">
                Leave Details
              </h3>

              <span
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${statusBadgeClass(
                  statusOf(selectedItem)
                )}`}
              >
                {statusOf(selectedItem)}
              </span>
            </div>

            <div className="space-y-5 pb-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-black mb-2">
                  Request ID
                </label>
                <input
                  value={selectedItem.Title || ""}
                  disabled
                  className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30 focus:outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-black mb-2">
                  What are you applying for?
                </label>
                <select
                  value={selectedItem.LeaveCategory || ""}
                  disabled
                  className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm text-black bg-indigo-50/30 focus:outline-none"
                >
                  <option value="">Choose an option...</option>
                  <option value="Annual Leave(Paid)">Annual Leave(Paid)</option>
                  <option value="Sick/Medical Leave">Sick/Medical Leave</option>
                  <option value="Parental Leave">Parental Leave</option>
                  <option value="Componsatory Off">Componsatory Off</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-semibold text-black mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={toDateInputValue(selectedItem.FromDate)}
                    disabled
                    className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-semibold text-black mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={toDateInputValue(selectedItem.ToDate)}
                    disabled
                    className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold text-black mb-2">
                  Tell us more (Optional)
                </label>
                <textarea
                  rows={4}
                  value={selectedItem.Reason || ""}
                  disabled
                  className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30 focus:outline-none resize-none"
                />
              </div>

              {/* Show existing remark + approved by if already actioned */}
              {!canApprove && (selectedItem.Remark || selectedItem.ApprovedBy) && (
                <>
                  {selectedItem.Remark && (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-black mb-2">
                        Remark
                      </label>
                      <textarea
                        rows={3}
                        value={selectedItem.Remark}
                        disabled
                        className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30 focus:outline-none resize-none"
                      />
                    </div>
                  )}

                  {/* ✅ Employee ko name show hoga remarks ke neeche */}
                  {statusOf(selectedItem) !== "Pending" && (
                    <div className="flex flex-col">
                      <label className="text-sm font-semibold text-black mb-2">
                        Approved By
                      </label>
                      <input
                        value={(selectedItem.ApprovedBy || "-").toString()}
                        disabled
                        className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30 focus:outline-none"
                      />
                    </div>
                  )}
                </>
              )}

              {/* Approve/Reject only for assigned Manager OR HR group */}
              {canApprove && (
                <div className="pt-1">
                  <label className="text-sm font-semibold text-black mb-2 block">
                    Remarks (Required)
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30
                               focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                    placeholder="Enter remarks..."
                  />

                  {/* ✅ Approve/Reject buttons smaller (same size feel as Close) */}
                  <div className="flex justify-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => void handleDecision("Approved")}
                      disabled={!remarks.trim()}
                      className="px-6 py-2 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDecision("Rejected")}
                      disabled={!remarks.trim()}
                      className="px-6 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={closePopup}
                  className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600"
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

export default Workplace;