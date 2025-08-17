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

          // Calculate unique classrooms from subjects and classTeacher
          const classroomSet = new Set();

          // Add classrooms from classTeacher (homeroom classes)
          if (response.data.classTeacher && response.data.classTeacher.length > 0) {
            response.data.classTeacher.forEach(entry => {
              if (entry.classroom) {
                classroomSet.add(`${entry.classroom.classLevel}/${entry.classroom.classRoom}`);
              }
            });
          }

          // Add classrooms from timetable if available
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

          setStats({
            subjects: subjectCount,
            classrooms: classroomSet.size || 0,
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

  // Helper function to get the teacher's homeroom class
  const getHomeRoomClass = () => {
    if (!teacher || !teacher.classTeacher || teacher.classTeacher.length === 0) {
      return null;
    }

    // Return the first classroom entry (assuming the primary homeroom)
    const primaryClassTeacher = teacher.classTeacher[0];
    if (primaryClassTeacher && primaryClassTeacher.classroom) {
      return primaryClassTeacher.classroom;
    }

    return null;
  };

  // Get teacher's homeroom class
  const homeroomClass = getHomeRoomClass();

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

      {/* Satisfaction Survey Section */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 md:p-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 pt-1">
            <div className="bg-blue-100 rounded-full p-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              แบบประเมินความพึงพอใจ
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              ขอความอนุเคราะห์ในการประเมินความพึงพอใจต่อการใช้งานระบบ
              เพื่อนำมาพัฒนาและปรับปรุงระบบให้ดียิ่งขึ้น
            </p>
            <a
              href="https://forms.gle/h1djPQjY2Lh7Y7ZU8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              ทำแบบประเมิน
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
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
              {!loading && homeroomClass && (
                <p className="text-xs text-text-color-alt mt-1">ประจำชั้น {homeroomClass.classLevel}/{homeroomClass.classRoom}</p>
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
