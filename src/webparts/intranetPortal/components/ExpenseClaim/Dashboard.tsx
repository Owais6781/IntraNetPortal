import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import { Icon } from "@fluentui/react/lib/Icon";
import { useNavigate } from "react-router-dom";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/items";

type Props = {
  context: WebPartContext;
  empListTitle?: string;
  expenseClaimRoute?: string;
  expenseViewRouteTemplate?: string;
  expenseEditRouteTemplate?: string;
  claimListTitle?: string;
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
};

const normalizeKey = (text: string) => (text || "").toLowerCase().replace(/\s+/g, "").trim();

const normalizeStatus = (s?: string) =>
  String(s ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

type StatusType = "approved" | "pending" | "rejected" | "draft" | "other";

/**
 * ✅ Pending includes: Pending, Pending for Approval, Awaiting, Submitted, In Progress,
 * ✅ Send Back / Sent Back (with or without spaces)
 */
const getStatusType = (status?: string): StatusType => {
  const t = normalizeStatus(status);
  if (!t) return "other";

  if (t === "draft" || t.includes("draft")) return "draft";
  if (t === "rejected" || t.includes("reject") || t.includes("declin") || t.includes("deny")) return "rejected";
  if (t === "approved" || t.includes("approve")) return "approved";

  const tNoSpace = t.replace(/\s+/g, "");

  if (
    t === "pending" ||
    t.includes("pending") ||
    t.includes("awaiting") ||
    t.includes("await") ||
    t.includes("waiting") ||
    t.includes("for approval") ||
    t === "submitted" ||
    t.includes("submitted") ||
    t.includes("in progress") ||
    t.includes("inprogress") ||
    t.includes("send back") ||
    t.includes("sent back") ||
    tNoSpace.includes("sendback") ||
    tNoSpace.includes("sentback")
  ) {
    return "pending";
  }

  return "other";
};

const parseMoney = (value: any) => {
  const n = parseFloat(String(value ?? "").replace(/,/g, ""));
  return isFinite(n) ? n : 0;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
    if (row && row.Title) {
      return `${result}${result.endsWith("&") || result.endsWith("?") ? "" : "&"}title=${encodeURIComponent(row.Title)}`;
    }
    return result;
  }

  if (row && !result.includes(":")) return `${result}?title=${encodeURIComponent(String(row.Title ?? ""))}`;

  return result;
};

const ExpenseDashboard: React.FC<Props> = ({
  context,
  empListTitle = "ExpenseEmpData",
  claimListTitle = "ExpenseClaim",
  expenseClaimRoute = "/expense-claims/add",
  expenseViewRouteTemplate = "/expense-claims/:id",
  expenseEditRouteTemplate = "/expense-claims/edit/:id",
  onNavigateToExpenseClaim,
}) => {
  const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState<EmpRow[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [deleting, setDeleting] = React.useState<number | null>(null);
  const [deleteError, setDeleteError] = React.useState("");

  // ✅ NEW: Page size selector (default 8)
  const [pageSize, setPageSize] = React.useState<number>(8);
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  // ✅ ONLY ONE navigation handler for Back/Add/View
  const handleNavigation = React.useCallback(
    (action: NavAction, row?: EmpRow) => {
      if (action === "BACK") {
        navigate(-1);
        return;
      }

      if (action === "ADD") {
        onNavigateToExpenseClaim?.();
        navigate(expenseClaimRoute);
        return;
      }

      if (action === "VIEW") {
        if (!row) return;
        const route = buildViewRoute(expenseViewRouteTemplate, row);
        navigate(route);
      }
    },
    [navigate, expenseClaimRoute, expenseViewRouteTemplate, onNavigateToExpenseClaim]
  );

  // ✅ Edit handler
  const handleEdit = React.useCallback(
    (row: EmpRow) => {
      const route = buildViewRoute(expenseEditRouteTemplate, row);
      navigate(route);
    },
    [navigate, expenseEditRouteTemplate]
  );

  // ✅ Delete handler (UPDATED: also deletes log history from ExpenseApproverData)
  const handleDelete = React.useCallback(
    async (row: EmpRow) => {
      if (!window.confirm(`Are you sure you want to delete claim ${row.Title}? This action cannot be undone.`)) {
        return;
      }

      try {
        setDeleting(row.Id);
        setDeleteError("");

        const empList = sp.web.lists.getByTitle(empListTitle);
        const claimList = sp.web.lists.getByTitle(claimListTitle);

        // ✅ Log history list (your screenshot)
        const logList = sp.web.lists.getByTitle("ExpenseApproverData");

        // 1) Delete all line items in ExpenseClaim with matching Title
        const safeTitle = String(row.Title || "").replace(/'/g, "''");
        const claimItems: any[] = await claimList.items.filter(`Title eq '${safeTitle}'`).select("Id").top(5000)();

        for (const item of claimItems) {
          await claimList.items.getById(item.Id).delete();
        }

        // ✅ 2) Delete all log history items in ExpenseApproverData with matching Title
        const logItems: any[] = await logList.items.filter(`Title eq '${safeTitle}'`).select("Id").top(5000)();

        for (const item of logItems) {
          await logList.items.getById(item.Id).delete();
        }

        // 3) Delete header in ExpenseEmpData
        await empList.items.getById(row.Id).delete();

        // 4) Update local state
        setRows((prevRows) => prevRows.filter((r) => r.Id !== row.Id));
      } catch (e: any) {
        setDeleteError(e?.message || "Failed to delete claim.");
      } finally {
        setDeleting(null);
      }
    },
    [sp, empListTitle, claimListTitle]
  );

  const getFieldInternals = React.useCallback(async () => {
    const list = sp.web.lists.getByTitle(empListTitle);
    const fields: any[] = await list.fields.select("InternalName", "Title", "Hidden")();

    const map: Record<string, string> = {};
    for (const f of fields) {
      if (f.Hidden) continue;
      map[normalizeKey(String(f.Title))] = String(f.InternalName);
    }

    const pick = (displayTitle: string, fallbackInternal: string) => map[normalizeKey(displayTitle)] || fallbackInternal;

    return {
      Name: pick("Name", "Name"),
      Department: pick("Department", "Department"),
      Designation: pick("Designation", "Designation"),
      TotalAmount: pick("TotalAmount", "TotalAmount"),
      Status: pick("Status", "Status"),
    };
  }, [sp, empListTitle]);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);

        const list = sp.web.lists.getByTitle(empListTitle);
        const internal = await getFieldInternals();

        const selectCols = [
          "Id",
          "Title",
          internal.Name,
          internal.Department,
          internal.Designation,
          internal.TotalAmount,
          internal.Status,
          "Created",
        ];

        const uniqueSelect = Array.from(new Set(selectCols));
        const items: any[] = await list.items.select(...uniqueSelect).orderBy("Created", false).top(200)();

        const mapped: EmpRow[] = items.map((it) => ({
          Id: it.Id,
          Title: it.Title,
          Name: it[internal.Name],
          Department: it[internal.Department],
          Designation: it[internal.Designation],
          TotalAmount: it[internal.TotalAmount],
          Status: it[internal.Status],
          Created: it.Created,
        }));

        if (mounted) setRows(mapped);
      } catch (e: any) {
        // optional: console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [sp, empListTitle, getFieldInternals]);

  // ✅ SUMMARY (Draft + Pending includes Send Back)
  const summary = React.useMemo(() => {
    const total = rows.length;
    const draft = rows.filter((r) => getStatusType(r.Status) === "draft").length;
    const pending = rows.filter((r) => getStatusType(r.Status) === "pending").length;
    const approved = rows.filter((r) => getStatusType(r.Status) === "approved").length;
    const rejected = rows.filter((r) => getStatusType(r.Status) === "rejected").length;
    const totalAmount = rows.reduce((acc, r) => acc + parseMoney(r.TotalAmount), 0);

    return { total, draft, pending, approved, rejected, totalAmount };
  }, [rows]);

  // ✅ FILTER (Pending filter matches Pending/Send Back/etc.)
  const filteredRows = React.useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        searchTerm === "" ||
        (r.Title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.Name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.Department || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ? true : getStatusType(r.Status) === (statusFilter.toLowerCase() as StatusType);

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchTerm, statusFilter]);

  // ✅ Reset pagination when filter/search changes OR page size changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  // ✅ Pagination calculations
  const totalPages = React.useMemo(() => {
    return Math.max(1, Math.ceil(filteredRows.length / pageSize));
  }, [filteredRows.length, pageSize]);

  // keep current page valid if data count changes
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageStartIndex = (currentPage - 1) * pageSize;
  const pageEndIndexExclusive = Math.min(pageStartIndex + pageSize, filteredRows.length);
  const visibleRows = React.useMemo(() => {
    return filteredRows.slice(pageStartIndex, pageEndIndexExclusive);
  }, [filteredRows, pageStartIndex, pageEndIndexExclusive]);

  const getStatusBadge = (status?: string) => {
    const type = getStatusType(status);

    const badgeConfig: Record<StatusType, { bg: string; text: string; icon: string }> = {
      approved: {
        bg: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200",
        text: "text-emerald-700",
        icon: "CheckMark",
      },
      pending: {
        bg: "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200",
        text: "text-amber-700",
        icon: "Clock",
      },
      rejected: {
        bg: "bg-gradient-to-r from-red-50 to-rose-50 border-red-200",
        text: "text-red-700",
        icon: "Cancel",
      },
      draft: {
        bg: "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200",
        text: "text-slate-700",
        icon: "Edit",
      },
      other: {
        bg: "bg-gray-50 border-gray-200",
        text: "text-gray-600",
        icon: "StatusCircleQuestionMark",
      },
    };

    const config = badgeConfig[type];

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text}`}
      >
        <Icon iconName={config.icon} className="text-[10px]" />
        {status || "Unknown"}
      </span>
    );
  };

  // ✅ NEW: clicking any stats container will filter the dashboard table
  const handleContainerFilter = React.useCallback(
    (filter: "all" | "draft" | "pending" | "approved" | "rejected") => {
      setStatusFilter(filter);
      setCurrentPage(1);
    },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 p-4 md:p-5 mb-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => handleNavigation("BACK")}
              className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              title="Back"
            >
              <Icon iconName="ChevronLeft" />
            </button>

            {/* Money Icon */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Icon iconName="Money" className="text-white text-xl" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl blur-md -z-10" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Expense Dashboard
              </h1>
              <p className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                <Icon iconName="Calendar" className="text-slate-400 text-xs" />
                Track and manage expense claims
              </p>
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={() => handleNavigation("ADD")}
            disabled={loading}
            className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 hover:bg-right transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <Icon iconName="Add" className="text-sm" />
            </div>
            <span>New Claim</span>
            <Icon iconName="ChevronRight" className="text-xs opacity-70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Delete Error Alert */}
      {deleteError && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl mb-5">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
            <Icon iconName="ErrorBadge" className="text-white text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-red-800 text-xs">Delete Error</span>
            <p className="text-red-600 text-xs mt-0.5 truncate">{deleteError}</p>
          </div>
          <button
            onClick={() => setDeleteError("")}
            className="w-7 h-7 rounded-lg hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors shrink-0"
          >
            <Icon iconName="Cancel" className="text-xs" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div
          onClick={() => handleContainerFilter("all")}
          className="flex-1 min-w-[140px] max-w-[200px] relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 rounded-xl p-3 text-white shadow-lg shadow-indigo-500/20 cursor-pointer"
          title="Show all claims"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleContainerFilter("all");
          }}
        >
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Icon iconName="DocumentSet" className="text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide opacity-80 truncate">Total Claims</p>
              <p className="text-xl font-bold leading-tight">{summary.total}</p>
            </div>
          </div>
        </div>

        {/* Draft */}
        <div
          onClick={() => handleContainerFilter("draft")}
          className="flex-1 min-w-[140px] max-w-[200px] relative overflow-hidden bg-gradient-to-br from-slate-500 via-gray-500 to-slate-600 rounded-xl p-3 text-white shadow-lg shadow-slate-500/20 cursor-pointer"
          title="Show draft claims"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleContainerFilter("draft");
          }}
        >
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Icon iconName="Edit" className="text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide opacity-80 truncate">Draft</p>
              <p className="text-xl font-bold leading-tight">{summary.draft}</p>
            </div>
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => handleContainerFilter("pending")}
          className="flex-1 min-w-[140px] max-w-[200px] relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 rounded-xl p-3 text-white shadow-lg shadow-amber-500/20 cursor-pointer"
          title="Show pending claims"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleContainerFilter("pending");
          }}
        >
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Icon iconName="Clock" className="text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide opacity-80 truncate">Pending</p>
              <p className="text-xl font-bold leading-tight">{summary.pending}</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleContainerFilter("approved")}
          className="flex-1 min-w-[140px] max-w-[200px] relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg shadow-emerald-500/20 cursor-pointer"
          title="Show approved claims"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleContainerFilter("approved");
          }}
        >
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Icon iconName="CheckMark" className="text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide opacity-80 truncate">Approved</p>
              <p className="text-xl font-bold leading-tight">{summary.approved}</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleContainerFilter("rejected")}
          className="flex-1 min-w-[140px] max-w-[200px] relative overflow-hidden bg-gradient-to-br from-red-500 via-rose-500 to-red-600 rounded-xl p-3 text-white shadow-lg shadow-red-500/20 cursor-pointer"
          title="Show rejected claims"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleContainerFilter("rejected");
          }}
        >
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Icon iconName="Cancel" className="text-base" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide opacity-80 truncate">Rejected</p>
              <p className="text-xl font-bold leading-tight">{summary.rejected}</p>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div
          onClick={() => handleContainerFilter("all")}
          className="flex-1 min-w-[240px] bg-white rounded-xl p-3 shadow-lg shadow-slate-200/60 border border-slate-100 cursor-pointer"
          title="Show all claims"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleContainerFilter("all");
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0">
              <Icon iconName="AllCurrency" className="text-white text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Total Amount</p>
              <p className="text-lg font-bold text-emerald-600 leading-tight whitespace-normal break-all">
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-100 overflow-hidden">
        {/* Table Header with Search & Filter */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
          <div className="flex items-center gap-2 flex-wrap">
            <Icon iconName="Table" className="text-indigo-500 text-base" />
            <h2 className="text-base font-semibold text-slate-800">Recent Claims</h2>

            <div className="relative">
              <Icon
                iconName="NumberField"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"
              />
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
                disabled={loading}
                className="pl-7 pr-6 py-1.5 border border-slate-200 rounded-full text-[10px] bg-white focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer disabled:opacity-60"
                title="How many records to show"
              >
                <option value={8}>Show 8</option>
                <option value={15}>Show 15</option>
                <option value={30}>Show 30</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Icon iconName="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-48 pl-8 pr-8 py-2 border-2 border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-full flex items-center justify-center text-slate-500 transition-colors"
                >
                  <Icon iconName="Cancel" className="text-[8px]" />
                </button>
              )}
            </div>

            <div className="relative">
              <Icon
                iconName="Filter"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-6 py-2 border-2 border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all appearance-none cursor-pointer"
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
              className="w-8 h-8 border-2 border-slate-200 bg-slate-50 hover:border-indigo-400 hover:text-indigo-500 hover:bg-white rounded-lg flex items-center justify-center text-slate-500 transition-all"
              title="Refresh"
            >
              <Icon iconName="Refresh" className="text-sm" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                <Icon
                  iconName="Sync"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 text-base"
                />
              </div>
              <span className="text-xs">Loading claims data...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-b from-slate-50 to-slate-100/50">
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wide border-b-2 border-slate-200">
                    Claim No
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wide border-b-2 border-slate-200">
                    Employee
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wide border-b-2 border-slate-200 hidden md:table-cell">
                    Department
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wide border-b-2 border-slate-200">
                    Amount
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wide border-b-2 border-slate-200">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wide border-b-2 border-slate-200 hidden lg:table-cell">
                    Created
                  </th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-slate-600 uppercase tracking-wide border-b-2 border-slate-200">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                        <h3 className="text-sm font-semibold text-slate-800">No claims found</h3>
                        <p className="text-slate-500 text-xs mt-1">Try adjusting your search or filter</p>
                        <button
                          onClick={() => handleNavigation("ADD")}
                          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-500/25 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                        >
                          <Icon iconName="Add" className="text-xs" />
                          Create New Claim
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((row) => (
                    <tr key={row.Id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-3 py-3">
                        <span className="inline-flex px-2 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 font-semibold text-xs rounded-md border border-indigo-100">
                          {row.Title}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-md shadow-indigo-500/25 shrink-0">
                            {(row.Name || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-xs truncate">{row.Name || "-"}</p>
                            <p className="text-[10px] text-slate-500 truncate">{row.Designation || "Employee"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                          <Icon iconName="Teamwork" className="text-slate-400 text-xs" />
                          <span className="truncate">{row.Department || "-"}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <span className="font-semibold text-emerald-600 text-xs">
                          {formatCurrency(parseMoney(row.TotalAmount))}
                        </span>
                      </td>

                      <td className="px-3 py-3">{getStatusBadge(row.Status)}</td>

                      <td className="px-3 py-3 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Icon iconName="DateTime" className="text-slate-400 text-xs" />
                          {formatDate(row.Created)}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleNavigation("VIEW", row)}
                            className="w-7 h-7 border border-slate-200 bg-white hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 rounded-md flex items-center justify-center text-slate-500 transition-all opacity-70 group-hover:opacity-100"
                            title="View"
                          >
                            <Icon iconName="View" className="text-xs" />
                          </button>

                          <button
                            onClick={() => handleEdit(row)}
                            className="w-7 h-7 border border-slate-200 bg-white hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md flex items-center justify-center text-slate-500 transition-all opacity-70 group-hover:opacity-100"
                            title="Edit"
                            disabled={deleting === row.Id}
                          >
                            <Icon iconName="Edit" className="text-xs" />
                          </button>

                          <button
                            onClick={() => handleDelete(row)}
                            disabled={deleting === row.Id}
                            className="w-7 h-7 border border-slate-200 bg-white hover:border-red-400 hover:text-red-500 hover:bg-red-50 rounded-md flex items-center justify-center text-slate-500 transition-all opacity-70 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            {deleting === row.Id ? (
                              <div className="animate-spin">
                                <Icon iconName="Sync" className="text-xs" />
                              </div>
                            ) : (
                              <Icon iconName="Delete" className="text-xs" />
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

        {/* ✅ Pagination footer (now working) */}
        {!loading && filteredRows.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredRows.length === 0 ? 0 : pageStartIndex + 1}
              </span>{" "}
              to <span className="font-semibold text-slate-700">{pageEndIndexExclusive}</span> of{" "}
              <span className="font-semibold text-slate-700">{filteredRows.length}</span> claims
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="w-7 h-7 border border-slate-200 bg-white rounded-md flex items-center justify-center text-slate-500 disabled:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-500 transition-all"
                title="Previous"
              >
                <Icon iconName="ChevronLeft" className="text-xs" />
              </button>

              <span className="text-xs text-slate-500 font-medium px-2">
                Page <span className="font-semibold text-slate-700">{currentPage}</span> of{" "}
                <span className="font-semibold text-slate-700">{totalPages}</span>
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="w-7 h-7 border border-slate-200 bg-white rounded-md flex items-center justify-center text-slate-500 disabled:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-indigo-400 hover:text-indigo-500 transition-all"
                title="Next"
              >
                <Icon iconName="ChevronRight" className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDashboard;