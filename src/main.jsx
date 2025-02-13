import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

// import pages
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'

// Subject Page
import Subject from './pages/subject/Subject.jsx';
import SubjectDetail from './pages/subject/SubjectDetail.jsx';
import SubjectAttendance from './pages/subject/SubjectAttendance.jsx';
import Attendance from './pages/subject/attendance/Attendance.jsx';
// Classroom Page
import Classroom from './pages/classroom/Classroom.jsx';
import ClassroomDetail from './pages/classroom/ClassroomDetail.jsx';
import StudentAttendance from './pages/classroom/attendance/StudentAttendance.jsx';
// Activity Page
import Activities from './pages/activities/Activities.jsx';
import ActivityDetail from './pages/activities/ActivityDetail.jsx';
import CheckIn from './pages/activities/CheckIn.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
      <Routes>
      <Route path="login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/" element={<App />} >
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='subjects' element={<Subject />} />
          <Route path='subjects/:id' element={<SubjectDetail />} />
          <Route path='subjects/:id/attendance' element={<SubjectAttendance />} />
          <Route path='subjects/:id/attendance/:studingid' element={<Attendance />} />
          {/* Classroom */}
          <Route path='classrooms' element={<Classroom/>}/>
          <Route path='classroom/attendance/student' element={<StudentAttendance/>}/>
          <Route path='classroom/detail' element={<ClassroomDetail/>}/>
          {/* Activities */}
          <Route path='activities' element={<Activities/>}/>
          <Route path='activities/:id' element={<ActivityDetail/>}/>
          <Route path='activities/:id/check-in' element={<CheckIn/>}/>
        </Route>
      </Routes>
  </BrowserRouter>,
  // </StrictMode>,
)
