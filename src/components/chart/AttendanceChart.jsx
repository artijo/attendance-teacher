import { useEffect, useState } from 'react';
import axios from 'axios';
import { HOSTNAME } from '../../config';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function AttendanceChart() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch subjects taught by the teacher
  useEffect(() => {
    setLoading(true);
    axios.get(`${HOSTNAME}/t/subjects`)
      .then((response) => {
        setSubjects(response.data);
        if (response.data && response.data.length > 0) {
          setSelectedSubject(response.data[0].subId);
        }
      })
      .catch((error) => {
        console.error('Error fetching subjects:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch subject details and organize timetables when a subject is selected
  useEffect(() => {
    if (selectedSubject) {
      setLoading(true);
      axios.get(`${HOSTNAME}/t/subject/${selectedSubject}`)
        .then((response) => {
          // Group timetables by classroom
          const classroomMap = new Map();
          
          if (response.data && response.data.timetable) {
            response.data.timetable.forEach(time => {
              if (time.classroom) {
                const classKey = `${time.classroom.classLevel}/${time.classroom.classRoom}`;
                
                if (!classroomMap.has(classKey)) {
                  classroomMap.set(classKey, {
                    classId: time.classId,
                    classLevel: time.classroom.classLevel,
                    classRoom: time.classroom.classRoom,
                    timetables: []
                  });
                }
                
                // Add this timetable to the classroom's timetables array
                classroomMap.get(classKey).timetables.push({
                  timetableId: time.timetableId,
                  timeStart: time.timeStart,
                  timeEnd: time.timeEnd,
                  dayOfWeek: time.dayOfWeek,
                  studyTime: time.studyTime
                });
              }
            });
          }
          
          const classroomArray = Array.from(classroomMap.values());
          setClassrooms(classroomArray);
          
          // Auto select first classroom if available
          if (classroomArray.length > 0) {
            const firstClassroom = classroomArray[0];
            setSelectedClassroom(`${firstClassroom.classLevel}/${firstClassroom.classRoom}`);
            setTimetables(firstClassroom.timetables);
            
            // Auto select first timetable if available
            if (firstClassroom.timetables.length > 0) {
              setSelectedTimetable(firstClassroom.timetables[0].timetableId);
              
              // Process attendance data for the selected timetable
              processPeriodData(response.data, firstClassroom.timetables[0]);
            }
          } else {
            setTimetables([]);
            setSelectedTimetable(null);
            setAttendanceData(null);
          }
        })
        .catch((error) => {
          console.error('Error fetching subject details:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedSubject]);

  // Handle classroom selection change
  useEffect(() => {
    if (selectedClassroom && classrooms.length > 0) {
      const selectedClassroomObj = classrooms.find(c => 
        `${c.classLevel}/${c.classRoom}` === selectedClassroom
      );
      
      if (selectedClassroomObj) {
        setTimetables(selectedClassroomObj.timetables);
        
        // Auto select first timetable when changing classroom
        if (selectedClassroomObj.timetables.length > 0) {
          setSelectedTimetable(selectedClassroomObj.timetables[0].timetableId);
        } else {
          setSelectedTimetable(null);
          setAttendanceData(null);
        }
      }
    }
  }, [selectedClassroom, classrooms]);

  // Process data when timetable is changed
  useEffect(() => {
    if (selectedSubject && selectedTimetable && timetables.length > 0) {
      setLoading(true);
      axios.get(`${HOSTNAME}/t/subject/${selectedSubject}`)
        .then((response) => {
          // Find the selected timetable from the response data
          const selectedTimetableObj = response.data.timetable.find(
            time => time.timetableId === selectedTimetable
          );
          
          if (selectedTimetableObj) {
            processPeriodData(response.data, selectedTimetableObj);
          } else {
            setAttendanceData(null);
          }
        })
        .catch((error) => {
          console.error('Error fetching subject details for timetable change:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedTimetable]);

  // Handle classroom selection change
  const handleClassroomChange = (e) => {
    setSelectedClassroom(e.target.value);
  };
  
  // Handle timetable selection change
  const handleTimetableChange = (e) => {
    setSelectedTimetable(e.target.value);
  };

  // Get day name from day of week number
  const getDayName = (dayOfWeek) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[dayOfWeek] || '';
  };

  // Process data for period view
  const processPeriodData = (subjectData, timetableObj) => {
    if (!subjectData || !timetableObj || !timetableObj.studyTime) {
      setAttendanceData(null);
      return;
    }
    
    const timeStartString = timetableObj.timeStart.substring(0, 5);
    const timeEndString = timetableObj.timeEnd.substring(0, 5);
    const dayName = getDayName(timetableObj.dayOfWeek);
    
    // Sort study times by date
    const sortedStudyTimes = [...timetableObj.studyTime].sort((a, b) => 
      new Date(a.studingTimeDate) - new Date(b.studingTimeDate)
    );
    
    // Create labels with dates
    const labels = sortedStudyTimes.map(study => {
      const date = new Date(study.studingTimeDate);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    });
    
    // Count attendance for each study date
    const presentData = [];
    const absentData = [];
    const lateData = [];
    const leaveData = [];
    const activityData = [];
    
    sortedStudyTimes.forEach(study => {
      // Initialize counters for this date
      let present = 0;
      let absent = 0;
      let late = 0;
      let leave = 0;
      let activity = 0;
      
      // Count attendance for this date
      if (study.attendance && study.attendance.length > 0) {
        study.attendance.forEach(att => {
          switch (att.attStatus.toUpperCase()) {
            case 'PRESENT':
              present++;
              break;
            case 'ABSENT':
              absent++;
              break;
            case 'LATE':
              late++;
              break;
            case 'LEAVE':
              leave++;
              break;
            case 'ACTIVITY':
              activity++;
              break;
            default:
              break;
          }
        });
      }
      
      // Add to datasets
      presentData.push(present);
      absentData.push(absent);
      lateData.push(late);
      leaveData.push(leave);
      activityData.push(activity);
    });
    
    // Prepare chart data
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'มาเรียน',
          data: presentData,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        },
        {
          label: 'ขาดเรียน',
          data: absentData,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        },
        {
          label: 'มาสาย',
          data: lateData,
          backgroundColor: 'rgba(255, 205, 86, 0.7)',
          borderColor: 'rgb(255, 205, 86)',
          borderWidth: 1
        },
        {
          label: 'ลา',
          data: leaveData,
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderColor: 'rgb(153, 102, 255)',
          borderWidth: 1
        },
        {
          label: 'กิจกรรม',
          data: activityData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };
    
    // Find the currently selected classroom name
    let selectedClassroomDisplay = selectedClassroom;
    if (classrooms.length > 0) {
      const classroomObj = classrooms.find(c => `${c.classLevel}/${c.classRoom}` === selectedClassroom);
      if (classroomObj) {
        selectedClassroomDisplay = `ม.${classroomObj.classLevel}/${classroomObj.classRoom}`;
      }
    }
    
    // Custom options for date-based view
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: `สถิติการเข้าเรียน ${selectedClassroomDisplay} วัน${dayName} (${timeStartString}-${timeEndString} น.)`,
          font: {
            size: 18
          }
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              return `วันที่: ${tooltipItems[0].label}`;
            },
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || 0;
              return `${label}: ${value} คน`;
            },
            afterLabel: function(context) {
              const dateIndex = context.dataIndex;
              const total = presentData[dateIndex] + absentData[dateIndex] + 
                           lateData[dateIndex] + leaveData[dateIndex] + 
                           activityData[dateIndex];
              if (total > 0) {
                const value = context.parsed.y || 0;
                const percentage = Math.round((value / total) * 100);
                return `คิดเป็น ${percentage}%`;
              }
              return null;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'วันที่'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'จำนวนนักเรียน (คน)'
          },
          ticks: {
            stepSize: 1
          }
        }
      }
    };
    
    setAttendanceData({ data: chartData, options: chartOptions });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-line p-6">
      <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        สถิติการเข้าเรียน
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Subject Selection */}
        <div>
          <label htmlFor="subject-select" className="block text-sm font-medium text-text-color-alt mb-2">เลือกวิชา</label>
          <select
            id="subject-select"
            value={selectedSubject || ''}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="block w-full px-3 py-2 bg-white border border-line rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            disabled={loading || subjects.length === 0}
          >
            {subjects.length === 0 ? (
              <option value="" disabled>ไม่มีวิชา</option>
            ) : (
              subjects.map(subject => (
                <option key={subject.subId} value={subject.subId}>
                  {subject.subCode} - {subject.subNameThai}
                </option>
              ))
            )}
          </select>
        </div>
        
        {/* Classroom Selection */}
        <div>
          <label htmlFor="classroom-select" className="block text-sm font-medium text-text-color-alt mb-2">เลือกห้องเรียน</label>
          <select
            id="classroom-select"
            value={selectedClassroom}
            onChange={handleClassroomChange}
            className="block w-full px-3 py-2 bg-white border border-line rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            disabled={loading || classrooms.length === 0}
          >
            {classrooms.length === 0 ? (
              <option value="" disabled>ไม่มีห้องเรียน</option>
            ) : (
              classrooms.map((classroom) => (
                <option key={`${classroom.classLevel}/${classroom.classRoom}`} value={`${classroom.classLevel}/${classroom.classRoom}`}>
                  ม.{classroom.classLevel}/{classroom.classRoom}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Timetable/Period Selection */}
        <div>
          <label htmlFor="timetable-select" className="block text-sm font-medium text-text-color-alt mb-2">เลือกคาบเรียน</label>
          <select
            id="timetable-select"
            value={selectedTimetable || ''}
            onChange={handleTimetableChange}
            className="block w-full px-3 py-2 bg-white border border-line rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            disabled={loading || timetables.length === 0}
          >
            {timetables.length === 0 ? (
              <option value="" disabled>ไม่มีคาบเรียน</option>
            ) : (
              timetables.map((timetable) => {
                const dayName = getDayName(timetable.dayOfWeek);
                return (
                  <option key={timetable.timetableId} value={timetable.timetableId}>
                    วัน{dayName} {timetable.timeStart.substring(0, 5)}-{timetable.timeEnd.substring(0, 5)} น.
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>
      
      <div className="h-80">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : attendanceData ? (
          <Bar data={attendanceData.data} options={attendanceData.options} />
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-text-color-alt">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium mb-2">ไม่พบข้อมูลการเข้าเรียน</p>
            <p>ยังไม่มีข้อมูลการบันทึกการเข้าเรียนสำหรับวิชาและคาบเรียนที่เลือก</p>
          </div>
        )}
      </div>
      
      {/* Display info text about the chart */}
      {attendanceData && (
        <div className="mt-4 text-sm text-text-color-alt px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">สถิติการเข้าเรียนตามวัน</p>
              <p>แสดงจำนวนนักเรียนที่มีสถานะการเข้าเรียนต่างๆ ในแต่ละวันที่มีการเรียนการสอน</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceChart;