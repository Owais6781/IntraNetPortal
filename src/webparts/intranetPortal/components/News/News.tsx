import * as React from "react";
import { useEffect, useState, useRef } from "react";
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
      <div className="news-container">
        <h1 className="news-title">Company Updates</h1>

        {loading ? (
          <p className="news-loading">Loading news...</p>
        ) : news.length === 0 ? (
          <p className="news-empty">No news found.</p>
        ) : (
          <div className="news-grid">
            {news.map((item) => (
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
                  <span className="news-category">
                    {item.category.toUpperCase()}
                  </span>
                  <h3 className="news-heading">{item.title}</h3>
                  <p className="news-desc">{item.description}</p>
                  <button
                    className="read-more"
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
    <div className="news-master-layout">
      <button onClick={backNews} className="back-button">
        ← Back to All News
      </button>

      <div className="news-split-view">
        {/* LEFT CONTAINER */}
        <section className="news-detail-pane">
          {selectedNews ? (
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
                <h1 className="single-news-title">{selectedNews.title}</h1>
                <div
                  className="single-news-description"
                  dangerouslySetInnerHTML={{
                    __html: selectedNews.fullDescription,
                  }}
                />
              </div>
            </article>
          ) : (
            <div className="no-selection">
              <p>Select a news item from the right to view details.</p>
            </div>
          )}
        </section>

        {/* RIGHT CONTAINER same height as a left*/}
        <section
          className="news-sidebar-pane"
          style={
            cardHeight
              ? {
                  height: `${cardHeight}px`,
                }
              : {}
          }
        >
          <h2 className="sidebar-title">All News</h2>

          <div
            className="sidebar-cards"
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
                  <span className="sidebar-card-category">
                    {item.category.toUpperCase()}
                  </span>
                  <h3 className="sidebar-card-title">{item.title}</h3>
                  <p className="sidebar-card-desc">
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