import * as React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layouts from "./Layouts/Layouts";
import Dashboard from "./Dashboard/Dashboard";
import Knowledge from "./Knowledge/Knowledge";
import Directory from "./Directory/Directory";
import ITSupport from "./IT Support/ITSupport";
import Engineering from "./Engineering/Engineering";
import Organization from "./Organization/Organization";
import News from "./News/News";
import WorkPlace from "./Workplace/Workplace";
import { SPFI } from "@pnp/sp";
import { GraphFI } from "@pnp/graph";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import "bootstrap/dist/css/bootstrap.min.css";
import RecruitmentPortal from "./RecruitmentPortal/RecruitmentPortal";
import OnboardingPortal from "./OnboardingPortal/OnboardingPortal";
import ExpenseDashboard from "./ExpenseClaim/Dashboard";
import ExpenseClaim from "./ExpenseClaim/ExpenseClaim";
import ExpenseView from "./ExpenseClaim/ExpenseView";
import ExpenseEdit from "./ExpenseClaim/ExpenseEdit";
import ViewForm from "./OnboardingPortal/View";
import MeetingRoomDashboard from "./MeetingRoom/MeetingRoomDashboard";
import BookRoom from "./MeetingRoom/BookRoom";
import AdminPage from "./MeetingRoom/AdminPage";
import MyBookings from "./MeetingRoom/MyBookings";

interface RoutingIPROPS {
  sp: SPFI;
  graph: GraphFI;
  context: WebPartContext;
}

const Routing: React.FC<RoutingIPROPS> = ({ sp, graph, context }) => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layouts sp={sp} graph={graph} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard sp={sp} graph={graph} context={context} />} />
          <Route path="organization" element={<Organization sp={sp} />} />
          <Route path="news" element={<News sp={sp} />} />
          <Route path="knowledge" element={<Knowledge graph={graph} sp={sp} context={context} />} />
          <Route path="directory" element={<Directory sp={sp} />} />
          <Route path="workplace" element={<WorkPlace sp={sp} />} />
          <Route path="it-support" element={<ITSupport graph={graph} sp={sp} context={context} />} />
          <Route path="engineering" element={<Engineering sp={sp} />} />
          <Route path="expense-claims" element={<ExpenseDashboard context={context} />} />
          <Route path="expense-claims/:id" element={<ExpenseView context={context} />} />
          <Route path="expense-claims/add" element={<ExpenseClaim context={context} />} />
          <Route path="expense-claims/edit/:id" element={<ExpenseEdit context={context} />} />
          <Route path="recruitment-portal" element={<RecruitmentPortal context={context} />} />
          <Route path="onboarding-portal" element={<OnboardingPortal sp={sp} context={context} graph={graph} />} />
          <Route path="/view-form/:id" element={<ViewForm sp={sp} context={context} graph={graph} />} />
          <Route path="meeting-room" element={<MeetingRoomDashboard sp={sp} graph={graph} />} />
          <Route path="BookRoom" element={<BookRoom sp={sp} />} />
          <Route path="MyBookings" element={<MyBookings sp={sp} />} />
          <Route path="AdminPage" element={<AdminPage sp={sp} />} />
        </Route>
      </Routes>
    </HashRouter>

  );
};

export default Routing;



