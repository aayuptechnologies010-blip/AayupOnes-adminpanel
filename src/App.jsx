import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const EmployeeDetails = lazy(() => import('./pages/EmployeeDetails'));
const OnboardingForm = lazy(() => import('./pages/OnboardingForm'));
const Approvals = lazy(() => import('./pages/Approvals'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Payroll = lazy(() => import('./pages/Payroll'));
const Payslips = lazy(() => import('./pages/Payslips'));
const Reimbursements = lazy(() => import('./pages/Reimbursements'));
const Documents = lazy(() => import('./pages/Documents'));
const Helpdesk = lazy(() => import('./pages/Helpdesk'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboard/:token" element={<OnboardingForm />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/payslips" element={<Payslips />} />
        <Route path="/reimbursements" element={<Reimbursements />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/helpdesk" element={<Helpdesk />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
