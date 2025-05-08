import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import TeacherTimetableBySubject from "../../components/teacherTimetableBySubject";
import AttendanceChart from "../../components/chart/AttendanceChart";

function Subject() {
    const [subjects, setSubjects] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
    const [isShowChart, setIsShowChart] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        setLoading(true);
        axios.get(`${HOSTNAME}/t/subjects`)
            .then((response) => {
                setSubjects(response.data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);
    
    const handleShow = () => {
        setIsShowTable(!isShowTable);
    }
    
    const handleShowChart = () => {
        setIsShowChart(!isShowChart);
    }
    
    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">วิชาที่สอน</h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => handleShow()}
                            className={`inline-flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg border transition-all duration-200 ${
                                isShowTable 
                                    ? 'bg-primary text-white border-primary hover:bg-accent' 
                                    : 'bg-white text-text-color border-line hover:bg-gray-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                            {isShowTable ? 'ซ่อนตารางสอน' : 'แสดงตารางสอน'}
                        </button>

                        <button 
                            onClick={() => handleShowChart()}
                            className={`inline-flex items-center gap-2 py-2.5 px-4 text-sm font-medium rounded-lg border transition-all duration-200 ${
                                isShowChart 
                                    ? 'bg-primary text-white border-primary hover:bg-accent' 
                                    : 'bg-white text-text-color border-line hover:bg-gray-50'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                            </svg>
                            {isShowChart ? 'ซ่อนกราฟสถิติ' : 'แสดงกราฟสถิติ'}
                        </button>
                    </div>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {subjects && subjects.length > 0 && (
                        <>
                            <div className={`mb-8 overflow-hidden transition-all duration-300 ${isShowTable ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="bg-white rounded-xl shadow-md border border-line p-4">
                                    <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        ตารางสอน
                                    </h2>
                                    <div>
                                        <TeacherTimetableBySubject subject={subjects}/>
                                    </div>
                                </div>
                            </div>

                            <div className={`mb-8 overflow-hidden transition-all duration-300 ${isShowChart ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <AttendanceChart />
                            </div>
                        </>
                    )}

                    {/* Rest of the subjects display */}
                    {subjects && subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.map((subject) => (
                                <div key={subject.subId} className="bg-white border border-line rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                                    <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                                                รหัสวิชา: {subject.subCode}
                                            </div>
                                            <div className="bg-secondary/10 text-secondary rounded-full px-3 py-1 text-xs font-medium">
                                                {subject.subCredit} หน่วยกิต
                                            </div>
                                        </div>
                                        
                                        <h2 className="text-xl font-bold text-text-color font-heading mb-2">{subject.subNameThai}</h2>
                                        <p className="text-text-color-alt font-body mb-6">{subject.subNameEng}</p>
                                        
                                        <div className="flex flex-col gap-2">
                                            <Link to={`/subjects/${subject.subId}`} className="w-full">
                                                <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-200 flex items-center justify-center text-sm font-medium">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    ดูรายละเอียด
                                                </button>
                                            </Link>
                                            
                                            <Link to={`/subjects/${subject.subId}/attendance`} className="w-full">
                                                <button className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center text-sm font-medium">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    บันทึกการเข้าเรียน
                                                </button>
                                            </Link>
                                            
                                            <Link to={`/subjects/${subject.subId}/attendance/check`} state={{subject: subject}} className="w-full">
                                                <button className="w-full py-2 px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center text-sm font-medium">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    ตรวจสอบการเข้าเรียน
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
                            <div className="flex justify-center mb-4 text-text-color-alt">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">ไม่พบข้อมูลวิชาที่สอน</h2>
                            <p className="text-text-color-alt font-body">ไม่มีข้อมูลวิชาที่ท่านรับผิดชอบในขณะนี้</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Subject;