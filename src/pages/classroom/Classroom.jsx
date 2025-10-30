import axios from "axios";
import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Classroom() {
    const [classroooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fecthTeacherAdvisorClassroom = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${HOSTNAME}/t/classrooms`);
            if (response.data.not_found) {
                setClassrooms([]);
            } else if (response.status === 200) {
                setClassrooms(response.data);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fecthTeacherAdvisorClassroom();
    }, [])

    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold md:text-3xl text-primary font-heading">ห้องเรียนที่ปรึกษา</h1>
                <div className="w-16 h-1 mt-2 rounded-full bg-secondary"></div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
                </div>
            ) : classroooms.length === 0 ? (
                <div className="p-8 text-center bg-white border shadow-md rounded-xl border-line">
                    <div className="flex justify-center mb-4 text-text-color-alt">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-text-color font-heading">ไม่พบข้อมูลห้องเรียน</h2>
                    <p className="text-text-color-alt font-body">ท่านไม่มีห้องที่เป็นที่ปรึกษาในขณะนี้</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {classroooms.map((item, index) => (
                        <div
                            key={`classroom-${item.classLevel}-${item.classRoom}`}
                            className="relative overflow-hidden transition-all duration-300 bg-white border shadow-md border-line rounded-xl hover:shadow-lg"
                        >
                            {/* ส่วนหัวการ์ด */}
                            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>

                            {/* เนื้อหาการ์ด */}
                            <div className="p-6 space-y-2">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-primary/10 text-primary font-body">
                                            ม.{item.classLevel}/{item.classRoom}
                                        </span>
                                    </div>
                                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-secondary/10 text-secondary font-body">
                                        {item.term.semester}/{item.term.academicYear + 543}
                                    </span>
                                </div>

                                <h3 className="mb-2 text-lg font-bold font-heading text-text-color">
                                    ห้อง ม.{item.classLevel}/{item.classRoom}
                                </h3>

                                <div className="mb-4 space-y-2 font-body text-text-color-alt">
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <p>หลักสูตร {item.classroomType.classTypeNameThai}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <p>ปีการศึกษา {item.term.academicYear + 543}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p>ภาคเรียนที่ {item.term.semester}</p>
                                    </div>
                                </div>

                                
                                <Link
                                    to={'/classroom/detail'}
                                    state={{ classroooms: item }}
                                    className="block w-full"
                                >
                                    <button className="w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-300 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        สิทธ์สอบแต่ละวิชา
                                    </button>
                                </Link>

                                <Link
                                    to={'/classroom/attendance/byday/calendar'}
                                    state={{ classrooms: item }}
                                    className="block w-full text-nowrap"
                                >
                                    <button className="w-full py-2.5 px-4 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        การเข้าเรียนตามวัน
                                    </button>
                                </Link>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Classroom;