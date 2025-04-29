import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HOSTNAME } from '../config';
import AttendanceChart from '../components/chart/AttendanceChart';

function Dashboard() {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    subjects: 0,
    classrooms: 0,
    activities: 0
  });

  useEffect(() => {
    // Fetch teacher information
    setLoading(true);
    axios.get(`${HOSTNAME}/t/teacher-info`)
      .then(response => {
        setTeacher(response.data);
        
        // Set basic stats if available
        if (response.data) {
          const subjectCount = response.data.subject?.length || 0;
          const activityCount = response.data.activity?.length || 0;
          
          // Calculate unique classrooms from subjects
          const classroomSet = new Set();
          
          if (response.data.subject) {
            response.data.subject.forEach(subject => {
              if (subject.timetable) {
                subject.timetable.forEach(time => {
                  if (time.classroom) {
                    classroomSet.add(`${time.classroom.classLevel}/${time.classroom.classRoom}`);
                  }
                });
              }
            });
          }
          
          // If no timetable data, add the teacher's assigned classroom
          if (response.data.classroom) {
            classroomSet.add(`${response.data.classroom.classLevel}/${response.data.classroom.classRoom}`);
          }
          
          setStats({
            subjects: subjectCount,
            classrooms: classroomSet.size || (response.data.classroom ? 1 : 0),
            activities: activityCount
          });
        }
      })
      .catch(error => {
        console.error('Error fetching teacher info:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">แดชบอร์ด</h1>
            <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
          </div>
          
          {!loading && teacher && (
            <div className="bg-white shadow-sm border border-line rounded-lg px-4 py-3 flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-text-color-alt text-xs">ยินดีต้อนรับ</p>
                <p className="text-primary font-medium">{teacher?.fName} {teacher?.lName}</p>
                <p className="text-xs text-text-color-alt">{teacher?.department?.deptName}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-line">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm text-text-color-alt font-medium">วิชาที่สอน</h3>
              <p className="text-2xl font-bold text-primary">{loading ? '-' : stats.subjects}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-line">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm text-text-color-alt font-medium">ห้องเรียน</h3>
              <p className="text-2xl font-bold text-secondary">{loading ? '-' : stats.classrooms}</p>
              {!loading && teacher?.classroom && (
                <p className="text-xs text-text-color-alt mt-1">ประจำชั้น {teacher.classroom.classLevel}/{teacher.classroom.classRoom}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-line">
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm text-text-color-alt font-medium">กิจกรรม</h3>
              <p className="text-2xl font-bold text-green-500">{loading ? '-' : stats.activities}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance Chart */}
      <div className="mb-8">
        <AttendanceChart />
      </div>
      
      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          การดำเนินการด่วน
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/subjects" className="bg-white rounded-xl shadow-sm border border-line p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-color">จัดการวิชา</h3>
                <p className="text-text-color-alt text-sm">ดูวิชาที่สอนทั้งหมด</p>
              </div>
            </div>
          </Link>
          
          <Link to="/classroom" className="bg-white rounded-xl shadow-sm border border-line p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-color">ห้องเรียน</h3>
                <p className="text-text-color-alt text-sm">จัดการนักเรียนในห้องเรียน</p>
              </div>
            </div>
          </Link>
          
          <Link to="/activities" className="bg-white rounded-xl shadow-sm border border-line p-5 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-text-color">กิจกรรม</h3>
                <p className="text-text-color-alt text-sm">จัดการกิจกรรมของโรงเรียน</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;