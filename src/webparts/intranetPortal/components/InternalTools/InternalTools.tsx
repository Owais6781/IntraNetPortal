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
} from "lucide-react";

export default function InternalTools() {
    const NavItems = [
        { label: "Organization", path: "/organization", icon: <Building2 size={26} /> },
        { label: "News", path: "/news", icon: <Megaphone size={26} /> },
        { label: "Knowledge", path: "/knowledge", icon: <BookOpen size={26} /> },
        { label: "Directory", path: "/directory", icon: <Users size={26} /> },
        { label: "Workplace", path: "/workplace", icon: <Briefcase size={26} /> },
        { label: "IT Support", path: "/it-support", icon: <Headphones size={26} /> },
        { label: "Engineering", path: "/engineering", icon: <Zap size={26} /> },
        { label: "Onboarding Portal", path: "/onboarding-portal", icon: <UserPlus size={26} /> },
        { label: "Meeting Room", path: "/meeting-room", icon: <DoorOpen size={26} /> },
        { label: "Expense Claims", path: "/expense-claims", icon: <Receipt size={26} /> },
        { label: "Recruitment Portal", path: "/recruitment-portal", icon: <UserSearch size={26} /> },

    ];

    return (
        <div className="container-fluid">
            <div className="row g-3">
                {NavItems.map((item) => (
                    <div key={item.label} className="col-6 col-md-4 col-lg-2">
                        <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                                `text-decoration-none d-flex h-100`
                            }
                        >
                            {({ isActive }) => (
                                <div
                                    className={`w-100 d-flex flex-column align-items-center justify-content-center
                  border rounded-4 p-3 text-center
                  ${isActive ? "bg-primary text-white" : "bg-white text-secondary"}`}
                                    style={{ minHeight: "120px" }}
                                >
                                    {/* ICON */}
                                    <div
                                        className={`d-flex align-items-center justify-content-center rounded-circle mb-2
                    ${isActive ? "bg-white text-primary" : "bg-light text-primary"}`}
                                        style={{ width: "44px", height: "44px" }}
                                    >
                                        {item.icon}
                                    </div>

                                    {/* LABEL */}
                                    <span className="fw-semibold small">
                                        {item.label}
                                    </span>
                                </div>
                            )}
                        </NavLink>
                    </div>
                ))}
            </div>
        </div>
    );
}
