# FWC HRMS – AI-Powered Human Resource Management System

## Overview

FWC HRMS is a modern Human Resource Management System (HRMS) built using Node.js, Express.js, MongoDB, and Artificial Intelligence features.

The platform helps organizations manage employees, recruitment, payroll, attendance, leave requests, onboarding, notifications, performance reviews, and AI-assisted candidate screening through a centralized dashboard.

---

## Features

### Employee Management

* Employee profiles
* Employee records management
* Department management
* Role-based access

### Recruitment Management

* Job creation and management
* Candidate tracking
* Resume screening
* AI candidate evaluation
* Recruitment workflow automation

### Payroll Management

* Salary calculation
* Payroll processing
* Payslip generation
* Tax and deduction management

### Leave Management

* Leave application
* Leave approval workflow
* Leave balance tracking

### Attendance Management

* Employee attendance records
* Attendance reports
* Workforce tracking

### Performance Management

* Employee reviews
* Performance evaluation
* KPI tracking

### Onboarding System

* New employee onboarding
* Employee documentation

### Notifications

* Real-time employee notifications
* Payroll notifications
* Leave notifications

### Reports & Analytics

* HR reports
* Recruitment analytics
* Employee statistics

### AI Features

* Resume Screening
* Candidate Ranking
* Recruitment Recommendations

---

## Technology Stack

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Authentication

* JWT Authentication
* Role-Based Access Control

### AI Integration

* Resume Analysis Engine
* Candidate Screening Module


Project Structure

hrms/
│
├── server/
│   ├── routes/
│   │   ├── attendance.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── documents.js
│   │   ├── employees.js
│   │   ├── leave.js
│   │   ├── notifications.js
│   │   ├── onboarding.js
│   │   ├── payroll.js
│   │   ├── performance.js
│   │   ├── recruitment.js
│   │   ├── reports.js
│   │   └── videoInterviews.js
│   │
│   ├── uploads/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── HRMS_Setup_Guide.html
├── package.json
└── README.md
```

---
Installation

Clone Repository

```bash
git clone https://github.com/jahnavi2056/hrms.git
cd hrms
```

### Install Dependencies

```bash
npm install
```

### Install Server Dependencies

```bash
cd server
npm install
```

Configure Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

OPENAI_API_KEY=your_openai_key

GEMINI_API_KEY=your_gemini_key


Run Application

```bash
cd server
node utils/seed.js
node fixpasswords.js 
npm run dev


Server will start at:

http://localhost:5173

Available Modules

| Module           | Description            |
| ---------------- | ---------------------- |
| Authentication   | Login & Access Control |
| Employees        | Employee Management    |
| Attendance       | Attendance Tracking    |
| Leave            | Leave Requests         |
| Payroll          | Salary Processing      |
| Recruitment      | AI Hiring System       |
| Performance      | Employee Reviews       |
| Onboarding       | Employee Onboarding    |
| Documents        | Document Management    |
| Notifications    | System Notifications   |
| Reports          | HR Analytics           |
| Video Interviews | Interview Management   |

Future Enhancements

* Employee Sentiment Analysis
* Attrition Prediction
* Attendance Face Recognition
* AI Career Recommendation System

Author

Jahnavi J P

AI/ML Engineer | Full Stack Developer

GitHub: https://github.com/jahnavi2056

LinkedIn: https://www.linkedin.com/in/jahnavi-j-p

Portfolio: https://jahanvijpportfolio.netlify.app/ 



License

This project is developed for educational, research, internship, and hackathon purposes.
