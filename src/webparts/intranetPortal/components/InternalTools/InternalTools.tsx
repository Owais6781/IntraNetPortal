import * as React from "react";
import { NavLink } from "react-router-dom";
import {
  Building2,
  Megaphone,
  BookOpen,
  Users,
  Briefcase,
  Headphones,
  Zap,
  UserPlus,
  DoorOpen,
  Receipt,
  UserSearch,
  ChevronRight,
} from "lucide-react";
import "./InternalTools.css";

export default function InternalTools() {
  const tools = [
    { id: "org", label: "Organization", path: "/organization", icon: Building2, color: "#eff6ff", text: "#2563eb" },
    { id: "news", label: "News", path: "/news", icon: Megaphone, color: "#fffbeb", text: "#d97706" },
    { id: "know", label: "Knowledge", path: "/knowledge", icon: BookOpen, color: "#ecfdf5", text: "#059669" },
    { id: "dir", label: "Directory", path: "/directory", icon: Users, color: "#eef2ff", text: "#4f46e5" },
    { id: "work", label: "Workplace", path: "/workplace", icon: Briefcase, color: "#fff1f2", text: "#e11d48" },
    { id: "it", label: "IT Support", path: "/it-support", icon: Headphones, color: "#ecfeff", text: "#0891b2" },
    { id: "eng", label: "Engineering", path: "/engineering", icon: Zap, color: "#faf5ff", text: "#9333ea" },
    { id: "onb", label: "Onboarding", path: "/onboarding-portal", icon: UserPlus, color: "#fff7ed", text: "#ea580c" },
    { id: "meet", label: "Meeting Room", path: "/meeting-room", icon: DoorOpen, color: "#f0fdfa", text: "#0d9488" },
    { id: "exp", label: "Expense Claims", path: "/expense-claims", icon: Receipt, color: "#f7fee7", text: "#65a30d" },
    { id: "rec", label: "Recruitment", path: "/recruitment-portal", icon: UserSearch, color: "#fdf4ff", text: "#c026d3" },
  ];

  return (
    <div className="tools-container">
      <div className="tools-grid">
        {tools.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `tool-card ${isActive ? "active" : ""}`}
            >
              {/* Background gradient flare */}
              <div className="card-flare" />
              
              {/* ICON CONTAINER */}
              <div 
                className="tool-icon-wrapper shadow-sm" 
                style={{ backgroundColor: item.color, color: item.text }}
              >
                <IconComponent size={22} className="lucide-icon" />
              </div>

              {/* LABEL */}
              <div className="tool-label-group">
                <span className="tool-label">
                  {item.label}
                </span>

                {/* Animated underline indicator */}
                <div className="tool-indicator-container">
                  <div className="tool-indicator" />
                </div>
              </div>

              {/* Tiny arrow indicator for interactivity */}
              <div className="tool-arrow">
                <ChevronRight size={12} />
              </div>
            </NavLink>
          );
        })}

        {/* 12th card: Mandatory blank box at the end as requested by the user */}
        <div className="tool-placeholder">
           <div className="placeholder-icon">
              <div className="placeholder-dot" />
           </div>
        </div>
      </div>
    </div>
  );
}
