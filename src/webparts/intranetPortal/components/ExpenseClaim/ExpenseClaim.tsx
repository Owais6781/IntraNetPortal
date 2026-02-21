import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import { Icon } from "@fluentui/react/lib/Icon";
import { useNavigate } from "react-router-dom";
import EmpDetails from "./EmpDetails";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/attachments";

type FieldType = "text" | "number" | "date" | "textarea";

type MasterField = {
  internalName: string;
  typeAsString: string;
};

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

type Props = {
  context: WebPartContext;
  masterListTitle?: string;
  categoryInternalName?: string;
  subCategoryListTitle?: string;
  subCategoryCategoryInternalName?: string;
  subCategoryStatusInternalName?: string;
  subCategoryActiveValue?: string;
  claimListTitle?: string;
  empListTitle?: string;
  empStatusInternalNameOrTitle?: string;
  empStatusPendingValue?: string;
  empStatusDraftValue?: string;
  dashboardRoute?: string;
};

type LineItemRow = {
  id: string;
  categoryKey: string;
  values: Record<string, string>;
  file: File | null;
};

const COMMON_FIELD_KEYS = {
  subcategory: "__Common_Subcategory",
  date: "__Common_Date",
  amount: "__Common_Amount",
  description: "__Common_Description",
};

type SubCategoryOption = { value: string; label: string };

const createRowId = () => `row_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

const isSystemField = (internalName: string) => {
  const n = (internalName || "").toLowerCase();
  return ["id", "title", "contenttype", "contenttypeid", "attachments", "created", "modified"].includes(n);
};

const toText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

const getCategoryValue = (value: unknown) => {
  if (value && typeof value === "object") {
    const anyObject = value as any;
    if (anyObject.Title) return String(anyObject.Title);
    if (anyObject.Label) return String(anyObject.Label);
  }
  return toText(value).trim();
};

const normalizeKey = (text: string) => (text || "").toLowerCase().replace(/\s+/g, "").trim();

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
    n.includes("description") ||
    n.includes("notes") ||
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

const parseMoney = (value: string) => {
  if (!value) return 0;
  const n = parseFloat(String(value).replace(/,/g, "").replace(/[^\d.]/g, ""));
  return isFinite(n) ? n : 0;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

/** ===================== DATE FIX (prevents -1 day) ===================== **/
const parseYMD = (yyyyMmDd: string) => {
  const [y, m, d] = (yyyyMmDd || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
};

const dateOnlyToSPDate = (yyyyMmDd: string) => {
  const p = parseYMD(yyyyMmDd);
  if (!p) return null;
  return new Date(Date.UTC(p.y, p.m - 1, p.d, 12, 0, 0));
};
/** ===================================================================== **/

const buildECPrefixFromDate = (dateText: string) => {
  const p = parseYMD(dateText);
  const now = new Date();
  const month = p ? p.m : now.getMonth() + 1;
  const year = p ? p.y : now.getFullYear();
  return `EC-${pad2(month)}-${year}-`;
};

const buildECDraftPrefixFromDate = (dateText: string) => {
  const p = parseYMD(dateText);
  const now = new Date();
  const month = p ? p.m : now.getMonth() + 1;
  const year = p ? p.y : now.getFullYear();
  return `EC-${pad2(month)}-Draft-${year}-`;
};


const EC_DRAFT_RE = /^EC-\d{2}-Draft-\d{4}-(\d+)$/i;
const EC_SUBMIT_RE = /^EC-\d{2}-\d{4}-(\d+)$/i;

type ECSeqKind = "draft" | "submit";

const getNextECSequence = async (empList: any, kind: ECSeqKind): Promise<number> => {
  const re = kind === "draft" ? EC_DRAFT_RE : EC_SUBMIT_RE;

  let maxSeq = 0;

  const process = (items: any[]) => {
    for (const it of items || []) {
      const title = String(it?.Title || "").trim();
      const m = re.exec(title);
      if (!m?.[1]) continue;
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n)) maxSeq = Math.max(maxSeq, n);
    }
  };

  // Prefer paged to avoid 5000 limit problems
  const base = empList.items.select("Title").filter(`startswith(Title,'EC-')`).top(5000);

  // PnP getPaged() exists in most versions; keep fallback if not
  const hasGetPaged = typeof (base as any).getPaged === "function";

  if (hasGetPaged) {
    let page = await (base as any).getPaged();
    process(page.results);

    while (page.hasNext) {
      page = await page.getNext();
      process(page.results);
    }
  } else {
    // fallback (may be limited to 5000 in older setups)
    const items: any[] = await base();
    process(items);
  }

  return maxSeq + 1;
};

type WritableFieldInfo = { internalName: string; typeAsString: string };

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

const coerceValueForField = (typeAsString: string, value: any) => {
  if (value === undefined || value === null) return null;
  const t = (typeAsString || "").toLowerCase();

  if (t.includes("text") || t.includes("note") || t.includes("multilinetext") || t.includes("string")) {
    return String(value);
  }

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

  if (t.includes("boolean")) return Boolean(value);

  return value;
};

const buildClaimFieldResolver = async (list: any) => {
  const rawClaimFields: any[] = await list.fields.select("InternalName", "Title", "TypeAsString", "Hidden", "ReadOnlyField")();
  const claimFields = rawClaimFields.filter((f) => !f.Hidden && !f.ReadOnlyField);

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

/** ✅ Helper: read real InternalName + Type from SharePoint (fixes Amount not saving) */
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

/** ✅ NEW: set Emp list fields (supports Text/Number/Date + Person fields) */
const toLoginNameForEnsureUser = (raw: string) => {
  const s = (raw || "").trim();
  if (!s) return "";
  if (s.startsWith("i:") || s.includes("|")) return s;
  if (s.includes("@")) return `i:0#.f|membership|${s.toLowerCase()}`;
  return s;
};

const ensureUserIdSafe = async (sp: any, rawUser: string): Promise<number | null> => {
  const login = toLoginNameForEnsureUser(rawUser);
  if (!login) return null;
  try {
    const r: any = await sp.web.ensureUser(login);
    const id = r?.data?.Id ?? r?.data?.ID ?? null;
    return typeof id === "number" ? id : null;
  } catch {
    return null;
  }
};

const setEmpFieldValue = async (
  sp: any,
  resolveEmpField: (displayTitle: string) => WritableFieldInfo | null,
  empPayload: any,
  displayTitle: string,
  value: any
) => {
  if (value === undefined || value === null) return;
  const valueText = String(value).trim();
  if (valueText === "") return;

  const info = resolveEmpField(displayTitle);
  if (!info) return;

  const typeLower = (info.typeAsString || "").toLowerCase();

  if (typeLower.includes("user")) {
    const parts = valueText
      .split(/[;,]/g)
      .map((x) => x.trim())
      .filter(Boolean);

    if (!parts.length) return;

    const ids: number[] = [];
    for (const p of parts) {
      const id = await ensureUserIdSafe(sp, p);
      if (id) ids.push(id);
    }

    if (!ids.length) return;

    const key = `${info.internalName}Id`;

    if (typeLower.includes("multi")) {
      empPayload[key] = { results: ids };
    } else {
      empPayload[key] = ids[0];
    }
    return;
  }

  empPayload[info.internalName] = coerceValueForField(info.typeAsString, value);
};

// ===== Styles (UI unchanged) =====
const labelClass = "block text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1";
const inputClass =
  "w-full h-[36px] px-3 text-[13px] text-slate-800 bg-white border border-slate-300 rounded-md transition-all duration-150 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed placeholder:text-slate-400";
const selectClass = `${inputClass} appearance-none cursor-pointer pr-8`;
const textareaClass =
  "w-full h-[36px] px-3 text-[13px] text-slate-800 bg-white border border-slate-300 rounded-md transition-all duration-150 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed placeholder:text-slate-400";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="h-8 w-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
  </div>
);

const ExpenseClaim = ({
  context,
  masterListTitle = "ExpenseMasterList",
  categoryInternalName = "Category",
  subCategoryListTitle = "ExpenseSubCategory",
  subCategoryCategoryInternalName = "Category",
  subCategoryStatusInternalName = "Status",
  subCategoryActiveValue = "Active",
  claimListTitle = "ExpenseClaim",
  empListTitle = "ExpenseEmpData",
  empStatusInternalNameOrTitle = "Status",
  empStatusPendingValue = "Pending",
  empStatusDraftValue = "Draft",
  dashboardRoute = "/expense-claims",
}: Props): JSX.Element => {
  const navigate = useNavigate();
  const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [loadError, setLoadError] = React.useState("");
  const [isTitleUniqueEnforced, setIsTitleUniqueEnforced] = React.useState<boolean>(false);
  const [categoryConfigurations, setCategoryConfigurations] = React.useState<CategoryConfiguration[]>([]);
  const categoryConfigurationByKey = React.useMemo(() => {
    const map: Record<string, CategoryConfiguration> = {};
    for (const config of categoryConfigurations) map[config.key] = config;
    return map;
  }, [categoryConfigurations]);

  const [subCategoryOptionsByCategory, setSubCategoryOptionsByCategory] = React.useState<Record<string, SubCategoryOption[]>>({});

  const [rows, setRows] = React.useState<LineItemRow[]>(() => [
    { id: createRowId(), categoryKey: "", values: buildEmptyValuesForCategory(undefined), file: null },
  ]);

  const fileInputRefs = React.useRef<Record<string, HTMLInputElement | null>>({});

  const [employeeValues, setEmployeeValues] = React.useState({
    empId: "",
    name: "",
    designation: "",
    department: "",
    phone: "",
    email: "",
    manager: "",
    director: "",
    hr: "",
  });

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        try {
          const titleField: any = await sp.web.lists
            .getByTitle(claimListTitle)
            .fields.getByInternalNameOrTitle("Title")
            .select("EnforceUniqueValues")();
          if (mounted) setIsTitleUniqueEnforced(Boolean(titleField?.EnforceUniqueValues));
        } catch {
          // ignore
        }

        const rawFields: any[] = await sp.web.lists
          .getByTitle(masterListTitle)
          .fields.select("InternalName", "Hidden", "ReadOnlyField", "TypeAsString")();

        const usableFields: MasterField[] = rawFields
          .filter((f) => !f.Hidden && !f.ReadOnlyField)
          .map((f) => ({ internalName: String(f.InternalName), typeAsString: String(f.TypeAsString || "Text") }))
          .filter((f) => !isSystemField(f.internalName) && f.internalName !== categoryInternalName);

        const selectColumns = ["Id", categoryInternalName, ...usableFields.map((f) => f.internalName)];
        const items: any[] = await sp.web.lists.getByTitle(masterListTitle).items.select(...selectColumns).top(5000)();

        const byCategory: Record<string, CategoryConfiguration> = {};
        for (const item of items) {
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

        const subItems: any[] = await sp.web.lists
          .getByTitle(subCategoryListTitle)
          .items.select("Id", "Title", subCategoryCategoryInternalName, subCategoryStatusInternalName)
          .top(5000)();

        const subMap: Record<string, SubCategoryOption[]> = {};
        for (const subItem of subItems) {
          const statusText = toText(subItem[subCategoryStatusInternalName]).trim();
          if (statusText && statusText.toLowerCase() !== subCategoryActiveValue.toLowerCase()) continue;

          const categoryKey = getCategoryValue(subItem[subCategoryCategoryInternalName]);
          const title = toText(subItem.Title).trim();
          if (!categoryKey || !title) continue;

          if (!subMap[categoryKey]) subMap[categoryKey] = [];
          subMap[categoryKey].push({ value: title, label: title });
        }
        for (const key of Object.keys(subMap)) subMap[key].sort((a, b) => a.label.localeCompare(b.label));

        if (mounted) {
          setCategoryConfigurations(sortedCategories);
          setSubCategoryOptionsByCategory(subMap);
        }
      } catch (error: any) {
        if (mounted) setLoadError(error?.message || "Failed to load configuration.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void load();
  }, [sp]);

  const grandTotal = React.useMemo(
    () => rows.reduce((sum, row) => sum + parseMoney(row.values[COMMON_FIELD_KEYS.amount]), 0),
    [rows]
  );

  const addRow = () =>
    setRows((prev) => [...prev, { id: createRowId(), categoryKey: "", values: buildEmptyValuesForCategory(undefined), file: null }]);

  const removeRow = (rowId: string) => {
    const el = fileInputRefs.current[rowId];
    if (el) {
      try {
        el.value = "";
      } catch {
        // ignore
      }
      delete fileInputRefs.current[rowId];
    }

    setRows((prev) => {
      const remaining = prev.filter((r) => r.id !== rowId);
      return remaining.length
        ? remaining
        : [{ id: createRowId(), categoryKey: "", values: buildEmptyValuesForCategory(undefined), file: null }];
    });
  };

  const updateRowCategory = (rowId: string, nextCategoryKey: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        const nextConfig = nextCategoryKey ? categoryConfigurationByKey[nextCategoryKey] : undefined;
        const nextValues = buildEmptyValuesForCategory(nextConfig);

        nextValues[COMMON_FIELD_KEYS.date] = row.values[COMMON_FIELD_KEYS.date] || "";
        nextValues[COMMON_FIELD_KEYS.amount] = row.values[COMMON_FIELD_KEYS.amount] || "";
        nextValues[COMMON_FIELD_KEYS.description] = row.values[COMMON_FIELD_KEYS.description] || "";

        return { ...row, categoryKey: nextCategoryKey, values: nextValues };
      })
    );
  };

  const updateRowValue = (rowId: string, fieldId: string, value: string) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, values: { ...row.values, [fieldId]: value } } : row)));
  };

  const updateRowFile = (rowId: string, file: File | null) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, file } : r)));
    if (!file) {
      try {
        const el = fileInputRefs.current[rowId];
        if (el) el.value = "";
      } catch {
        // ignore
      }
    }
  };

  const getDateTextForSubmissionTitle = (allRows: LineItemRow[]) => {
    const dates = allRows.map((r) => (r.values[COMMON_FIELD_KEYS.date] || "").trim()).filter(Boolean);
    return dates.length ? dates.reduce((min, cur) => (cur < min ? cur : min), dates[0]) : "";
  };

  const saveToSharePoint = async (statusValue: string, navigateAfterSuccess: boolean) => {
    // validations
    for (const row of rows) {
      if (!row.categoryKey) return alert("Please select Category for all rows.");

      const subOptions = subCategoryOptionsByCategory[row.categoryKey] || [];
      if (subOptions.length > 0 && !row.values[COMMON_FIELD_KEYS.subcategory]) {
        return alert("Please select Subcategory for all rows.");
      }

      if (!row.values[COMMON_FIELD_KEYS.date]) return alert("Please select Date for all rows.");

      const amtText = (row.values[COMMON_FIELD_KEYS.amount] || "").trim();
      if (!amtText) return alert("Please enter Amount for all rows.");

      const amt = parseMoney(amtText);
      if (!isFinite(amt) || amt < 1) return alert("Amount should not less than 1");

      if (!row.values[COMMON_FIELD_KEYS.description]) return alert("Please enter Description for all rows.");
    }

    if (isTitleUniqueEnforced) return alert("ExpenseClaim list has Title unique ON. Please disable it.");

    const rowErrors: string[] = [];

    const claimList = sp.web.lists.getByTitle(claimListTitle);
    const empList = sp.web.lists.getByTitle(empListTitle);

    /** ✅ get real internal names */
    const amountField = await getFieldInfoSafe(claimList, "Amount");
    const dateField = await getFieldInfoSafe(claimList, "Date");
    const categoryField = await getFieldInfoSafe(claimList, "Category");
    const descField = await getFieldInfoSafe(claimList, "Description");
    const subCategoryField = await getFieldInfoSafe(claimList, "SubCategory"); 

    if (!amountField) throw new Error(`Field "Amount" not found in list ${claimListTitle}`);
    if (!dateField) throw new Error(`Field "Date" not found in list ${claimListTitle}`);
    if (!categoryField) throw new Error(`Field "Category" not found in list ${claimListTitle}`);
    if (!descField) throw new Error(`Field "Description" not found in list ${claimListTitle}`);

    const amountType = amountField.typeAsString.toLowerCase();
    const amountIsNumericColumn =
      amountType.includes("number") || amountType.includes("currency") || amountType.includes("integer");

    const resolveClaimField = await buildClaimFieldResolver(claimList);

    // ✅ Claim No (NEVER restart + Draft/Submit separate)
    let submissionTitle = "";
    const titleDateText = getDateTextForSubmissionTitle(rows);

    if (statusValue === empStatusDraftValue) {
      const prefix = buildECDraftPrefixFromDate(titleDateText);
      const seq = await getNextECSequence(empList, "draft");
      submissionTitle = `${prefix}${seq}`;
    } else {
      const prefix = buildECPrefixFromDate(titleDateText);
      const seq = await getNextECSequence(empList, "submit");
      submissionTitle = `${prefix}${seq}`;
    }

    // 1) Header -> ExpenseEmpData  (Draft + Submit both)
    {
      const resolveEmpField = await buildWritableFieldResolver(empList);
      const empPayload: any = { Title: submissionTitle };

      await setEmpFieldValue(sp, resolveEmpField, empPayload, "EmpID", employeeValues.empId);
      await setEmpFieldValue(sp, resolveEmpField, empPayload, "EmployeeID", employeeValues.empId);

      await setEmpFieldValue(sp, resolveEmpField, empPayload, "Name", employeeValues.name);
      await setEmpFieldValue(sp, resolveEmpField, empPayload, "Department", employeeValues.department);
      await setEmpFieldValue(sp, resolveEmpField, empPayload, "Designation", employeeValues.designation);
      await setEmpFieldValue(sp, resolveEmpField, empPayload, "TotalAmount", grandTotal.toFixed(2));

      const phoneText = (employeeValues.phone || "").replace(/,/g, "").trim();
      if (phoneText) {
        const phoneNumber = Number(phoneText);
        const phoneValueToSave = isFinite(phoneNumber) ? phoneNumber : phoneText;

        await setEmpFieldValue(sp, resolveEmpField, empPayload, "PhoneNumber", phoneValueToSave);
        await setEmpFieldValue(sp, resolveEmpField, empPayload, "Contact", phoneValueToSave);
      }

      await setEmpFieldValue(sp, resolveEmpField, empPayload, "Email", employeeValues.email);

      await setEmpFieldValue(sp, resolveEmpField, empPayload, "Manager", employeeValues.manager);
      await setEmpFieldValue(sp, resolveEmpField, empPayload, "Director", employeeValues.director);
      await setEmpFieldValue(sp, resolveEmpField, empPayload, "Hr", employeeValues.hr);

      await setEmpFieldValue(sp, resolveEmpField, empPayload, empStatusInternalNameOrTitle, statusValue);

      await empList.items.add(empPayload);
    }

    // 2) Line Items -> ExpenseClaim (+ attachment)
    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];

      try {
        const config = row.categoryKey ? categoryConfigurationByKey[row.categoryKey] : undefined;
        const subOptions = subCategoryOptionsByCategory[row.categoryKey] || [];

        const amtNumber = parseMoney(row.values[COMMON_FIELD_KEYS.amount] || "");
        if (!isFinite(amtNumber) || amtNumber < 1) throw new Error("Amount must be minimum 1.");

        const amtTextToSave = amtNumber.toFixed(2);
        const dateText = (row.values[COMMON_FIELD_KEYS.date] || "").trim();

        const payload: any = {
          Title: submissionTitle,
        };

        payload[categoryField.internalName] = coerceValueForField(categoryField.typeAsString, row.categoryKey);
        payload[dateField.internalName] = dateText ? dateOnlyToSPDate(dateText) : null;
        payload[amountField.internalName] = amountIsNumericColumn ? amtNumber : amtTextToSave;
        payload[descField.internalName] = coerceValueForField(descField.typeAsString, row.values[COMMON_FIELD_KEYS.description]);

        if (subOptions.length > 0 && subCategoryField) {
          payload[subCategoryField.internalName] = coerceValueForField(
            subCategoryField.typeAsString,
            row.values[COMMON_FIELD_KEYS.subcategory]
          );
        }

        if (config?.fields?.length) {
          for (const f of config.fields) {
            const raw = (row.values[f.id] || "").trim();
            if (!raw) continue;

            const target = await resolveClaimField(f);
            if (!target) continue;

            const claimType = (target.typeAsString || "").toLowerCase();

            if (claimType.includes("datetime")) payload[target.internal] = dateOnlyToSPDate(raw);
            else if (claimType.includes("number") || claimType.includes("currency") || claimType.includes("integer")) {
              const n = Number(raw.replace(/,/g, ""));
              payload[target.internal] = isFinite(n) ? n : null;
            } else payload[target.internal] = raw;
          }
        }

        const addResult = await claimList.items.add(payload);

        let itemId: number | null = addResult?.data?.Id ?? addResult?.data?.ID ?? null;

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

        if (row.file) {
          try {
            const safeName = row.file.name.replace(/[\\/:*?"<>|#%]+/g, "_");
            const buffer = await row.file.arrayBuffer();
            await claimList.items.getById(itemId).attachmentFiles.add(safeName, buffer);
          } catch (attachmentError: any) {
            rowErrors.push(`Row ${idx + 1} (Attachment): ${attachmentError?.message || "Failed"}`);
          }
        }
      } catch (e: any) {
        rowErrors.push(`Row ${idx + 1}: ${e?.message || "Failed"}`);
      }
    }

    if (rowErrors.length === 0) {
      alert(statusValue === empStatusDraftValue ? "Draft saved successfully!" : "Submitted successfully!");
      if (navigateAfterSuccess) navigate(dashboardRoute);
    } else {
      alert(`${statusValue} saved with errors:\n${rowErrors.join("\n")}`);
    }
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await saveToSharePoint(empStatusDraftValue, true);
    } catch (e: any) {
      alert(e?.message || "Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await saveToSharePoint(empStatusPendingValue, true);
    } catch (e: any) {
      alert(e?.message || "Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                title="Back to Dashboard"
              >
                <Icon iconName="ChevronLeft" />
              </button>
              <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Icon iconName="ReceiptProcessing" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Expense Claim</h1>
                <p className="text-[11px] text-slate-500">Submit your expense claims</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-center min-w-[60px]">
                <div className="text-[9px] font-semibold text-slate-500 uppercase">Items</div>
                <div className="text-sm font-bold text-slate-800">{rows.length}</div>
              </div>
            </div>
          </div>

          {!isLoading && loadError && (
            <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg p-2.5 flex items-center gap-2 text-rose-700 text-sm">
              <Icon iconName="Warning" />
              <span>{loadError}</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <LoadingSpinner />
            <p className="text-center text-sm text-slate-500 mt-2">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Employee Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-5">
              <EmpDetails context={context} value={employeeValues} onChange={setEmployeeValues} controlClassName={inputClass} />
            </div>

            {/* Line Items */}
            <div className="space-y-4 mb-5">
              {rows.map((row, index) => {
                const enabled = Boolean(row.categoryKey);
                const config = row.categoryKey ? categoryConfigurationByKey[row.categoryKey] : undefined;
                const dynamicFields = config?.fields || [];
                const subOptions = enabled ? subCategoryOptionsByCategory[row.categoryKey] || [] : [];
                const showSubCategory = subOptions.length > 0;
                const isLastRow = index === rows.length - 1;

                return (
                  <div key={row.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Row Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">Line Item</span>
                        {row.categoryKey && <span className="text-xs text-slate-500">• {row.categoryKey}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {isLastRow && (
                          <button
                            type="button"
                            onClick={addRow}
                            disabled={isSubmitting || isSavingDraft}
                            className="h-7 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <Icon iconName="Add" className="text-[10px]" /> Add
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          disabled={rows.length === 1 || isSubmitting || isSavingDraft}
                          className="h-7 px-2.5 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium rounded border border-slate-300 hover:border-rose-300 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon iconName="Delete" className="text-[10px]" />
                        </button>
                      </div>
                    </div>

                    {/* Row Body */}
                    <div className="p-4">
                      {/* Row 1 */}
                      <div className="flex flex-wrap gap-3 mb-3">
                        <div className="flex-1 min-w-[160px]">
                          <label className={labelClass}>
                            Category <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={row.categoryKey}
                              onChange={(e) => updateRowCategory(row.id, e.target.value)}
                              disabled={isSubmitting || isSavingDraft}
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

                        {showSubCategory && (
                          <div className="flex-1 min-w-[160px]">
                            <label className={labelClass}>
                              Subcategory <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                value={row.values[COMMON_FIELD_KEYS.subcategory] || ""}
                                onChange={(e) => updateRowValue(row.id, COMMON_FIELD_KEYS.subcategory, e.target.value)}
                                disabled={!enabled || isSubmitting || isSavingDraft}
                                className={selectClass}
                              >
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
                          <label className={labelClass}>
                            Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={row.values[COMMON_FIELD_KEYS.date] || ""}
                            onChange={(e) => updateRowValue(row.id, COMMON_FIELD_KEYS.date, e.target.value)}
                            disabled={!enabled || isSubmitting || isSavingDraft}
                            className={inputClass}
                          />
                        </div>

                        <div className="flex-1 min-w-[120px]">
                          <label className={labelClass}>
                            Amount (₹) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={row.values[COMMON_FIELD_KEYS.amount] || ""}
                            onChange={(e) => updateRowValue(row.id, COMMON_FIELD_KEYS.amount, e.target.value)}
                            disabled={!enabled || isSubmitting || isSavingDraft}
                            placeholder="1.00"
                            className={inputClass}
                          />
                        </div>

                        <div className="flex-1 min-w-[160px]">
                          <label className={labelClass}>Attachment</label>
                          <div className="relative">
                            <input
                              ref={(el) => {
                                fileInputRefs.current[row.id] = el;
                              }}
                              type="file"
                              accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx"
                              onChange={(e) => updateRowFile(row.id, e.currentTarget.files?.[0] ?? null)}
                              disabled={!enabled || isSubmitting || isSavingDraft}
                              className="hidden"
                            />

                            {!row.file ? (
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[row.id]?.click()}
                                disabled={!enabled || isSubmitting || isSavingDraft}
                                className={`${inputClass} text-left flex items-center justify-between`}
                              >
                                <span className="text-slate-400 truncate">Choose file...</span>
                                <Icon iconName="Attach" className="text-slate-400" />
                              </button>
                            ) : (
                              <div className={`${inputClass} flex items-center justify-between bg-emerald-50 border-emerald-300`}>
                                <span className="text-slate-700 truncate text-xs" title={row.file.name}>
                                  {row.file.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateRowFile(row.id, null)}
                                  disabled={isSubmitting || isSavingDraft}
                                  className="text-slate-400 hover:text-rose-500 ml-1"
                                >
                                  <Icon iconName="Cancel" className="text-xs" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Row 2 */}
                      {enabled && (
                        <div className="flex flex-wrap gap-3">
                          {dynamicFields.map((field) => (
                            <div key={field.id} className="flex-1 min-w-[140px]">
                              <label className={labelClass}>{field.label}</label>
                              {field.type === "textarea" ? (
                                <textarea
                                  value={row.values[field.id] || ""}
                                  onChange={(e) => updateRowValue(row.id, field.id, e.target.value)}
                                  disabled={isSubmitting || isSavingDraft}
                                  rows={2}
                                  className={textareaClass}
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  value={row.values[field.id] || ""}
                                  onChange={(e) => updateRowValue(row.id, field.id, e.target.value)}
                                  disabled={isSubmitting || isSavingDraft}
                                  className={inputClass}
                                />
                              )}
                            </div>
                          ))}

                          <div className="flex-[2] min-w-[200px]">
                            <label className={labelClass}>
                              Description <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                              value={row.values[COMMON_FIELD_KEYS.description] || ""}
                              onChange={(e) => updateRowValue(row.id, COMMON_FIELD_KEYS.description, e.target.value)}
                              disabled={isSubmitting || isSavingDraft}
                              rows={2}
                              placeholder="Enter expense details..."
                              className={textareaClass}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {(isSubmitting || isSavingDraft) && (
                    <div className="flex items-center gap-2 text-indigo-600">
                      <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">{isSavingDraft ? "Saving draft..." : "Submitting..."}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg px-5 py-2.5 text-right">
                    <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Total Amount</div>
                    <div className="text-xl font-bold text-emerald-700">
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isSubmitting || isSavingDraft}
                      className="h-10 px-5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Icon iconName="ChevronLeft" />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={isSubmitting || isSavingDraft}
                      className="h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Icon iconName="Save" />
                      Save Draft
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting || isSavingDraft || isLoading}
                      className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Icon iconName="Send" />
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ExpenseClaim;