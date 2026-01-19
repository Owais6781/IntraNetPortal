import * as React from "react";

const LatestCompanyNews: React.FC = () => {
  return (
    <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white shadow-lg shadow-rose-200">
            📰
          </span>
          Latest Company News
        </h2>

        <button className="text-sm px-5 py-2 rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 font-semibold transition-all duration-300">
          View All →
        </button>
      </div>

      {/* News Cards */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* News Card 1 */}
        <div className="flex-1 group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
              className="h-44 w-full object-cover group-hover:scale-110 transition-transform duration-700"
              alt="News"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="p-5">
            <span className="inline-flex items-center text-xs bg-sky-100 text-sky-600 px-3 py-1.5 rounded-full font-semibold">
              🏢 Organization
            </span>

            <h3 className="mt-3 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              Noida Campus Expansion
            </h3>

            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
              We are expanding our Noida facility to support growth and innovation…
            </p>

            <div className="mt-4 flex items-center text-xs text-slate-400">
              <span>5 min read</span>
              <span className="mx-2">•</span>
              <span>Jan 5, 2026</span>
            </div>
          </div>
        </div>

        {/* News Card 2 */}
        <div className="flex-1 group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b"
              className="h-44 w-full object-cover group-hover:scale-110 transition-transform duration-700"
              alt="News"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="p-5">
            <span className="inline-flex items-center text-xs bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full font-semibold">
              🎉 Events
            </span>

            <h3 className="mt-3 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              Annual Wellness Week
            </h3>

            <p className="text-sm text-slate-500 mt-2 line-clamp-2">
              Join us for yoga, nutrition & mindfulness sessions throughout the week…
            </p>

            <div className="mt-4 flex items-center text-xs text-slate-400">
              <span>3 min read</span>
              <span className="mx-2">•</span>
              <span>Jan 8, 2026</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LatestCompanyNews;
