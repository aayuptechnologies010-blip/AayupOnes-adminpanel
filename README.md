# AayupOnes - Keka HRMS Web Admin Console (React + Tailwind + MERN Frontend)

Enterprise Admin Portal designed with **Keka HRMS UX reference**.

## 🚀 Tech Stack
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS 3 (Keka Slate & Brand Blue Theme)
- **Routing**: React Router DOM v6
- **Icons**: React Icons (`react-icons/md`)
- **Alerts & Toasts**: SweetAlert2 (`sweetalert2`)
- **Charts & Graphs**: Highcharts & Highcharts React Official (`highcharts`, `highcharts-react-official`)
- **Table & Pagination**: Chakra UI & Keka-inspired responsive data tables with page navigation

---

## 📁 Directory Structure
```
admin-web/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── Sidebar.jsx       # Keka Dark Nav with live badges
    │   └── Header.jsx        # Global search, notifications & user profile
    ├── pages/
    │   ├── Dashboard.jsx     # Highcharts Attendance Trends + Department Pie Chart + KPIs
    │   ├── Employees.jsx     # Chakra-style Data Table with pagination, search, filter & modal
    │   ├── Approvals.jsx     # Leave & Regularization resolution inbox with SweetAlert
    │   ├── Attendance.jsx    # Live check-in punch registry and shift metrics
    │   ├── Payroll.jsx       # Keka 4-step salary processing wizard & statutory summary
    │   └── Settings.jsx      # Shift timings & geo-fencing configuration
    ├── utils/
    │   └── alerts.js         # SweetAlert2 toast & confirm dialog utilities
    └── data/
        └── mockData.js       # Structured mock HRMS data
```

---

## 🛠️ How to Run

1. Navigate to the `admin-web` folder:
   ```bash
   cd admin-web
   ```

2. Start the local Vite development server:
   ```bash
   npm run dev
   ```

3. Open in browser:
   ```
   http://localhost:3000
   ```

