import * as React from "react";
import "./MeetingRoom.css";
import { Calendar2CheckFill, PieChartFill, CalendarPlusFill, ListCheck, GearFill } from "react-bootstrap-icons";
import { SPFI } from "@pnp/sp";
import { GraphFI } from "@pnp/graph";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import "@pnp/graph/users";
import { useState, useEffect } from "react";
import {  useNavigate} from "react-router-dom";

interface IMeetingRoomDashboardProps {
    sp: SPFI;
    graph: GraphFI;
}

const MeetingRoomDashboard: React.FC<IMeetingRoomDashboardProps> = ({sp,graph}) => {
    const Navigate = useNavigate();
   
    const [jobTitle, setJobTitle] = useState("");
    const [initials, setInitials] = useState("");
    const [userName, setUserName] = useState("");

   


    const menu = [
        { name: "Dashboard", icon: <PieChartFill />, Route: "/meeting-room" },
        { name: "Book Room", icon: <CalendarPlusFill />, Route: "/BookRoom" },
        { name: "My Bookings", icon: <ListCheck />, Route: "/MyBookings" },
        { name: "Admin", icon: <GearFill />, Route: "/AdminPage" }
    ];
    const active =
    menu.find(item => item.Route === location.pathname)?.name || "Dashboard";


    const loadCurrentUser = async () => {
        try {
            
            const spUser = await sp.web.currentUser();

            if (spUser.Title) {
                setUserName(spUser.Title);

                const nameInitials = spUser.Title
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase();

                setInitials(nameInitials);
            }

         
            const graphUser = await graph.me();
            setJobTitle(graphUser.jobTitle || "User");
        } catch (error) {
            console.error("Error loading user:", error);
        }
    };

    useEffect(() => {
        void loadCurrentUser();
    }, [sp, graph]);

    return (
        <>
            {/* HEADER */}
            <div className="meetingHubHeaderWrapper">
                <div className="meetingHubHeader">
                    <div className="leftSection">
                        <div className="appIcon">
                            <Calendar2CheckFill size={22} />
                        </div>

                        <div className="titleBlock">
                            <div className="appTitle">MeetingHub</div>
                            <div className="appSubtitle">
                                Meeting Room Management System
                            </div>
                        </div>
                    </div>

                    <div className="rightSection">
                        <div className="userInfo">
                            <div className="userText">
                                <div className="userRole">{jobTitle}</div>
                            </div>
                            <div className="avatar">{initials || "U"}</div>
                        </div>
                    </div>
                </div>

                {/* SUB HEADER */}
                <div className="meetingHubSubHeader">
                    {menu.map(item => (
            <div
              key={item.name}
              className={`subTab ${active === item.name ? "active" : ""}`}
              onClick={() => Navigate(item.Route)}
            >
              <span className="tabIcon">{item.icon}</span>
              <span className="tabText">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
            {/* WELCOME CARD */}
            <div className="welcome-wrapper">
                <div className="welcome-card">
                    <h2>
                        Welcome back,{" "}
                        <span className="user-name">
                            {userName || "User"}{" "}
                        </span>
                        ! 👋
                    </h2>
                    <p>
                        Here's what's happening with your meeting rooms today. You have{" "}
                        <span className="highlight">3 upcoming meetings</span> this week.
                    </p>
                </div>
            </div>
        </>
    );
};

export default MeetingRoomDashboard;
