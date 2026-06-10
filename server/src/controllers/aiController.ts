import { Request, Response } from 'express';
import prisma from '../prisma';
import { LeaveStatus, Role } from '@prisma/client';

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message parameter is required' });
    }

    const query = message.toLowerCase();
    let reply = '';

    // 1. DYNAMIC SYSTEM STATUS REPORT GENERATOR
    if (query.includes('report') || query.includes('stats') || query.includes('statistics') || query.includes('summary')) {
      const totalUsers = await prisma.user.count();
      const studentCount = await prisma.user.count({ where: { role: Role.STUDENT } });
      const pendingLeaves = await prisma.leaveRequest.count({ where: { status: LeaveStatus.PENDING } });
      const approvedLeaves = await prisma.leaveRequest.count({ where: { status: LeaveStatus.APPROVED } });
      const activeCheckouts = await prisma.leaveRequest.count({
        where: { exitTime: { not: null }, entryTime: null }
      });
      const hostelCount = await prisma.hostel.count();

      reply = `### 📊 Real-Time DORM-X System Report

Here is a summary of the active campus logs fetched directly from the database:

| Category | Metric Count | Status |
| :--- | :---: | :--- |
| **Total Registered Users** | ${totalUsers} | Active |
| **Students Enrolled** | ${studentCount} | Active |
| **Hostel Blocks Managed** | ${hostelCount} | Online |
| **Pending Leave Approvals** | ${pendingLeaves} | Needs Attention |
| **Approved Outpasses** | ${approvedLeaves} | Active |
| **Active Checked-Out Students** | ${activeCheckouts} | Off-Campus |

*To download detailed historical files, please use the **Export Reports** desk on your dashboard.*`;
    } 
    // 2. LEAVE POLICY & CURFEW
    else if (query.includes('policy') || query.includes('curfew') || query.includes('time') || query.includes('limit') || query.includes('rule')) {
      reply = `### 📜 DORM-X Hostel Leave & Curfew Policy

1. **Curfew Timeline**:
   - The campus gates close strictly at **9:00 PM** daily.
   - Any student returning after 9:00 PM without prior Night Leave approval will automatically trigger a **Late Overdue Alert** on the Warden and Security panels.

2. **Outpass Classifications**:
   - **Short Exit (30 mins)**: Auto-approvable for quick local chores.
   - **Standard Outpass**: Requires Warden authorization. Valid for day outings. Must return before curfew.
   - **Night Leave**: Requires Warden authorization. Parent notification sent instantly upon filing and decision.

3. **Scanning Mandate**:
   - You **MUST** present your dynamic QR pass at the security desk during both checkout and checkin. Failing to scan will result in an "Absentee" status record.`;
    } 
    // 3. STUDENT HELP & QR CODES
    else if (query.includes('student') || query.includes('how to') || query.includes('apply') || query.includes('qr') || query.includes('pass')) {
      reply = `### 🎓 Student Support Desk

* **Filing an Outpass Request**:
  1. Go to your **Student Dashboard**.
  2. Locate the **Request Outpass Access** form.
  3. Choose the outpass type, enter the reason, set departure/return timestamps, and click **Transmit**.
* **Accessing your QR Wallet**:
  1. Once approved, your outpass token appears in the **Active Pass Wallet** card.
  2. Click **Expand QR Token** to show the gate pass. Dynamic passes regenerate every 60s to prevent card sharing.
* **Emergency SOS**:
  - Click the flashing red **Trigger SOS Protocol** button in case of immediate safety threats. This alerts all campus security guards and block wardens.`;
    } 
    // 4. WARDEN INSTRUCTIONS
    else if (query.includes('warden') || query.includes('approve') || query.includes('reject') || query.includes('overdue')) {
      reply = `### 🏢 Warden Operations Guide

* **Approvals Desk**:
  - Pending outpass requests are listed in the **Command Approval Queue**.
  - Click **Approve** (green check) or **Reject** (red cross) to authorize.
* **Overdue Alerts**:
  - The warden dashboard displays a list of checked-out students who exceeded their estimated return deadlines. Proactively contact these residents.
* **Occupancy Telemetry**:
  - Check the occupancy charts to track exactly how many students from your hostel are currently checked out vs inside the dorms.`;
    } 
    // 5. SECURITY & ALERTS
    else if (query.includes('security') || query.includes('lockdown') || query.includes('visitor') || query.includes('courier')) {
      reply = `### 🛡️ Security SOC Protocols

* **Lockdown Mode**:
  - Activating **Lockdown** instantly locks down the gate scanners, suspends normal outpasses, and broadcasts emergency push alerts to all students, parents, and wardens.
* **Visitor Registry**:
  - Log guest check-ins with name, purpose, room destination, and the student host's email. Remember to log their check-out when they leave.
* **Courier Deliveries**:
  - Log parcel drop-offs by student email and vendor name. The student receives an instant Socket.IO ping to collect it.
* **Gate Scanners**:
  - Supports standard ID inputs, dynamic QR scans, RFID tap tags, and facial matching.`;
    } 
    // 6. DEFAULT FAQ
    else {
      reply = `### 👋 Welcome to DORM-X AI Assistant!

I am your virtual companion integrated directly into the hostel security platform. 

Here are some topics you can ask me about:
- **"What is the outpass policy?"** (Curfew limits and leave rules)
- **"How do I apply for a leave?"** (Student portal guide)
- **"How does the warden approve outpasses?"** (Warden administrative console instructions)
- **"What is the security lockdown protocol?"** (Emergency SOPs)
- **"Generate system statistics report"** (Fetches real-time counts from the database)

How can I help you today?`;
    }

    return res.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
