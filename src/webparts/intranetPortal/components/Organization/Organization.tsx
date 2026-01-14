import * as React from "react";
import styles from "./Organization.module.scss";
import { PersonFill, Eye, Airplane, Diamond } from "react-bootstrap-icons";
import { SPFI } from "@pnp/sp";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@pnp/sp/lists";
import "@pnp/sp/items";
// import { size } from "lodash";

interface IOrgProps {
  sp: SPFI;
}

interface ExecutiveItem {
  ID: number;
  UserName: {
    Title: string;
    Department: string;
  };
  Role: string;
  Status: string;
}


interface OrgItems {
  Title: string;
  Description: string;
}

interface HItem {
  Department: string;
  Degination: string;
  Email: {
    Title: string;
  };
}


interface PolicyDoc {
  ID: number;
  Name: string;
  Descriptions: string;
  FileRef: string;
  Status: string;
  FileLeafRef: string;
}



interface NewsItem {
  SubTitle: string;
  Created: string;
  RecordType: string;
}

const Organization: React.FC<IOrgProps> = ({ sp }) => {
  const [executives, setExecutives] = useState<ExecutiveItem[]>([]);
  const [vision, setVision] = useState<OrgItems | null>(null);
  const [mission, setMission] = useState<OrgItems | null>(null);
  const [values, setValues] = useState<OrgItems | null>(null);
  const [orgH, setOrgH] = useState<HItem[]>([]);
  const [policy, setPolicy] = useState<PolicyDoc[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);



  const navigate = useNavigate();

  const VISIBLE_CARDS = 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const executiveData: ExecutiveItem[] = await sp.web.lists
          .getByTitle("ExecutiveLeadership")
          .items.select("ID,UserName/Title,UserName/Department,Role,Status")
          .expand("UserName")
          .filter("Status eq 'Active'")();

        setExecutives(executiveData);

        const data = await sp.web.lists
          .getByTitle("EmployeeDirectory")
          .items
          .select(
            "Department",
            "Degination",
            "Email/Title",
            "Status"
          )
          .expand("Email").filter("Status eq 'Active'")();

        setOrgH(data);

        const orgItems: OrgItems[] = await sp.web.lists
          .getByTitle("OrganizationTypes")
          .items.select("Title", "Description")();

        setVision(orgItems.find(i => i.Title === "Vision") ?? null);
        setMission(orgItems.find(i => i.Title === "Mission") ?? null);
        setValues(orgItems.find(i => i.Title === "Values") ?? null);

        const policyItem = await sp.web.lists
          .getByTitle("OrganizationPolicies")
          .items
          .select("ID", "FileLeafRef", "FileRef", "Descriptions", "Status")
          .filter("Status eq 'Active'")();

        const formattedPolicy: PolicyDoc[] = policyItem.map(p => ({
          ID: p.ID,
          Name: p.FileLeafRef,
          Descriptions: p.Descriptions,
          FileRef: p.FileRef,
          Status: p.Status,
          FileLeafRef: p.FileLeafRef
        }));

        setPolicy(formattedPolicy);

        const NewsData: NewsItem[] = await sp.web.lists
          .getByTitle("News")
          .items.select("SubTitle", "Created", "RecordType")();

        setNews(NewsData);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    void fetchData();
  }, [sp]);

  const handleNext = () => {
    if (currentIndex < executives.length - VISIBLE_CARDS) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };



  const stripHTML = (html: string): string => html.replace(/<[^>]+>/g, "");


  return (
    <>
      <div className={styles.heroWrapper}>
        <div className={styles.heroCard}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <div className={styles.iconBox}>🏢</div>
            <h1 className={styles.companyName}>Globex Corporation</h1>
            <p className={styles.tagline}>
              “Innovating for a smarter, sustainable tomorrow.”
            </p>
          </div>
        </div>
      </div>

      <div className={styles.profileWrapper}>
        <div className={styles.companyProfile}>
          <h2 className={styles.heading}>Company Profile</h2>
          <p className={styles.description}>
            Globex Corporation is a leading global provider of technology solutions
            and architectural engineering. Founded on the principles of excellence
            and innovation, we have grown to serve over 50 countries with a workforce
            dedicated to solving the world's most complex challenges.
          </p>

          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.label}>FOUNDED</span>
              <span className={styles.value}>1998</span>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.label}>INDUSTRY</span>
              <span className={styles.value}>Tech & Infrastructure</span>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.label}>HEADQUARTERS</span>
              <span className={styles.value}>Noida, India</span>
            </div>

            <div className={styles.infoCard}>
              <span className={styles.label}>PRESENCE</span>
              <span className={styles.value}>Global (50+ Countries)</span>
            </div>
          </div>
        </div>

        <h2 className={styles.executiveTitle}>Executive Leadership</h2>

        <div className={styles.executiveSlider}>
          {currentIndex > 0 && (
            <button
              className={styles.arrowLeft}
              onClick={handlePrev}
              aria-label="Previous"
            >
              ‹
            </button>
          )}

          <div className={styles.sliderViewport}>
            <div className={styles.executiveGrid}>
              {executives
                .slice(currentIndex, currentIndex + VISIBLE_CARDS)
                .map(exec => (

                  <div className={styles.executiveCard} key={exec.ID}>
                    <div className={styles.executiveAvatar}>
                      <PersonFill size={34} />
                    </div>

                    <div className={styles.executiveName}>
                      {exec.UserName?.Title}
                    </div>

                    <div className={styles.executiveRole}>{exec.Role}</div>

                    <div className={styles.executiveDept}>
                      {exec.UserName?.Department}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {currentIndex < executives.length - VISIBLE_CARDS && (
            <button
              className={styles.arrowRight}
              onClick={handleNext}
              aria-label="Next"
            >
              ›
            </button>
          )}
        </div>

        <section className={styles.orgWrapper}>
          <h2 className={styles.orgTitle}>Organization Hierarchy</h2>

          <div className={styles.ceoWrapper}>
            {orgH.find(e => e.Degination?.toLowerCase() === "ceo") && (
              <div className={styles.ceoCard}>
                <h3>CEO</h3>
                <p style={{ fontWeight: "500", fontSize: "16px" }}>
                  {orgH.find(e => e.Degination?.toLowerCase() === "ceo")?.Email?.Title}
                </p>
              </div>
            )}
            <span className={styles.verticalLine}></span>
          </div>


          <div className={styles.horizontalLine}></div>

          <div className={styles.deptRow}>
            {orgH
              .slice(-4)
              .map((dept, index) => (
                <div className={styles.deptCard} key={index}>
                  <h4 style={{ fontWeight: "bold", fontSize: "15px" }}>
                    {dept.Department}
                  </h4>

                  <p style={{ fontWeight: "400", fontSize: "14px", color: "black" }}>
                    {dept.Email?.Title}
                  </p>
                </div>
              ))}
          </div>
        </section>


        <div className={styles.vmvWrapper}>
          {vision && (
            <div className={`${styles.typesCard} ${styles.vision}`}>
              <h3 className={styles.typesTitle}>
                <Eye className={styles.TypesIcon} size={22} color="white" /> Vision
              </h3>
              <p className={styles.TypesText} style={{ whiteSpace: "pre-line" }}>
                {stripHTML(vision.Description)}
              </p>
            </div>
          )}

          {mission && (
            <div className={`${styles.typesCard} ${styles.mission}`}>
              <h3 className={styles.typesTitle}>
                <Airplane className={styles.TypesIcon} size={22} color="white" /> Mission
              </h3>
              <p className={styles.TypesText} style={{ whiteSpace: "pre-line" }}>
                {stripHTML(mission.Description)}
              </p>
            </div>
          )}

          {values && (
            <div className={`${styles.typesCard} ${styles.values}`}>
              <h3 className={styles.typesTitle}>
                <Diamond className={styles.TypesIcon} size={22} color="white" /> Values
              </h3>
              <ul className={styles.valuesList} style={{ fontSize: "12px", fontWeight: 500 }}>
                {stripHTML(values.Description)
                  .split("\n")
                  .map((v, i) => (
                    <li key={i}>• {v.trim()}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        <section className={styles.policyWrapper}>
          <h2 className={styles.policyTitle}>Policies & Governance</h2>

          <div className={styles.policyCard}>
            {policy
              .filter(p => p.Status === "Active")
              .map((doc) => (
                <div
                  className={styles.policyItem}
                  onClick={() => window.open(doc.FileRef, "_blank")}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className={`${styles.policyIcon} ${/\bIT\b/.test(doc.Name) ? styles.itIcon : styles.formIcon
                      }`}
                  >
                    {/\bIT\b/.test(doc.Name) ? "🛡️" : "📄"}
                  </div>


                  <div className={styles.policyContent}>
                    <h5 style={{ fontWeight: "bold" }}>
                      {doc.Name}
                    </h5>
                    <p style={{ fontSize: "14px", marginTop: "3px", color: "grey" }}>
                      {doc.Descriptions}
                    </p>
                  </div>


                </div>
              ))}
          </div>
        </section>



        <div className={styles.shortcutWrapper}>
          <div className={styles.shortcutGrid}>
            <div className={styles.shortcutCard}>
              <div className={styles.CardIcon}>📖</div>
              <span className={styles.cardItem}>Handbook</span>
            </div>

            <div className={styles.shortcutCard}>
              <div className={styles.CardIcon}>📅</div>
              <span className={styles.cardItem}>Holidays</span>
            </div>

            <div className={styles.shortcutCard}>
              <div className={styles.CardIcon}>📝</div>
              <span className={styles.cardItem}>Forms</span>
            </div>

            <div className={styles.shortcutCard}>
              <div className={styles.CardIcon}>🛠️</div>
              <span className={styles.cardItem}>Tools</span>
            </div>
          </div>
        </div>

        <div className={styles.newsWrapper}>
          <div className={styles.newsHeader}>
            <h2>Organization News</h2>
            <button
              className={styles.viewAllBtn}
              onClick={() => navigate("/news")}
            >
              View All
            </button>
          </div>

          {news.map((item, index) => (
            <div className={styles.newsItem} key={index}>
              <div className={styles.newsText}>
                <h3>{item.SubTitle}</h3>
                <span style={{ fontWeight: 500, color: "black" }}>
                  {new Date(item.Created).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div
                className={`${styles.newsTag} ${item.RecordType?.toLowerCase() === "update" ? styles.update : styles.policy
                  }`}
              >
                {item.RecordType}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.contactsection}>
          <h2 style={{ marginTop: "-15px" }}> Contact & Support Information</h2>
          <div className={styles.contactcards}>
            <div className={styles.contactcard}>
              <h3>Human Resources</h3>
              <p>📧 hr@globex.com</p>
              <p>📞 +91 120 4455 667</p>
            </div>


            <div className={styles.contactcard}>
              <h3> IT Helpdesk</h3>
              <p>📧 helpdesk@globex.com</p>
              <p>📞 Ext 505 / +91 120 4455 999</p>
            </div>

            <div className={styles.contactcard}>
              <h3>Head Office</h3>
              <p>📍 Sector 62, Noida, UP</p>
              <p>India - 201301</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Organization;
