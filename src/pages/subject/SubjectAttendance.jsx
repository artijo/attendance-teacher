import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { HOSTNAME } from '../../config';
import { getDayName, formatDate } from '../../helper';

function SubjectAttendance() {
    const { id } = useParams();
    const [subject, setSubject] = useState(null);
    const [expandedTimetable, setExpandedTimetable] = useState(null);

    useEffect(() => {
        axios.get(`${HOSTNAME}/t/subject/${id}`)
            .then((response) => {
                setSubject(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [id]);

    const hasAttendance = (study) => {
        return study.attendance && study.attendance.length > 0;
    };

    return (
        <div className="container mx-auto">
            {subject && (
                <>
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h1 className="text-3xl font-bold mb-6">บันทึกการเข้าเรียน</h1>
                        <div className="space-y-3">
                            <p className="text-xl">
                                <span className="font-bold">วิชา:</span> {subject.subNameThai}
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">รหัสวิชา:</span> {subject.subCode}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-6">เลือกวันที่ต้องการบันทึกการเข้าเรียน</h2>
                        {subject.timetable.map((time) => (
                            <div key={time.timetableId} className="mb-4">
                                <div 
                                    onClick={() => setExpandedTimetable(expandedTimetable === time.timetableId ? null : time.timetableId)}
                                    className={`bg-gray-100 p-4 rounded-lg cursor-pointer transition-all
                                        ${expandedTimetable === time.timetableId ? 'rounded-b-none bg-blue-50' : 'hover:bg-gray-50'}`}
                                >
                                    <h3 className="text-xl font-semibold flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span>ห้องเรียน {time.classroom.classLevel}/{time.classroom.classRoom}</span>
                                            <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                                                {time.studyTime.length} ครั้ง
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-base text-gray-600">
                                                วัน{getDayName(time.dayOfWeek)} {time.timeStart.substring(0, 5)} - {time.timeEnd.substring(0, 5)} น.
                                            </span>
                                            <svg 
                                                className={`w-6 h-6 transition-transform ${expandedTimetable === time.timetableId ? 'transform rotate-180' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </h3>
                                </div>
                                
                                {expandedTimetable === time.timetableId && (
                                    <div className="border border-t-0 rounded-b-lg bg-white">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                            {time.studyTime
                                                .sort((a, b) => new Date(a.studingTimeDate) - new Date(b.studingTimeDate))
                                                .map((study) => (
                                                    <Link
                                                        key={study.studyTimeId}
                                                        to={`/subjects/${id}/attendance/${study.studyTimeId}`}
                                                        className={`block p-4 rounded-lg border transition-colors ${
                                                            hasAttendance(study) 
                                                            ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                                                            : 'hover:bg-blue-50 hover:border-blue-200'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="font-semibold mb-2">
                                                                    {formatDate(study.studingTimeDate)}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {time.timeStart.substring(0, 5)} - {time.timeEnd.substring(0, 5)} น.
                                                                </div>
                                                            </div>
                                                            <span className={`px-2 py-1 text-sm rounded-full ${
                                                                hasAttendance(study) 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {hasAttendance(study) ? 'บันทึกแล้ว' : 'ยังไม่บันทึก'}
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default SubjectAttendance;