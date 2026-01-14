import * as React from "react";
import { useEffect, useState } from "react";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
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
  Created?: string;
}

const Workplace: React.FC<WorkplaceProps> = ({ sp }) => {
  const emptyForm: FormData = {
    applyingFor: "",
    startDate: "",
    endDate: "",
    description: "",
  };

  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [leaveList, setLeaveList] = useState<LeaveItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveItem | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const toDateInputValue = (spDate?: string): string =>
    spDate ? spDate.split("T")[0] : "";


  const fetchLeaveList = async (): Promise<void> => {
    try {
      setLoadingList(true);

      const items = await sp.web.lists
        .getByTitle("IntranetLeave")
        .items.select(
          "Id",
          "Title",
          "LeaveCategory",
          "FromDate",
          "ToDate",
          "Reason",
          "Created"
        )
        
        .orderBy("Id", false)
        ();

      setLeaveList(items as LeaveItem[]);
    } catch (error) {
      console.error("Error fetching list:", error);
      setLeaveList([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    const init = async (): Promise<void> => {
      await fetchLeaveList();
    };
    void init();
  }, []);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;

    if (name === "startDate" && value < today) {
      alert("Please choose a valid date");
      return;
    }

    if (name === "endDate") {
      if (!formData.startDate) {
        alert("Please select From Date first");
        return;
      }
      if (value < formData.startDate) {
        alert("Please choose a valid date");
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const prefix = `ESC-${month}-${year}`;

      const items = await sp.web.lists
        .getByTitle("IntranetLeave")
        .items.select("Title")
        .filter(`startswith(Title,'${prefix}-')`)();

      let nextNumber = 1;

      if (items.length > 0) {
        const numbers = items
          .map((i) => Number(i.Title.split("-").pop()))
          .filter((n) => !isNaN(n));

        nextNumber = Math.max(...numbers) + 1;
      }

      const requestId = `${prefix}-${nextNumber}`;

      await sp.web.lists.getByTitle("IntranetLeave").items.add({
        Title: requestId,
        LeaveCategory: formData.applyingFor,
        FromDate: formData.startDate,
        ToDate: formData.endDate,
        Reason: formData.description,
      });

      alert("Leave submitted successfully");
      setFormData(emptyForm);
      await fetchLeaveList();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error while submitting leave");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPopup = (item: LeaveItem): void => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const closePopup = (): void => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };


  return (
    <div className="min-h-screen bg-[#f3f6fb] p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT COLUMN – FORM (unchanged UI) */}
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
                className="rounded-xl border border-indigo-200
                           px-4 py-3 text-sm text-black bg-indigo-50/30
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
                  className="rounded-xl border border-indigo-200
                             px-4 py-3 text-sm bg-indigo-50/30
                             focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-black  mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || today}
                  onChange={handleChange}
                  required
                  className="rounded-xl border border-indigo-200
                             px-4 py-3 text-sm bg-indigo-50/30
                             focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div className="mb-6 flex flex-col">
              <label className="text-sm font-semibold text-black  mb-2">
                Tell us more (Optional)
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Briefly describe the purpose of your leave..."
                className="rounded-xl border border-indigo-200
                           px-4 py-3 text-sm bg-indigo-50/30
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full block px-8 py-3 rounded-xl font-bold text-white
           bg-gradient-to-r from-orange-400 to-pink-500
           hover:scale-105 transition-transform shadow-lg"
            >
              Submit Leave Application
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN – ACTIVITY (same box UI, repeated for each list item) */}
        <div className="flex-1 basis-0 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-indigo-600 mb-4">
            My Recent Activity
          </h3>

          {/* add scroll here */}
          <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2">
            {loadingList && <div className="text-sm text-gray-500">Loading...</div>}

            {!loadingList && leaveList.length === 0 && (
              <div className="text-sm text-gray-500">No recent activity</div>
            )}

            {!loadingList &&
              leaveList.map((item) => (
                <div
                  key={item.Id}
                  className="bg-gray-50 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{item.Title}</p>

                    <p className="text-xs text-gray-500">
                      {item.LeaveCategory ? item.LeaveCategory : "Leave Request"}
                      {item.Created
                        ? ` • ${new Date(item.Created).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        })}`
                        : ""}
                    </p>
                  </div>

                  <button
                    className="text-sm font-bold text-indigo-500 cursor-pointer"
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

      {/* POPUP (shows clicked list item data) */}
      {isPopupOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closePopup} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={closePopup}
                className="absolute right-3 top-3 text-indigo-500 hover:text-indigo-700"
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
              <h3 className="text-lg font-bold text-indigo-600">Leave Details</h3>
            </div>

            {/* show data in popup */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Request ID</p>
                <p className="font-semibold text-gray-800">{selectedItem.Title}</p>
              </div>

              {selectedItem.LeaveCategory && (
                <div>
                  <p className="text-gray-500">Leave Category</p>
                  <p className="font-semibold text-gray-800">{selectedItem.LeaveCategory}</p>
                </div>
              )}

              <div>
                <p className="text-gray-500">From - To</p>
                <p className="font-semibold text-gray-800">
                  {toDateInputValue(selectedItem.FromDate) || "-"}{" "}
                  {" to "}{" "}
                  {toDateInputValue(selectedItem.ToDate) || "-"}
                </p>
              </div>

              {selectedItem.Reason && (
                <div>
                  <p className="text-gray-500">Reason</p>
                  <p className="font-semibold text-gray-800">{selectedItem.Reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Workplace;