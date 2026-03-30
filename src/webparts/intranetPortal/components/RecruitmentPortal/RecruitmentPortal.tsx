import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/site-users/web";
import styles from "./RecruitmentPortal.module.scss";
import JobOpening from "./JobOpening";
import Applicant from "./Applicants";
import Interview from "./Interview";
import UploadResume from "./UploadResume";

// ==================== INTERFACES ====================
export interface IJobOpening {
  Id?: number;
  Title: string;
  JobId: string;
  Department: string;
  Experience: string;
  Description: string;
  Location: string;
  Status: string;
  CreatedOn: string;
  EndingDate: string;
  Attachment?: string;
  Opening: number;
  SalaryRange: string;
  NoticePeriod: string;
}

export interface IRecruitmentApplication {
  Id?: number;
  JobDetailsId: string;
  JobId: string;
  Title: string;
  Department: string;
  Experience: string;
  Location: string;
  CreatedOn: string;
  ApplicationDeadline: string;
  Status: string;
  Description: string;
  Attachments?: string;
  HasAttachment?: boolean;
  ApplicantName?: string;
  ApplicantEmail?: string;
  ApplicantDepartment?: string;
  EmployeeId?: string;
  HRComments?: string;
  ResumeReviewed?: boolean;
  ExperienceVerified?: boolean;
  SkillsMatched?: boolean;
  QualificationChecked?: boolean;
  LocationSuitable?: boolean;
  SalaryExpectationOk?: boolean;
  AvailabilityConfirmed?: boolean;
  BackgroundCheckOk?: boolean;
  ReviewedOn?: string;
  ReviewedById?: number;
  ReviewedByName?: string;
  CandidateName?: string;
  PhoneNumber?: string;
  EmailId?: string;
  SalaryRange?: string;
  NoticePeriod?: string;
}

export interface IInterviewLog {
  Id?: number;
  Title: string;
  JobDetailsId: string;
  JobId: string;
  CandidateName: string;
  PhoneNumber: string;
  EmailId: string;
  Department: string;
  Location: string;
  Experience: string;
  JobTitle: string;
  RoundType: string;
  InterviewDate: string;
  StartTime: string;
  EndTime: string;
  InterviewerIds: number[];
  InterviewerNames: string;
  Status: string;
  Comments: string;
  FinalStatus: string;
  FinalComments: string;
  ReviewedBy: string;
  CreatedOn?: string;
}

export interface IInterviewSummary {
  JobDetailsId: string;
  JobId: string;
  CandidateName: string;
  PhoneNumber: string;
  EmailId: string;
  Department: string;
  Location: string;
  Experience: string;
  JobTitle: string;
  ReviewedBy: string;
  Rounds: IInterviewLog[];
  FinalStatus: string;
  FinalComments: string;
  HasAttachment?: boolean;
}

export interface ICurrentUser {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  department: string;
}

export interface ISiteUser {
  Id: number;
  Title: string;
  Email: string;
}

export interface IScreeningChecklist {
  ResumeReviewed: boolean;
  ExperienceVerified: boolean;
  SkillsMatched: boolean;
  QualificationChecked: boolean;
  LocationSuitable: boolean;
  SalaryExpectationOk: boolean;
  AvailabilityConfirmed: boolean;
  BackgroundCheckOk: boolean;
}

// ==================== SERVICE CLASS ====================
export class SPService {
  private sp: ReturnType<typeof spfi>;

  constructor(context: WebPartContext) {
    this.sp = spfi().using(SPFx(context));
  }

  // ==================== USER METHODS ====================
  public async getCurrentUserId(): Promise<number> {
    try {
      const currentUser = await this.sp.web.currentUser();
      return currentUser.Id;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return 0;
    }
  }

  public async getCurrentUserInfo(): Promise<ICurrentUser | null> {
    try {
      const currentUser = await this.sp.web.currentUser();
      return {
        id: currentUser.Id,
        employeeId: "",
        name: currentUser.Title || "Unknown User",
        email: currentUser.Email || "",
        department: "General",
      };
    } catch (error) {
      console.error("Error getting current user info:", error);
      return null;
    }
  }

  public async getCurrentUserFromEmployeeDirectory(): Promise<ICurrentUser | null> {
    try {
      const currentUser = await this.sp.web.currentUser();
      const currentUserId = currentUser.Id;
      const userEmail = currentUser.Email?.toLowerCase().trim();

      const allEmployees = await this.sp.web.lists
        .getByTitle("EmployeeDirectory")
        .items.select("Id", "Title", "Department", "Email/Id", "Email/Title", "Email/EMail")
        .expand("Email")
        .top(1000)();

      for (const emp of allEmployees) {
        const empEmailField = emp.Email;
        if (!empEmailField) continue;

        const empUserId = empEmailField.Id;
        const empDisplayName = empEmailField.Title;
        const empEmail = empEmailField.EMail?.toLowerCase().trim();

        if (empUserId && empUserId === currentUserId) {
          return {
            id: currentUserId,
            employeeId: emp.Title || "",
            name: empDisplayName || "",
            email: empEmail || userEmail || "",
            department: emp.Department || "General",
          };
        }

        if (empEmail && userEmail && empEmail === userEmail) {
          return {
            id: currentUserId,
            employeeId: emp.Title || "",
            name: empDisplayName || "",
            email: empEmail,
            department: emp.Department || "General",
          };
        }
      }

      return {
        id: currentUserId,
        employeeId: "",
        name: currentUser.Title || "Unknown User",
        email: userEmail || "",
        department: "General",
      };
    } catch (error) {
      console.error("Error getting current user from EmployeeDirectory:", error);
      try {
        const currentUser = await this.sp.web.currentUser();
        return {
          id: currentUser.Id,
          employeeId: "",
          name: currentUser.Title || "Unknown User",
          email: currentUser.Email || "",
          department: "General",
        };
      } catch {
        return null;
      }
    }
  }

  public async getSiteUsers(): Promise<ISiteUser[]> {
    try {
      const users = await this.sp.web.siteUsers
        .filter("PrincipalType eq 1")
        .select("Id", "Title", "Email")
        .top(500)();

      return users
        .filter((u) => u.Email && u.Title)
        .map((u) => ({
          Id: u.Id,
          Title: u.Title,
          Email: u.Email,
        }));
    } catch (error) {
      console.error("Error fetching site users:", error);
      return [];
    }
  }

  // ==================== HELPER METHODS ====================
  private getDepartmentPrefix(department: string): string {
    const prefixes: { [key: string]: string } = {
      IT: "IT",
      HR: "HR",
      Finance: "FI",
      Marketing: "MK",
      Sales: "SL",
      Operations: "OP",
      Admin: "AD",
      Engineering: "EN",
      General: "GN",
    };
    return prefixes[department] || department.substring(0, 2).toUpperCase();
  }

  private getNameInitials(fullName: string): string {
    if (!fullName) return "XX";
    const nameParts = fullName.trim().toUpperCase().split(/\s+/);
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2);
    } else if (nameParts.length === 2) {
      return nameParts[0][0] + nameParts[1][0];
    } else {
      return nameParts[0][0] + nameParts[nameParts.length - 1][0];
    }
  }

  private extractJobNumber(jobId: string): number {
    if (!jobId) return 0;
    const match = jobId.match(/^JOB-[A-Z]{2}-(\d+)$/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  private extractJobDetailsNumber(jobDetailsId: string): number {
    if (!jobDetailsId) return 0;
    const match = jobDetailsId.match(/(\d+)$/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 0;
  }

  // ==================== ID GENERATION ====================
  public async generateJobIdByDepartment(department: string): Promise<string> {
    try {
      const deptPrefix = this.getDepartmentPrefix(department);
      const items = await this.sp.web.lists
        .getByTitle("JobOpening")
        .items.select("JobId")
        .orderBy("Id", false)();

      let maxNum = 0;
      for (const item of items) {
        const num = this.extractJobNumber(item.JobId as string);
        if (num > maxNum) maxNum = num;
      }

      return `JOB-${deptPrefix}-${(maxNum + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error generating JobId:", error);
      return `JOB-${this.getDepartmentPrefix(department)}-${Date.now().toString().slice(-3)}`;
    }
  }

  public async generateJobDetailsId(applicantName: string, department: string): Promise<string> {
    try {
      const nameInitials = this.getNameInitials(applicantName);
      const deptPrefix = this.getDepartmentPrefix(department);

      const items = await this.sp.web.lists
        .getByTitle("Recruitments")
        .items.select("JobDetailsId")
        .orderBy("Id", false)();

      let maxNum = 0;
      for (const item of items) {
        const num = this.extractJobDetailsNumber(item.JobDetailsId as string);
        if (num > maxNum) maxNum = num;
      }

      return `JOB-${nameInitials}-${deptPrefix}-${(maxNum + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error generating JobDetailsId:", error);
      return `JOB-${this.getNameInitials(applicantName)}-${this.getDepartmentPrefix(department)}-${Date.now().toString().slice(-3)}`;
    }
  }

  public async generateJobDetailsIdByDepartment(department: string): Promise<string> {
    try {
      const deptPrefix = this.getDepartmentPrefix(department);
      const items = await this.sp.web.lists
        .getByTitle("Recruitments")
        .items.select("JobDetailsId")
        .orderBy("Id", false)();

      let maxNum = 0;
      for (const item of items) {
        const num = this.extractJobDetailsNumber(item.JobDetailsId as string);
        if (num > maxNum) maxNum = num;
      }

      return `JOB-${deptPrefix}-${(maxNum + 1).toString().padStart(3, "0")}`;
    } catch (error) {
      console.error("Error generating JobDetailsId:", error);
      return `JOB-${this.getDepartmentPrefix(department)}-${Date.now().toString().slice(-3)}`;
    }
  }

  // ==================== JOB OPENING METHODS ====================
  public async getJobs(): Promise<IJobOpening[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle("JobOpening")
        .items.select(
          "Id",
          "Title",
          "JobId",
          "Department",
          "Experience",
          "Description",
          "Location",
          "Status",
          "CreatedOn",
          "EndingDate",
          "Attachment",
          "Opening",
          "SalaryRange",
          "NoticePeriod"
        )
        .orderBy("Id", false)();

      return items.map((item: IJobOpening) => ({
        ...item,
        Opening: typeof item.Opening === "string" ? parseInt(item.Opening, 10) || 1 : item.Opening || 1,
        SalaryRange: item.SalaryRange || "",
        NoticePeriod: item.NoticePeriod || "",
      }));
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }

  public async createJob(job: IJobOpening, attachmentFile?: File): Promise<void> {
    try {
      const generatedJobId = await this.generateJobIdByDepartment(job.Department);

      const itemData: Record<string, unknown> = {
        Title: job.Title || "",
        JobId: generatedJobId,
        Department: job.Department || "",
        Experience: job.Experience || "",
        Description: job.Description || "",
        Location: job.Location || "",
        Status: job.Status || "Open",
        CreatedOn: job.CreatedOn || new Date().toISOString().split("T")[0],
        EndingDate: job.EndingDate || "",
        Opening: job.Opening.toString(),
        SalaryRange: job.SalaryRange || "",
        NoticePeriod: job.NoticePeriod || "",
      };

      const result = await this.sp.web.lists.getByTitle("JobOpening").items.add(itemData);

      if (attachmentFile) {
        await this.sp.web.lists
          .getByTitle("JobOpening")
          .items.getById(result.Id)
          .attachmentFiles.add(attachmentFile.name, attachmentFile);
      }
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  }

  public async updateJob(id: number, job: Partial<IJobOpening>, attachmentFile?: File): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        Title: job.Title || "",
        Department: job.Department || "",
        Experience: job.Experience || "",
        Description: job.Description || "",
        Location: job.Location || "",
        Status: job.Status || "Open",
        CreatedOn: job.CreatedOn || "",
        EndingDate: job.EndingDate || "",
        Opening: job.Opening !== undefined ? job.Opening.toString() : "1",
        SalaryRange: job.SalaryRange || "",
        NoticePeriod: job.NoticePeriod || "",
      };

      await this.sp.web.lists.getByTitle("JobOpening").items.getById(id).update(updateData);

      if (attachmentFile) {
        try {
          const existingAttachments = await this.sp.web.lists
            .getByTitle("JobOpening")
            .items.getById(id)
            .attachmentFiles();

          for (const att of existingAttachments) {
            await this.sp.web.lists
              .getByTitle("JobOpening")
              .items.getById(id)
              .attachmentFiles.getByName(att.FileName)
              .delete();
          }
        } catch (e) {
          console.log("No existing attachments:", e);
        }

        await this.sp.web.lists
          .getByTitle("JobOpening")
          .items.getById(id)
          .attachmentFiles.add(attachmentFile.name, attachmentFile);
      }
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  }

  public async getJobAttachments(itemId: number): Promise<{ FileName: string; ServerRelativeUrl: string }[]> {
    try {
      return await this.sp.web.lists.getByTitle("JobOpening").items.getById(itemId).attachmentFiles();
    } catch (error) {
      console.error("Error fetching job attachments:", error);
      return [];
    }
  }

  public async deleteJob(id: number): Promise<void> {
    try {
      await this.sp.web.lists.getByTitle("JobOpening").items.getById(id).delete();
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  }

  // ==================== RESUME APPLICATION ====================
  public async createResumeApplication(
    application: {
      JobId: string;
      JobTitle: string;
      Department: string;
      Experience: string;
      Location: string;
      CreatedOn: string;
      ApplicationDeadline: string;
      Description: string;
      SalaryRange?: string;
      NoticePeriod?: string;
      CandidateName?: string;
    },
    currentUser: ICurrentUser,
    attachmentFile?: File
  ): Promise<string> {
    try {
      const generatedJobDetailsId = await this.generateJobDetailsId(currentUser.name, currentUser.department);

      const itemData: Record<string, unknown> = {
        Title: application.JobTitle || "",
        JobDetailsId: generatedJobDetailsId,
        JobId: application.JobId || "",
        ApplicantName: currentUser.name || "",
        ApplicantEmail: currentUser.email || "",
        ApplicantDepartment: currentUser.department || "",
        EmployeeId: currentUser.employeeId || "",
        Department: application.Department || "",
        Experience: application.Experience || "",
        Location: application.Location || "",
        CreatedOn: new Date().toISOString().split("T")[0],
        ApplicationDeadline: application.ApplicationDeadline || "",
        Status: "Open",
        Description: application.Description || "",
        SalaryRange: application.SalaryRange || "",
        NoticePeriod: application.NoticePeriod || "",
        CandidateName: application.CandidateName || "",
      };

      const result = await this.sp.web.lists.getByTitle("Recruitments").items.add(itemData);

      if (attachmentFile) {
        await this.sp.web.lists
          .getByTitle("Recruitments")
          .items.getById(result.Id)
          .attachmentFiles.add(attachmentFile.name, attachmentFile);
      }

      return generatedJobDetailsId;
    } catch (error) {
      console.error("Error creating resume application:", error);
      throw error;
    }
  }

  // ==================== RECRUITMENT METHODS ====================
  public async getRecruitmentsWithAttachments(): Promise<IRecruitmentApplication[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle("Recruitments")
        .items.select("*", "ReviewedBy/Id", "ReviewedBy/Title", "ReviewedBy/EMail")
        .expand("ReviewedBy")
        .orderBy("Id", false)
        .top(500)();

      if (items.length === 0) return [];

      const result: IRecruitmentApplication[] = await Promise.all(
        items.map(async (item) => {
          let hasAttachment = false;
          try {
            const attachments = await this.sp.web.lists
              .getByTitle("Recruitments")
              .items.getById(item.Id)
              .attachmentFiles();
            hasAttachment = attachments.length > 0;
          } catch {
            hasAttachment = false;
          }

          return {
            Id: item.Id,
            JobDetailsId: item.JobDetailsId || "",
            JobId: item.JobId || "",
            Title: item.Title || "",
            Department: item.Department || "",
            Experience: item.Experience || "",
            Location: item.Location || "",
            CreatedOn: item.CreatedOn || "",
            ApplicationDeadline: item.ApplicationDeadline || "",
            Status: item.Status || "Open",
            Description: item.Description || "",
            ApplicantName: item.ApplicantName || "",
            ApplicantEmail: item.ApplicantEmail || "",
            ApplicantDepartment: item.ApplicantDepartment || "",
            EmployeeId: item.EmployeeId || "",
            HasAttachment: hasAttachment,
            HRComments: item.HRComments || "",
            ResumeReviewed: item.ResumeReviewed || false,
            ExperienceVerified: item.ExperienceVerified || false,
            SkillsMatched: item.SkillsMatched || false,
            QualificationChecked: item.QualificationChecked || false,
            LocationSuitable: item.LocationSuitable || false,
            SalaryExpectationOk: item.SalaryExpectationOk || false,
            AvailabilityConfirmed: item.AvailabilityConfirmed || false,
            BackgroundCheckOk: item.BackgroundCheckOk || false,
            ReviewedOn: item.ReviewedOn || "",
            ReviewedById: item.ReviewedBy?.Id || 0,
            ReviewedByName: item.ReviewedBy?.Title || "",
            CandidateName: item.CandidateName || "",
            PhoneNumber: item.PhoneNumber || "",
            EmailId: item.EmailId || "",
            SalaryRange: item.SalaryRange || "",
            NoticePeriod: item.NoticePeriod || "",
          };
        })
      );

      return result;
    } catch (error) {
      console.error("Error fetching recruitments:", error);
      return [];
    }
  }

  public async getRecruitmentApplications(): Promise<IRecruitmentApplication[]> {
    try {
      const items = await this.sp.web.lists.getByTitle("Recruitments").items.orderBy("Id", false)();

      return items.map((item) => ({
        Id: item.Id,
        JobDetailsId: item.JobDetailsId || "",
        JobId: item.JobId || "",
        Title: item.Title || "",
        Department: item.Department || "",
        Experience: item.Experience || "",
        Location: item.Location || "",
        CreatedOn: item.CreatedOn || "",
        ApplicationDeadline: item.ApplicationDeadline || "",
        Status: item.Status || "Open",
        Description: item.Description || "",
        ApplicantName: item.ApplicantName || "",
        ApplicantEmail: item.ApplicantEmail || "",
        ApplicantDepartment: item.ApplicantDepartment || "",
        EmployeeId: item.EmployeeId || "",
        CandidateName: item.CandidateName || "",
        PhoneNumber: item.PhoneNumber || "",
        EmailId: item.EmailId || "",
        SalaryRange: item.SalaryRange || "",
        NoticePeriod: item.NoticePeriod || "",
      }));
    } catch (error) {
      console.error("Error fetching recruitment applications:", error);
      return [];
    }
  }

  public async createRecruitmentApplication(
    application: IRecruitmentApplication,
    attachmentFile?: File
  ): Promise<void> {
    try {
      const generatedJobDetailsId = await this.generateJobDetailsIdByDepartment(application.Department);

      const itemData: Record<string, unknown> = {
        JobDetailsId: generatedJobDetailsId,
        JobId: application.JobId || "",
        Title: application.Title || "",
        Department: application.Department || "",
        Experience: application.Experience || "",
        Location: application.Location || "",
        CreatedOn: application.CreatedOn || "",
        ApplicationDeadline: application.ApplicationDeadline || "",
        Status: application.Status || "Open",
        Description: application.Description || "",
        SalaryRange: application.SalaryRange || "",
        NoticePeriod: application.NoticePeriod || "",
      };

      const result = await this.sp.web.lists.getByTitle("Recruitments").items.add(itemData);

      if (attachmentFile) {
        await this.sp.web.lists
          .getByTitle("Recruitments")
          .items.getById(result.Id)
          .attachmentFiles.add(attachmentFile.name, attachmentFile);
      }
    } catch (error) {
      console.error("Error creating recruitment application:", error);
      throw error;
    }
  }

  public async updateRecruitmentStatus(id: number, status: string): Promise<void> {
    try {
      await this.sp.web.lists.getByTitle("Recruitments").items.getById(id).update({ Status: status });
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  }

  public async updateCandidateDetails(
    id: number,
    candidateName: string,
    phoneNumber: string,
    emailId: string
  ): Promise<void> {
    try {
      await this.sp.web.lists.getByTitle("Recruitments").items.getById(id).update({
        CandidateName: candidateName,
        PhoneNumber: phoneNumber,
        EmailId: emailId,
      });
    } catch (error) {
      console.error("Error updating candidate details:", error);
      throw error;
    }
  }

  public async updateRecruitmentWithScreening(
    id: number,
    status: string,
    hrComments: string,
    screeningChecklist: IScreeningChecklist,
    reviewedByUserId: number,
    candidateName?: string,
    phoneNumber?: string,
    emailId?: string
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        Status: status,
        HRComments: hrComments,
        ResumeReviewed: screeningChecklist.ResumeReviewed,
        ExperienceVerified: screeningChecklist.ExperienceVerified,
        SkillsMatched: screeningChecklist.SkillsMatched,
        QualificationChecked: screeningChecklist.QualificationChecked,
        LocationSuitable: screeningChecklist.LocationSuitable,
        SalaryExpectationOk: screeningChecklist.SalaryExpectationOk,
        AvailabilityConfirmed: screeningChecklist.AvailabilityConfirmed,
        BackgroundCheckOk: screeningChecklist.BackgroundCheckOk,
        ReviewedOn: new Date().toISOString(),
        ReviewedById: reviewedByUserId,
      };

      if (candidateName !== undefined) updateData.CandidateName = candidateName;
      if (phoneNumber !== undefined) updateData.PhoneNumber = phoneNumber;
      if (emailId !== undefined) updateData.EmailId = emailId;

      await this.sp.web.lists.getByTitle("Recruitments").items.getById(id).update(updateData);
    } catch (error) {
      console.error("Error updating with screening:", error);
      throw error;
    }
  }

  public async deleteRecruitment(id: number): Promise<void> {
    try {
      await this.sp.web.lists.getByTitle("Recruitments").items.getById(id).delete();
    } catch (error) {
      console.error("Error deleting recruitment:", error);
      throw error;
    }
  }

  public async getRecruitmentAttachments(
    itemId: number
  ): Promise<{ FileName: string; ServerRelativeUrl: string }[]> {
    try {
      return await this.sp.web.lists.getByTitle("Recruitments").items.getById(itemId).attachmentFiles();
    } catch (error) {
      console.error("Error fetching attachments:", error);
      return [];
    }
  }

  // ==================== SHORTLISTED RECRUITMENTS ====================
  public async getShortlistedRecruitments(): Promise<IRecruitmentApplication[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle("Recruitments")
        .items.select("*", "ReviewedBy/Id", "ReviewedBy/Title")
        .expand("ReviewedBy")
        .filter("Status eq 'Shortlisted'")
        .orderBy("Id", false)
        .top(500)();

      const result: IRecruitmentApplication[] = await Promise.all(
        items.map(async (item) => {
          let hasAttachment = false;
          try {
            const attachments = await this.sp.web.lists
              .getByTitle("Recruitments")
              .items.getById(item.Id)
              .attachmentFiles();
            hasAttachment = attachments.length > 0;
          } catch {
            hasAttachment = false;
          }

          return {
            Id: item.Id,
            JobDetailsId: item.JobDetailsId || "",
            JobId: item.JobId || "",
            Title: item.Title || "",
            Department: item.Department || "",
            Experience: item.Experience || "",
            Location: item.Location || "",
            CreatedOn: item.CreatedOn || "",
            ApplicationDeadline: item.ApplicationDeadline || "",
            Status: item.Status || "Shortlisted",
            Description: item.Description || "",
            HasAttachment: hasAttachment,
            CandidateName: item.CandidateName || "",
            PhoneNumber: item.PhoneNumber || "",
            EmailId: item.EmailId || "",
            ReviewedByName: item.ReviewedBy?.Title || "",
            ReviewedById: item.ReviewedBy?.Id || 0,
            HRComments: item.HRComments || "",
            SalaryRange: item.SalaryRange || "",
            NoticePeriod: item.NoticePeriod || "",
          };
        })
      );

      return result;
    } catch (error) {
      console.error("Error fetching shortlisted:", error);
      return [];
    }
  }

  // ==================== INTERVIEW LOG METHODS ====================
  public async getInterviewLogs(): Promise<IInterviewLog[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle("InterviewLogs")
        .items.select(
          "Id",
          "Title",
          "JobDetailsId",
          "JobId",
          "CandidateName",
          "PhoneNumber",
          "EmailId",
          "Department",
          "Location",
          "Experience",
          "JobTitle",
          "RoundType",
          "InterviewDate",
          "StartTime",
          "EndTime",
          "Status",
          "Comments",
          "FinalStatus",
          "FinalComments",
          "ReviewedBy",
          "Created",
          "Interviewers/Id",
          "Interviewers/Title",
          "Interviewers/EMail"
        )
        .expand("Interviewers")
        .orderBy("Id", false)
        .top(1000)();

      return items.map((item) => {
        const interviewers = item.Interviewers || [];
        return {
          Id: item.Id,
          Title: item.Title || "",
          JobDetailsId: item.JobDetailsId || item.Title || "",
          JobId: item.JobId || "",
          CandidateName: item.CandidateName || "",
          PhoneNumber: item.PhoneNumber || "",
          EmailId: item.EmailId || "",
          Department: item.Department || "",
          Location: item.Location || "",
          Experience: item.Experience || "",
          JobTitle: item.JobTitle || "",
          RoundType: item.RoundType || "",
          InterviewDate: item.InterviewDate || "",
          StartTime: item.StartTime || "",
          EndTime: item.EndTime || "",
          InterviewerIds: interviewers.map((i: { Id: number }) => i.Id),
          InterviewerNames: interviewers.map((i: { Title: string }) => i.Title).join(", "),
          Status: item.Status || "Pending",
          Comments: item.Comments || "",
          FinalStatus: item.FinalStatus || "Pending",
          FinalComments: item.FinalComments || "",
          ReviewedBy: item.ReviewedBy || "",
          CreatedOn: item.Created || "",
        };
      });
    } catch (error) {
      console.error("Error fetching interview logs:", error);
      return [];
    }
  }

  public async getInterviewLogsByJobDetailsId(jobDetailsId: string): Promise<IInterviewLog[]> {
    try {
      const items = await this.sp.web.lists
        .getByTitle("InterviewLogs")
        .items.select(
          "Id",
          "Title",
          "JobDetailsId",
          "JobId",
          "CandidateName",
          "PhoneNumber",
          "EmailId",
          "Department",
          "Location",
          "Experience",
          "JobTitle",
          "RoundType",
          "InterviewDate",
          "StartTime",
          "EndTime",
          "Status",
          "Comments",
          "FinalStatus",
          "FinalComments",
          "ReviewedBy",
          "Created",
          "Interviewers/Id",
          "Interviewers/Title",
          "Interviewers/EMail"
        )
        .expand("Interviewers")
        .filter(`Title eq '${jobDetailsId}'`)
        .orderBy("Id", true)();

      return items.map((item) => {
        const interviewers = item.Interviewers || [];
        return {
          Id: item.Id,
          Title: item.Title || "",
          JobDetailsId: item.JobDetailsId || item.Title || "",
          JobId: item.JobId || "",
          CandidateName: item.CandidateName || "",
          PhoneNumber: item.PhoneNumber || "",
          EmailId: item.EmailId || "",
          Department: item.Department || "",
          Location: item.Location || "",
          Experience: item.Experience || "",
          JobTitle: item.JobTitle || "",
          RoundType: item.RoundType || "",
          InterviewDate: item.InterviewDate || "",
          StartTime: item.StartTime || "",
          EndTime: item.EndTime || "",
          InterviewerIds: interviewers.map((i: { Id: number }) => i.Id),
          InterviewerNames: interviewers.map((i: { Title: string }) => i.Title).join(", "),
          Status: item.Status || "Pending",
          Comments: item.Comments || "",
          FinalStatus: item.FinalStatus || "Pending",
          FinalComments: item.FinalComments || "",
          ReviewedBy: item.ReviewedBy || "",
          CreatedOn: item.Created || "",
        };
      });
    } catch (error) {
      console.error("Error fetching interview logs by JobDetailsId:", error);
      return [];
    }
  }

  public async createInterviewLog(logData: {
    JobDetailsId: string;
    JobId: string;
    CandidateName: string;
    PhoneNumber: string;
    EmailId: string;
    Department: string;
    Location: string;
    Experience: string;
    JobTitle: string;
    RoundType: string;
    InterviewDate: string;
    StartTime: string;
    EndTime: string;
    InterviewerIds: number[];
    Status: string;
    Comments: string;
    ReviewedBy: string;
  }): Promise<void> {
    try {
      const itemData: Record<string, unknown> = {
        Title: logData.JobDetailsId,
        JobDetailsId: logData.JobDetailsId,
        JobId: logData.JobId,
        CandidateName: logData.CandidateName,
        PhoneNumber: logData.PhoneNumber,
        EmailId: logData.EmailId,
        Department: logData.Department,
        Location: logData.Location,
        Experience: logData.Experience,
        JobTitle: logData.JobTitle,
        RoundType: logData.RoundType,
        InterviewDate: logData.InterviewDate,
        StartTime: logData.StartTime,
        EndTime: logData.EndTime,
        Status: logData.Status,
        Comments: logData.Comments,
        FinalStatus: "Pending",
        FinalComments: "",
        ReviewedBy: logData.ReviewedBy,
      };

      if (logData.InterviewerIds && logData.InterviewerIds.length > 0) {
        itemData.InterviewersId = logData.InterviewerIds;
      }

      console.log("📤 Creating interview log:", JSON.stringify(itemData, null, 2));
      await this.sp.web.lists.getByTitle("InterviewLogs").items.add(itemData);
      console.log("✅ Interview log created for:", logData.JobDetailsId, "-", logData.RoundType);
    } catch (error) {
      console.error("Error creating interview log:", error);
      throw error;
    }
  }

  public async updateInterviewLog(
    id: number,
    data: {
      InterviewDate?: string;
      StartTime?: string;
      EndTime?: string;
      InterviewerIds?: number[];
      Status?: string;
      Comments?: string;
    }
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {};

      if (data.InterviewDate !== undefined) updateData.InterviewDate = data.InterviewDate;
      if (data.StartTime !== undefined) updateData.StartTime = data.StartTime;
      if (data.EndTime !== undefined) updateData.EndTime = data.EndTime;
      if (data.Status !== undefined) updateData.Status = data.Status;
      if (data.Comments !== undefined) updateData.Comments = data.Comments;

      if (data.InterviewerIds !== undefined && data.InterviewerIds.length > 0) {
        updateData.InterviewersId = data.InterviewerIds;
      }

      console.log("📤 Updating interview log ID:", id, "Data:", JSON.stringify(updateData, null, 2));
      await this.sp.web.lists.getByTitle("InterviewLogs").items.getById(id).update(updateData);
      console.log("✅ Interview log updated - ID:", id);
    } catch (error) {
      console.error("Error updating interview log:", error);
      throw error;
    }
  }

  public async updateInterviewLogFinalStatus(
    jobDetailsId: string,
    finalStatus: string,
    finalComments: string
  ): Promise<void> {
    try {
      const logs = await this.getInterviewLogsByJobDetailsId(jobDetailsId);
      for (const log of logs) {
        if (log.Id) {
          await this.sp.web.lists.getByTitle("InterviewLogs").items.getById(log.Id).update({
            FinalStatus: finalStatus,
            FinalComments: finalComments,
          });
        }
      }
      console.log("✅ Final status updated for all logs of:", jobDetailsId);
    } catch (error) {
      console.error("Error updating final status:", error);
      throw error;
    }
  }

  public async deleteInterviewLog(id: number): Promise<void> {
    try {
      await this.sp.web.lists.getByTitle("InterviewLogs").items.getById(id).delete();
      console.log("✅ Interview log deleted - ID:", id);
    } catch (error) {
      console.error("Error deleting interview log:", error);
      throw error;
    }
  }

  public async deleteAllInterviewLogsForCandidate(jobDetailsId: string): Promise<void> {
    try {
      const logs = await this.getInterviewLogsByJobDetailsId(jobDetailsId);
      for (const log of logs) {
        if (log.Id) {
          await this.sp.web.lists.getByTitle("InterviewLogs").items.getById(log.Id).delete();
        }
      }
      console.log("✅ All interview logs deleted for:", jobDetailsId);
    } catch (error) {
      console.error("Error deleting all logs:", error);
      throw error;
    }
  }

  // ==================== GET INTERVIEW SUMMARIES ====================
  public async getInterviewSummaries(): Promise<IInterviewSummary[]> {
    try {
      const allLogs = await this.getInterviewLogs();
      const shortlisted = await this.getShortlistedRecruitments();

      const grouped: { [key: string]: IInterviewLog[] } = {};
      allLogs.forEach((log) => {
        const key = log.Title || log.JobDetailsId;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(log);
      });

      const summaries: IInterviewSummary[] = [];

      const keys = Object.keys(grouped);
      for (let i = 0; i < keys.length; i++) {
        const jobDetailsId = keys[i];
        if (Object.prototype.hasOwnProperty.call(grouped, jobDetailsId)) {
          const rounds = grouped[jobDetailsId];
          const firstRound = rounds[0];
          const candidate = shortlisted.find((c) => c.JobDetailsId === jobDetailsId);
          const latestRound = rounds[rounds.length - 1];

          summaries.push({
            JobDetailsId: jobDetailsId,
            JobId: firstRound.JobId,
            CandidateName: firstRound.CandidateName,
            PhoneNumber: firstRound.PhoneNumber,
            EmailId: firstRound.EmailId,
            Department: firstRound.Department,
            Location: firstRound.Location,
            Experience: firstRound.Experience,
            JobTitle: firstRound.JobTitle,
            ReviewedBy: firstRound.ReviewedBy,
            Rounds: rounds,
            FinalStatus: latestRound.FinalStatus,
            FinalComments: latestRound.FinalComments,
            HasAttachment: candidate?.HasAttachment || false,
          });
        }
      }

      return summaries;
    } catch (error) {
      console.error("Error getting interview summaries:", error);
      return [];
    }
  }
}

// ==================== MAIN COMPONENT ====================
export interface IRecruitmentPortalProps {
  context: WebPartContext;
}

type PageType = "jobs" | "applicants" | "interviews" | "upload";

const STORAGE_KEY = "recruitmentPortal_currentPage";
const JOB_FILTER_KEY = "recruitmentPortal_jobIdFilter";
const JOB_DETAILS_FILTER_KEY = "recruitmentPortal_jobDetailsIdFilter";

const getSavedPage = (): PageType => {
  try {
    const savedPage = localStorage.getItem(STORAGE_KEY);
    if (savedPage && ["jobs", "applicants", "interviews", "upload"].includes(savedPage)) {
      return savedPage as PageType;
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  return "jobs";
};

const savePage = (page: PageType): void => {
  try {
    localStorage.setItem(STORAGE_KEY, page);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

// Job ID Filter functions
const setJobIdFilter = (jobId: string): void => {
  try {
    localStorage.setItem(JOB_FILTER_KEY, jobId);
  } catch (error) {
    console.error("Error saving job filter:", error);
  }
};

const getAndClearJobIdFilter = (): string => {
  try {
    const jobId = localStorage.getItem(JOB_FILTER_KEY) || "";
    localStorage.removeItem(JOB_FILTER_KEY);
    return jobId;
  } catch (error) {
    console.error("Error reading job filter:", error);
    return "";
  }
};

// Job Details ID Filter functions (NEW)
const setJobDetailsIdFilter = (jobDetailsId: string): void => {
  try {
    localStorage.setItem(JOB_DETAILS_FILTER_KEY, jobDetailsId);
  } catch (error) {
    console.error("Error saving job details filter:", error);
  }
};

const getAndClearJobDetailsIdFilter = (): string => {
  try {
    const jobDetailsId = localStorage.getItem(JOB_DETAILS_FILTER_KEY) || "";
    localStorage.removeItem(JOB_DETAILS_FILTER_KEY);
    return jobDetailsId;
  } catch (error) {
    console.error("Error reading job details filter:", error);
    return "";
  }
};

const RecruitmentPortal: React.FC<IRecruitmentPortalProps> = ({ context }) => {
  const [currentPage, setCurrentPage] = useState<PageType>(getSavedPage);
  const [jobIdFilterForJobPage, setJobIdFilterForJobPage] = useState<string>("");
  const [jobDetailsIdFilterForApplicantPage, setJobDetailsIdFilterForApplicantPage] = useState<string>("");
  const service = React.useMemo(() => new SPService(context), [context]);

  useEffect(() => {
    savePage(currentPage);
  }, [currentPage]);

  // Handle Job ID filter for Job Openings page
  useEffect(() => {
    if (currentPage === "jobs") {
      const filter = getAndClearJobIdFilter();
      if (filter) {
        setJobIdFilterForJobPage(filter);
      }
    }
  }, [currentPage]);

  // Handle Job Details ID filter for Applicants page (NEW)
  useEffect(() => {
    if (currentPage === "applicants") {
      const filter = getAndClearJobDetailsIdFilter();
      if (filter) {
        setJobDetailsIdFilterForApplicantPage(filter);
      }
    }
  }, [currentPage]);

  const navItems = [
    { key: "jobs" as PageType, label: "💼 Job Openings" },
    { key: "upload" as PageType, label: "📄 Upload Resume" },
    { key: "applicants" as PageType, label: "👥 Applicants" },
    { key: "interviews" as PageType, label: "🗓️ Shortlisted Candidates" },
  ];

  const handlePageChange = (page: PageType): void => {
    setJobIdFilterForJobPage("");
    setJobDetailsIdFilterForApplicantPage("");
    setCurrentPage(page);
  };

  // Navigate to Job Openings with Job ID filter
  const navigateToJobWithFilter = useCallback((jobId: string): void => {
    setJobIdFilter(jobId);
    setJobIdFilterForJobPage(jobId);
    setCurrentPage("jobs");
  }, []);

  // Navigate to Applicants with Job Details ID filter (NEW)
  const navigateToApplicantWithFilter = useCallback((jobDetailsId: string): void => {
    setJobDetailsIdFilter(jobDetailsId);
    setJobDetailsIdFilterForApplicantPage(jobDetailsId);
    setCurrentPage("applicants");
  }, []);

  const clearJobFilter = useCallback((): void => {
    setJobIdFilterForJobPage("");
  }, []);

  const clearJobDetailsIdFilter = useCallback((): void => {
    setJobDetailsIdFilterForApplicantPage("");
  }, []);

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case "jobs":
        return (
          <JobOpening
            service={service}
            initialJobIdFilter={jobIdFilterForJobPage}
            onClearFilter={clearJobFilter}
          />
        );
      case "upload":
        return <UploadResume service={service} />;
      case "applicants":
        return (
          <Applicant
            service={service}
            onNavigateToJob={navigateToJobWithFilter}
            initialJobDetailsIdFilter={jobDetailsIdFilterForApplicantPage}
            onClearFilter={clearJobDetailsIdFilter}
          />
        );
      case "interviews":
        return (
          <Interview
            service={service}
            onNavigateToJob={navigateToJobWithFilter}
            onNavigateToApplicant={navigateToApplicantWithFilter}
          />
        );
      default:
        return (
          <JobOpening
            service={service}
            initialJobIdFilter={jobIdFilterForJobPage}
            onClearFilter={clearJobFilter}
          />
        );
    }
  };

  return (
    <div className={styles.portal}>
      <nav className={styles.nav}>
        <h2 className={styles.logo}>🏢 Recruitment Portal</h2>
        <ul>
          {navItems.map((item) => (
            <li
              key={item.key}
              className={currentPage === item.key ? styles.active : ""}
              onClick={() => handlePageChange(item.key)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
      <main className={styles.main}>{renderPage()}</main>
    </div>
  );
};

export default RecruitmentPortal;