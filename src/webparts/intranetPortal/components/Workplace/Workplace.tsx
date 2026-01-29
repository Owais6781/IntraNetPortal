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

interface LeavePerson {
  EMail?: string;
  Title?: string;
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

  Author?: LeavePerson;
  Manager?: LeavePerson;

  ApprovedBy?: string;
  [key: string]: any;
}

type LeaveCategoryKey = "Annual Leave" | "Sick Leave" | "Optional Leave";

type LeaveStats = {
  annualTotal: number;
  annualUsed: number;
  annualRemaining: number;

  sickTotal: number;
  sickUsed: number;
  sickRemaining: number;

  optionalTotal: number;
  optionalUsed: number;
  optionalRemaining: number;

  totalLeave: number;
  usedLeave: number;
  remainingLeave: number;
};

type LeaveTotals = {
  annualTotal: number;
  sickTotal: number;
  optionalTotal: number;
  totalLeave: number;
};

const Workplace: React.FC<WorkplaceProps> = ({ sp }) => {
  // =========================
  // LISTS / GROUPS
  // =========================
  const LIST_NAME = "IntranetLeave";
  const LEAVE_DATA_LIST = "IntranetLeaveData";
  const EMP_DIR_LIST = "EmployeeDirectory"; // (manager resolve / manager role check only)
  const HR_GROUP_NAME = "IntranetRequest";
  const APPROVED_BY_TITLE = "ApprovedBy";

  // =========================
  // FORM / STATE
  // =========================
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
  const [currentUserName, setCurrentUserName] = useState("");

  const [managerId, setManagerId] = useState<number | null>(null);

  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);

  const [loadingList, setLoadingList] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveItem | undefined>(undefined);
  const [remarks, setRemarks] = useState("");

  const [approvedByInternalName, setApprovedByInternalName] =
    useState<string>(APPROVED_BY_TITLE);

  // ✅ Leave limit popup
  const [isLimitPopupOpen, setIsLimitPopupOpen] = useState(false);
  const [limitPopupMessage, setLimitPopupMessage] = useState("");

  // ✅ Sync state (HR)
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  // ✅ store IntranetLeaveData field types (helps with text-number coercion)
  const [leaveDataFieldTypes, setLeaveDataFieldTypes] = useState<Record<string, string>>({});

  // ✅ Totals/Quota now comes from IntranetLeaveData (current user row)
  const [myTotals, setMyTotals] = useState<LeaveTotals>({
    annualTotal: 0,
    sickTotal: 0,
    optionalTotal: 0,
    totalLeave: 0,
  });

  const leaveQuota = useMemo(() => {
    return {
      "Annual Leave": myTotals.annualTotal,
      "Sick Leave": myTotals.sickTotal,
      "Optional Leave": myTotals.optionalTotal,
    } as Record<LeaveCategoryKey, number>;
  }, [myTotals]);

  const totalLeaveQuota = myTotals.totalLeave;

  const canSeeWorkflowTabs = isHR || isManager;

  const userRole: "Employee" | "Manager" | "HR" = isHR
    ? "HR"
    : isManager
      ? "Manager"
      : "Employee";

  // =========================
  // HELPERS
  // =========================
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
    `px-3 py-2 rounded-xl text-xs font-bold ${activeTab === tab ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-700"
    }`;

  const openLimitPopup = (msg: string) => {
    setLimitPopupMessage(msg);
    setIsLimitPopupOpen(true);
  };

  const closeLimitPopup = () => {
    setIsLimitPopupOpen(false);
    setLimitPopupMessage("");
  };

  const normalizeCategory = (raw?: string): LeaveCategoryKey | null => {
    if (!raw) return null;
    const value = raw.toLowerCase().trim();
    if (value.includes("annual")) return "Annual Leave";
    if (value.includes("sick") || value.includes("medical")) return "Sick Leave";
    if (value.includes("optional")) return "Optional Leave";
    return null;
  };

  const daysBetweenInclusive = (from?: string, to?: string) => {
    if (!from || !to) return 0;

    const s = new Date(from);
    const e = new Date(to);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;

    const startUTC = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
    const endUTC = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());

    const diff = Math.floor((endUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(0, diff);
  };

  const toSafeNumber = (v: any): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // ✅ Coerce payload values based on SharePoint column types
  const coerceLeaveDataValue = (internalName: string, value: any) => {
    if (value === null || value === undefined) return value;

    const type = (leaveDataFieldTypes?.[internalName] || "").toLowerCase();

    if (type.includes("text") || type.includes("note") || type.includes("choice")) {
      return String(value);
    }
    if (type.includes("number") || type.includes("currency") || type.includes("integer")) {
      return toSafeNumber(value);
    }
    return value;
  };

  const coerceLeaveDataPayload = (payload: Record<string, any>) => {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(payload)) {
      out[k] = coerceLeaveDataValue(k, v);
    }
    return out;
  };

  // =========================
  // ✅ FETCH LEAVE LIST
  // =========================
  const fetchLeaveList = async (approvedFieldName?: string): Promise<LeaveItem[]> => {
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
        "Author/Title",
        "Manager/EMail",
        "Manager/Title",
      ];
      if (approvedField) selectFields.push(approvedField);

      const items: LeaveItem[] = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select(...selectFields)
        .expand("Author", "Manager")
        .orderBy("Id", false)();

      const normalized = items.map((it) => ({
        ...it,
        ApprovedBy: (it as any)[approvedField] || it.ApprovedBy || "",
      }));

      setLeaveList(normalized);
      return normalized;
    } catch (error) {
      console.error("Unable to fetch items from IntranetLeave list", error);
      alert('Unable to fetch items from "IntranetLeave" list.');
      setLeaveList([]);
      return [];
    } finally {
      setLoadingList(false);
    }
  };

  // =========================
  // ✅ IntranetLeaveData: load totals for current user
  // =========================
  const loadMyTotalsFromIntranetLeaveData = async (userId: number) => {
    try {
      const rows: any[] = await sp.web.lists
        .getByTitle(LEAVE_DATA_LIST)
        .items.select("Id", "AnnualTotal", "SickTotal", "OptionalTotal", "TotalLeave", "EmpNameId")
        .filter(`EmpNameId eq ${userId}`)
        .top(1)();

      if (!rows.length) {
        setMyTotals({ annualTotal: 0, sickTotal: 0, optionalTotal: 0, totalLeave: 0 });
        return;
      }

      const r = rows[0];
      const annualTotal = toSafeNumber(r.AnnualTotal);
      const sickTotal = toSafeNumber(r.SickTotal);
      const optionalTotal = toSafeNumber(r.OptionalTotal);

      const sum = annualTotal + sickTotal + optionalTotal;
      const totalLeave = toSafeNumber(r.TotalLeave) || sum;

      setMyTotals({ annualTotal, sickTotal, optionalTotal, totalLeave });
    } catch (e) {
      console.warn("Could not load totals from IntranetLeaveData for current user", e);
      setMyTotals({ annualTotal: 0, sickTotal: 0, optionalTotal: 0, totalLeave: 0 });
    }
  };

  // =========================
  // LEAVE BALANCE (UI + validation)
  // ✅ Used = Pending + Approved (Rejected ignore)
  // =========================
  const getMyReservedDaysForCategory = (cat: LeaveCategoryKey) => {
    const meEmail = (currentUserEmail || "").toLowerCase().trim();
    let total = 0;

    for (const it of leaveList) {
      const authorEmail = (it.Author?.EMail || "").toLowerCase().trim();
      if (authorEmail !== meEmail) continue;

      const st = statusOf(it);
      if (st === "Rejected") continue;

      const mapped = normalizeCategory(it.LeaveCategory);
      if (mapped !== cat) continue;

      total += daysBetweenInclusive(it.FromDate, it.ToDate);
    }
    return total;
  };

  const getMyRemainingDaysForCategoryForValidation = (cat: LeaveCategoryKey) => {
    const usedOrPending = getMyReservedDaysForCategory(cat);
    const total = leaveQuota?.[cat] ?? 0;
    return Math.max(total - usedOrPending, 0);
  };

  const leaveBalance = useMemo(() => {
    const categories: LeaveCategoryKey[] = ["Annual Leave", "Sick Leave", "Optional Leave"];

    const rows = categories.map((category) => {
      const total = leaveQuota?.[category] ?? 0; // ✅ from IntranetLeaveData
      const leaveUsed = getMyReservedDaysForCategory(category); // ✅ Pending+Approved
      const remaining = Math.max(total - leaveUsed, 0);
      return { category, total, leaveUsed, remaining };
    });

    const usedSum = rows.reduce((a, r) => a + r.leaveUsed, 0);

    return {
      rows,
      totals: {
        total: totalLeaveQuota,
        leaveUsed: usedSum,
        remaining: Math.max(totalLeaveQuota - usedSum, 0),
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveList, currentUserEmail, leaveQuota, totalLeaveQuota]);

  // =========================
  // IntranetLeaveData SYNC HELPERS (update Used/Remaining only)
  // =========================
  const ensureUserIdByEmail = async (email: string): Promise<number | null> => {
    const e = (email || "").trim();
    if (!e) return null;
    const ensured = await sp.web.ensureUser(e);
    return ensured?.Id ?? null;
  };

  // ✅ Do NOT fetch Title/Email from EmployeeDirectory anymore.
  // ✅ Read existing Title from IntranetLeaveData itself (if any).
  const getLeaveDataRowMetaByUserId = async (
    userId: number
  ): Promise<{ rowId: number | null; title: string }> => {
    try {
      const rows: any[] = await sp.web.lists
        .getByTitle(LEAVE_DATA_LIST)
        .items.select("Id", "Title", "EmpNameId")
        .filter(`EmpNameId eq ${userId}`)
        .top(1)();

      if (!rows.length) return { rowId: null, title: "" };
      return { rowId: rows[0].Id, title: (rows[0].Title || "").trim() };
    } catch {
      return { rowId: null, title: "" };
    }
  };

  const findLeaveDataRowId = async (
    empUserId: number | null,
    empName?: string
  ): Promise<number | null> => {
    const list = sp.web.lists.getByTitle(LEAVE_DATA_LIST);
    const name = (empName || "").trim();

    if (empUserId) {
      const byUser = await list.items.select("Id").filter(`EmpNameId eq ${empUserId}`).top(1)();
      if (byUser.length) return byUser[0].Id;
    }

    // keep fallback (optional): if old rows were created by Title only
    if (name) {
      const byName = await list.items.select("Id").filter(`Title eq '${odataString(name)}'`).top(1)();
      if (byName.length) return byName[0].Id;
    }

    return null;
  };

  const getTotalsFromLeaveDataRowByUserId = async (
    userId: number
  ): Promise<LeaveTotals> => {
    try {
      const rows: any[] = await sp.web.lists
        .getByTitle(LEAVE_DATA_LIST)
        .items.select("AnnualTotal", "SickTotal", "OptionalTotal", "TotalLeave", "EmpNameId")
        .filter(`EmpNameId eq ${userId}`)
        .top(1)();

      if (!rows.length) {
        return { annualTotal: 0, sickTotal: 0, optionalTotal: 0, totalLeave: 0 };
      }

      const r = rows[0];
      const annualTotal = toSafeNumber(r.AnnualTotal);
      const sickTotal = toSafeNumber(r.SickTotal);
      const optionalTotal = toSafeNumber(r.OptionalTotal);
      const sum = annualTotal + sickTotal + optionalTotal;
      const totalLeave = toSafeNumber(r.TotalLeave) || sum;

      return { annualTotal, sickTotal, optionalTotal, totalLeave };
    } catch {
      return { annualTotal: 0, sickTotal: 0, optionalTotal: 0, totalLeave: 0 };
    }
  };

  const computeUsedReservedForEmail = (email: string, allLeaves: LeaveItem[]) => {
    const e = (email || "").toLowerCase().trim();
    const used: Record<LeaveCategoryKey, number> = {
      "Annual Leave": 0,
      "Sick Leave": 0,
      "Optional Leave": 0,
    };

    for (const it of allLeaves) {
      const authorEmail = (it.Author?.EMail || "").toLowerCase().trim();
      if (authorEmail !== e) continue;

      const st = statusOf(it);
      if (st === "Rejected") continue; // Pending + Approved

      const cat = normalizeCategory(it.LeaveCategory);
      if (!cat) continue;

      used[cat] += daysBetweenInclusive(it.FromDate, it.ToDate);
    }

    return used;
  };

  const buildStatsFromTotals = (totals: LeaveTotals, used: Record<LeaveCategoryKey, number>): LeaveStats => {
    const annualTotal = totals.annualTotal;
    const sickTotal = totals.sickTotal;
    const optionalTotal = totals.optionalTotal;

    const annualUsed = used["Annual Leave"];
    const sickUsed = used["Sick Leave"];
    const optionalUsed = used["Optional Leave"];

    const annualRemaining = Math.max(annualTotal - annualUsed, 0);
    const sickRemaining = Math.max(sickTotal - sickUsed, 0);
    const optionalRemaining = Math.max(optionalTotal - optionalUsed, 0);

    const totalLeave = totals.totalLeave || (annualTotal + sickTotal + optionalTotal);
    const usedLeave = annualUsed + sickUsed + optionalUsed;
    const remainingLeave = Math.max(totalLeave - usedLeave, 0);

    return {
      annualTotal,
      annualUsed,
      annualRemaining,

      sickTotal,
      sickUsed,
      sickRemaining,

      optionalTotal,
      optionalUsed,
      optionalRemaining,

      totalLeave,
      usedLeave,
      remainingLeave,
    };
  };

  const upsertIntranetLeaveDataRowUsedRemainingOnly = async (
    empEmail: string,
    empName: string,
    stats: LeaveStats,
    empUserId?: number
  ) => {
    const email = (empEmail || "").trim().toLowerCase();
    const name = (empName || "").trim();

    const userId = empUserId ?? (await ensureUserIdByEmail(email));
    if (!userId) return;

    const list = sp.web.lists.getByTitle(LEAVE_DATA_LIST);

    const rawPayloadBase: any = {
      EmpNameId: userId,

      AnnualUsed: String(stats.annualUsed),
      AnnualRemaining: String(stats.annualRemaining),

      SickUsed: String(stats.sickUsed),
      SickRemaining: String(stats.sickRemaining),

      OptionalUsed: String(stats.optionalUsed),
      OptionalRemaining: String(stats.optionalRemaining),

      UsedLeave: String(stats.usedLeave),
      RemainingLeave: String(stats.remainingLeave),

      // Keep TotalLeave consistent (optional)
      TotalLeave: String(stats.totalLeave),
    };

    const rowId = await findLeaveDataRowId(userId, name);

    // ✅ IMPORTANT:
    // - Update: do NOT overwrite Title unless we have a non-empty name.
    // - Add: Title is usually required -> if name empty, use email as safe fallback.
    const rawPayload =
      rowId
        ? { ...rawPayloadBase, ...(name ? { Title: name } : {}) }
        : { ...rawPayloadBase, Title: name || email };

    const payload = coerceLeaveDataPayload(rawPayload);

    if (rowId) {
      await list.items.getById(rowId).update(payload);
    } else {
      await list.items.add(payload);
    }
  };

  const syncOneEmployeeToLeaveData = async (
    email: string,
    name?: string,
    leaves?: LeaveItem[],
    userId?: number
  ) => {
    const empEmail = (email || "").trim().toLowerCase();
    if (!empEmail) return;

    const resolvedUserId = userId ?? (await ensureUserIdByEmail(empEmail));
    if (!resolvedUserId) return;

    // ✅ EmployeeDirectory se name/email fetch remove.
    // ✅ Prefer existing IntranetLeaveData Title; else fallback to passed "name"; else keep empty.
    const meta = await getLeaveDataRowMetaByUserId(resolvedUserId);
    const empName = meta.title || (name || "").trim();

    const totals = await getTotalsFromLeaveDataRowByUserId(resolvedUserId);
    const used = computeUsedReservedForEmail(empEmail, leaves || leaveList);
    const stats = buildStatsFromTotals(totals, used);

    await upsertIntranetLeaveDataRowUsedRemainingOnly(empEmail, empName, stats, resolvedUserId);

    if (currentUserId != null && resolvedUserId === currentUserId) {
      await loadMyTotalsFromIntranetLeaveData(currentUserId);
    }
  };

  // ✅ HR Sync: EmployeeDirectory removed.
  // Now HR sync reads employees from IntranetLeaveData itself (EmpName person column).
  const syncAllEmployeesToIntranetLeaveData = async () => {
    setIsSyncing(true);
    setSyncMessage("Reading IntranetLeave items...");

    try {
      const latestLeaves = await fetchLeaveList();

      setSyncMessage("Reading IntranetLeaveData employees...");
      const rows: any[] = await sp.web.lists
        .getByTitle(LEAVE_DATA_LIST)
        .items.select("Id", "Title", "EmpNameId", "EmpName/EMail")
        .expand("EmpName")
        .top(5000)();

      const employees = rows
        .map((r) => ({
          email: (r.EmpName?.EMail || "").trim().toLowerCase(),
          name: (r.Title || "").trim(),
          userId: r.EmpNameId as number | undefined,
        }))
        .filter((x) => !!x.email && !!x.userId);

      if (employees.length === 0) {
        alert("No employees found in IntranetLeaveData (EmpName missing).");
        return;
      }

      for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        setSyncMessage(`Syncing ${i + 1}/${employees.length}: ${emp.name || emp.email}`);
        await syncOneEmployeeToLeaveData(emp.email, emp.name, latestLeaves, emp.userId);
      }

      alert("Update completed: IntranetLeaveData Updated.");
    } catch (e) {
      console.error("Sync failed", e);
      alert("Sync failed. Check console and permissions.");
    } finally {
      setIsSyncing(false);
      setSyncMessage("");
    }
  };

  // =========================
  // UI helpers
  // =========================
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
      (isManager && currentUserId != null && selectedItem?.ManagerId === currentUserId));

  // =========================
  // FORM handlers
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;

    if (name === "endDate" && value < formData.startDate) {
      alert("Please choose a valid date");
      return;
    }

    setFormData((p) => ({ ...p, [name]: value }));
  };

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    const init = async () => {
      const user = await sp.web.currentUser();
      setCurrentUserEmail((user.Email || "").toLowerCase());
      setCurrentUserId(user.Id);
      setCurrentUserName(user.Title || "");

      // ✅ load my totals from IntranetLeaveData
      await loadMyTotalsFromIntranetLeaveData(user.Id);

      // resolve ApprovedBy internal name
      let approvedInternal = APPROVED_BY_TITLE;
      try {
        const f: any = await sp.web.lists
          .getByTitle(LIST_NAME)
          .fields.getByInternalNameOrTitle(APPROVED_BY_TITLE)();
        approvedInternal = f.InternalName || APPROVED_BY_TITLE;
      } catch (e) {
        console.warn("ApprovedBy internal name resolve failed. Using 'ApprovedBy'.", e);
      }
      setApprovedByInternalName(approvedInternal);

      // ✅ load IntranetLeaveData field types
      try {
        const fields: any[] = await sp.web.lists
          .getByTitle(LEAVE_DATA_LIST)
          .fields.select("InternalName", "TypeAsString")();

        const map: Record<string, string> = {};
        for (const f of fields) {
          if (f?.InternalName) map[f.InternalName] = f.TypeAsString || "";
        }
        setLeaveDataFieldTypes(map);
      } catch (e) {
        console.warn("Could not read IntranetLeaveData fields. Type coercion may not work.", e);
        setLeaveDataFieldTypes({});
      }

      // HR group membership
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

      // Manager check (kept same, uses EmployeeDirectory for role only)
      try {
        const directReports = await sp.web.lists
          .getByTitle(EMP_DIR_LIST)
          .items.select("Id")
          .filter(`ManagerId eq ${user.Id}`)
          .top(1)();
        setIsManager(directReports.length > 0);
      } catch (e) {
        console.warn("Could not check direct reports in EmployeeDirectory.", e);
        setIsManager(false);
      }

      // Resolve employee manager for submission (kept same)
      try {
        const emp = await sp.web.lists
          .getByTitle(EMP_DIR_LIST)
          .items.select("Id", "Email/EMail", "Manager/EMail")
          .expand("Email", "Manager")
          .filter(`Email/EMail eq '${odataString((user.Email || "").toLowerCase())}'`)();

        if (emp.length > 0 && emp[0].Manager?.EMail) {
          const mgrEmail = emp[0].Manager.EMail;
          const ensuredUser = await sp.web.ensureUser(mgrEmail);
          setManagerId(ensuredUser.Id);
        } else {
          setManagerId(null);
        }
      } catch (e) {
        console.warn("Could not resolve employee manager from EmployeeDirectory.",);
        setManagerId(null);
      }

      const latestLeaves = await fetchLeaveList(approvedInternal);

      // ✅ sync current user Used/Remaining (no EmployeeDirectory name/email)
      try {
        await syncOneEmployeeToLeaveData(user.Email || "", user.Title || "", latestLeaves, user.Id);
      } catch (e) {
        console.warn("Initial sync (current user) failed", e);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!canSeeWorkflowTabs && activeTab !== "my") setActiveTab("my");
  }, [canSeeWorkflowTabs, activeTab]);

  const filteredList = useMemo(() => {
    const meEmail = (currentUserEmail || "").toLowerCase();
    const meId = currentUserId;

    return leaveList.filter((i) => {
      const authorEmail = (i.Author?.EMail || "").toLowerCase();

      if (activeTab === "my") return authorEmail === meEmail;

      if (activeTab === "approval") {
        if (isHR) return statusOf(i) === "Pending";
        if (isManager && meId != null) return statusOf(i) === "Pending" && i.ManagerId === meId;
        return false;
      }

      if (activeTab === "action") {
        if (isHR) return statusOf(i) !== "Pending";
        if (isManager && meId != null) return statusOf(i) !== "Pending" && i.ManagerId === meId;
        return false;
      }

      return false;
    });
  }, [leaveList, activeTab, currentUserEmail, currentUserId, isHR, isManager]);

  // =========================
  // SUBMIT (save to IntranetLeave)
  // ✅ Optimistic update
  // =========================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!managerId) {
      alert("Manager not found for your profile.");
      return;
    }

    const categoryKey = normalizeCategory(formData.applyingFor);
    if (categoryKey) {
      const totalConfigured = leaveQuota?.[categoryKey] ?? 0;
      if (totalConfigured <= 0) {
        alert("Your leave quota is not configured in IntranetLeaveData. Please contact HR.");
        return;
      }

      const requestedDays = daysBetweenInclusive(formData.startDate, formData.endDate);
      if (requestedDays <= 0) {
        alert("Please choose a valid Start Date and End Date.");
        return;
      }

      const remaining = getMyRemainingDaysForCategoryForValidation(categoryKey);
      if (requestedDays > remaining) {
        openLimitPopup(
          `You cannot take more than remaining leave.\n\nCategory: ${categoryKey}\nRemaining: ${remaining} day(s)\nYou selected: ${requestedDays} day(s)`
        );
        return;
      }
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

      const addRes = await sp.web.lists.getByTitle(LIST_NAME).items.add({
        Title: `${prefix}-${nextNo}`,
        LeaveCategory: formData.applyingFor,
        FromDate: formData.startDate,
        ToDate: formData.endDate,
        Reason: formData.description,
        Status: "Pending",
        ManagerId: managerId,
      });

      // ✅ Optimistic (UI instantly updates)
      const optimistic: LeaveItem = {
        Id: addRes?.data?.Id ?? Date.now(),
        Title: `${prefix}-${nextNo}`,
        LeaveCategory: formData.applyingFor,
        FromDate: formData.startDate,
        ToDate: formData.endDate,
        Reason: formData.description,
        Status: "Pending",
        Created: new Date().toISOString(),
        AuthorId: currentUserId ?? undefined,
        ManagerId: managerId ?? undefined,
        Author: { EMail: currentUserEmail, Title: currentUserName },
      };
      setLeaveList((p) => [optimistic, ...p]);

      alert("Leave submitted successfully");
      setFormData(emptyForm);

      // refresh server data + sync used/remaining in IntranetLeaveData
      const latestLeaves = await fetchLeaveList();
      try {
        if (currentUserId != null) {
          await syncOneEmployeeToLeaveData(currentUserEmail, currentUserName, latestLeaves, currentUserId);
        }
      } catch (syncErr) {
        console.error("Leave submitted, but IntranetLeaveData sync failed:", syncErr);
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting leave");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // APPROVE/REJECT
  // =========================
  const handleDecision = async (status: "Approved" | "Rejected") => {
    if (!selectedItem) return;

    const allowed =
      statusOf(selectedItem) === "Pending" &&
      (isHR ||
        (isManager && currentUserId != null && selectedItem.ManagerId === currentUserId));

    if (!allowed) {
      alert("You are not allowed to approve/reject this request.");
      return;
    }

    if (!remarks.trim()) {
      alert("Remarks required");
      return;
    }

    const itemRef = sp.web.lists.getByTitle(LIST_NAME).items.getById(selectedItem.Id);

    try {
      const current: any = await itemRef.select(approvedByInternalName)();
      const existingApprovedBy = (current?.[approvedByInternalName] || "").toString().trim();

      const payload: any = {
        Status: status,
        Remark: remarks,
      };

      if (!existingApprovedBy) {
        payload[approvedByInternalName] = (currentUserName || "").trim() || currentUserEmail;
      }

      await itemRef.update(payload);
      closePopup();
    } catch (e) {
      console.error("Failed to update leave status", e);
      alert("Failed to update leave status. Please check permissions.");
      return;
    }

    // refresh + sync requestor row
    const latestLeaves = await fetchLeaveList();

    const requestorEmail = (selectedItem.Author?.EMail || "").toLowerCase().trim();
    const requestorName = (selectedItem.Author?.Title || "").trim();
    const requestorId = selectedItem.AuthorId ?? null;

    if (requestorEmail) {
      try {
        await syncOneEmployeeToLeaveData(
          requestorEmail,
          requestorName,
          latestLeaves,
          requestorId ?? undefined
        );
      } catch (syncErr) {
        console.error("Status updated, but IntranetLeaveData sync failed:", syncErr);
      }
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="min-h-screen bg-[#f3f6fb] p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT: FORM */}
        <div className="flex-1 basis-0 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-indigo-600 mb-2">Leave Request</h2>
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
                <option value="Annual Leave">Annual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Optional Leave">Optional Leave</option>
                <option value="Paid Leave">Paid Leave</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-black mb-2">Start Date</label>
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
                <label className="text-sm font-semibold text-black mb-2">End Date</label>
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
          <div className="flex items-center justify-between mb-3 gap-3">
            <h3 className="text-lg font-bold text-indigo-600">My Recent Activity</h3>

            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500 font-semibold">Role: {userRole}</div>

              {isHR && (
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => void syncAllEmployeesToIntranetLeaveData()}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white disabled:opacity-60"
                  title="Sync Used/Remaining into IntranetLeaveData"
                >
                  {isSyncing ? "Updating..." : "Update"}
                </button>
              )}
            </div>
          </div>

          {isHR && isSyncing && (
            <div className="mb-3 text-xs text-gray-600 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3">
              {syncMessage || "Syncing..."}
            </div>
          )}

          {/* Leave Balance Table */}
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
            <div className="text-sm font-bold text-indigo-600 mb-3">Leave Balance</div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="py-2 pr-3">Category Name</th>
                    <th className="py-2 pr-3">Category Total Leave</th>
                    <th className="py-2 pr-3">Leave Used</th>
                    <th className="py-2 pr-3">Remaining Leave</th>
                  </tr>
                </thead>

                <tbody className="text-gray-800">
                  {leaveBalance.rows.map((r) => (
                    <tr key={r.category} className="border-t border-indigo-100">
                      <td className="py-2 pr-3 font-semibold">{r.category}</td>
                      <td className="py-2 pr-3">{r.total}</td>
                      <td className="py-2 pr-3">{r.leaveUsed}</td>
                      <td className="py-2 pr-3">{r.remaining}</td>
                    </tr>
                  ))}

                  <tr className="border-t border-indigo-200 font-bold">
                    <td className="py-2 pr-3">Total</td>
                    <td className="py-2 pr-3">{leaveBalance.totals.total}</td>
                    <td className="py-2 pr-3">{leaveBalance.totals.leaveUsed}</td>
                    <td className="py-2 pr-3">{leaveBalance.totals.remaining}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button type="button" className={tabClass("my")} onClick={() => setActiveTab("my")}>
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
            {loadingList && <div className="text-sm text-gray-500">Loading...</div>}

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

      {/* LIMIT POPUP */}
      {isLimitPopupOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={closeLimitPopup} />
          <div className="relative bg-white rounded-2xl shadow-lg w-[520px] max-w-[95vw] p-6">
            <div className="text-lg font-bold text-red-600 mb-3">Leave Limit Exceeded</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">{limitPopupMessage}</div>

            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={closeLimitPopup}
                className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-500 hover:bg-indigo-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS POPUP */}
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
              <h3 className="text-lg font-bold text-indigo-600">Leave Details</h3>

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
                <label className="text-sm font-semibold text-black mb-2">Request ID</label>
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
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Optional Leave">Optional Leave</option>
                  <option value="Paid Leave">Paid Leave</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-semibold text-black mb-2">Start Date</label>
                  <input
                    type="date"
                    value={toDateInputValue(selectedItem.FromDate)}
                    disabled
                    className="w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm bg-indigo-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-semibold text-black mb-2">End Date</label>
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