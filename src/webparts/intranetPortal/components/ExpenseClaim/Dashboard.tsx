import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import { Icon } from "@fluentui/react/lib/Icon";
import { useNavigate } from "react-router-dom";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";

type Props = {
  context: WebPartContext;
  empListTitle?: string;
  claimListTitle?: string;
  employeeDirectoryListTitle?: string;
  directoryEmployeeFieldDisplayName?: string;
  directoryManagerFieldDisplayName?: string;
  directoryDirectorFieldDisplayName?: string;
  directoryHRFieldDisplayName?: string;
  expenseClaimRoute?: string;
  expenseViewRouteTemplate?: string;
  expenseEditRouteTemplate?: string;
  onNavigateToExpenseClaim?: () => void;
};

type EmpRow = {
  Id: number;
  Title: string;
  Name?: string;
  Department?: string;
  Designation?: string;
  TotalAmount?: string | number;
  Status?: string;
  Created?: string;
  AuthorId?: number;
};

type Me = { Id: number; Title?: string; Email?: string };

const normalizeKey = (text: string) =>
  (text || "").toLowerCase().replace(/\s+/g, "").trim();

const normalizeStatus = (s?: string) =>
  String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

type StatusType = "approved" | "pending" | "rejected" | "draft" | "other";

const getStatusType = (status?: string): StatusType => {
  const t = normalizeStatus(status);
  if (!t) return "other";
  if (t === "draft" || t.includes("draft")) return "draft";
  if (t === "rejected" || t.includes("reject") || t.includes("declin") || t.includes("deny")) return "rejected";
  if (t === "approved" || t.includes("approve")) return "approved";
  const tNoSpace = t.replace(/\s+/g, "");
  if (
    t === "pending" || t.includes("pending") || t.includes("awaiting") ||
    t.includes("await") || t.includes("waiting") || t.includes("for approval") ||
    t === "submitted" || t.includes("submitted") || t.includes("in progress") ||
    t.includes("inprogress") || t.includes("send back") || t.includes("sent back") ||
    tNoSpace.includes("sendback") || tNoSpace.includes("sentback")
  ) return "pending";
  return "other";
};

const parseMoney = (value: any) => {
  const n = parseFloat(String(value ?? "").replace(/,/g, ""));
  return isFinite(n) ? n : 0;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(amount);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

type NavAction = "BACK" | "ADD" | "VIEW";

const buildViewRoute = (template: string, row?: EmpRow) => {
  if (!template) return "/";
  let result = template;
  if (row) {
    if (result.includes(":id")) result = result.replace(/:id/g, encodeURIComponent(String(row.Id ?? "")));
    if (result.includes(":title")) result = result.replace(/:title/g, encodeURIComponent(String(row.Title ?? "")));
  }
  if (result.includes("?")) {
    if (result.toLowerCase().includes("title=")) return result;
    if (row && row.Title) return `${result}${result.endsWith("&") || result.endsWith("?") ? "" : "&"}title=${encodeURIComponent(row.Title)}`;
    return result;
  }
  if (row && !result.includes(":")) return `${result}?title=${encodeURIComponent(String(row.Title ?? ""))}`;
  return result;
};

const buildOrIdFilter = (field: string, ids: number[]) => {
  const uniq = Array.from(new Set(ids.filter((x) => Number.isFinite(x))));
  if (uniq.length === 0) return "";
  return uniq.map((id) => `(${field} eq ${id})`).join(" or ");
};

const avatarGradients = [
  "from-indigo-500 to-purple-500",
  "from-cyan-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-red-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-fuchsia-500",
];

const getAvatarGradient = (name?: string) => {
  const idx = (name || "U").charCodeAt(0) % avatarGradients.length;
  return avatarGradients[idx];
};

const statusBadgeConfig: Record<StatusType, { wrapper: string; icon: string }> = {
  approved: { wrapper: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: "CheckMark" },
  pending: { wrapper: "bg-amber-50 text-amber-600 border-amber-200", icon: "Clock" },
  rejected: { wrapper: "bg-red-50 text-red-600 border-red-200", icon: "Cancel" },
  draft: { wrapper: "bg-gray-100 text-gray-600 border-gray-200", icon: "Edit" },
  other: { wrapper: "bg-gray-50 text-gray-500 border-gray-200", icon: "StatusCircleQuestionMark" },
};

type StatCardConfig = {
  key: string;
  label: string;
  iconName: string;
  iconWrapClass: string;
  filter: string;
};

const ExpenseDashboard: React.FC<Props> = ({
  context,
  empListTitle = "ExpenseEmpData",
  claimListTitle = "ExpenseClaim",
  employeeDirectoryListTitle = "EmployeeDirectory",
  directoryEmployeeFieldDisplayName = "Email",
  directoryManagerFieldDisplayName = "Manager",
  directoryDirectorFieldDisplayName = "Director",
  directoryHRFieldDisplayName = "HR",
  expenseClaimRoute = "/expense-claims/add",
  expenseViewRouteTemplate = "/expense-claims/:id",
  expenseEditRouteTemplate = "/expense-claims/edit/:id",
  onNavigateToExpenseClaim,
}) => {
  const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);
  const navigate = useNavigate();

  const [me, setMe] = React.useState<Me | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<EmpRow[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deleting, setDeleting] = React.useState<number | null>(null);
  const [pageSize, setPageSize] = React.useState<number>(8);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const handleNavigation = React.useCallback(
    (action: NavAction, row?: EmpRow) => {
      if (action === "BACK") return navigate(-1);
      if (action === "ADD") { onNavigateToExpenseClaim?.(); return navigate(expenseClaimRoute); }
      if (action === "VIEW" && row) return navigate(buildViewRoute(expenseViewRouteTemplate, row));
    },
    [navigate, expenseClaimRoute, expenseViewRouteTemplate, onNavigateToExpenseClaim]
  );

  const handleEdit = React.useCallback(
    (row: EmpRow) => navigate(buildViewRoute(expenseEditRouteTemplate, row)),
    [navigate, expenseEditRouteTemplate]
  );

  const canManage = React.useCallback((row: EmpRow) => !!me && row.AuthorId === me.Id, [me]);

  const handleDelete = React.useCallback(
    async (row: EmpRow) => {
      if (!canManage(row)) return;
      if (!window.confirm(`Are you sure you want to delete claim ${row.Title}? This action cannot be undone.`)) return;
      try {
        setDeleting(row.Id);
        const empList = sp.web.lists.getByTitle(empListTitle);
        const claimList = sp.web.lists.getByTitle(claimListTitle);
        const logList = sp.web.lists.getByTitle("ExpenseApproverData");
        const safeTitle = String(row.Title || "").replace(/'/g, "''");
        const claimItems: any[] = await claimList.items.filter(`Title eq '${safeTitle}'`).select("Id").top(5000)();
        for (const item of claimItems) await claimList.items.getById(item.Id).delete();
        const logItems: any[] = await logList.items.filter(`Title eq '${safeTitle}'`).select("Id").top(5000)();
        for (const item of logItems) await logList.items.getById(item.Id).delete();
        await empList.items.getById(row.Id).delete();
        setRows((prev) => prev.filter((r) => r.Id !== row.Id));
      } catch { /* */ } finally { setDeleting(null); }
    },
    [sp, empListTitle, claimListTitle, canManage]
  );

  const getExpenseFieldInternals = React.useCallback(async () => {
    const list = sp.web.lists.getByTitle(empListTitle);
    const fields: any[] = await list.fields.select("InternalName", "Title", "Hidden")();
    const map: Record<string, string> = {};
    for (const f of fields) if (!f.Hidden) map[normalizeKey(String(f.Title))] = String(f.InternalName);
    const pick = (d: string, fb: string) => map[normalizeKey(d)] || fb;
    return {
      Name: pick("Name", "Name"),
      Department: pick("Department", "Department"),
      Designation: pick("Designation", "Designation"),
      TotalAmount: pick("TotalAmount", "TotalAmount"),
      Status: pick("Status", "Status"),
    };
  }, [sp, empListTitle]);

  const getAssignedEmployeeUserIdsFromDirectory = React.useCallback(
    async (currentUserId: number) => {
      const dirList = sp.web.lists.getByTitle(employeeDirectoryListTitle);
      const fields: any[] = await dirList.fields.select("InternalName", "Title", "Hidden")();
      const map: Record<string, string> = {};
      for (const f of fields) if (!f.Hidden) map[normalizeKey(String(f.Title))] = String(f.InternalName);
      const empInternal = map[normalizeKey(directoryEmployeeFieldDisplayName)];
      const mgrInternal = map[normalizeKey(directoryManagerFieldDisplayName)];
      const dirInternal = map[normalizeKey(directoryDirectorFieldDisplayName)];
      const hrInternal = map[normalizeKey(directoryHRFieldDisplayName)];
      if (!empInternal) throw new Error(`Column not found: "${directoryEmployeeFieldDisplayName}"`);
      if (!mgrInternal) throw new Error(`Column not found: "${directoryManagerFieldDisplayName}"`);
      if (!dirInternal) throw new Error(`Column not found: "${directoryDirectorFieldDisplayName}"`);
      if (!hrInternal) throw new Error(`Column not found: "${directoryHRFieldDisplayName}"`);
      const empIdField = `${empInternal}Id`;
      const f = `(${mgrInternal}Id eq ${currentUserId}) or (${dirInternal}Id eq ${currentUserId}) or (${hrInternal}Id eq ${currentUserId})`;
      const items: any[] = await dirList.items.select("Id", empIdField).filter(f).top(5000)();
      const empUserIds = items.map((it) => it[empIdField]).filter((x) => Number.isFinite(x)) as number[];
      return Array.from(new Set(empUserIds));
    },
    [sp]
  );

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const current = await sp.web.currentUser.select("Id", "Title", "Email")();
        if (!mounted) return;
        setMe({ Id: current.Id, Title: current.Title, Email: current.Email });
        let assignedEmployeeIds: number[] = [];
        try { assignedEmployeeIds = await getAssignedEmployeeUserIdsFromDirectory(current.Id); } catch { assignedEmployeeIds = []; }
        const idsForExpense = Array.from(new Set([current.Id, ...assignedEmployeeIds]));
        const rbacFilter = buildOrIdFilter("AuthorId", idsForExpense) || `(AuthorId eq ${current.Id})`;
        const list = sp.web.lists.getByTitle(empListTitle);
        const internal = await getExpenseFieldInternals();
        const selectCols = ["Id", "Title", internal.Name, internal.Department, internal.Designation, internal.TotalAmount, internal.Status, "Created", "AuthorId"];
        const items: any[] = await list.items.select(...Array.from(new Set(selectCols))).filter(rbacFilter).orderBy("Created", false).top(200)();
        const mapped: EmpRow[] = items.map((it) => ({
          Id: it.Id, Title: it.Title, Name: it[internal.Name], Department: it[internal.Department],
          Designation: it[internal.Designation], TotalAmount: it[internal.TotalAmount],
          Status: it[internal.Status], Created: it.Created, AuthorId: it.AuthorId,
        }));
        if (mounted) setRows(mapped);
      } catch { /* */ } finally { if (mounted) setLoading(false); }
    };
    void load();
    return () => { mounted = false; };
  }, [sp, empListTitle, getExpenseFieldInternals, getAssignedEmployeeUserIdsFromDirectory]);

  const summary = React.useMemo(() => {
    const total = rows.length;
    const draft = rows.filter((r) => getStatusType(r.Status) === "draft").length;
    const pending = rows.filter((r) => getStatusType(r.Status) === "pending").length;
    const approved = rows.filter((r) => getStatusType(r.Status) === "approved").length;
    const rejected = rows.filter((r) => getStatusType(r.Status) === "rejected").length;
    const totalAmount = rows.reduce((acc, r) => acc + parseMoney(r.TotalAmount), 0);
    return { total, draft, pending, approved, rejected, totalAmount };
  }, [rows]);

  const filteredRows = React.useMemo(() => {
    return rows.filter((r) => {
      const matchSearch = searchTerm === "" ||
        (r.Title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.Name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.Department || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || getStatusType(r.Status) === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, pageSize]);

  const totalPages = React.useMemo(() => Math.max(1, Math.ceil(filteredRows.length / pageSize)), [filteredRows.length, pageSize]);

  React.useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, filteredRows.length);
  const visibleRows = React.useMemo(() => filteredRows.slice(pageStart, pageEnd), [filteredRows, pageStart, pageEnd]);

  const statCards: (StatCardConfig & { value: number })[] = [
    { key: "total", label: "Total Claims", value: summary.total, iconName: "ViewAll", iconWrapClass: "bg-indigo-100 text-indigo-600", filter: "all" },
    { key: "draft", label: "Draft", value: summary.draft, iconName: "Edit", iconWrapClass: "bg-gray-100 text-gray-600", filter: "draft" },
    { key: "pending", label: "Pending", value: summary.pending, iconName: "Clock", iconWrapClass: "bg-amber-100 text-amber-600", filter: "pending" },
    { key: "approved", label: "Approved", value: summary.approved, iconName: "CheckMark", iconWrapClass: "bg-emerald-100 text-emerald-600", filter: "approved" },
    { key: "rejected", label: "Rejected", value: summary.rejected, iconName: "Cancel", iconWrapClass: "bg-red-100 text-red-600", filter: "rejected" },
  ];

  const renderStatusBadge = (status?: string) => {
    const type = getStatusType(status);
    const cfg = statusBadgeConfig[type];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${cfg.wrapper}`}>
        <Icon iconName={cfg.icon} className="text-[9px]" />
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f0ff] via-[#f8f8ff] to-[#eef0ff] p-3 md:p-4 font-[Segoe_UI,system-ui,sans-serif]">

      {/* ═══ HEADER BANNER ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-xl p-4 md:p-6 mb-3 text-white shadow-lg shadow-indigo-500/20 w-full">
        <div className="absolute -top-14 -right-8 w-48 h-48 rounded-full bg-white/[0.06]" />
        <div className="absolute -bottom-6 right-28 w-20 h-20 rounded-full bg-white/[0.04]" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigation("BACK")}
              className="w-9 h-9 rounded-lg border border-white/30 bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all shrink-0"
              title="Go Back"
            >
              <Icon iconName="ChevronLeft" className="text-sm" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight leading-tight">Expense Dashboard</h1>
              <p className="text-xs text-white/75 mt-0.5">Manage and track all your expense claims</p>
            </div>
          </div>

          <button
            onClick={() => handleNavigation("ADD")}
            disabled={loading}
            className="group flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 font-semibold text-[13px] rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            <div className="w-6 h-6 bg-indigo-100 rounded-md flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <Icon iconName="Add" className="text-xs" />
            </div>
            <span>New Claim</span>
          </button>
        </div>
      </div>

      {/* ═══ STATS CARDS — forced single row, full width ═══ */}
      <div className="flex flex-nowrap gap-2 mb-3 w-full overflow-hidden">
        {statCards.map((sc) => (
          <div
            key={sc.key}
            role="button"
            tabIndex={0}
            onClick={() => { setStatusFilter(sc.filter); setCurrentPage(1); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setStatusFilter(sc.filter); setCurrentPage(1); } }}
            title={`Show ${sc.label}`}
            className={`
              flex-1 min-w-0 bg-white rounded-xl p-3 cursor-pointer border transition-all select-none
              hover:-translate-y-0.5 hover:shadow-md
              ${statusFilter === sc.filter
                ? "border-indigo-400 shadow-sm ring-1 ring-indigo-100"
                : "border-[#e8e8f4]"
              }
            `}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] mb-1.5 ${sc.iconWrapClass}`}>
              <Icon iconName={sc.iconName} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight truncate">{sc.label}</p>
            <p className="text-xl font-bold text-slate-800 leading-none mt-0.5">{sc.value}</p>
          </div>
        ))}

        {/* Total Amount — same row */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setStatusFilter("all"); setCurrentPage(1); } }}
          title="Total Amount"
          className="flex-1 min-w-0 bg-white rounded-xl p-3 cursor-pointer border border-[#e8e8f4] hover:-translate-y-0.5 hover:shadow-md transition-all select-none"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] mb-1.5 bg-emerald-100 text-emerald-600">
            <Icon iconName="Money" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 leading-tight truncate">Total Amt</p>
          <p className="text-base font-bold text-emerald-600 leading-tight mt-0.5 truncate">{formatCurrency(summary.totalAmount)}</p>
        </div>
      </div>

      {/* ═══ TABLE SECTION — full width ═══ */}
      <div className="bg-white rounded-xl border border-[#e8e8f4] shadow-sm overflow-hidden w-full">

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 px-3 py-2.5 border-b border-[#e8e8f4]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">
              <Icon iconName="Table" />
            </div>
            <h2 className="text-sm font-bold text-slate-800">Recent Claims</h2>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              disabled={loading}
              className="px-2 py-1.5 rounded-lg border border-[#e8e8f4] bg-[#fafaff] text-[12px] text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-400 transition-colors disabled:opacity-50"
            >
              <option value={8}>8</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Icon iconName="Search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[12px] pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-44 pl-8 pr-7 py-1.5 rounded-lg border border-[#e8e8f4] bg-[#fafaff] text-[12px] text-slate-700 outline-none placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 transition-colors"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500">
                  <Icon iconName="Cancel" className="text-[7px]" />
                </button>
              )}
            </div>

            <div className="relative">
              <Icon iconName="Filter" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[11px] pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-7 pr-5 py-1.5 rounded-lg border border-[#e8e8f4] bg-[#fafaff] text-[12px] text-slate-700 outline-none appearance-none cursor-pointer focus:border-indigo-400 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-8 h-8 rounded-lg border border-[#e8e8f4] bg-[#fafaff] text-slate-500 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 transition-all shrink-0"
              title="Refresh"
            >
              <Icon iconName="Refresh" className="text-xs" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-[3px] border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                <Icon iconName="Sync" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 text-sm" />
              </div>
              <span className="text-[12px] text-slate-500">Loading claims...</span>
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-[#fafaff]">
                  <th className="w-[12%] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#e8e8f4]">Claim No</th>
                  <th className="w-[20%] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#e8e8f4]">Employee</th>
                  <th className="w-[14%] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#e8e8f4] hidden md:table-cell">Department</th>
                  <th className="w-[13%] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#e8e8f4]">Amount</th>
                  <th className="w-[14%] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#e8e8f4]">Status</th>
                  <th className="w-[13%] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#e8e8f4] hidden lg:table-cell">Created</th>
                  <th className="w-[14%] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#e8e8f4]">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#f0f0f8]">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-14 text-center px-4">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                          <Icon iconName="SearchIssue" className="text-xl text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 mb-0.5">No claims found</h3>
                        <p className="text-[12px] text-slate-500 mb-4">Try adjusting your search or filter</p>
                        <button
                          onClick={() => handleNavigation("ADD")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[12px] font-semibold rounded-lg shadow-md shadow-indigo-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                          <Icon iconName="Add" className="text-[10px]" />
                          Create New Claim
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.Id} className="group hover:bg-[#f8f8ff] transition-colors">
                      <td className="px-3 py-2.5 overflow-hidden">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 font-bold text-[11px] border border-indigo-100 whitespace-nowrap truncate max-w-full">
                          {row.Title}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(row.Name)} flex items-center justify-center text-white text-[12px] font-bold shadow-sm shrink-0`}>
                            {(row.Name || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 overflow-hidden">
                            <p className="text-[12px] font-semibold text-slate-800 truncate leading-tight">{row.Name || "-"}</p>
                            <p className="text-[10px] text-slate-400 truncate">{row.Designation || "Employee"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 hidden md:table-cell overflow-hidden">
                        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 min-w-0">
                          <Icon iconName="Org" className="text-[10px] text-slate-400 shrink-0" />
                          <span className="truncate">{row.Department || "-"}</span>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 overflow-hidden">
                        <span className="font-bold text-emerald-600 text-[12px] whitespace-nowrap truncate block">
                          {formatCurrency(parseMoney(row.TotalAmount))}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 overflow-hidden">{renderStatusBadge(row.Status)}</td>

                      <td className="px-3 py-2.5 hidden lg:table-cell overflow-hidden">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 whitespace-nowrap">
                          <Icon iconName="Calendar" className="text-[10px] text-slate-400 shrink-0" />
                          {formatDate(row.Created)}
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleNavigation("VIEW", row)}
                            className="w-7 h-7 rounded-md border border-[#e8e8f4] bg-white text-slate-500 flex items-center justify-center opacity-60 group-hover:opacity-100 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all shrink-0"
                            title="View"
                          >
                            <Icon iconName="View" className="text-[11px]" />
                          </button>

                          <button
                            onClick={() => handleEdit(row)}
                            disabled={deleting === row.Id || !canManage(row)}
                            className={`w-7 h-7 rounded-md border border-[#e8e8f4] bg-white text-slate-500 flex items-center justify-center transition-all shrink-0
                              ${canManage(row)
                                ? "opacity-60 group-hover:opacity-100 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 cursor-pointer"
                                : "opacity-25 cursor-not-allowed"
                              }`}
                            title={canManage(row) ? "Edit" : "You can edit only your own claim"}
                          >
                            <Icon iconName="Edit" className="text-[11px]" />
                          </button>

                          <button
                            onClick={() => handleDelete(row)}
                            disabled={deleting === row.Id || !canManage(row)}
                            className={`w-7 h-7 rounded-md border border-[#e8e8f4] bg-white text-slate-500 flex items-center justify-center transition-all shrink-0
                              ${canManage(row)
                                ? "opacity-60 group-hover:opacity-100 hover:border-red-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                                : "opacity-25 cursor-not-allowed"
                              }`}
                            title={canManage(row) ? "Delete" : "You can delete only your own claim"}
                          >
                            {deleting === row.Id ? (
                              <div className="animate-spin"><Icon iconName="Sync" className="text-[11px]" /></div>
                            ) : (
                              <Icon iconName="Delete" className="text-[11px]" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredRows.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 px-3 py-2.5 border-t border-[#e8e8f4] bg-[#fafaff]">
            <p className="text-[11px] text-slate-500">
              Showing <span className="font-bold text-slate-700">{pageStart + 1}</span>–<span className="font-bold text-slate-700">{pageEnd}</span> of <span className="font-bold text-slate-700">{filteredRows.length}</span> claims
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="w-7 h-7 rounded-lg border border-[#e8e8f4] bg-white text-slate-500 flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-600 transition-all"
                title="Previous"
              >
                <Icon iconName="ChevronLeft" className="text-[10px]" />
              </button>
              <span className="text-[11px] text-slate-500 font-medium px-1.5">
                <span className="font-bold text-slate-700">{currentPage}</span> / <span className="font-bold text-slate-700">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="w-7 h-7 rounded-lg border border-[#e8e8f4] bg-white text-slate-500 flex items-center justify-center disabled:opacity-35 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-600 transition-all"
                title="Next"
              >
                <Icon iconName="ChevronRight" className="text-[10px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDashboard;