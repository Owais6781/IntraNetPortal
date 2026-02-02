

import * as React from "react";
import { useEffect, useState } from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { Link } from "react-router-dom";

interface Props {
  sp: SPFI;
}

interface INewsItem {
  id: number;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  created: string;
}

const LatestCompanyNews: React.FC<Props> = ({ sp }) => {
  const [news, setNews] = useState<INewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLatestNews = async () => {
    try {
      const items: any[] = await sp.web.lists
        .getByTitle("News")
        .items.select(
          "ID",
          "Title",
          "SubTitle",
          "Description",
          "Created",
          "AttachmentFiles"
        )
        .expand("AttachmentFiles")
        .orderBy("Created", false)
        .top(2)(); 

      const mapped = items.map((item) => ({
        id: item.ID,
        category: item.Title || "UPDATE",
        title: item.SubTitle || "No Title",
        description:
          item.Description?.length > 120
            ? item.Description.substring(0, 120) + "..."
            : item.Description || "No description available",
        imageUrl:
          item.AttachmentFiles?.length > 0
            ? item.AttachmentFiles[0].ServerRelativeUrl
            : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
        created: new Date(item.Created).toDateString(),
      }));

      setNews(mapped);
    } catch (error) {
      console.error("Latest news fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   void fetchLatestNews();
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading latest news...</p>;
  }

  return (
    <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white shadow-lg">
            📰
          </span>
          Latest Company News
        </h2>

        <Link to="/news">
          <button className="text-sm px-5 py-2 rounded-full bg-slate-100 hover:bg-indigo-100 hover:text-indigo-600 font-semibold transition-all">
            View All →
          </button>
        </Link>
      </div>

      {/* News Cards */}
      <div className="flex flex-col lg:flex-row gap-6">
        {news.map((item) => (
          <div
            key={item.id}
            className="flex-1 group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div className="relative overflow-hidden">
              <img
                src={item.imageUrl}
                className="h-44 w-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="News"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-5">
              <span className="inline-flex text-xs bg-sky-100 text-sky-600 px-3 py-1.5 rounded-full font-semibold">
                {item.category.toUpperCase()}
              </span>

              <h3 className="mt-3 font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                {item.description}
              </p>

              <div className="mt-4 text-xs text-slate-400">
                {item.created}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestCompanyNews;

