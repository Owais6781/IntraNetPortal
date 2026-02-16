# Expense Claim Approval Workflow Fixes

## Summary of Changes

Fixed the email matching logic and implemented proper sequential approval workflow in `ExpenseView.tsx`. The approval flow now correctly:

1. **Matches current user email** from EmployeeDirectory people picker fields
2. **Loads approver emails** (Manager, Director, HR) from the employee record
3. **Implements sequential approval** - only the current stage approver can act
4. **Prevents non-approvers** from seeing approval actions

---

## Key Fixes

### 1. Fixed Current User Email Matching (Lines ~1373-1390)

**Problem:** The original code used filter syntax that doesn't work well with person picker fields.

**Solution:** Now iterates through all EmployeeDirectory items and extracts email from the expanded person picker field:

```tsx
// For person picker fields, expand and extract EMail
const allEmpDirItems: any[] = await directoryList.items
  .select("Id", `${emailInternal}/EMail`, `${emailInternal}/Id`)
  .expand(emailInternal)
  .top(5000)();

for (const item of allEmpDirItems) {
  const personEmail = toText(item?.[emailInternal]?.EMail).trim().toLowerCase();
  if (personEmail === currentEmail) {
    userExists = true;
    break;
  }
}
```

### 2. Fixed Approver Email Extraction (Lines ~1410-1430)

**Problem:** Didn't properly extract emails from person picker fields.

**Solution:** Now explicitly checks and extracts from the person picker's EMail property:

```tsx
if (empRow?.[mgrInternal]?.EMail) {
  managerEmail = toText(empRow[mgrInternal].EMail).trim().toLowerCase();
}
if (empRow?.[dirInternal]?.EMail) {
  directorEmail = toText(empRow[dirInternal].EMail).trim().toLowerCase();
}
if (empRow?.[hrInternal]?.EMail) {
  hrEmail = toText(empRow[hrInternal].EMail).trim().toLowerCase();
}
```

### 3. Implemented Sequential Approval Authorization (Lines ~1530-1550)

**Problem:** Previous logic didn't properly implement stage-based approval.

**Solution:** New `canApprove` memoized logic that checks:
- Is the claim in "Pending" status?
- Is the current stage not "Completed"?
- Does the current user's email match the current stage's approver email?

```tsx
const canApprove = React.useMemo(() => {
  if (!pending || effectiveStage === "Completed") return false;

  if (effectiveStage === "Manager" && currentUserEmail === approverEmails.manager) return true;
  if (effectiveStage === "Director" && currentUserEmail === approverEmails.director) return true;
  if (effectiveStage === "HR" && currentUserEmail === approverEmails.hr) return true;

  return false;
}, [pending, effectiveStage, currentUserEmail, approverEmails]);
```

### 4. Non-Approvers See No Actions

**Implementation:**
- `showApproverContainer = canApprove` - only shows if user is the current stage approver
- Non-approvers won't see the approval remarks box or action buttons
- Clear error message if unauthorized user attempts action

### 5. Sequential Approval Flow

**Approval Stages:**
1. **Manager** reviews and approves/rejects/requests modification
   - If approved → moves to next stage (Director or HR)
   - If rejected/modified → claim status ends
2. **Director** (if claim amount ≥ 5000) reviews
   - Same actions as Manager
3. **HR** final approval
   - If approved → Status = "Approved", Stage = "Completed"
   - If rejected/modified → claim status ends

---

## How It Works

### User Email Matching
1. Get current user email from `context.pageContext.user.email`
2. Fetch all EmployeeDirectory items with expanded person picker fields
3. Compare current user email with all entries
4. `isCurrentUserInDirectory = true` if found (for potential future use)

### Approver Assignment
1. Get employee code from claim header (EMP-002)
2. Find employee record in EmployeeDirectory
3. Extract Manager, Director, HR emails from person picker fields
4. Store in state: `approverEmails = { manager, director, hr }`

### Approval Authorization
1. Check if claim is "Pending" status
2. Determine current stage from ApprovalStage field
3. Check if current stage is not "Completed"
4. Match `currentUserEmail` with the required stage approver email
5. Only that approver sees the action buttons

### Current Stage Determination
```tsx
const effectiveStage = normalizeStage(
  header?.ApprovalStage, 
  isPending, 
  steps
);
```

Stages flow: Manager → Director (if amount ≥5000) → HR → Completed

---

## Testing Checklist

- [ ] Create a pending expense claim
- [ ] Manager logs in, should see approve/reject/modify buttons
- [ ] Director logs in (if applicable), should NOT see buttons until Manager approves
- [ ] Other users should NOT see any approval actions
- [ ] Manager approves → stage advances to Director
- [ ] Director approves → stage advances to HR
- [ ] HR approves → Status = "Approved", Stage = "Completed"
- [ ] Test reject at any stage → Status = "Rejected", Stage = "Completed"
- [ ] Test modify at any stage → Status = "Need Modification", Stage = "Completed"
- [ ] Remarks are saved correctly for each stage

---

## Field Configuration

Add these fields to your **ExpenseEmpData** list:

| Field Name | Type | Internal Name | Notes |
|---|---|---|---|
| ApprovalStage | Single line text | ApprovalStage | Stores: Manager, Director, HR, Completed |
| ManagerRemarks | Multiple lines text | ManagerRemarks | Manager's approval remarks |
| DirectorRemarks | Multiple lines text | DirectorRemarks | Director's approval remarks |
| HRRemarks | Multiple lines text | HRRemarks | HR's approval remarks |

---

## Component Props

If you need to customize internal field names:

```tsx
<ExpenseView
  context={context}
  // ... other props
  approvalStageInternalName="ApprovalStage"
  managerRemarksInternalName="ManagerRemarks"
  directorRemarksInternalName="DirectorRemarks"
  hrRemarksInternalName="HRRemarks"
  employeeDirectoryListTitle="EmployeeDirectory"
  directoryManagerInternalName="Manager"
  directoryDirectorInternalName="Director"
  directoryHRInternalName="HR"
/>
```

