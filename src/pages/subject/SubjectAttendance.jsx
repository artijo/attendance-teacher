import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { HOSTNAME } from '../../config';
import { getDayName, formatDate } from '../../helper';

function SubjectAttendance() {
    const { id } = useParams();
    const [subject, setSubject] = useState(null);
    const [expandedTimetable, setExpandedTimetable] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`${HOSTNAME}/t/subject/${id}`)
            .then((response) => {
                setSubject(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [id]);

    const hasAttendance = (study) => {
        return study.attendance && study.attendance.length > 0;
    };
    
    const getTotalAttendedCount = (timetable) => {
        let attended = 0;
        let total = 0;
        
        if (timetable.studyTime && timetable.studyTime.length > 0) {
            total = timetable.studyTime.length;
            attended = timetable.studyTime.filter(study => hasAttendance(study)).length;
        }
        
        return { attended, total };
    };

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : subject ? (
                <>
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                                    บันทึกการเข้าเรียน
                                </h1>
                                <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                            </div>
                            
                            <div className="flex items-center gap-2 font-body">
                                <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                                    <span className="font-medium text-primary">รหัสวิชา:</span> {subject.subCode}
                                </div>
                                <div className="bg-secondary/10 px-3 py-1.5 rounded-lg">
                                    <span className="font-medium text-secondary">{subject.subCredit}</span> หน่วยกิต
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 mt-6 shadow-sm border border-line">
                            <p className="text-xl font-medium text-text-color font-heading">{subject.subNameThai}</p>
                            <p className="text-text-color-alt font-body">{subject.subNameEng}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                        <div className="p-4 border-b border-line">
                            <h2 className="text-xl font-bold text-primary font-heading flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                เลือกวันที่ต้องการบันทึกการเข้าเรียน
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {subject.timetable.map((time) => {
                                    const { attended, total } = getTotalAttendedCount(time);
                                    const progressPercent = total > 0 ? Math.round((attended / total) * 100) : 0;
                                    
                                    return (
                                        <div key={time.timetableId} className="border border-line rounded-xl overflow-hidden shadow-sm">
                                            <div
                                                onClick={() => setExpandedTimetable(expandedTimetable === time.timetableId ? null : time.timetableId)}
                                                className={`p-5 cursor-pointer transition-all duration-200 ${
                                                    expandedTimetable === time.timetableId
                                                        ? 'bg-primary/5 border-b border-line'
                                                        : 'bg-white hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                                                        <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium rounded-lg">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                            ม.{time.classroom.classLevel}/{time.classroom.classRoom}
                                                        </span>
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm ${
                                                            total === 0 ? 'bg-gray-100 text-gray-700' :
                                                            progressPercent === 100 ? 'bg-green-100 text-green-800' :
                                                            progressPercent > 50 ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                            </svg>
                                                            บันทึกแล้ว {attended}/{total} คาบ
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="hidden md:flex items-center text-text-color">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-text-color-alt">วัน{getDayName(time.dayOfWeek)}</span>
                                                        </div>

                                                        <div className="hidden md:flex items-center text-text-color-alt">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{time.timeStart.substring(0, 5)} - {time.timeEnd.substring(0, 5)} น.</span>
                                                        </div>

                                                        <button className="text-primary hover:text-accent transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${expandedTimetable === time.timetableId ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-4 md:hidden">
                                                    <div className="flex items-center mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-text-color-alt">วัน{getDayName(time.dayOfWeek)}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-text-color-alt">{time.timeStart.substring(0, 5)} - {time.timeEnd.substring(0, 5)} น.</span>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                                        <div className={`h-2.5 rounded-full ${
                                                            total === 0 ? 'bg-gray-400' :
                                                            progressPercent === 100 ? 'bg-green-500' :
                                                            progressPercent > 50 ? 'bg-blue-500' :
                                                            'bg-yellow-500'
                                                        }`} style={{ width: `${progressPercent}%` }}></div>
                                                    </div>
                                                    <div className="text-right text-xs text-text-color-alt">
                                                        บันทึกไปแล้ว {progressPercent}%
                                                    </div>
                                                </div>
                                            </div>

                                            {expandedTimetable === time.timetableId && (
                                                <div className="p-5 bg-white">
                                                    <h3 className="font-medium text-primary mb-4 font-heading flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                        คาบเรียนทั้งหมด
                                                    </h3>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {time.studyTime.length > 0 ? (
                                                            time.studyTime.sort((a, b) => new Date(a.studingTimeDate) - new Date(b.studingTimeDate)).map((study) => (
                                                                <Link
                                                                    key={study.studyTimeId}
                                                                    to={`/subjects/${id}/attendance/${study.studyTimeId}`}
                                                                    className={`block rounded-lg border transition-all duration-200 hover:-translate-y-1 ${
                                                                        hasAttendance(study) 
                                                                        ? 'bg-green-50 border-green-200 hover:shadow-md hover:border-green-300' 
                                                                        : 'bg-white border-line hover:bg-blue-50 hover:shadow-md hover:border-blue-200'
                                                                    }`}
                                                                >
                                                                    <div className="p-4">
                                                                        <div className="flex justify-between items-center mb-3">
                                                                            <div className="font-medium text-text-color">
                                                                                {formatDate(study.studingTimeDate)}
                                                                            </div>
                                                                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                                                                                hasAttendance(study) 
                                                                                ? 'bg-green-100 text-green-800' 
                                                                                : 'bg-yellow-100 text-yellow-800'
                                                                            }`}>
                                                                                {hasAttendance(study) ? (
                                                                                    <>
                                                                                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                                                        </svg>
                                                                                        บันทึกแล้ว
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                                                                                        </svg>
                                                                                        ยังไม่บันทึก
                                                                                    </>
                                                                                )}
                                                                            </span>
                                                                        </div>

                                                                        <div className="text-text-color-alt text-sm mb-3">
                                                                            {time.timeStart.substring(0, 5)} - {time.timeEnd.substring(0, 5)} น.
                                                                        </div>

                                                                        <div className="flex justify-end">
                                                                            <span className="text-sm px-3 py-1 rounded-lg bg-primary text-white inline-flex items-center">
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                </svg>
                                                                                {hasAttendance(study) ? 'ดูบันทึก' : 'บันทึกการเข้าเรียน'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))
                                                        ) : (
                                                            <div className="col-span-full text-center py-6 text-text-color-alt bg-gray-50 rounded-lg">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <p className="mb-1 font-medium">ยังไม่มีข้อมูลคาบเรียน</p>
                                                                <p className="text-sm">ยังไม่ได้กำหนดคาบเรียนสำหรับห้องเรียนนี้</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {subject.timetable.length === 0 && (
                                    <div className="col-span-full text-center py-10 text-text-color-alt bg-white rounded-lg border border-line">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <h3 className="text-lg font-medium mb-1">ไม่พบข้อมูลตารางเรียน</h3>
                                        <p>ยังไม่มีตารางเรียนที่กำหนดไว้สำหรับวิชานี้</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
                    <div className="flex justify-center mb-4 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">ไม่พบข้อมูลวิชา</h2>
                    <p className="text-text-color-alt font-body">ไม่พบข้อมูลวิชาที่เลือก กรุณาลองใหม่อีกครั้ง</p>
                </div>
            )}
        </div>
    );
}

export default SubjectAttendance;