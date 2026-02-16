import * as React from "react";
import styles from "./Organization.module.scss";
import { PersonFill } from "react-bootstrap-icons";
import { SPFI } from "@pnp/sp";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { Link } from "react-router-dom";
import { Icon } from "@fluentui/react/lib/Icon";
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();
import "@pnp/sp/profiles";


interface IOrgProps {
  sp: SPFI;
}

interface ExecutiveItem {
  ID: number;
  Email: {
    Title: string;
    EMail: string;
  };
  Designation: string;
  Department: string;
  Status: string;
}


interface OrgItems {
  Title: string;
  Description: string;
  Logo: string;
  Color: string;
}


interface HItem {
  Designation: string;
  Email: {
    Title: string;
  };
  UnderOrgHeads: {
    Title: string;
    Id: number;
    JobTitle?: string;
    Name: string;
  }[];
}


interface PolicyDoc {
  ID: number;
  FilesName: string;
  Descriptions: string;
  FileRef: string;
  Status: string;
  FileLeafRef: string;
}

interface NewsItem {
  SubTitle: string;
  Created: string;
  RecordType: string;
  Modified: string;
}

const Organization: React.FC<IOrgProps> = ({ sp }) => {
  const [executives, setExecutives] = useState<ExecutiveItem[]>([]);
  const [orgTypes, setOrgTypes] = useState<OrgItems[]>([]);

  const [orgH, setOrgH] = useState<HItem[]>([]);
  const [policy, setPolicy] = useState<PolicyDoc[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);



  const [currentIndex, setCurrentIndex] = useState(0);
  const [orgIndex, setOrgIndex] = useState(0);

  const navigate = useNavigate();

  const VISIBLE_CARDS = 4;
  const ORG_VISIBLE_CARDS = 3;



  useEffect(() => {
    const fetchData = async () => {
      try {
        const executiveData: ExecutiveItem[] = await sp.web.lists
          .getByTitle("EmployeeDirectory")
          .items.select("ID,Email/Title, Email/EMail,Status,Designation,Department")
          .expand("Email")
          .filter("Status eq 'Active' and ExecutiveLeadership eq 'Yes'")();

        setExecutives(executiveData);

        const data = await sp.web.lists
          .getByTitle("EmployeeDirectory")
          .items
          .select(
            "Designation",
            "Email/Title",
            "Status",
            "UnderOrgHeads/Title",
            "UnderOrgHeads/Id",
            "UnderOrgHeads/Name"

          )
          .expand("Email", "UnderOrgHeads")
          .filter("Status eq 'Active'")();


        const enrichedData: HItem[] = await Promise.all(
          data.map(async (item) => {
            if (!item.UnderOrgHeads?.length) return item;

            const enrichedUsers = await Promise.all(
              item.UnderOrgHeads.map(async (user: { Name: string; }) => {
                const profile = await sp.profiles.getPropertiesFor(user.Name);

                const jobTitle =
                  profile.UserProfileProperties?.find(
                    (p: { Key: string; }) => p.Key === "Title"
                  )?.Value || "";

                return {
                  ...user,
                  JobTitle: jobTitle
                };
              })
            );

            return {
              ...item,
              UnderOrgHeads: enrichedUsers
            };
          })
        );

        setOrgH(enrichedData);

        const orgItems: OrgItems[] = await sp.web.lists
          .getByTitle("OrganizationTypes")
          .items.select("Title", "Description", "Logo", "Color", "Status")
          .filter("Status eq 'Active'")();

        setOrgTypes(orgItems);

        const policyItem = await sp.web.lists
          .getByTitle("OrganizationPolicies")
          .items
          .select("ID", "FileLeafRef", "FileRef", "Descriptions", "Status", "FilesName")
          .filter("Status eq 'Active'")();

        const formattedPolicy: PolicyDoc[] = policyItem.map(p => ({
          ID: p.ID,
          FilesName: p.FilesName,
          Descriptions: p.Descriptions,
          FileRef: p.FileRef,
          Status: p.Status,
          FileLeafRef: p.FileLeafRef
        }));

        setPolicy(formattedPolicy);

        const NewsData: NewsItem[] = await sp.web.lists
          .getByTitle("News")
          .items.select("SubTitle", "Created", "RecordType", "Modified")();

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

  const orghandleNext = () => {
    if (orgIndex < orgTypes.length - ORG_VISIBLE_CARDS) {
      setOrgIndex(prev => prev + 1);
    }
  };

  const orghandlePrev = () => {
    if (orgIndex > 0) {
      setOrgIndex(prev => prev - 1);
    }
  };

  return (
    <>

      {/* Banner */}
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



      {/* Company Profile */}
      <div className={styles.profileWrapper}>
        <div className={styles.companyProfile}>
          <h2 className={styles.heading}>Company Profile</h2>
          <p className={styles.description}>
            Globex Corporation is a leading global provider of technology solutions
            and architectural engineering. Founded on the principles of excellence
            and innovation, we have grown to serve over 50 countries with a workforce
            dedicated to solving the world's most complex challenges.
          </p>

          <div className={styles.infoflex}>
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


        {/* Executive Leadership */}
        <h2 className={styles.executiveTitle}>Executive Leadership</h2>
        <div className={styles.executiveSlider}>

          {currentIndex > 0 && (
            <button className={styles.arrowLeft} onClick={handlePrev}>‹</button>
          )}

          <div className={styles.sliderViewport}>
            <div className={styles.sliderInner}>
              <div className={styles.executiveflex}>
                {executives
                  .slice(currentIndex, currentIndex + VISIBLE_CARDS)
                  .map(exec => (
                    <div className={styles.executiveCard} key={exec.ID}>
                      <div className={styles.executiveAvatar}>
                        {exec.Email?.EMail ? (
                          <img
                            src={`/_layouts/15/userphoto.aspx?size=L&accountname=${exec.Email.EMail}`}
                            alt={exec.Email.Title}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}

                        <PersonFill size={34} />
                      </div>
                      <div className={styles.executiveName}>{exec.Email?.Title}</div>
                      <div className={styles.executiveRole}>{exec.Designation}</div>
                      <div className={styles.executiveDept}>{exec.Department}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {currentIndex < executives.length - VISIBLE_CARDS && (
            <button className={styles.arrowRight} onClick={handleNext}>›</button>
          )}
        </div>


        {/* Organization Hierarchy */}
        <section className={styles.orgWrapper}>
          <h2 className={styles.orgTitle}>Organization Hierarchy</h2>

          <div className={styles.ceoWrapper}>
            {orgH.find(e => e.Designation?.toLowerCase() === "ceo") && (
              <div className={styles.ceoCard}>
                <h3>CEO</h3>
                <p style={{ fontWeight: "500", fontSize: "16px" }}>
                  {orgH.find(e => e.Designation?.toLowerCase() === "ceo")?.Email?.Title}
                </p>
              </div>
            )}
            <span className={styles.verticalLine}></span>
          </div>


          <div className={styles.horizontalLine}></div>

          <div className={styles.deptRow}>
            {orgH
              .filter(o => o.Designation && o.Designation.toLowerCase().includes("head"))
              .map((dept, index) => (
                <div className={styles.deptColumn} key={index}>

                  {/* Head Card */}
                  <div className={styles.deptCard}>
                    <h4>{dept.Designation}</h4>
                    <p>{dept.Email?.Title}</p>
                  </div>

                  {/* Vertical line */}
                  {dept.UnderOrgHeads?.length > 0 && (
                    <span className={styles.subVerticalLine}></span>
                  )}


                  {/* Under Members */}
                  {dept.UnderOrgHeads?.length > 0 && (
                    <div className={styles.subDeptWrapper}>
                      {dept.UnderOrgHeads.map((person, i) => (
                        <div className={styles.subDeptCard}>
                          {person.JobTitle && (
                            <div className={styles.personJob}>{person.JobTitle}</div>
                          )}
                          <div className={styles.personName}>{person.Title}</div>

                        </div>

                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>


        {/* Organization Types */}
        <div className={styles.vmvWrapper}>
          {orgIndex > 0 && (
            <button className={styles.arrowLeft} onClick={orghandlePrev}>
              ‹
            </button>
          )}

          {orgTypes
            .slice(orgIndex, orgIndex + ORG_VISIBLE_CARDS)
            .map((item, index) => (
              <div
                key={index}
                className={styles.typesCard}
                style={{ borderTop: `6px solid ${item.Color}` }}
              >
                <h3 className={styles.typesTitle}>
                  <Icon
                    iconName={item.Logo}
                    styles={{ root: { color: "#6f63d2", fontSize: 22, marginRight: 8 } }}
                  />
                  {item.Title}
                </h3>

                <div
                  className={
                    item.Title.toLowerCase() === "values"
                      ? styles.valuesList
                      : styles.TypesText
                  }
                  dangerouslySetInnerHTML={{ __html: item.Description }}
                />
              </div>
            ))}

          {orgIndex < orgTypes.length - ORG_VISIBLE_CARDS && (
            <button className={styles.arrowRight} onClick={orghandleNext}>
              ›
            </button>
          )}
        </div>

        {/* Policies & Governance  */}
        <section className={styles.policyWrapper}>
          <h2 className={styles.policyTitle}>Policies & Governance</h2>

          <div className={styles.policyCard}>
            {policy
              .filter(p => p.Status === "Active")
              .map((doc) => (
                <a
                  key={doc.ID}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(doc.FileRef, "_blank", "noopener,noreferrer");
                  }}
                  className={styles.policyItem}
                >

                  <div
                    className={`${styles.policyIcon} ${/\bIT\b/.test(doc.FilesName) ? styles.itIcon : styles.formIcon
                      }`}
                  >
                    {/\bIT\b/.test(doc.FilesName) ? "🛡️" : "📄"}
                  </div>

                  <div className={styles.policyContent}>
                    <h5 style={{ fontWeight: "700" }}>{doc.FilesName}</h5>
                    <p style={{ color: "grey", marginTop: "3px" }}>{doc.Descriptions}</p>
                  </div>
                </a>
              ))}
          </div>
        </section>


        {/* Tools */}
        <div className={styles.shortcutWrapper}>
          <div className={styles.shortcutflex}>
            <Link to="#" className={styles.shortcutLink}>
              <div className={styles.shortcutCard}>
                <div className={styles.CardIcon}>📖</div>
                <span className={styles.cardItem}>Handbook</span>
              </div>
            </Link>

            <Link to="#" className={styles.shortcutLink}>
              <div className={styles.shortcutCard}>
                <div className={styles.CardIcon}>📅</div>
                <span className={styles.cardItem}>Holidays</span>
              </div>
            </Link>

            <Link to="#" className={styles.shortcutLink}>
              <div className={styles.shortcutCard}>
                <div className={styles.CardIcon}>📝</div>
                <span className={styles.cardItem}>Forms</span>
              </div>
            </Link>

            <Link to="#" className={styles.shortcutLink}>
              <div className={styles.shortcutCard}>
                <div className={styles.CardIcon}>🛠️</div>
                <span className={styles.cardItem}>Tools</span>
              </div>
            </Link>
          </div>
        </div>


        {/* News */}
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

          <div className={styles.newsList}>
            {news
              .sort(
                (a, b) =>
                  new Date(b.Created).getTime() - new Date(a.Created).getTime()
              )
              .slice(0, 3)
              .map((item, index) => (
                <div className={styles.newsItem} key={index}>
                  <div className={styles.newsText}>
                    <div className={styles.newsMeta}>
                      <h3 className={styles.newsTitle} title={item.SubTitle}>
                        {item.SubTitle}
                      </h3>

                      <span className={styles.createdOn}>
                        <b>Created On:</b>{" "}
                        {new Date(item.Created).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <span>
                      <b>Last Modified:</b>{" "}
                      {new Date(item.Modified).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>


        {/* Contact & Support Information */}
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

      </div >
    </>
  );
};

export default Organization;