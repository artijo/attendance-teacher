import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function FilterByClassroomJoinPage() {
    const location = useLocation();
    const { classrooms, activityId, activity } = location.state;
    const [loading, setLoading] = useState({});

    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                            รายงาน PDF สรุปการเข้าร่วม
                        </h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center gap-2 font-body">
                        <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-primary">กิจกรรม:</span> {activity.actName}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                <div className="border-b border-line p-6">
                    <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        ดาวน์โหลดรายงานสรุปจำนวนการเข้าร่วมกิจกรรม
                    </h2>
                    <p className="text-text-color-alt font-body text-sm">
                        ดาวน์โหลดรายงานสรุปจำนวนการเข้าร่วมกิจกรรมแบ่งตามห้องเรียน
                    </p>
                </div>
                
                {classrooms.length > 0 ? (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            <div className="col-span-full space-y-2">
                                <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-md">
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <p className="font-medium">รายงานนี้จะแสดงจำนวนครั้งที่นักเรียนเข้าร่วมกิจกรรม</p>
                                            <p className="mt-1 text-sm">เลือกห้องเรียนที่ต้องการดาวน์โหลดรายงาน PDF</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">   
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-white uppercase bg-primary">
                                    <tr>
                                        <th className="px-6 py-3">ห้องเรียน</th>
                                        <th className="px-6 py-3 text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="font-body">
                                    {classrooms.map((classroom) => (
                                        <tr key={classroom.classId} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                ม.{classroom.className}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link 
                                                    to="/activity/participate/filterbyclassroomjoin/pdfpage"
                                                    state={{
                                                        activityId: activityId,
                                                        className: classroom.className,
                                                        activity: activity,
                                                        // filterRoom: classroom.className.split('ม.')[1]
                                                    }}
                                                >
                                                    <button 
                                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 focus:ring-4 focus:ring-rose-200 transition-colors"
                                                        disabled={loading[classroom.classId]}
                                                    >
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                                                        </svg>
                                                        ดาวน์โหลด PDF
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-lg font-medium mb-1 text-text-color">ไม่พบข้อมูลห้องเรียน</h3>
                        <p className="text-text-color-alt">ไม่มีห้องเรียนที่สามารถดาวน์โหลดข้อมูลได้</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FilterByClassroomJoinPage;
