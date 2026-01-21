import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";


interface IProps {
  sp: SPFI;
}

interface INewsItem {
  id: number;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  fullDescription: string;
}

type ViewMode = "list" | "detail";

const News: React.FC<IProps> = ({ sp }) => {
  const [news, setNews] = useState<INewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<INewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ViewMode>("list");

  // ref for whole left card 
  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState<number | null>(null);

  const fetchNews = async () => {
    try {
      const items: any[] = await sp.web.lists
        .getByTitle("News")
        .items.select("ID", "Title", "SubTitle", "Description", "AttachmentFiles")
        .expand("AttachmentFiles")
        .orderBy("Created", false)();

      const mapped: INewsItem[] = items.map((item) => {
        const fullDescription: string =
          item.Description || "No content available.";

        const short =
          fullDescription && fullDescription.length > 150
            ? `${fullDescription.substring(0, 150)}...`
            : fullDescription || "No preview available.";

        const imageFile = (item.AttachmentFiles || []).find((file: any) => {
          const name = (file.FileName || "").toLowerCase();
          return /\.(jpg|jpeg|png|gif|webp|svg)$/.test(name);
        });

        return {
          id: item.ID,
          category: item.Title || "UPDATE",
          title: item.SubTitle || "No Title",
          description: short,
          fullDescription,
          imageUrl: imageFile ? imageFile.ServerRelativeUrl : "",
        };
      });

      setNews(mapped);
    } catch (err) {
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews().catch(console.error);
  }, []);

  // restore previous selection
  useEffect(() => {
    if (!news.length) return;

    const savedMode = localStorage.getItem("newsMode");
    const savedId = localStorage.getItem("selectedNewsId");

    if (savedMode === "detail" && savedId) {
      const found = news.find((n) => n.id === Number(savedId));
      if (found) {
        setSelectedNews(found);
        setMode("detail");
      }
    }
  }, [news]);

  const openDetailPage = (item?: INewsItem) => {
    const target = item || news[0] || null;
    if (!target) return;

    setSelectedNews(target);
    setMode("detail");
    localStorage.setItem("newsMode", "detail");
    localStorage.setItem("selectedNewsId", target.id.toString());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backNews = () => {
    setMode("list");
    setSelectedNews(null);
    localStorage.removeItem("newsMode");
    localStorage.removeItem("selectedNewsId");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Measure left card height and  left & right equal okay
  useEffect(() => {
    if (!leftCardRef.current) {
      setCardHeight(null);
      return;
    }

    const measure = () => {
      if (leftCardRef.current) {
        setCardHeight(leftCardRef.current.offsetHeight);
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(leftCardRef.current);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [selectedNews]);

  /* ---------- LIST VIEW ---------- */
  if (mode === "list") {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary-900 mb-8">Company Updates</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : news.length === 0 ? (
          <p className="text-center text-surface-500 py-10">No news found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <article key={item.id} className="bg-white rounded-2xl shadow-lg shadow-primary-900/5 overflow-hidden border border-surface-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-900/10 transition-all duration-300">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{
                    backgroundImage: item.imageUrl
                      ? `url(${item.imageUrl})`
                      : "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                  }}
                />
                <div className="p-6">
                  <span className="text-xs font-bold text-primary-600 mb-2 block tracking-wider">
                    {item.category.toUpperCase()}
                  </span>
                  <h3 className="text-xl font-bold text-surface-900 mb-3 line-clamp-2">{item.title}</h3>
                  <p className="text-surface-500 text-sm leading-relaxed mb-4 line-clamp-3">{item.description}</p>
                  <button
                    className="text-primary-600 font-semibold hover:text-primary-700 text-sm inline-flex items-center gap-1 transition-colors"
                    onClick={() => openDetailPage(item)}
                  >
                    Read More →
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------- DETAIL VIEW ---------- */
  return (
    <div className="flex flex-col max-w-7xl mx-auto p-6 min-h-screen">
      <button onClick={backNews} className="mb-6 text-sm font-semibold text-surface-500 hover:text-primary-600 flex items-center gap-2 transition-colors w-fit">
        ← Back to All News
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT CONTAINER */}
        <section className="flex-[2]">
          {selectedNews ? (
            <article className="bg-white rounded-3xl shadow-xl shadow-primary-900/10 overflow-hidden border border-surface-200" ref={leftCardRef}>
              <div
                className="h-[300px] lg:h-[400px] bg-cover bg-center"
                style={{
                  backgroundImage: selectedNews.imageUrl
                    ? `url(${selectedNews.imageUrl})`
                    : "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                }}
              />
              <div className="p-8 lg:p-10">
                <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-bold tracking-wide mb-4">
                  {selectedNews.category.toUpperCase()}
                </span>
                <h1 className="text-3xl lg:text-4xl font-bold text-surface-900 mb-6 leading-tight">{selectedNews.title}</h1>
                <div
                  className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-surface-900 prose-p:text-surface-600 prose-a:text-primary-600"
                  dangerouslySetInnerHTML={{
                    __html: selectedNews.fullDescription,
                  }}
                />
              </div>
            </article>
          ) : (
            <div className="h-64 flex items-center justify-center bg-surface-50 rounded-3xl border border-dashed border-surface-300 text-surface-500">
              <p>Select a news item from the right to view details.</p>
            </div>
          )}
        </section>

        {/* RIGHT CONTAINER same height as a left*/}
        <section
          className="lg:w-[380px] flex flex-col"
          style={
            cardHeight
              ? {
                height: `${cardHeight}px`,
              }
              : {}
          }
        >
          <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center justify-between">All News</h2>

          <div
            className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar"
            style={{
              // take full height minus title area
              height: cardHeight ? `calc(${cardHeight}px - 56px)` : "auto",
              overflowY: cardHeight ? "auto" : "visible",
              overflowX: "hidden",
            }}
          >
            {news.map((item) => (
              <div
                key={item.id}
                className={`flex gap-4 p-3 rounded-xl bg-white border border-surface-200 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group ${selectedNews?.id === item.id ? "ring-2 ring-primary-500 ring-offset-2" : ""
                  }`}
                onClick={() => openDetailPage(item)}
              >
                <div
                  className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: item.imageUrl
                      ? `url(${item.imageUrl})`
                      : "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1 block">
                    {item.category.toUpperCase()}
                  </span>
                  <h3 className="text-sm font-bold text-surface-900 mb-1 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-surface-500 line-clamp-2">
                    {item.description.substring(0, 100)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default News;