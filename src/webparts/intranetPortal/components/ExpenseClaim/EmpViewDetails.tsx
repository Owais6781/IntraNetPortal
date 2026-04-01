import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import { Icon } from "@fluentui/react/lib/Icon";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

export type EmployeeValues = {
  empId: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  manager: string;
  director: string;
};

type Props = {
  context: WebPartContext;
  empListTitle?: string;
  /** ExpenseEmpData item id */
  itemId: number;
};

const toText = (v: any) => {
  if (v === null || v === undefined) return "";
  return String(v);
};

const EmpViewDetails: React.FC<Props> = ({ context, empListTitle = "ExpenseEmpData", itemId }) => {
  const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);

  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  const [value, setValue] = React.useState<EmployeeValues>({
    empId: "",
    name: "",
    designation: "",
    department: "",
    phone: "",
    email: "",
    manager: "",
    director: "",
  });

  React.useEffect(() => {
    let mounted = true;

    const loadById = async () => {
      try {
        if (!itemId || itemId <= 0) return;

        setIsLoading(true);
        const list = sp.web.lists.getByTitle(empListTitle);

        let item: any = null;

        // Try Person fields first (if your list columns are Person type)
        try {
          item = await list.items
            .getById(itemId)
            .select(
              "Id",
              "Title",
              "EmpID",
              "Name",
              "Department",
              "Designation",
              "PhoneNumber",
              "Email/Title",
              "Email/EMail",
              "Manager/Title",
              "Manager/EMail",
              "Director/Title",
              "Director/EMail"
            )
            .expand("Email", "Manager", "Director")();
        } catch {
          // ignore -> fallback to text fields
        }

        // Fallback: Text columns (as in your screenshot)
        if (!item) {
          item = await list.items
            .getById(itemId)
            .select(
              "Id",
              "Title",
              "EmpID",
              "Name",
              "Department",
              "Designation",
              "PhoneNumber",
              "Email",
              "Manager",
              "Director"
            )();
        }

        const next: EmployeeValues = {
          empId: toText(item.EmpID),
          name: toText(item.Name) || toText(item.Email?.Title),
          designation: toText(item.Designation),
          department: toText(item.Department),
          phone: toText(item.PhoneNumber),
          email: toText(item.Email) || toText(item.Email?.EMail),
          manager: toText(item.Manager) || toText(item.Manager?.Title) || toText(item.Manager?.EMail),
          director: toText(item.Director) || toText(item.Director?.Title) || toText(item.Director?.EMail),
        };

        if (mounted) setValue(next);
      } catch (e) {
        // optional
        // console.error("EmpViewDetails load error:", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void loadById();
    return () => {
      mounted = false;
    };
  }, [sp, empListTitle, itemId]);

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center">
                <Icon iconName="Contact" className="text-white text-xs" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-xs">Employee Information</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md text-white text-[10px] font-semibold transition-all duration-200"
              title={isExpanded ? "Hide Details" : "Show Details"}
            >
              <Icon iconName={isExpanded ? "ChevronUp" : "ChevronDown"} className="text-xs" />
              <span>{isExpanded ? "Hide" : "Show"}</span>
            </button>
          </div>
        </div>

        {/* Body */}
        {isExpanded && (
          <div className="px-4 py-2">
            {isLoading && <div className="px-3 py-2 text-[11px] text-slate-500">Loading employee details...</div>}

            {/* Row 1 */}
            <div className="flex flex-wrap">
              <div className="flex-1 min-w-[220px] flex items-center gap-3 px-3 py-2 border-b border-slate-200">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Employee ID</span>
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-800 truncate">{value.empId || "-"}</div>
              </div>

              <div className="flex-1 min-w-[220px] flex items-center gap-3 px-3 py-2 border-b border-slate-200">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Department</span>
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-800 truncate">{value.department || "-"}</div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex flex-wrap">
              <div className="flex-1 min-w-[220px] flex items-center gap-3 px-3 py-2 border-b border-slate-200">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Emp Name</span>
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-800 truncate">{value.name || "-"}</div>
              </div>

              <div className="flex-1 min-w-[220px] flex items-center gap-3 px-3 py-2 border-b border-slate-200">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Designation</span>
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-800 truncate">{value.designation || "-"}</div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex flex-wrap">
              <div className="flex-1 min-w-[220px] flex items-center gap-3 px-3 py-2 border-b border-slate-200">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Phone</span>
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-800 truncate">{value.phone || "-"}</div>
              </div>

              <div className="flex-1 min-w-[220px] flex items-center gap-3 px-3 py-2 border-b border-slate-200">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Manager</span>
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-800 truncate">{value.manager || "-"}</div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="flex flex-wrap">
              <div className="flex-1 min-w-[220px] flex items-center gap-3 px-3 py-2">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Email</span>
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-800 truncate">{value.email || "-"}</div>
              </div>

              <div className="flex-1 min-w-[220px] flex items-center gap-3 px-3 py-2">
                <div className="w-24 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Director</span>
                </div>
                <div className="flex-1 text-xs font-semibold text-slate-800 truncate">{value.director || "-"}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpViewDetails;