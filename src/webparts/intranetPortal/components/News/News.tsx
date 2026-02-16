import * as React from "react";
import { useEffect, useState, useRef, useMemo } from "react";
import { SPFI } from "@pnp/sp";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "./News.css";

interface IProps {
  sp: SPFI;
}

interface INewsItem {
  id: number;
  category: string;
  title: string;

  // keep if you still use it anywhere
  description: string;

  imageUrl: string;

  // keep HTML for detail page
  fullDescription: string;

  // NEW
  createdDate: string; // DD MMM YYYY
  createdTime: string; // HH:MM
  createdBy: string;   // Author Title
}

type ViewMode = "list" | "detail";

const ITEMS_PER_PAGE = 8;

const News: React.FC<IProps> = ({ sp }) => {
  const [news, setNews] = useState<INewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<INewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ViewMode>("list");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const leftCardRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState<number | null>(null);

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const formatDate = (iso: string) => {
    // "27 Jan 2026"
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    // "14:05"
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const fetchNews = async () => {
    try {
      const items: any[] = await sp.web.lists
        .getByTitle("News")
        .items.select(
          "ID",
          "Title",
          "SubTitle",
          "Description",
          "AttachmentFiles",
          "Created",
          "Author/Title"
        )
        .expand("AttachmentFiles", "Author")
        .orderBy("Created", false)();

      const mapped: INewsItem[] = items.map((item) => {
        const fullDescription = item.Description || "No content available.";
        const cleanText = stripHtml(fullDescription);

        // keep your old short logic (optional)
        const short =
          cleanText.length > 150
            ? `${cleanText.substring(0, 150)}...`
            : cleanText;

        const imageFile = (item.AttachmentFiles || []).find((file: any) =>
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.FileName || "")
        );

        const createdIso = item.Created;
        const createdBy = item?.Author?.Title || "Unknown";

        return {
          id: item.ID,
          category: item.Title || "UPDATE",
          title: item.SubTitle || "No Title",
          description: short,
          fullDescription, // keep HTML for detail page
          imageUrl: imageFile ? imageFile.ServerRelativeUrl : "",
          createdDate: createdIso ? formatDate(createdIso) : "",
          createdTime: createdIso ? formatTime(createdIso) : "",
          createdBy,
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

  useEffect(() => {
    if (!leftCardRef.current) return;

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

  /* SEARCH ONLY (dropdown removed) */
  const filteredNews = useMemo(() => {
    return news.filter((n) => {
      const text =
        n.title + " " + n.category + " " + stripHtml(n.fullDescription) + " " + n.createdBy;
      return text.toLowerCase().includes(search.toLowerCase());
    });
  }, [news, search]);

  /* PAGINATION */
  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE);

  const paginatedNews = filteredNews.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* LIST VIEW */
  if (mode === "list") {
    return (
      <div className="news-container">
        <h1 className="news-title">Company News</h1>

        {/* SEARCH ONLY (dropdown removed) */}
        <div className="news-toolbar">
          <input
            className="news-search"
            placeholder="Search news..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {loading ? (
          <p className="news-loading">Loading news...</p>
        ) : filteredNews.length === 0 ? (
          <p className="news-empty">No news found.</p>
        ) : (
          <>
            <div className="news-flex">
              {paginatedNews.map((item) => (
                <article key={item.id} className="news-card">
                  <div
                    className="news-image"
                    style={{
                      backgroundImage: item.imageUrl
                        ? `url(${item.imageUrl})`
                        : "linear-gradient(135deg,#dbeafe,#c7d2fe)",
                    }}
                  />

                  <div className="news-content">
                    {/* category + created date/time/by */}
                    <div className="news-meta">
                      <span className="news-category">
                        {item.category.toUpperCase()}
                      </span>
                      <span className="news-date">
                        {item.createdDate} {item.createdTime}
                      </span>
                    </div>

                 

                    <h3 className="news-heading">{item.title}</h3>
                    

                    <div className="news-desc-wrapper">
                      {/* Use text version for card view */}
                      <p className="news-desc-clamped">
                        {stripHtml(item.fullDescription)}
                      </p>
                    </div>

                    <button className="read-more" onClick={() => openDetailPage(item)}>
                      Read More →
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="news-pagination">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </button>

              <span>
                Page {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  /* DETAIL VIEW */
  return (
    <div className="news-master-layout">
      <button onClick={backNews} className="back-button">
        ← Back to All News
      </button>

      <div className="news-split-view">
        <section className="news-detail-pane">
          {selectedNews && (
            <article className="single-news-card" ref={leftCardRef}>
              <div
                className="single-news-image"
                style={{
                  backgroundImage: selectedNews.imageUrl
                    ? `url(${selectedNews.imageUrl})`
                    : "linear-gradient(135deg,#dbeafe,#c7d2fe)",
                }}
              />
              <div className="single-news-content">
                <span className="single-news-category">
                  {selectedNews.category.toUpperCase()}
                </span>

                <div className="single-news-meta">
                  <span>
                    {selectedNews.createdDate} {selectedNews.createdTime}
                  </span>
                  <span>• Created by: {selectedNews.createdBy}</span>
                </div>

                <h1 className="single-news-title">{selectedNews.title}</h1>

                <div
                  className="single-news-description bordered-desc"
                  dangerouslySetInnerHTML={{
                    __html: selectedNews?.fullDescription || "",
                  }}
                />
              </div>
            </article>
          )}
        </section>

        <section
          className="news-sidebar-pane"
          style={cardHeight ? { height: `${cardHeight}px` } : {}}
        >
          <h2 className="sidebar-title">All News</h2>

          <div
            className="sidebar-cards"
            style={{
              height: cardHeight ? `calc(${cardHeight}px - 56px)` : "auto",
              overflowY: "auto",
            }}
          >
            {news.map((item) => (
              <div
                key={item.id}
                className={`sidebar-news-card ${
                  selectedNews?.id === item.id ? "active" : ""
                }`}
                onClick={() => openDetailPage(item)}
              >
                <div
                  className="sidebar-card-image"
                  style={{
                    backgroundImage: item.imageUrl
                      ? `url(${item.imageUrl})`
                      : "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
                  }}
                />

                <div className="sidebar-card-content">
                  <div className="sidebar-meta">
                    <span className="sidebar-card-category">
                      {item.category.toUpperCase()}
                    </span>
                    <span className="sidebar-date">
                      {item.createdDate} {item.createdTime}
                    </span>
                  </div>

                  <div className="sidebar-by">Created By: {item.createdBy}</div>

                  <h3 className="sidebar-card-title">{item.title}</h3>

                  <p className="sidebar-card-desc">
                    {stripHtml(item.fullDescription)}
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