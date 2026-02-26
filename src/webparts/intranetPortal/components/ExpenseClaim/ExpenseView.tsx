import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import { Icon } from "@fluentui/react/lib/Icon";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import EmpViewDetails from "./EmpViewDetails";

type FieldType = "text" | "number" | "date" | "textarea";

type CategoryFieldDefinition = {
  id: string;
  label: string;
  type: FieldType;
};

type CategoryConfiguration = {
  key: string;
  label: string;
  fields: CategoryFieldDefinition[];
};

type AttachmentInfo = { FileName: string; ServerRelativeUrl: string };

type LineItemRow = {
  id: string;
  spItemId: number;
  categoryKey: string;
  values: Record<string, string>;
  attachments: AttachmentInfo[];
};

type ClaimHeader = {
  Id: number;
  Title: string;
  Created?: string;
  Status?: string;

  EmpID?: string;
  Name?: string;
  Department?: string;
  Designation?: string;
  Email?: string;
  PhoneNumber?: string | number;

  /** Approvers coming from ExpenseEmpData list */
  Manager?: string;
  Director?: string;
  TotalAmount?: number;
  SubmitterRemarks?: string;
};

type ApproverLogView = {
  id: number;
  stage: string;
  status: string;
  approver: string;
  remarks: string;
  created?: string;
};

type Props = {
  context: WebPartContext;

  empListTitle?: string;
  claimListTitle?: string;

  masterListTitle?: string;
  categoryInternalName?: string;

  subCategoryListTitle?: string;
  subCategoryCategoryInternalName?: string;
  subCategoryStatusInternalName?: string;
  subCategoryActiveValue?: string;

  dashboardRoute?: string;
};

/** ===================== Helpers ===================== */
const COMMON_FIELD_KEYS = {
  subcategory: "__Common_Subcategory",
  date: "__Common_Date",
  amount: "__Common_Amount",
  description: "__Common_Description",
};

const createRowId = (spId: number) => `row_${spId}`;
const normalizeKey = (text: string) => (text || "").toLowerCase().replace(/\s+/g, "").trim();
const escapeOData = (s: string) => String(s || "").replace(/'/g, "''");

const toText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};
const norm = (v: any) => toText(v).trim().toLowerCase();

const stageLabel = (s?: string) => {
  const v = String(s || "").trim().toLowerCase();
  if (v === "hr") return "HR";
  if (v === "manager") return "Manager";
  if (v === "director") return "Director";
  return String(s || "").trim();
};

const fmtDateTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

const getCategoryValue = (value: unknown) => {
  if (value && typeof value === "object") {
    const anyObj = value as any;
    if (anyObj.Title) return String(anyObj.Title);
    if (anyObj.Label) return String(anyObj.Label);
  }
  return toText(value).trim();
};

const toInputDate = (value: any) => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const parseMoney = (value: string) => {
  if (!value) return 0;
  const n = parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const money = (n: any) => {
  const x = typeof n === "number" ? n : parseFloat(String(n || "0").replace(/,/g, ""));
  const v = Number.isFinite(x) ? x : 0;
  return v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const isSystemField = (internalName: string) => {
  const n = (internalName || "").toLowerCase();
  return ["id", "title", "contenttype", "contenttypeid", "attachments", "created", "modified"].includes(n);
};

const shouldSkipDynamicField = (internalName: string, label: string) => {
  const nameKey = normalizeKey(internalName);
  const labelKey = normalizeKey(label);
  const blocked = ["subcategory", "date", "fromdate", "todate", "amount", "description", "attachment"].map(normalizeKey);
  return blocked.includes(nameKey) || blocked.includes(labelKey);
};

const inferFieldType = (typeAsString: string, internalName: string, label: string): FieldType => {
  const t = (typeAsString || "").toLowerCase();
  const n = (internalName || "").toLowerCase();
  const l = (label || "").toLowerCase();

  if (t.includes("datetime")) return "date";
  if (t.includes("number") || t.includes("currency") || t.includes("integer")) return "number";
  if (t.includes("note") || t.includes("multilinetext")) return "textarea";

  if (n.includes("date") || n.includes("checkin") || n.includes("checkout")) return "date";
  if (n.includes("qty") || n.includes("nights") || n.includes("noof")) return "number";

  if (
    n.includes("purpose") ||
    n.includes("description") ||
    n.includes("notes") ||
    l.includes("purpose") ||
    l.includes("description") ||
    l.includes("notes")
  )
    return "textarea";

  return "text";
};

const buildEmptyValuesForCategory = (categoryConfiguration: CategoryConfiguration | undefined) => {
  const values: Record<string, string> = {};
  values[COMMON_FIELD_KEYS.subcategory] = "";
  values[COMMON_FIELD_KEYS.date] = "";
  values[COMMON_FIELD_KEYS.amount] = "";
  values[COMMON_FIELD_KEYS.description] = "";
  if (categoryConfiguration) for (const field of categoryConfiguration.fields) values[field.id] = "";
  return values;
};

const buildClaimFieldResolver = async (list: any) => {
  const raw: any[] = await list.fields.select("InternalName", "Title", "TypeAsString", "Hidden", "ReadOnlyField")();
  const claimFields = raw.filter((f) => !f.Hidden && !f.ReadOnlyField);

  const internalSet = new Set<string>();
  const titleToInternal: Record<string, string> = {};
  const internalToType: Record<string, string> = {};

  for (const f of claimFields) {
    const internal = String(f.InternalName);
    internalSet.add(internal);
    titleToInternal[normalizeKey(String(f.Title))] = internal;
    internalToType[internal] = String(f.TypeAsString || "Text");
  }

  return (configField: CategoryFieldDefinition): { internal: string; typeAsString: string } | null => {
    if (internalSet.has(configField.id))
      return { internal: configField.id, typeAsString: internalToType[configField.id] || "Text" };
    const byTitle = titleToInternal[normalizeKey(configField.label)];
    if (byTitle) return { internal: byTitle, typeAsString: internalToType[byTitle] || "Text" };
    return null;
  };
};

const getPendingStageFromHeaderStatus = (status: string): "Manager" | "Director" | "HR" | null => {
  const s = norm(status);
  if (s === "pending" || s === "pending - manager") return "Manager";
  if (s === "pending - director") return "Director";
  if (s === "pending - hr") return "HR";
  return null;
};

const getSendBackStageFromHeaderStatus = (status: string): "Manager" | "Director" | "HR" | null => {
  const s = norm(status);
  if (!s.startsWith("send back")) return null;
  if (s.includes("manager")) return "Manager";
  if (s.includes("director")) return "Director";
  if (s.includes("hr")) return "HR";
  return "Manager";
};

const getNextStageAfterApproval = (
  current: "Manager" | "Director" | "HR",
  totalAmt: number
): "Manager" | "Director" | "HR" | null => {
  if (current === "Manager") return totalAmt > 5000 ? "Director" : "HR";
  if (current === "Director") return "HR";
  return null;
};

/** Approver matching using ExpenseEmpData fields (name OR email) */
const splitApprovers = (text: string) =>
  (text || "")
    .split(/[;,]/g)
    .map((x) => x.trim())
    .filter(Boolean);

const isMeApprover = (approverText: string, myEmail: string, myTitle: string) => {
  const parts = splitApprovers(approverText);
  if (!parts.length) return false;

  const myE = (myEmail || "").toLowerCase();
  const myT = normalizeKey(myTitle || "");

  return parts.some((p) => {
    const pl = p.toLowerCase();
    if (pl.includes("@")) return pl === myE; // email stored
    return normalizeKey(p) === myT; // name stored
  });
};


const getNextPendingTitleGlobal = async (empList: any, draftTitle: string): Promise<string> => {
  const raw = String(draftTitle || "").trim();
  const parts = raw.split("-");

  if (parts.length < 5) throw new Error("Invalid Draft Title format.");

  // Example: EC-06-Draft-2028-4  => prefixWithoutDraft: EC-06-2028-
  const prefixWithoutDraft = `${parts[0]}-${parts[1]}-${parts[3]}-`;

  const items: any[] = await empList.items.filter("startswith(Status,'Pending')").select("Title").top(5000)();

  let maxNumber = 0;
  for (const it of items || []) {
    const title = String(it?.Title || "");
    const match = title.match(/(\d+)$/);
    if (!match) continue;
    const num = parseInt(match[1], 10);
    if (Number.isFinite(num) && num > maxNumber) maxNumber = num;
  }

  return `${prefixWithoutDraft}${maxNumber + 1}`;
};

/** ===================== Styles ===================== */
const labelClass = "block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1";
const remarkLabelClass = "block text-[12px] font-semibold text-slate-700 mb-1";

const inputClass =
  "w-full h-[36px] px-3 text-[13px] text-slate-800 bg-white border border-slate-300 rounded-md transition-all duration-150 " +
  "focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 " +
  "disabled:bg-slate-50 disabled:text-slate-900 disabled:opacity-100 disabled:cursor-not-allowed placeholder:text-slate-400";

const selectClass = `${inputClass} appearance-none pr-8`;

const textareaClass =
  "w-full px-3 text-[13px] text-slate-800 bg-white border border-slate-300 rounded-md transition-all duration-150 " +
  "focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 " +
  "disabled:bg-slate-50 disabled:text-slate-900 disabled:opacity-100 disabled:cursor-not-allowed placeholder:text-slate-400";

const btnBase =
  "h-10 px-6 text-sm font-semibold rounded-lg border transition-colors flex items-center justify-center gap-2 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const btnApprove = `${btnBase} bg-emerald-600 hover:bg-emerald-700 border-emerald-700 text-white`;
const btnReject = `${btnBase} bg-red-600 hover:bg-red-700 border-red-700 text-white`;
const btnModify = `${btnBase} bg-amber-500 hover:bg-amber-600 border-amber-600 text-white`;
const btnBack = `${btnBase} bg-white hover:bg-slate-50 border-slate-300 text-slate-700`;
const btnSubmit = `${btnBase} bg-indigo-600 hover:bg-indigo-700 border-indigo-700 text-white`;

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const StatusBadge = ({ value }: { value?: string }) => {
  const v = norm(value);
  const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border";

  if (v === "approved") return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Approved</span>;
  if (v === "rejected") return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}>Rejected</span>;
  if (v === "draft") return <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>Draft</span>;
  if (v.startsWith("send back")) return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>Send Back</span>;
  if (v === "pending" || v.startsWith("pending"))
    return <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200`}>Pending</span>;

  return <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>{value || "—"}</span>;
};

/** ===================== Tracker ===================== */
type TrackerStepStatus = "completed" | "current" | "pending" | "rejected" | "sendback";

type TrackerStep = {
  key: string;
  label: string;
  status: TrackerStepStatus;
  by?: string;
  time?: string;
  note?: string;
};

const Tracker = ({ steps }: { steps: TrackerStep[] }) => {
  const circleBase = "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border";

  const circleClass = (s: TrackerStepStatus) => {
    if (s === "completed") return `${circleBase} bg-emerald-600 border-emerald-700 text-white`;
    if (s === "rejected") return `${circleBase} bg-rose-600 border-rose-700 text-white`;
    if (s === "sendback") return `${circleBase} bg-amber-500 border-amber-600 text-white`;
    if (s === "current") return `${circleBase} bg-indigo-600 border-indigo-700 text-white`;
    return `${circleBase} bg-white border-slate-300 text-slate-700`;
  };

  const lineClass = (fromStatus: TrackerStepStatus) => {
    if (fromStatus === "completed") return "bg-emerald-500";
    if (fromStatus === "rejected") return "bg-rose-500";
    if (fromStatus === "sendback") return "bg-amber-400";
    return "bg-slate-200";
  };

  const noteClass = (s: TrackerStepStatus) => {
    if (s === "completed") return "text-emerald-700";
    if (s === "rejected") return "text-rose-700";
    if (s === "sendback") return "text-amber-800";
    if (s === "current") return "text-indigo-700";
    return "text-slate-500";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon iconName="ProgressRingDots" className="text-indigo-600" />
        <div className="text-sm font-semibold text-slate-800">Tracker</div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[780px]">
          <div className="flex items-start">
            {steps.map((st, idx) => (
              <div key={st.key} className="flex items-start flex-1">
                <div className="flex flex-col items-center min-w-[140px]">
                  <div className={circleClass(st.status)}>{idx + 1}</div>
                  <div className="mt-2 text-xs font-semibold text-slate-800">{st.label}</div>

                  {st.note && <div className={`mt-0.5 text-[11px] font-semibold ${noteClass(st.status)}`}>{st.note}</div>}
                  {st.by && (
                    <div className="mt-0.5 text-[11px] text-slate-600 truncate max-w-[140px]" title={st.by}>
                      {st.by}
                    </div>
                  )}
                  {st.time && <div className="mt-0.5 text-[11px] text-slate-400">{st.time}</div>}
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex-1 px-2 pt-4">
                    <div className={`h-[3px] w-full rounded ${lineClass(st.status)}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/** ===================== Component ===================== */
const ExpenseView = ({
  context,

  empListTitle = "ExpenseEmpData",
  claimListTitle = "ExpenseClaim",

  masterListTitle = "ExpenseMasterList",
  categoryInternalName = "Category",

  subCategoryListTitle = "ExpenseSubCategory",
  subCategoryCategoryInternalName = "Category",
  subCategoryStatusInternalName = "Status",
  subCategoryActiveValue = "Active",

  dashboardRoute = "/expense-claims",
}: Props): JSX.Element => {
  const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);
  const navigate = useNavigate();

  const params = useParams<{ title?: string }>();
  const [searchParams] = useSearchParams();

  const claimTitleFromRoute = params.title || searchParams.get("title") || "";
  let claimTitle = claimTitleFromRoute;
  try {
    claimTitle = decodeURIComponent(claimTitleFromRoute);
  } catch {
    // ignore
  }

  const [isLoading, setIsLoading] = React.useState(true);
  const [header, setHeader] = React.useState<ClaimHeader | null>(null);

  const [myRole, setMyRole] = React.useState<"Manager" | "Director" | "HR" | null>(null);
  const [approvalRemarks, setApprovalRemarks] = React.useState("");
  const [isApproving, setIsApproving] = React.useState(false);
  const [isModifying, setIsModifying] = React.useState(false);

  const [approverNames, setApproverNames] = React.useState<{ manager?: string; director?: string; hr?: string }>({});

  const [categoryConfigurations, setCategoryConfigurations] = React.useState<CategoryConfiguration[]>([]);
  const categoryConfigurationByKey = React.useMemo(() => {
    const map: Record<string, CategoryConfiguration> = {};
    for (const c of categoryConfigurations) map[c.key] = c;
    return map;
  }, [categoryConfigurations]);
  const categoryConfigurationByKeyCI = React.useMemo(() => {
    const map: Record<string, CategoryConfiguration> = {};
    for (const c of categoryConfigurations) map[normalizeKey(c.key)] = c;
    return map;
  }, [categoryConfigurations]);

  const [subCategoryOptionsByCategory, setSubCategoryOptionsByCategory] = React.useState<
    Record<string, { value: string; label: string }[]>
  >({});
  const subCategoryOptionsByCategoryCI = React.useMemo(() => {
    const map: Record<string, { value: string; label: string }[]> = {};
    for (const k of Object.keys(subCategoryOptionsByCategory)) map[normalizeKey(k)] = subCategoryOptionsByCategory[k];
    return map;
  }, [subCategoryOptionsByCategory]);

  const [rows, setRows] = React.useState<LineItemRow[]>([]);
  const [approvalHistory, setApprovalHistory] = React.useState<ApproverLogView[]>([]);

  const totalAmount = React.useMemo(
    () => rows.reduce((sum, r) => sum + parseMoney(r.values[COMMON_FIELD_KEYS.amount]), 0),
    [rows]
  );

  const pendingStageFromHeader = React.useMemo(
    () => (header ? getPendingStageFromHeaderStatus(header.Status || "") : null),
    [header?.Status]
  );

  const isDraft = React.useMemo(() => norm(header?.Status) === "draft", [header?.Status]);
  const isSendBack = React.useMemo(() => norm(header?.Status).startsWith("send back"), [header?.Status]);

  /** ===================== ExpenseApproverData: resolver (race-free) ===================== */
  const approverFieldCache = React.useRef<null | {
    approverInternal: string;
    stageInternal: string;
    statusInternal: string;
    remarksInternal: string;
  }>(null);

  const approverFieldCachePromise = React.useRef<
    Promise<{
      approverInternal: string;
      stageInternal: string;
      statusInternal: string;
      remarksInternal: string;
    }> | null
  >(null);

  const resolveApproverFields = React.useCallback((list: any) => {
    if (approverFieldCache.current) return Promise.resolve(approverFieldCache.current);
    if (approverFieldCachePromise.current) return approverFieldCachePromise.current;

    approverFieldCachePromise.current = (async () => {
      const fields: any[] = await list.fields.select("InternalName", "Title")();

      const findByTitle = (title: string) =>
        fields.find((f) => String(f.Title || "").trim().toLowerCase() === title.trim().toLowerCase());

      const approver = findByTitle("Approver");
      const stage = findByTitle("Stage");
      const status = findByTitle("Status");
      const remarks = findByTitle("Remarks");

      if (!approver) throw new Error(`ExpenseApproverData: Column Title "Approver" not found`);
      if (!stage) throw new Error(`ExpenseApproverData: Column Title "Stage" not found`);
      if (!status) throw new Error(`ExpenseApproverData: Column Title "Status" not found`);
      if (!remarks) throw new Error(`ExpenseApproverData: Column Title "Remarks" not found`);

      const info = {
        approverInternal: String(approver.InternalName),
        stageInternal: String(stage.InternalName),
        statusInternal: String(status.InternalName),
        remarksInternal: String(remarks.InternalName),
      };

      approverFieldCache.current = info;
      return info;
    })().finally(() => {
      approverFieldCachePromise.current = null;
    });

    return approverFieldCachePromise.current;
  }, []);

  const addApproverLogRow = React.useCallback(
    async (claimId: string, payload: { stage: string; status: string; approver?: string; remarks?: string }) => {
      const list = sp.web.lists.getByTitle("ExpenseApproverData");
      const f = await resolveApproverFields(list);

      await list.items.add({
        Title: claimId,
        [f.stageInternal]: payload.stage,
        [f.statusInternal]: payload.status,
        [f.approverInternal]: payload.approver || "",
        [f.remarksInternal]: payload.remarks || "",
      });
    },
    [sp, resolveApproverFields]
  );

  /**
   * Pending log inserted as NEW row AFTER last log,
   * but avoid duplicate if LATEST log for that stage is already Pending.
   */
  const ensurePendingLogAfterLast = React.useCallback(
    async (claimId: string, stage: "Manager" | "Director" | "HR", initiator: string, remarks?: string) => {
      const list = sp.web.lists.getByTitle("ExpenseApproverData");
      const f = await resolveApproverFields(list);

      const safeTitle = escapeOData(claimId);
      const safeStage = escapeOData(stage);

      const last: any[] = await list.items
        .filter(`Title eq '${safeTitle}' and ${f.stageInternal} eq '${safeStage}'`)
        .select("Id", f.statusInternal)
        .orderBy("Id", false)
        .top(1)();

      if (last?.length) {
        const lastStatus = norm(last[0]?.[f.statusInternal]);
        if (lastStatus === "pending") return;
      }

      await list.items.add({
        Title: claimId,
        [f.stageInternal]: stage,
        [f.statusInternal]: "Pending",
        [f.approverInternal]: initiator,
        [f.remarksInternal]: remarks || "",
      });
    },
    [sp, resolveApproverFields]
  );

  const loadApprovalHistory = React.useCallback(
    async (claimId: string) => {
      const list = sp.web.lists.getByTitle("ExpenseApproverData");
      const f = await resolveApproverFields(list);
      const safeTitle = escapeOData(claimId);

      const items: any[] = await list.items
        .filter(`Title eq '${safeTitle}'`)
        .select("Id", "Created", f.stageInternal, f.statusInternal, f.approverInternal, f.remarksInternal)
        .orderBy("Id", true)
        .top(5000)();

      const mapped: ApproverLogView[] = (items || [])
        .map((i) => ({
          id: i.Id,
          created: i.Created,
          stage: toText(i[f.stageInternal]).trim(),
          status: toText(i[f.statusInternal]).trim(),
          approver: toText(i[f.approverInternal]).trim(),
          remarks: toText(i[f.remarksInternal]).trim(),
        }))
        .filter((x) => {
          const s = norm(x.status);
          return s === "pending" || s === "approved" || s === "rejected" || s === "send back";
        });

      setApprovalHistory(mapped);
    },
    [sp, resolveApproverFields]
  );

  /** ===================== Detect role ONLY from ExpenseEmpData (Manager/Director/HR) ===================== */
  React.useEffect(() => {
    const detectRole = async () => {
      try {
        setMyRole(null);
        setApproverNames({});

        if (!header) return;

        const me = await sp.web.currentUser.select("Title", "Email")();
        const myEmail = String(me?.Email || "").toLowerCase();
        const myTitle = String(me?.Title || "").trim();

        const mgr = String(header.Manager || "").trim();
        const dir = String(header.Director || "").trim();
        const hr = String((header as any).HR || "").trim();

        setApproverNames({
          manager: mgr || "",
          director: dir || "",
          hr: hr || "HR",
        });

        const pending = getPendingStageFromHeaderStatus(header.Status || "");
        if (!pending) return setMyRole(null);

        if (pending === "Manager" && isMeApprover(mgr, myEmail, myTitle)) return setMyRole("Manager");
        if (pending === "Director" && isMeApprover(dir, myEmail, myTitle)) return setMyRole("Director");
        if (pending === "HR" && hr && isMeApprover(hr, myEmail, myTitle)) return setMyRole("HR");

        setMyRole(null);
      } catch {
        setMyRole(null);
        setApproverNames({});
      }
    };

    void detectRole();
  }, [header, sp]);

  /** ===================== Load page data ===================== */
  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);

        if (!claimTitle) throw new Error("Missing claim title");
        const safeTitle = escapeOData(claimTitle);

        const masterList = sp.web.lists.getByTitle(masterListTitle);
        const claimList = sp.web.lists.getByTitle(claimListTitle);
        const empList = sp.web.lists.getByTitle(empListTitle);

        // Config from master list
        const rawFields: any[] = await masterList.fields.select("InternalName", "Hidden", "ReadOnlyField", "TypeAsString")();
        const usableFields = rawFields
          .filter((f) => !f.Hidden && !f.ReadOnlyField)
          .map((f) => ({ internalName: String(f.InternalName), typeAsString: String(f.TypeAsString || "Text") }))
          .filter((f) => !isSystemField(f.internalName) && f.internalName !== categoryInternalName);

        const selectColumns = ["Id", categoryInternalName, ...usableFields.map((f) => f.internalName)];
        const masterItems: any[] = await masterList.items.select(...selectColumns).top(5000)();

        const byCategory: Record<string, CategoryConfiguration> = {};
        for (const item of masterItems) {
          const categoryKey = getCategoryValue(item[categoryInternalName]);
          if (!categoryKey) continue;

          if (!byCategory[categoryKey]) byCategory[categoryKey] = { key: categoryKey, label: categoryKey, fields: [] };

          for (const masterField of usableFields) {
            const labelFromCell = toText(item[masterField.internalName]).trim();
            if (!labelFromCell || shouldSkipDynamicField(masterField.internalName, labelFromCell)) continue;
            if (byCategory[categoryKey].fields.some((f) => f.id === masterField.internalName)) continue;

            byCategory[categoryKey].fields.push({
              id: masterField.internalName,
              label: labelFromCell,
              type: inferFieldType(masterField.typeAsString, masterField.internalName, labelFromCell),
            });
          }
        }

        // Subcategories
        const subItems: any[] = await sp.web.lists
          .getByTitle(subCategoryListTitle)
          .items.select("Id", "Title", subCategoryCategoryInternalName, subCategoryStatusInternalName)
          .top(5000)();

        const subMap: Record<string, { value: string; label: string }[]> = {};
        for (const s of subItems) {
          const statusText = toText(s[subCategoryStatusInternalName]).trim();
          if (statusText && statusText.toLowerCase() !== subCategoryActiveValue.toLowerCase()) continue;

          const catKey = getCategoryValue(s[subCategoryCategoryInternalName]);
          const title = toText(s.Title).trim();
          if (!catKey || !title) continue;

          if (!subMap[catKey]) subMap[catKey] = [];
          subMap[catKey].push({ value: title, label: title });
        }
        for (const key of Object.keys(subMap)) subMap[key].sort((a, b) => a.label.localeCompare(b.label));

        // Header
        const empRows: any[] = await empList.items.filter(`Title eq '${safeTitle}'`).select("*").top(1)();
        if (!empRows.length) throw new Error(`No header found for "${claimTitle}"`);
        const hdr: ClaimHeader = { ...empRows[0] };

        // Items
        const resolveClaimField = await buildClaimFieldResolver(claimList);
        const claimItems: any[] = await claimList.items
          .filter(`Title eq '${safeTitle}'`)
          .select("*")
          .orderBy("Id", true)
          .top(5000)();

        const mappedRows: LineItemRow[] = await Promise.all(
          claimItems.map(async (it) => {
            const categoryKey = getCategoryValue(it.Category).trim();
            const config = categoryKey ? byCategory[categoryKey] : undefined;

            const values = buildEmptyValuesForCategory(config);
            values[COMMON_FIELD_KEYS.subcategory] = toText(it.SubCategory).trim();
            values[COMMON_FIELD_KEYS.date] = toInputDate(it.Date);
            values[COMMON_FIELD_KEYS.amount] = it.Amount !== undefined && it.Amount !== null ? String(it.Amount) : "";
            values[COMMON_FIELD_KEYS.description] = toText(it.Description);

            if (config?.fields?.length) {
              for (const f of config.fields) {
                const target = resolveClaimField(f);
                const internal = target?.internal || f.id;
                const rawVal = it[internal];
                if (rawVal === undefined || rawVal === null) continue;

                const t = (target?.typeAsString || "").toLowerCase();
                values[f.id] = t.includes("datetime") ? toInputDate(rawVal) : toText(rawVal);
              }
            }

            let attachments: AttachmentInfo[] = [];
            try {
              if (it.Attachments) {
                const files: any[] = await claimList.items.getById(it.Id).attachmentFiles();
                attachments = (files || []).map((f) => ({
                  FileName: String(f.FileName),
                  ServerRelativeUrl: String(f.ServerRelativeUrl),
                }));
              }
            } catch {
              attachments = [];
            }

            return { id: createRowId(it.Id), spItemId: it.Id, categoryKey, values, attachments };
          })
        );

        const computedTotal = mappedRows.reduce((s, r) => s + parseMoney(r.values[COMMON_FIELD_KEYS.amount]), 0);
        if (!hdr.TotalAmount) hdr.TotalAmount = computedTotal;

        if (!mounted) return;

        setCategoryConfigurations(Object.values(byCategory).sort((a, b) => a.label.localeCompare(b.label)));
        setSubCategoryOptionsByCategory(subMap);

        setHeader(hdr);
        setRows(mappedRows);

        await loadApprovalHistory(hdr.Title);
      } catch {
        // keep existing behavior
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [
    sp,
    loadApprovalHistory,
    claimTitle,
    masterListTitle,
    claimListTitle,
    empListTitle,
    categoryInternalName,
    subCategoryListTitle,
    subCategoryCategoryInternalName,
    subCategoryStatusInternalName,
    subCategoryActiveValue,
  ]);

  /** ===================== ACTIONS ===================== */
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState("");

  /**
   * ✅ UPDATED: Draft Submit logic SAME as ExpenseEdit:
   * - save is not needed here (read-only)
   * - generate next Pending title
   * - update ALL line items Title old->new
   * - update header Title old->new and Status -> "Pending"
   *
   * For Send Back submit:
   * - keep Title same
   * - update status to Pending - <stage>
   */
  const onSubmit = async () => {
    if (!header) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const empList = sp.web.lists.getByTitle(empListTitle);
      const claimList = sp.web.lists.getByTitle(claimListTitle);
      const approverList = sp.web.lists.getByTitle("ExpenseApproverData");

      const oldTitle = String(header.Title || "").trim();
      const isHdrDraft = norm(header.Status) === "draft";

      const me = await sp.web.currentUser.select("Title", "Email")();
      const initiatorText = String(me?.Title || me?.Email || header.Name || header.Email || "Employee").trim();

      if (isHdrDraft) {
        // === SAME DRAFT SUBMIT FLOW AS ExpenseEdit ===
        const newTitle = await getNextPendingTitleGlobal(empList, oldTitle);

        const safeOldTitle = escapeOData(oldTitle);

        // 1) Update ALL line items Title -> newTitle
        const lineItems: any[] = await claimList.items.filter(`Title eq '${safeOldTitle}'`).select("Id").top(5000)();
        for (const li of lineItems || []) {
          await claimList.items.getById(li.Id).update({ Title: newTitle });
        }

        // 2) (Optional but recommended) Update existing approver logs Title -> newTitle
        try {
          const logItems: any[] = await approverList.items.filter(`Title eq '${safeOldTitle}'`).select("Id").top(5000)();
          for (const lg of logItems || []) {
            await approverList.items.getById(lg.Id).update({ Title: newTitle });
          }
        } catch {
          // ignore if list/permissions not available
        }

        // 3) Update header Title + Status
        await empList.items.getById(header.Id).update({ Title: newTitle, Status: "Pending" });
        setHeader((p) => (p ? { ...p, Title: newTitle, Status: "Pending" } : p));

        // 4) Add pending log for Manager (avoid duplicate)
        await ensurePendingLogAfterLast(newTitle, "Manager", initiatorText, header.SubmitterRemarks || "");

        navigate(dashboardRoute, { replace: true });
        return;
      }

      // === Send Back submit (keep your existing behavior) ===
      const sendBackStage = getSendBackStageFromHeaderStatus(header.Status || "") || "Manager";
      const newStatus = `Pending - ${sendBackStage}`;

      await ensurePendingLogAfterLast(oldTitle, sendBackStage, initiatorText, header.SubmitterRemarks || "");

      await empList.items.getById(header.Id).update({ Status: newStatus });
      setHeader((p) => (p ? { ...p, Status: newStatus } : p));

      navigate(dashboardRoute, { replace: true });
    } catch (e: any) {
      setSubmitError(e?.message || "Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onModify = async () => {
    if (!header || !myRole) return;

    try {
      setIsModifying(true);

      const empList = sp.web.lists.getByTitle(empListTitle);
      const newStatus = `Send Back - ${myRole}`;

      const me = await sp.web.currentUser.select("Title", "Email")();
      const approverText = String(me?.Title || me?.Email || "").trim();

      await addApproverLogRow(header.Title, {
        stage: myRole,
        status: "Send Back",
        approver: approverText,
        remarks: approvalRemarks || "",
      });

      await empList.items.getById(header.Id).update({ Status: newStatus });
      setHeader((p) => (p ? { ...p, Status: newStatus } : p));

      setApprovalRemarks("");
      navigate(dashboardRoute, { replace: true });
    } finally {
      setIsModifying(false);
    }
  };

  const shouldShowApprovalPanel = React.useMemo(() => {
    if (!myRole || !header) return false;
    if (isDraft || isSendBack) return false;
    return pendingStageFromHeader === myRole;
  }, [myRole, header, isDraft, isSendBack, pendingStageFromHeader]);

  const canApprove = React.useMemo(() => shouldShowApprovalPanel && !isApproving, [shouldShowApprovalPanel, isApproving]);

  const approvalRemarksOnly = React.useMemo(
    () => approvalHistory.filter((l) => String(l.remarks || "").trim().length > 0),
    [approvalHistory]
  );

  const showEmployeeSubmit = Boolean(header) && (isDraft || isSendBack);

  const handleApproval = async (action: "Approved" | "Rejected") => {
    if (!header || !myRole) return;

    try {
      setIsApproving(true);

      const total = header.TotalAmount ?? totalAmount;
      const empList = sp.web.lists.getByTitle(empListTitle);

      const me = await sp.web.currentUser.select("Title", "Email")();
      const approverText = (me?.Title || me?.Email || "").trim();

      // 1) Add action log
      await addApproverLogRow(header.Title, {
        stage: myRole,
        status: action,
        approver: approverText,
        remarks: approvalRemarks || "",
      });

      let newHeaderStatus = header.Status || "";
      let nextStage: "Manager" | "Director" | "HR" | null = null;

      if (action === "Rejected") {
        newHeaderStatus = "Rejected";
      } else {
        nextStage = getNextStageAfterApproval(myRole, total);
        newHeaderStatus = nextStage ? `Pending - ${nextStage}` : "Approved";
      }

      // 2) Update header status
      await empList.items.getById(header.Id).update({ Status: newHeaderStatus });
      setHeader((p) => (p ? { ...p, Status: newHeaderStatus } : p));

      // 3) If moved to next stage, insert Pending log as NEW row (after last)
      if (action === "Approved" && nextStage) {
        await ensurePendingLogAfterLast(header.Title, nextStage, approverText, "");
      }

      setApprovalRemarks("");
      navigate(dashboardRoute, { replace: true });
    } finally {
      setIsApproving(false);
    }
  };

  /** ===================== Tracker steps ===================== */
  const trackerSteps = React.useMemo<TrackerStep[]>(() => {
    if (!header) return [];

    const amount = header.TotalAmount ?? totalAmount;
    const needsDirector = amount > 5000;
    const workflowStages: Array<"Manager" | "Director" | "HR"> = needsDirector ? ["Manager", "Director", "HR"] : ["Manager", "HR"];

    const latestByStage: Record<string, ApproverLogView> = {};
    for (const l of approvalHistory) {
      const k = norm(l.stage);
      if (!k) continue;
      if (!latestByStage[k] || l.id > latestByStage[k].id) latestByStage[k] = l;
    }

    const sendBackStage = getSendBackStageFromHeaderStatus(header.Status || "");
    const pendingStage = getPendingStageFromHeaderStatus(header.Status || "");
    const hs = norm(header.Status);

    const firstRejectedIndex = workflowStages.findIndex((st) => {
      const log = latestByStage[norm(st)];
      return log && norm(log.status) === "rejected";
    });

    const visibleStages = firstRejectedIndex >= 0 ? workflowStages.slice(0, firstRejectedIndex + 1) : workflowStages;

    const mgrName = approverNames.manager || toText(header.Manager || "");
    const dirName = approverNames.director || toText(header.Director || "");
    const hrName = approverNames.hr || toText((header as any).HR || "HR");

    const stageAssignedBy = (stage: "Manager" | "Director" | "HR") =>
      stage === "Manager" ? mgrName : stage === "Director" ? dirName : hrName;

    const steps: TrackerStep[] = [];

    const submittedStatus: TrackerStepStatus = hs === "draft" ? "current" : "completed";
    const submittedNote = hs === "draft" ? "Pending" : "Completed";

    steps.push({
      key: "submitted",
      label: "Employee",
      status: submittedStatus,
      by: header.Name ? String(header.Name) : "Employee",
      time: fmtDateTime(header.Created),
      note: submittedNote,
    });

    for (const stage of visibleStages) {
      const stageKey = norm(stage);
      const log = latestByStage[stageKey];

      if (log && norm(log.status) === "approved") {
        steps.push({
          key: stageKey,
          label: stageLabel(stage),
          status: "completed",
          by: log.approver || stageAssignedBy(stage),
          time: fmtDateTime(log.created),
          note: "Completed",
        });
        continue;
      }

      if (log && norm(log.status) === "rejected") {
        steps.push({
          key: stageKey,
          label: stageLabel(stage),
          status: "rejected",
          by: log.approver || stageAssignedBy(stage),
          time: fmtDateTime(log.created),
          note: "Rejected",
        });
        continue;
      }

      if (sendBackStage === stage) {
        steps.push({
          key: stageKey,
          label: stageLabel(stage),
          status: "sendback",
          by: stageAssignedBy(stage),
          note: "Send Back",
        });
        continue;
      }

      if (pendingStage === stage) {
        steps.push({
          key: stageKey,
          label: stageLabel(stage),
          status: "current",
          by: stageAssignedBy(stage),
          note: "Pending",
        });
        continue;
      }

      steps.push({
        key: stageKey,
        label: stageLabel(stage),
        status: "pending",
        by: stageAssignedBy(stage),
        note: "Pending",
      });
    }

    if (hs === "approved") steps.push({ key: "done", label: "Completed", status: "completed", note: "Completed" });
    else if (hs === "rejected") steps.push({ key: "done", label: "Completed", status: "rejected", note: "Rejected" });
    else if (hs.startsWith("send back")) steps.push({ key: "done", label: "Completed", status: "pending", note: "Send Back" });
    else steps.push({ key: "done", label: "Completed", status: "pending", note: "Pending" });

    return steps;
  }, [header, totalAmount, approvalHistory, approverNames]);

  /** ===================== Render ===================== */
  const readOnly = true;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(dashboardRoute)}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                title="Back"
              >
                <Icon iconName="ChevronLeft" />
              </button>
              <div>
                <div className="text-lg font-bold text-slate-900">Expense Claim Details</div>
                <div className="text-xs text-slate-500">View claim</div>
              </div>
            </div>

            {header && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Claim ID</div>
                  <div className="text-sm font-bold text-slate-900">{header.Title}</div>
                </div>
                <StatusBadge value={header.Status} />
              </div>
            )}
          </div>

          {submitError && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700 flex items-center gap-2">
              <Icon iconName="Warning" />
              {submitError}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <LoadingSpinner />
          </div>
        ) : !header ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-600">No data found.</div>
        ) : (
          <>
            {/* Employee Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon iconName="Contact" className="text-indigo-600" />
                <div className="text-sm font-semibold text-slate-800">Employee Details</div>
              </div>

              <EmpViewDetails context={context} empListTitle={empListTitle} itemId={header.Id} />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Total Amount</div>
                  <div className="text-lg font-bold text-emerald-700">₹{money(header.TotalAmount ?? totalAmount)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Items</div>
                  <div className="text-lg font-bold text-slate-800">{rows.length}</div>
                </div>
              </div>

              {header.SubmitterRemarks && (
                <div className="mt-4">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Submitter Remarks</div>
                  <div className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                    {header.SubmitterRemarks}
                  </div>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Icon iconName="BulletedList" className="text-indigo-600" />
                <div className="text-sm font-semibold text-slate-800">Expense Line Items</div>
              </div>

              <div className="space-y-4">
                {rows.map((row, index) => {
                  const categoryKey = (row.categoryKey || "").trim();

                  const config =
                    categoryConfigurationByKey[categoryKey] || categoryConfigurationByKeyCI[normalizeKey(categoryKey)];

                  const dynamicFields = config?.fields || [];

                  const subOptions =
                    subCategoryOptionsByCategory[categoryKey] ||
                    subCategoryOptionsByCategoryCI[normalizeKey(categoryKey)] ||
                    [];

                  const currentSub = (row.values[COMMON_FIELD_KEYS.subcategory] || "").trim();
                  const subExists = subOptions.some((o) => o.value === currentSub);
                  const showSubCategory = subOptions.length > 0 || Boolean(currentSub);

                  return (
                    <div key={row.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">Line Item</span>
                          {categoryKey && <span className="text-xs text-slate-500">• {categoryKey}</span>}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <div className="flex-1 min-w-[160px]">
                            <label className={labelClass}>Category</label>
                            <select value={categoryKey} onChange={() => {}} disabled className={selectClass}>
                              <option value={categoryKey}>{categoryKey || "—"}</option>
                            </select>
                          </div>

                          {showSubCategory && (
                            <div className="flex-1 min-w-[160px]">
                              <label className={labelClass}>Subcategory</label>
                              <div className="relative">
                                <select value={currentSub} onChange={() => {}} disabled className={selectClass}>
                                  {!subExists && currentSub && <option value={currentSub}>{currentSub}</option>}
                                  <option value="">Select Subcategory</option>
                                  {subOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <Icon
                                  iconName="ChevronDown"
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex-1 min-w-[140px]">
                            <label className={labelClass}>Date</label>
                            <input
                              type="date"
                              value={row.values[COMMON_FIELD_KEYS.date] || ""}
                              onChange={() => {}}
                              disabled
                              className={inputClass}
                            />
                          </div>

                          <div className="flex-1 min-w-[120px]">
                            <label className={labelClass}>Amount (₹)</label>
                            <input
                              type="text"
                              value={row.values[COMMON_FIELD_KEYS.amount] || ""}
                              onChange={() => {}}
                              disabled
                              className={inputClass}
                            />
                          </div>

                          <div className="flex-1 min-w-[200px]">
                            <label className={labelClass}>Attachment</label>
                            <div className={`${inputClass} h-auto min-h-[36px] py-2 bg-slate-50`}>
                              {row.attachments.length ? (
                                <div className="flex flex-col gap-1">
                                  {row.attachments.map((f) => (
                                    <a
                                      key={f.ServerRelativeUrl}
                                      href={f.ServerRelativeUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-indigo-600 underline truncate"
                                      title={f.FileName}
                                    >
                                      {f.FileName}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-500 text-xs">No attachment</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {dynamicFields.map((field) => (
                            <div key={field.id} className="flex-1 min-w-[140px]">
                              <label className={labelClass}>{field.label}</label>
                              {field.type === "textarea" ? (
                                <textarea
                                  value={row.values[field.id] || ""}
                                  onChange={() => {}}
                                  disabled={readOnly}
                                  rows={2}
                                  className={textareaClass}
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  value={row.values[field.id] || ""}
                                  onChange={() => {}}
                                  disabled={readOnly}
                                  className={inputClass}
                                />
                              )}
                            </div>
                          ))}

                          <div className="flex-[2] min-w-[200px]">
                            <label className={labelClass}>Description</label>
                            <textarea
                              value={row.values[COMMON_FIELD_KEYS.description] || ""}
                              onChange={() => {}}
                              disabled={readOnly}
                              rows={2}
                              className={textareaClass}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {rows.length === 0 && <div className="text-sm text-slate-500">No items found.</div>}
              </div>
            </div>

            {/* Remarks + Approver Input */}
            {(approvalRemarksOnly.length > 0 || shouldShowApprovalPanel) && (
              <div className="mt-6 bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon iconName="Chat" className="text-indigo-600" />
                  <div className="text-sm font-semibold text-slate-800">Approver Remarks</div>
                </div>

                {approvalRemarksOnly.length > 0 && (
                  <div className="space-y-3">
                    {approvalRemarksOnly.map((l) => (
                      <div key={l.id}>
                        <div className={remarkLabelClass}>{`Remarks ${stageLabel(l.stage)}`}</div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <div className="text-sm text-slate-700 whitespace-pre-wrap">{l.remarks}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {shouldShowApprovalPanel && (
                  <div className="mt-5">
                    <div className="mb-4">
                      <label className={labelClass}>{`Remarks ${stageLabel(myRole || "")}`}</label>
                      <textarea
                        value={approvalRemarks}
                        onChange={(e) => setApprovalRemarks(e.target.value)}
                        placeholder="Enter remarks"
                        className={`${textareaClass} h-48`}
                      />
                    </div>

                    <div className="flex justify-center gap-3 flex-wrap">
                      <button
                        type="button"
                        disabled={!canApprove}
                        onClick={() => handleApproval("Approved")}
                        className={btnApprove}
                      >
                        {isApproving ? "Processing..." : "Approve"}
                      </button>

                      <button
                        type="button"
                        disabled={!canApprove}
                        onClick={() => handleApproval("Rejected")}
                        className={btnReject}
                      >
                        Reject
                      </button>

                      <button type="button" onClick={onModify} disabled={isModifying} className={btnModify}>
                        <Icon iconName="Edit" />
                        {isModifying ? "Sending..." : "Modify"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tracker (hide in Draft) */}
            {trackerSteps.length > 0 && !isDraft && (
              <div className="mt-6">
                <Tracker steps={trackerSteps} />
              </div>
            )}

            {/* Bottom buttons */}
            <div className="flex justify-center mt-6 gap-3 flex-wrap">
              <button type="button" onClick={() => navigate(dashboardRoute)} className={btnBack}>
                <Icon iconName="ChevronLeft" />
                Back to Dashboard
              </button>

              {/* Submit button for employee in Draft/SendBack */}
              {showEmployeeSubmit && (
                <button type="button" onClick={onSubmit} disabled={isSubmitting} className={btnSubmit}>
                  <Icon iconName="Send" />
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseView;