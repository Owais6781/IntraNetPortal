import * as React from "react";

const EmployeeOfTheMonth: React.FC = () => {
  return (
    <div className="flex-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 px-6 py-5 text-white shadow-md">
      <h3 className="text-base sm:text-lg font-bold mb-4">
        Employee of the Month
      </h3>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          🌟
        </div>

        <div>
          <p className="font-semibold">Sarah Jenkins</p>
          <p className="text-xs sm:text-sm text-white/80">
            Engineering Lead
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOfTheMonth;
