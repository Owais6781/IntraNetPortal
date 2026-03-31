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
  spItemId: number; // 0 = new
  categoryKey: string;
  values: Record<string, string>;
  attachments: AttachmentInfo[];
  removedFileNames: string[];
  newFile: File | null;
};

type ClaimHeader = {
  Id: number;
  Title: string;
  Status?: string;

  Name?: string;
  Department?: string;
  Designation?: string;
  Email?: string;
  PhoneNumber?: string | number;
  EmployeeId?: string;
  EmployeeID?: string;

  Manager?: string;
  Director?: string;

  TotalAmount?: string | number;
  SubmitterRemarks?: string;
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
const createTempRowId = () => `row_tmp_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

const normalizeKey = (text: string) => (text || "").toLowerCase().replace(/\s+/g, "").trim();
const escapeOData = (s: string) => String(s || "").replace(/'/g, "''");

const toText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const norm = (v: any) => toText(v).trim().toLowerCase();

const getSendBackStageFromStatus = (status?: string): "Manager" | "Director" | "HR" | null => {
  const s = norm(status);
  if (!s.startsWith("send back")) return null;
  if (s.includes("manager")) return "Manager";
  if (s.includes("director")) return "Director";
  if (s.includes("hr")) return "HR";
  return "Manager";
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
  const n = parseFloat(String(value).replace(/,/g, "").replace(/[^\d.]/g, ""));
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
  ) {
    return "textarea";
  }
  return "text";
};

const buildEmptyValuesForCategory = (categoryConfiguration: CategoryConfiguration | undefined) => {
  const values: Record<string, string> = {};
  values[COMMON_FIELD_KEYS.subcategory] = "";
  values[COMMON_FIELD_KEYS.date] = "";
  values[COMMON_FIELD_KEYS.amount] = "";
  values[COMMON_FIELD_KEYS.description] = "";
  if (categoryConfiguration) {
    for (const field of categoryConfiguration.fields) values[field.id] = "";
  }
  return values;
};

/** ===== DATE FIX ===== */
const parseYMD = (yyyyMmDd: string) => {
  const [y, m, d] = (yyyyMmDd || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
};

// store date-only as UTC noon to avoid timezone shifts
const dateOnlyToSPDate = (yyyyMmDd: string) => {
  const p = parseYMD(yyyyMmDd);
  if (!p) return null;
  return new Date(Date.UTC(p.y, p.m - 1, p.d, 12, 0, 0));
};
/** ==================== */

type WritableFieldInfo = { internalName: string; typeAsString: string };

const getFieldInfoSafe = async (list: any, internalNameOrTitle: string): Promise<WritableFieldInfo | null> => {
  try {
    const f: any = await list.fields.getByInternalNameOrTitle(internalNameOrTitle).select("InternalName", "TypeAsString")();
    return {
      internalName: String(f.InternalName),
      typeAsString: String(f.TypeAsString || "Text"),
    };
  } catch {
    return null;
  }
};

const coerceValueForField = (typeAsString: string, value: any) => {
  if (value === undefined || value === null) return null;
  const t = (typeAsString || "").toLowerCase();

  if (t.includes("datetime")) {
    if (value instanceof Date) return value;
    const s = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return dateOnlyToSPDate(s);
    return new Date(s);
  }

  if (t.includes("number") || t.includes("currency") || t.includes("integer")) {
    const n = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
    return isFinite(n) ? n : null;
  }

  return String(value);
};

const buildWritableFieldResolver = async (list: any) => {
  const raw: any[] = await list.fields.select("InternalName", "Title", "Hidden", "ReadOnlyField", "TypeAsString")();
  const writable = raw.filter((f) => !f.Hidden && !f.ReadOnlyField);

  const titleToInfo: Record<string, WritableFieldInfo> = {};
  for (const f of writable) {
    titleToInfo[normalizeKey(String(f.Title))] = {
      internalName: String(f.InternalName),
      typeAsString: String(f.TypeAsString || "Text"),
    };
  }

  return (displayTitle: string): WritableFieldInfo | null => titleToInfo[normalizeKey(displayTitle)] || null;
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
    if (internalSet.has(configField.id)) {
      return { internal: configField.id, typeAsString: internalToType[configField.id] || "Text" };
    }
    const byTitle = titleToInternal[normalizeKey(configField.label)];
    if (byTitle) return { internal: byTitle, typeAsString: internalToType[byTitle] || "Text" };
    return null;
  };
};

/** ===== Draft -> Pending title helpers ===== */
const getNextPendingTitleGlobal = async (empList: any, draftTitle: string): Promise<string> => {
  const raw = String(draftTitle || "").trim();
  const parts = raw.split("-");

  if (parts.length < 5) throw new Error("Invalid Draft Title format.");

  // Example: EC-06-Draft-2028-4
  const prefixWithoutDraft = `${parts[0]}-${parts[1]}-${parts[3]}-`; // EC-06-2028-

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

const inputClass =
  "w-full h-[36px] px-3 text-[13px] text-slate-800 bg-white border border-slate-300 rounded-md transition-all duration-150 " +
  "focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 " +
  "disabled:bg-slate-50 disabled:text-slate-900 disabled:opacity-100 disabled:cursor-not-allowed placeholder:text-slate-400";

const selectClass = `${inputClass} appearance-none pr-8`;

const textareaClass =
  "w-full px-3 py-2 text-[13px] text-slate-800 bg-white border border-slate-300 rounded-md transition-all duration-150 " +
  "focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 " +
  "disabled:bg-slate-50 disabled:text-slate-900 disabled:opacity-100 disabled:cursor-not-allowed placeholder:text-slate-400";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const StatusBadge = ({ value }: { value?: string }) => {
  const v = (value || "").toLowerCase();
  const base = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border";
  if (v === "approved") return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>Approved</span>;
  if (v === "rejected") return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}>Rejected</span>;
  if (v === "draft") return <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>Draft</span>;
  if (v.startsWith("send back")) return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>Send Back</span>;
  if (v.includes("pending")) return <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200`}>Pending</span>;
  if (v.includes("need")) return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}>Need Modification</span>;
  return <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>{value || "—"}</span>;
};

/** ===================== Component ===================== */
const ExpenseEdit = ({
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
  const [rows, setRows] = React.useState<LineItemRow[]>([]);
  const [employeeValues, setEmployeeValues] = React.useState({
    empId: "",
    name: "",
    designation: "",
    department: "",
    phone: "",
    email: "",
    manager: "",
    director: "",
  });

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

  const getSubOptions = React.useCallback(
    (categoryKey: string) => {
      const key = (categoryKey || "").trim();
      return subCategoryOptionsByCategory[key] || subCategoryOptionsByCategoryCI[normalizeKey(key)] || [];
    },
    [subCategoryOptionsByCategory, subCategoryOptionsByCategoryCI]
  );

  const totalAmount = React.useMemo(
    () => rows.reduce((sum, r) => sum + parseMoney(r.values[COMMON_FIELD_KEYS.amount]), 0),
    [rows]
  );

  const currentUserEmail = (context.pageContext.user.email || "").trim().toLowerCase();
  const headerEmail = toText(header?.Email).trim().toLowerCase();
  const statusText = toText(header?.Status).trim().toLowerCase();

  const isDraft = statusText === "draft";
  const isSendBack = statusText.startsWith("send back");

  const canEdit =
    !!header &&
    headerEmail &&
    headerEmail === currentUserEmail &&
    (isDraft || isSendBack || statusText.includes("need"));

  const displayedTotal = React.useMemo(() => {
    if (canEdit) return totalAmount;
    return header?.TotalAmount ?? totalAmount;
  }, [canEdit, header?.TotalAmount, totalAmount]);

  const [reloadToken, setReloadToken] = React.useState(0);
  const deletedSpItemIdsRef = React.useRef<number[]>([]);

  // store internal names for common fields
  type CommonClaimFields = {
    category: WritableFieldInfo;
    subCategory: WritableFieldInfo | null;
    date: WritableFieldInfo;
    amount: WritableFieldInfo;
    description: WritableFieldInfo;
  };
  const commonClaimFieldsRef = React.useRef<CommonClaimFields | null>(null);

  const [amountIsNumericColumn, setAmountIsNumericColumn] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        if (!claimTitle) throw new Error("Missing claim title");
        const safeTitle = escapeOData(claimTitle);

        const masterList = sp.web.lists.getByTitle(masterListTitle);
        const claimList = sp.web.lists.getByTitle(claimListTitle);

        // read internal names once
        const categoryF = await getFieldInfoSafe(claimList, "Category");
        const subCategoryF = await getFieldInfoSafe(claimList, "SubCategory"); // optional
        const dateF = await getFieldInfoSafe(claimList, "Date");
        const amountF = await getFieldInfoSafe(claimList, "Amount");
        const descF = await getFieldInfoSafe(claimList, "Description");

        if (!categoryF) throw new Error(`Field "Category" not found in ${claimListTitle}`);
        if (!dateF) throw new Error(`Field "Date" not found in ${claimListTitle}`);
        if (!amountF) throw new Error(`Field "Amount" not found in ${claimListTitle}`);
        if (!descF) throw new Error(`Field "Description" not found in ${claimListTitle}`);

        commonClaimFieldsRef.current = {
          category: categoryF,
          subCategory: subCategoryF,
          date: dateF,
          amount: amountF,
          description: descF,
        };

        const amountType = (amountF.typeAsString || "").toLowerCase();
        const isNumeric = amountType.includes("number") || amountType.includes("currency") || amountType.includes("integer");
        if (mounted) setAmountIsNumericColumn(isNumeric);

        // dynamic config
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
        const sortedCategories = Object.values(byCategory).sort((a, b) => a.label.localeCompare(b.label));

        // sub categories
        const subItems: any[] = await sp.web.lists
          .getByTitle(subCategoryListTitle)
          .items.select("Id", "Title", subCategoryCategoryInternalName, subCategoryStatusInternalName)
          .top(5000)();

        const subMap: Record<string, { value: string; label: string }[]> = {};
        for (const s of subItems) {
          const status = toText(s[subCategoryStatusInternalName]).trim();
          if (status && status.toLowerCase() !== subCategoryActiveValue.toLowerCase()) continue;

          const catKey = getCategoryValue(s[subCategoryCategoryInternalName]);
          const title = toText(s.Title).trim();
          if (!catKey || !title) continue;

          if (!subMap[catKey]) subMap[catKey] = [];
          subMap[catKey].push({ value: title, label: title });
        }
        for (const k of Object.keys(subMap)) subMap[k].sort((a, b) => a.label.localeCompare(b.label));

        // header
        const empList = sp.web.lists.getByTitle(empListTitle);
        const hdrRows: any[] = await empList.items.filter(`Title eq '${safeTitle}'`).select("*").top(1)();
        if (!hdrRows.length) throw new Error("Header not found.");
        const hdr: ClaimHeader = { ...hdrRows[0] };

        // line items
        const resolveClaimField = await buildClaimFieldResolver(claimList);
        const claimItems: any[] = await claimList.items
          .filter(`Title eq '${safeTitle}'`)
          .select("*")
          .orderBy("Id", true)
          .top(5000)();

        const common = commonClaimFieldsRef.current!;
        const mappedRows: LineItemRow[] = await Promise.all(
          claimItems.map(async (it) => {
            const categoryKey = getCategoryValue(it[common.category.internalName]).trim();
            const config = categoryKey ? byCategory[categoryKey] : undefined;

            const values = buildEmptyValuesForCategory(config);

            const subOptions = subMap[categoryKey] || [];
            const hasSubcategory = subOptions.length > 0;
            const rawSub = common.subCategory ? toText(it[common.subCategory.internalName]).trim() : "";
            const isValidSub = hasSubcategory ? subOptions.some((o) => o.value === rawSub) : false;
            values[COMMON_FIELD_KEYS.subcategory] = hasSubcategory && isValidSub ? rawSub : "";

            values[COMMON_FIELD_KEYS.date] = toInputDate(it[common.date.internalName]); // optional in validation now
            values[COMMON_FIELD_KEYS.amount] =
              it[common.amount.internalName] !== undefined && it[common.amount.internalName] !== null
                ? String(it[common.amount.internalName])
                : "";
            values[COMMON_FIELD_KEYS.description] = toText(it[common.description.internalName]);

            if (config?.fields?.length) {
              for (const f of config.fields) {
                const target = resolveClaimField(f);
                if (!target) continue;
                const rawVal = it[target.internal];
                if (rawVal === undefined || rawVal === null) continue;
                values[f.id] = (target.typeAsString || "").toLowerCase().includes("datetime") ? toInputDate(rawVal) : toText(rawVal);
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
              // ignore
            }

            return {
              id: createRowId(it.Id),
              spItemId: it.Id,
              categoryKey,
              values,
              attachments,
              removedFileNames: [],
              newFile: null,
            };
          })
        );

        const rowsOrBlank: LineItemRow[] =
          mappedRows.length > 0
            ? mappedRows
            : [
                {
                  id: createTempRowId(),
                  spItemId: 0,
                  categoryKey: "",
                  values: buildEmptyValuesForCategory(undefined),
                  attachments: [],
                  removedFileNames: [],
                  newFile: null,
                },
              ];

        if (!mounted) return;

        deletedSpItemIdsRef.current = [];
        setCategoryConfigurations(sortedCategories);
        setSubCategoryOptionsByCategory(subMap);

        setHeader(hdr);
        setRows(rowsOrBlank);

        setEmployeeValues({
          empId: String(hdr.EmployeeId || hdr.EmployeeID || ""),
          name: String(hdr.Name || ""),
          designation: String(hdr.Designation || ""),
          department: String(hdr.Department || ""),
          phone: String(hdr.PhoneNumber || ""),
          email: String(hdr.Email || ""),
          manager: String(hdr.Manager || ""),
          director: String(hdr.Director || ""),
        });
      } catch {
        // keep existing behavior: show "No data found"
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [sp,reloadToken]);

  const addRow = React.useCallback(() => {
    setRows((prev) => [
      ...prev,
      {
        id: createTempRowId(),
        spItemId: 0,
        categoryKey: "",
        values: buildEmptyValuesForCategory(undefined),
        attachments: [],
        removedFileNames: [],
        newFile: null,
      },
    ]);
  }, []);

  const removeRow = React.useCallback((rowId: string) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === rowId);
      if (row?.spItemId && row.spItemId > 0) {
        deletedSpItemIdsRef.current = Array.from(new Set([...deletedSpItemIdsRef.current, row.spItemId]));
      }

      const remaining = prev.filter((r) => r.id !== rowId);
      return remaining.length
        ? remaining
        : [
            {
              id: createTempRowId(),
              spItemId: 0,
              categoryKey: "",
              values: buildEmptyValuesForCategory(undefined),
              attachments: [],
              removedFileNames: [],
              newFile: null,
            },
          ];
    });
  }, []);

  const setRowField = (rowId: string, key: string, value: string) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, values: { ...r.values, [key]: value } } : r)));
  };

  const setRowCategory = (rowId: string, categoryKey: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;

        const config = categoryConfigurationByKey[categoryKey] || categoryConfigurationByKeyCI[normalizeKey(categoryKey)];
        const nextValues = buildEmptyValuesForCategory(config);

        const subOpts = getSubOptions(categoryKey);
        const prevSub = r.values[COMMON_FIELD_KEYS.subcategory] || "";
        const hasSub = subOpts.length > 0;
        const isPrevValid = hasSub ? subOpts.some((o) => o.value === prevSub) : false;

        // keep common values
        nextValues[COMMON_FIELD_KEYS.date] = r.values[COMMON_FIELD_KEYS.date] || "";
        nextValues[COMMON_FIELD_KEYS.amount] = r.values[COMMON_FIELD_KEYS.amount] || "";
        nextValues[COMMON_FIELD_KEYS.description] = r.values[COMMON_FIELD_KEYS.description] || "";
        nextValues[COMMON_FIELD_KEYS.subcategory] = isPrevValid ? prevSub : "";

        return { ...r, categoryKey, values: nextValues };
      })
    );
  };

  // when selecting a new file we are in "replace" mode
  const setRowNewFile = (rowId: string, file: File | null) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;

        const existingNames = r.attachments.map((a) => a.FileName);

        return {
          ...r,
          newFile: file,
          removedFileNames: file ? existingNames : r.removedFileNames,
          attachments: file ? [] : r.attachments,
        };
      })
    );
  };

  const removeExistingAttachment = (rowId: string, fileName: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          attachments: r.attachments.filter((a) => a.FileName !== fileName),
          removedFileNames: [...r.removedFileNames, fileName],
        };
      })
    );
  };

  const [isSaving, setIsSaving] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);


  const saveChanges = async () => {
    if (!header) return;
    if (!canEdit) return;

    const claimList = sp.web.lists.getByTitle(claimListTitle);
    const empList = sp.web.lists.getByTitle(empListTitle);

    const resolveClaimField = await buildClaimFieldResolver(claimList);
    const common = commonClaimFieldsRef.current;
    if (!common) throw new Error("Claim field mapping not loaded.");

    const submissionTitle = String(header.Title || "").trim();

    // Update header
    const resolveEmpField = await buildWritableFieldResolver(empList);
    const empPayload: any = {};

    const setEmp = (displayTitle: string, value: any) => {
      if (value === undefined || value === null || String(value).trim() === "") return;
      const info = resolveEmpField(displayTitle);
      if (!info) return;
      empPayload[info.internalName] = coerceValueForField(info.typeAsString, value);
    };

    setEmp("Name", employeeValues.name);
    setEmp("Department", employeeValues.department);
    setEmp("Designation", employeeValues.designation);
    setEmp("Email", employeeValues.email);
    setEmp("Manager", employeeValues.manager);
    setEmp("Director", employeeValues.director);
    setEmp("TotalAmount", totalAmount.toFixed(2));

    const phoneText = (employeeValues.phone || "").replace(/,/g, "").trim();
    if (phoneText) {
      const phoneNumber = Number(phoneText);
      if (Number.isFinite(phoneNumber)) setEmp("PhoneNumber", phoneNumber);
      else setEmp("PhoneNumber", phoneText);
    }

    await empList.items.getById(header.Id).update(empPayload);

    // delete removed line items
    const deletedIds = Array.from(new Set(deletedSpItemIdsRef.current));
    for (const id of deletedIds) {
      try {
        await claimList.items.getById(id).delete();
      } catch {
        // ignore
      }
    }
    deletedSpItemIdsRef.current = [];

    const rowErrors: string[] = [];
    const newIdsByRowId: Record<string, number> = {};

    // add/update rows
    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];

      try {
        const categoryKey = (row.categoryKey || "").trim();

        const config = categoryConfigurationByKey[categoryKey] || categoryConfigurationByKeyCI[normalizeKey(categoryKey)];
        const dynamicFields = config?.fields || [];

        const subOpts = getSubOptions(categoryKey);
        const hasSubcategory = subOpts.length > 0;

        const amountRaw = (row.values[COMMON_FIELD_KEYS.amount] ?? "").trim();
        const dateRaw = (row.values[COMMON_FIELD_KEYS.date] ?? "").trim(); 
        const descRaw = (row.values[COMMON_FIELD_KEYS.description] ?? "").trim();
        const subRaw = (row.values[COMMON_FIELD_KEYS.subcategory] ?? "").trim();

        // ✅ Mandatory only these:
        if (!categoryKey) throw new Error("Category is required.");
        if (hasSubcategory && !subRaw) throw new Error("Subcategory is required.");
        if (!amountRaw) throw new Error("Amount is required.");
        if (!descRaw) throw new Error("Description is required.");

        const amtNumber = parseMoney(amountRaw);
        if (!Number.isFinite(amtNumber) || amtNumber < 1) throw new Error("Amount must be minimum 1.");

        const payload: any = { Title: submissionTitle };

        payload[common.category.internalName] = categoryKey;
        if (common.subCategory) payload[common.subCategory.internalName] = hasSubcategory ? subRaw : null;

        // ✅ Date is NOT mandatory now
        if (dateRaw) {
          const dt = dateOnlyToSPDate(dateRaw);
          if (!dt) throw new Error("Invalid date.");
          payload[common.date.internalName] = dt;
        } else {
          payload[common.date.internalName] = null;
        }

        payload[common.amount.internalName] = amountIsNumericColumn ? amtNumber : amtNumber.toFixed(2);
        payload[common.description.internalName] = descRaw;

        // dynamic fields (optional)
        for (const f of dynamicFields) {
          const target = resolveClaimField(f);
          if (!target) continue;

          const internal = target.internal;
          const type = (target.typeAsString || "").toLowerCase();
          const vRaw = (row.values[f.id] ?? "").trim();

          if (!vRaw) {
            payload[internal] = null;
            continue;
          }

          if (type.includes("datetime")) payload[internal] = dateOnlyToSPDate(vRaw);
          else if (type.includes("number") || type.includes("currency") || type.includes("integer")) payload[internal] = parseMoney(vRaw);
          else payload[internal] = vRaw;
        }

        // update if exists, else add
        let itemId: number | null = row.spItemId && row.spItemId > 0 ? row.spItemId : null;

        if (itemId) {
          await claimList.items.getById(itemId).update(payload);
        } else {
          const addResult = await claimList.items.add(payload);

          itemId = addResult?.data?.Id ?? addResult?.data?.ID ?? null;

          if (!itemId && addResult?.item) {
            try {
              const info: any = await addResult.item.select("Id")();
              itemId = info?.Id ?? info?.ID ?? null;
            } catch {
              // ignore
            }
          }

          if (!itemId) {
            try {
              const found = await claimList.items
                .filter(`Title eq '${submissionTitle.replace(/'/g, "''")}'`)
                .select("Id")
                .orderBy("Id", false)
                .top(1)();
              if (found?.length) itemId = found[0].Id ?? found[0].ID ?? null;
            } catch {
              // ignore
            }
          }

          if (!itemId) throw new Error("Failed to determine created item ID");
          newIdsByRowId[row.id] = itemId;
        }

        // delete removed attachments
        const removeNames = Array.from(
          new Set((row.removedFileNames || []).map((x) => String(x).trim()).filter(Boolean))
        );
        for (const fileName of removeNames) {
          try {
            await claimList.items.getById(itemId!).attachmentFiles.getByName(fileName).delete();
          } catch {
            // ignore
          }
        }

        // add new attachment (replace mode)
        if (row.newFile) {
          try {
            const safeName = row.newFile.name.replace(/[\\/:*?"<>|#%]+/g, "_");
            const buffer = await row.newFile.arrayBuffer();
            await claimList.items.getById(itemId!).attachmentFiles.add(safeName, buffer);
          } catch (attachmentError: any) {
            rowErrors.push(`Row ${idx + 1} (Attachment): ${attachmentError?.message || "Failed"}`);
          }
        }
      } catch (e: any) {
        rowErrors.push(`Row ${idx + 1}: ${e?.message || "Failed"}`);
      }
    }

    // Update new rows with SP IDs in state (prevents duplicates)
    const newRowKeys = Object.keys(newIdsByRowId);
    if (newRowKeys.length) {
      setRows((prev) =>
        prev.map((r) => {
          const newId = newIdsByRowId[r.id];
          if (!newId) return r;
          return {
            ...r,
            spItemId: newId,
            id: createRowId(newId),
            removedFileNames: [],
            newFile: null,
          };
        })
      );
    }

    if (rowErrors.length) throw new Error(rowErrors.join("\n"));
  };

  const onSave = async () => {
    if (!header || !canEdit) return;
    try {
      setIsSaving(true);
      await saveChanges();
      alert("Saved successfully!");
      setReloadToken((x) => x + 1);
    } catch (e: any) {
      alert("Error saving: " + (e?.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const onUpdateSendBack = async () => {
    if (!header || !canEdit) return;
    try {
      setIsUpdating(true);

      await saveChanges();

      const stage = getSendBackStageFromStatus(header.Status) || "Manager";
      const empList = sp.web.lists.getByTitle(empListTitle);
      await empList.items.getById(header.Id).update({ Status: `Pending - ${stage}` });

      navigate(dashboardRoute, { replace: true });
    } catch (e: any) {
      alert("Error updating: " + (e?.message || "Unknown error"));
    } finally {
      setIsUpdating(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async () => {
    if (!header) return;
    if (!isDraft) return;

    try {
      setIsSubmitting(true);

      await saveChanges();

      const oldTitle = String(header.Title || "").trim();

      const empList = sp.web.lists.getByTitle(empListTitle);
      const claimList = sp.web.lists.getByTitle(claimListTitle);
      const newTitle = await getNextPendingTitleGlobal(empList, oldTitle);

      const safeOldTitle = escapeOData(oldTitle);
      const lineItems: any[] = await claimList.items.filter(`Title eq '${safeOldTitle}'`).select("Id").top(5000)();
      for (const li of lineItems) await claimList.items.getById(li.Id).update({ Title: newTitle });

      await empList.items.getById(header.Id).update({ Title: newTitle, Status: "Pending" });

      navigate(dashboardRoute, { replace: true });
    } catch (e: any) {
      alert("Error submitting: " + (e?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(dashboardRoute)}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              >
                <Icon iconName="ChevronLeft" />
              </button>
              <div>
                <div className="text-lg font-bold text-slate-900">Expense Claim Edit</div>
                <div className="text-xs text-slate-500">Edit claim (employee)</div>
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
        </div>

        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <LoadingSpinner />
          </div>
        ) : !header ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-slate-600">No data found.</div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Icon iconName="Contact" className="text-indigo-600" />
                <div className="text-sm font-semibold text-slate-800">Employee Details</div>
              </div>

              <EmpViewDetails context={context} empListTitle={empListTitle} itemId={header.Id} />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">
                    Total Amount {canEdit ? "(Live)" : "(Saved)"}
                  </div>
                  <div className="text-lg font-bold text-emerald-700">₹{money(displayedTotal)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">Items</div>
                  <div className="text-lg font-bold text-slate-800">{rows.length}</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                <div className="flex items-center gap-2">
                  <Icon iconName="BulletedList" className="text-indigo-600" />
                  <div className="text-sm font-semibold text-slate-800">Expense Line Items</div>
                </div>

                {canEdit && !isSendBack && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReloadToken((x) => x + 1)}
                      disabled={isSaving || isUpdating}
                      className="h-9 px-4 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={onSave}
                      disabled={isSaving || isUpdating}
                      className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-semibold rounded-lg"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {rows.map((row, index) => {
                  const categoryKey = (row.categoryKey || "").trim();

                  const config = categoryConfigurationByKey[categoryKey] || categoryConfigurationByKeyCI[normalizeKey(categoryKey)];
                  const dynamicFields = config?.fields || [];

                  const subOptions = getSubOptions(categoryKey);
                  const hasSubcategory = subOptions.length > 0;
                  const isLastRow = index === rows.length - 1;

                  return (
                    <div key={row.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-sm font-semibold text-slate-800">Line Item</span>
                        </div>

                        {canEdit && (
                          <div className="flex items-center gap-2">
                            {isLastRow && (
                              <button
                                type="button"
                                onClick={addRow}
                                disabled={isSaving || isUpdating}
                                className="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                              >
                                <Icon iconName="Add" className="text-[10px]" /> Add
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              disabled={rows.length === 1 || isSaving || isUpdating}
                              className="h-7 px-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium rounded border border-slate-300 hover:border-rose-300 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={row.spItemId > 0 ? "Remove (will delete on Save)" : "Remove"}
                            >
                              <Icon iconName="Delete" className="text-[10px]" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                          <div className="flex-1 min-w-[160px]">
                            <label className={labelClass}>Category *</label>
                            <div className="relative">
                              <select
                                value={categoryKey}
                                disabled={!canEdit || isSaving || isUpdating}
                                onChange={(e) => setRowCategory(row.id, e.target.value)}
                                className={selectClass}
                              >
                                <option value="">Select Category</option>
                                {categoryConfigurations.map((c) => (
                                  <option key={c.key} value={c.key}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                              <Icon
                                iconName="ChevronDown"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
                              />
                            </div>
                          </div>

                          {hasSubcategory && (
                            <div className="flex-1 min-w-[160px]">
                              <label className={labelClass}>Subcategory *</label>
                              <div className="relative">
                                <select
                                  value={row.values[COMMON_FIELD_KEYS.subcategory] || ""}
                                  disabled={!canEdit || isSaving || isUpdating}
                                  onChange={(e) => setRowField(row.id, COMMON_FIELD_KEYS.subcategory, e.target.value)}
                                  className={selectClass}
                                >
                                  <option value="">Select Subcategory</option>
                                  {subOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
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
                              onChange={(e) => setRowField(row.id, COMMON_FIELD_KEYS.date, e.target.value)}
                              disabled={!canEdit || isSaving || isUpdating}
                              className={inputClass}
                            />
                          </div>

                          <div className="flex-1 min-w-[120px]">
                            <label className={labelClass}>Amount (₹) *</label>
                            <input
                              type="text"
                              value={row.values[COMMON_FIELD_KEYS.amount] || ""}
                              onChange={(e) => setRowField(row.id, COMMON_FIELD_KEYS.amount, e.target.value)}
                              disabled={!canEdit || isSaving || isUpdating}
                              className={inputClass}
                            />
                          </div>

                          <div className="flex-1 min-w-[260px]">
                            <label className={labelClass}>Attachments</label>
                            <div className={`${inputClass} h-auto min-h-[36px] py-2 bg-slate-50`}>
                             
                                <div className="flex flex-col gap-1">
                                  {row.attachments.map((a) => (
                                    <div key={a.ServerRelativeUrl} className="flex items-center justify-between gap-2">
                                      <a
                                        href={a.ServerRelativeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-indigo-600 underline truncate"
                                      >
                                        {a.FileName}
                                      </a>
                                      {canEdit && (
                                        <button
                                          type="button"
                                          onClick={() => removeExistingAttachment(row.id, a.FileName)}
                                          className="text-xs px-2 py-1 rounded border border-rose-300 text-rose-700 bg-rose-50"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>

                              {canEdit && (
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    onChange={(e) => {
                                      const file = e.currentTarget.files?.[0] ?? null;
                                      setRowNewFile(row.id, file);
                                      e.currentTarget.value = "";
                                    }}
                                    className="text-xs"
                                  />

                                  {row.newFile && (
                                    <div className="mt-2">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs text-slate-700 truncate">{row.newFile.name}</span>
                                        <button
                                          type="button"
                                          onClick={() => setRowNewFile(row.id, null)}
                                          className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-700 bg-white"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {dynamicFields.map((field) => (
                            <div key={field.id} className="flex-1 min-w-[160px]">
                              <label className={labelClass}>{field.label}</label>
                              {field.type === "textarea" ? (
                                <textarea
                                  rows={2}
                                  className={textareaClass}
                                  disabled={!canEdit || isSaving || isUpdating}
                                  value={row.values[field.id] || ""}
                                  onChange={(e) => setRowField(row.id, field.id, e.target.value)}
                                />
                              ) : (
                                <input
                                  className={inputClass}
                                  disabled={!canEdit || isSaving || isUpdating}
                                  type={field.type}
                                  value={row.values[field.id] || ""}
                                  onChange={(e) => setRowField(row.id, field.id, e.target.value)}
                                />
                              )}
                            </div>
                          ))}

                          <div className="flex-[2] min-w-[260px]">
                            <label className={labelClass}>Description *</label>
                            <textarea
                              rows={2}
                              className={textareaClass}
                              disabled={!canEdit || isSaving || isUpdating}
                              value={row.values[COMMON_FIELD_KEYS.description] || ""}
                              onChange={(e) => setRowField(row.id, COMMON_FIELD_KEYS.description, e.target.value)}
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

            <div className="flex justify-center mt-6 gap-3">
              <button
                type="button"
                onClick={() => navigate(dashboardRoute)}
                className="h-10 px-6 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300 flex items-center gap-2"
              >
                <Icon iconName="ChevronLeft" />
                Back
              </button>

              {isDraft && canEdit && (
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting || isSaving || isUpdating}
                  className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg border border-indigo-600 flex items-center gap-2"
                >
                  <Icon iconName="Send" />
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              )}

              {isSendBack && canEdit && (
                <button
                  type="button"
                  onClick={onUpdateSendBack}
                  disabled={isSaving || isUpdating}
                  className="h-10 px-6 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-sm font-semibold rounded-lg border border-amber-600 flex items-center gap-2"
                >
                  <Icon iconName="Save" />
                  {isUpdating ? "Updating..." : "Update"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseEdit;