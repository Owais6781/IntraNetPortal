import * as React from "react";
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
import "./Organization.css";

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
  const [visibleCards, setVisibleCards] = useState(4);
  const [orgVisibleCards, setOrgVisibleCards] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleCards(1);
        setOrgVisibleCards(1);
      } else if (width < 1024) {
        setVisibleCards(2);
        setOrgVisibleCards(2);
      } else if (width < 1280) {
        setVisibleCards(3);
        setOrgVisibleCards(3);
      } else {
        setVisibleCards(4);
        setOrgVisibleCards(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
                return { ...user, JobTitle: jobTitle };
              })
            );
            return { ...item, UnderOrgHeads: enrichedUsers };
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
    if (currentIndex < executives.length - visibleCards) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const orghandleNext = () => {
    if (orgIndex < orgTypes.length - orgVisibleCards) {
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
      <div className="heroWrapper">
        <div className="heroCard">
          <div className="heroOverlay" />
          <div className="heroContent">
            <div className="iconBox">🏢</div>
            <h1 className="companyName">Globex Corporation</h1>
            <p className="tagline">
              “Innovating for a smarter, sustainable tomorrow.”
            </p>
          </div>
        </div>
      </div>

      {/* Company Profile */}
      <div className="profileWrapper">
        <div className="companyProfile">
          <h2 className="heading">Company Profile</h2>
          <p className="description">
            Globex Corporation is a leading global provider of technology solutions
            and architectural engineering. Founded on the principles of excellence
            and innovation, we have grown to serve over 50 countries with a workforce
            dedicated to solving the world's most complex challenges.
          </p>

          <div className="infoflex">
            <div className="infoCard">
              <span className="label">FOUNDED</span>
              <span className="value">1998</span>
            </div>
            <div className="infoCard">
              <span className="label">INDUSTRY</span>
              <span className="value">Tech & Infrastructure</span>
            </div>
            <div className="infoCard">
              <span className="label">HEADQUARTERS</span>
              <span className="value">Noida, India</span>
            </div>
            <div className="infoCard">
              <span className="label">PRESENCE</span>
              <span className="value">Global (50+ Countries)</span>
            </div>
          </div>
        </div>

        {/* Executive Leadership */}
        <h2 className="executiveTitle">Executive Leadership</h2>
        <div className="executiveSlider">
          {currentIndex > 0 && (
            <button className="orgSliderArrowLeft" onClick={handlePrev}>‹</button>
          )}
          <div className="sliderViewport">
            <div className="sliderInner">
              <div className="executiveflex">
                {executives
                  .slice(currentIndex, currentIndex + visibleCards)
                  .map(exec => (
                    <div className="executiveCard" key={exec.ID}>
                      <div className="executiveAvatar">
                        {exec.Email?.EMail ? (
                          <img
                            src={`/_layouts/15/userphoto.aspx?size=L&accountname=${exec.Email.EMail}`}
                            alt={exec.Email.Title}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : null}
                        <PersonFill size={34} />
                      </div>
                      <div className="executiveName">{exec.Email?.Title}</div>
                      <div className="executiveRole">{exec.Designation}</div>
                      <div className="executiveDept">{exec.Department}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
          {currentIndex < executives.length - visibleCards && (
            <button className="orgSliderArrowRight" onClick={handleNext}>›</button>
          )}
        </div>

        {/* Organization Hierarchy */}
        <section className="orgWrapper">
          <h2 className="orgTitle">Organization Hierarchy</h2>
          <div className="ceoWrapper">
            {orgH.find(e => e.Designation?.toLowerCase() === "ceo") && (
              <div className="ceoCard">
                <h3>CEO</h3>
                <p style={{ fontWeight: "500", fontSize: "16px" }}>
                  {orgH.find(e => e.Designation?.toLowerCase() === "ceo")?.Email?.Title}
                </p>
              </div>
            )}
            <span className="verticalLine"></span>
          </div>

          <div className="horizontalLine"></div>

          <div className="deptRow">
            {orgH
              .filter(o => o.Designation && o.Designation.toLowerCase().includes("head"))
              .map((dept, index) => (
                <div className="deptColumn" key={index}>
                  <div className="deptCard">
                    <h4>{dept.Designation}</h4>
                    <p>{dept.Email?.Title}</p>
                  </div>
                  {dept.UnderOrgHeads?.length > 0 && (
                    <span className="subVerticalLine"></span>
                  )}
                  {dept.UnderOrgHeads?.length > 0 && (
                    <div className="subDeptWrapper">
                      {dept.UnderOrgHeads.map((person, i) => (
                        <div className="subDeptCard" key={i}>
                          {person.JobTitle && (
                            <div className="personJob">{person.JobTitle}</div>
                          )}
                          <div className="personName">{person.Title}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>

        {/* Organization Types */}
        <div className="vmvWrapper">
          {orgIndex > 0 && (
            <button className="orgSliderArrowLeft" onClick={orghandlePrev}>‹</button>
          )}
          {orgTypes
            .slice(orgIndex, orgIndex + orgVisibleCards)
            .map((item, index) => (
              <div
                key={index}
                className="typesCard"
                style={{ borderTop: `6px solid ${item.Color}` }}
              >
                <h3 className="typesTitle">
                  <Icon iconName={item.Logo} styles={{ root: { color: "#6f63d2", fontSize: 22, marginRight: 8 } }} />
                  {item.Title}
                </h3>
                <div
                  className={item.Title.toLowerCase() === "values" ? "valuesList" : "TypesText"}
                  dangerouslySetInnerHTML={{ __html: item.Description }}
                />
              </div>
            ))}
          {orgIndex < orgTypes.length - orgVisibleCards && (
            <button className="orgSliderArrowRight" onClick={orghandleNext}>›</button>
          )}
        </div>

        {/* Policies & Governance  */}
        <section className="policyWrapper">
          <h2 className="policyTitle">Policies & Governance</h2>
          <div className="policyCard">
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
                  className="policyItem"
                >
                  <div className={`policyIcon ${/\bIT\b/.test(doc.FilesName) ? "itIcon" : "formIcon"}`}>
                    {/\bIT\b/.test(doc.FilesName) ? "🛡️" : "📄"}
                  </div>
                  <div className="policyContent">
                    <h5 style={{ fontWeight: "700" }}>{doc.FilesName}</h5>
                    <p style={{ color: "grey", marginTop: "3px" }}>{doc.Descriptions}</p>
                  </div>
                </a>
              ))}
          </div>
        </section>

        {/* Tools Shortcut Section */}
        <div className="shortcutWrapper">
          <div className="shortcutflex">
            <Link to="#" className="shortcutLink">
              <div className="shortcutCard">
                <div className="CardIcon">📖</div>
                <span className="cardItem">Handbook</span>
              </div>
            </Link>
            <Link to="#" className="shortcutLink">
              <div className="shortcutCard">
                <div className="CardIcon">📅</div>
                <span className="cardItem">Holidays</span>
              </div>
            </Link>
            <Link to="#" className="shortcutLink">
              <div className="shortcutCard">
                <div className="CardIcon">📝</div>
                <span className="cardItem">Forms</span>
              </div>
            </Link>
            <Link to="#" className="shortcutLink">
              <div className="shortcutCard">
                <div className="CardIcon">🛠️</div>
                <span className="cardItem">Tools</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Organization News */}
        <div className="newsWrapper">
          <div className="newsHeader">
            <h2>Organization News</h2>
            <button className="viewAllBtn" onClick={() => navigate("/news")}>View All</button>
          </div>
          <div className="newsList">
            {news
              .sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
              .slice(0, 3)
              .map((item, index) => (
                <div className="newsItem" key={index}>
                  <div className="newsText">
                    <div className="newsMeta">
                      <h3 className="newsTitle" title={item.SubTitle}>{item.SubTitle}</h3>
                      <span className="createdOn">
                        <b>Created On:</b> {new Date(item.Created).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <span>
                      <b>Last Modified:</b> {new Date(item.Modified).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Contact & Support Section */}
        <div className="contactsection">
          <h2 style={{ marginTop: "-15px" }}> Contact & Support Information</h2>
          <div className="contactcards">
            <div className="contactcard">
              <h3>Human Resources</h3>
              <p>📧 hr@globex.com</p>
              <p>📞 +91 120 4455 667</p>
            </div>
            <div className="contactcard">
              <h3> IT Helpdesk</h3>
              <p>📧 helpdesk@globex.com</p>
              <p>📞 Ext 505 / +91 120 4455 999</p>
            </div>
            <div className="contactcard">
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