import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import { Icon } from "@fluentui/react/lib/Icon";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";

export type EmployeeValues = {
  empId: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
  email: string;
  manager: string;
  director: string;
  hr: string; 
};

type Props = {
  context: WebPartContext;
  value: EmployeeValues;
  onChange: (next: EmployeeValues) => void;
  controlClassName?: string;
  enabled?: boolean;
  isSubmitting?: boolean;
};

const EmpDetails: React.FC<Props> = ({context,value,onChange}) => {
  const sp = React.useMemo(() => spfi().using(SPFx(context)), [context]);

  const [isExpanded, setIsExpanded] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    const loadEmployee = async () => {
      try {
        const userEmail = (context.pageContext.user.email || "").trim();
        if (!userEmail) return;

        const safeEmail = userEmail.replace(/'/g, "''");

        let items: any[] = [];
        try {
          items = await sp.web.lists
            .getByTitle("EmployeeDirectory")
            .items.filter(`Email/EMail eq '${safeEmail}'`)
            .select(
              "Title",
              "Designation",
              "Department",
              "ContactNumber",
              "Email/Title",
              "Email/EMail",
              "Manager/Title",
              "Director/Title",
              "HR/Title",
              "HR/EMail"
            )
            .expand("Email", "Manager", "Director", "HR")();
        } catch {
          // ✅ Fallback if HR column does not exist
          items = await sp.web.lists
            .getByTitle("EmployeeDirectory")
            .items.filter(`Email/EMail eq '${safeEmail}'`)
            .select(
              "Title",
              "Designation",
              "Department",
              "ContactNumber",
              "Email/Title",
              "Email/EMail",
              "Manager/Title",
              "Director/Title"
            )
            .expand("Email", "Manager", "Director")();
        }

        if (!items || items.length === 0) return;
        const emp: any = items[0];

        const directorText = Array.isArray(emp.Director)
          ? emp.Director.map((p: any) => p?.Title).filter(Boolean).join(", ")
          : emp.Director?.Title || "";

        // HR can be single person (object) or multi (array)
        const hrText = Array.isArray(emp.HR)
          ? emp.HR.map((p: any) => p?.Title || p?.EMail).filter(Boolean).join(", ")
          : emp.HR?.Title || emp.HR?.EMail || "";

        if (!mounted) return;

        onChange({
          empId: emp.Title || "",
          name: emp.Email?.Title || "",
          designation: emp.Designation || "",
          department: emp.Department || "",
          phone: emp.ContactNumber || "",
          email: emp.Email?.EMail || "",
          manager: emp.Manager?.Title || "",
          director: directorText,
          hr: hrText, // ✅ NEW
        });
      } catch (error) {
        // keep your existing behavior (log only)
        // eslint-disable-next-line no-console
        console.error("Error loading employee details:", error);
      }
    };

    void loadEmployee();
  }, [sp, context]);

  const handleToggle = () => setIsExpanded((prev) => !prev);

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
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
              onClick={handleToggle}
              className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md text-white text-[10px] font-semibold transition-all duration-200"
              title={isExpanded ? "Hide Details" : "Show Details"}
            >
              <Icon iconName={isExpanded ? "ChevronUp" : "ChevronDown"} className="text-xs" />
              <span>{isExpanded ? "Hide" : "Show"}</span>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 py-2">
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

            {/* ✅ HR is stored but not shown (UI unchanged) */}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpDetails;