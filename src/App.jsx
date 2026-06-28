import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import UniversityDashboard from './pages/UniversityDashboard';
import Auth from './pages/Auth';
import Store from './pages/Store';
import LMS from './pages/LMS';
import GuardianDashboard from './pages/GuardianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import VisitorDashboard from './pages/VisitorDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import FeedbackWidget from './components/FeedbackWidget';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/university" element={<UniversityDashboard />} />
        <Route path="/store" element={<Store />} />
        <Route path="/lms" element={<LMS />} />
        <Route path="/guardian" element={<GuardianDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/visitor" element={<VisitorDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
      <FeedbackWidget />
    </BrowserRouter>
  );
}

export default App;
