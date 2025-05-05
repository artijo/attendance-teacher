import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

// Lazy load all page components
// Auth
const Login = lazy(() => import('./pages/Login.jsx'));
const NewLogin = lazy(() => import('./pages/New-Account.jsx'));
const NewPassword = lazy(() => import('./pages/New-Password.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));

// Subject Page
const Subject = lazy(() => import('./pages/subject/Subject.jsx'));
const SubjectDetail = lazy(() => import('./pages/subject/SubjectDetail.jsx'));
const SubjectAttendance = lazy(() => import('./pages/subject/SubjectAttendance.jsx'));
const Attendance = lazy(() => import('./pages/subject/attendance/Attendance.jsx'));
const SubjectCheckAttendence = lazy(() => import('./pages/subject/SubjectCheckAttendence.jsx'));
const SubjectCheckAttendenceDetail = lazy(() => import('./pages/subject/SubjectCheckAttendenceDetail.jsx'));
const SubjectCheckAttendenceByPeriod = lazy(() => import('./pages/subject/SubjectCheckAttendenceByPeriod.jsx'));
const AttendanceWithQR = lazy(() => import('./pages/subject/AttendanceQRCode.jsx'))

// Classroom Page
const Classroom = lazy(() => import('./pages/classroom/Classroom.jsx'));
const ClassroomDetail = lazy(() => import('./pages/classroom/ClassroomDetail.jsx'));
const StudentAttendance = lazy(() => import('./pages/classroom/attendance/StudentAttendance.jsx'));
const StudentAttendanceFilterByDay = lazy(() => import('./pages/classroom/attendance/StudentAttendanceFilterByDay.jsx'));
const PaticepateByDay = lazy(() => import('./components/classroom/attendance/PaticepateByDay.jsx'));

// Activity Page
const Activities = lazy(() => import('./pages/activities/Activities.jsx'));
const ActivityDetail = lazy(() => import('./pages/activities/ActivityDetail.jsx'));
const ActivityQRpaticipate = lazy(() => import('./pages/activities/ActivityQRpaticipate.jsx'));
const CheckIn = lazy(() => import('./pages/activities/CheckIn.jsx'));
const EditCheckIn = lazy(() => import('./pages/activities/ActivityEditCheckinByDate.jsx'));
const ExcelByFilterRoom = lazy(() => import('./pages/activities/excelmanagedownload/ExcelByRoomJoin.jsx'));
const FilterClassroomPage = lazy(() => import('./pages/activities/pdfmanagedownload/FilterClassroomPage.jsx'));
const FilterByClassroom = lazy(() => import('./components/activities/exportPDF/FilterByClassroom.jsx'));
const FilterExcelPage = lazy(() => import('./pages/activities/excelmanagedownload/ExcelByClassroomPage.jsx'));
const FilterByClassroomJoinPage = lazy(() => import('./pages/activities/pdfmanagedownload/FilterByClassroomJoinPage.jsx'));
const FilterByRoomJoin = lazy(() => import('./components/activities/exportPDF/FilterByRoomJoin.jsx'));

// Leave Request Page
const LeaveRequest = lazy(() => import('./pages/leaverequest/LeaveRequest.jsx'));
const LeaveRequestDetail = lazy(() => import('./pages/leaverequest/LeaveRequestDetail.jsx'));

// PDF pages (now lazy-loaded)
const AttendenceBySubjectPDF = lazy(() => import('./pages/classroom/attendance/pdfpage/bysubject/AttendenceBySubjectPDF.jsx'))
const AttendanceIsExamPDF = lazy(() => import('./pages/subject/attendance/pdfpage/IsExam/AttendanceIsExamPDF.jsx'))
const AttendenceBySubjectPDFSubject = lazy(() => import('./pages/subject/attendance/pdfpage/bysubject/AttendenceBySubjectPDFSubject.jsx'))

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <BrowserRouter>
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="new-login" element={<NewLogin />} />
        <Route path="new-password" element={<NewPassword />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/" element={<App />} >
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='subjects' element={<Subject />} />
          <Route path='subjects/:id' element={<SubjectDetail />} />
          <Route path='subjects/:id/attendance' element={<SubjectAttendance />} />
          <Route path='subjects/:id/attendance/:studingid' element={<Attendance />} />
          <Route path='subjects/:subjectId/qrcode/:studyTimeId' element={<AttendanceWithQR />} />
          <Route path='subjects/:id/attendance/check' element={<SubjectCheckAttendence />} />
          <Route path='subjects/attendance/checkdetail' element={<SubjectCheckAttendenceDetail />} />
          <Route path='subjects/attendance/checkdetail/pdfpage' element={<AttendanceIsExamPDF />} />
          <Route path='subjects/attendances/abstract/subject' element={<AttendenceBySubjectPDFSubject />} />
          <Route path='subjects/attendance/byperiod' element={<SubjectCheckAttendenceByPeriod />} />
          {/* Classroom */}
          <Route path='classroom' element={<Classroom/>}/>
          <Route path='classroom/attendance/student' element={<StudentAttendance/>}/>
          <Route path='classroom/attendence/student/pdf' element={<AttendenceBySubjectPDF/>}/>
          {/* <Route path='classroom/attendance/byday/student'  element={<StudentAttendanceFilterByDay/>}/>
          <Route path='classroom/attendance/byday/student/infomation'  element={<PaticepateByDay/>}/> */}
          <Route path='classroom/detail' element={<ClassroomDetail/>}/>
          
          {/* Activities */}
          <Route path='activities' element={<Activities/>}/>
          <Route path='activities/:id' element={<ActivityDetail/>}/>
          <Route path='activities/:id/check-in' element={<CheckIn/>}/>
          <Route path='activities/:id/check-in/edit' element={<EditCheckIn/>}/>
          <Route path='activities/:id/qr-code' element={<ActivityQRpaticipate/>}/>
           {/* By Ohm Section */}
          <Route path="activity/participate/filterbyclassroom/excel" element={<ExcelByFilterRoom/>} />
          <Route path="activity/participate/filterbyclassroom" element={<FilterClassroomPage />} />
          <Route path="activity/participate/filterbyclassroom/pdfpage" element={<FilterByClassroom />} />
          <Route path="activity/participate/filterbyclassroomjoin/excel" element={<FilterExcelPage/>} />
          <Route path="activity/participate/filterbyclassroomjoin" element={<FilterByClassroomJoinPage />} />
          <Route path="activity/participate/filterbyclassroomjoin/pdfpage" element={<FilterByRoomJoin />} />
          {/* Leave Request */}
          <Route path='leavereq' element={<LeaveRequest />} />
          <Route path='leavereq/:id' element={<LeaveRequestDetail />} />
          {/* Redirect to dashboard if no match */}
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>,
  // </StrictMode>,
)
