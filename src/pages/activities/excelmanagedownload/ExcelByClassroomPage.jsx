import { useLocation } from "react-router-dom";
import { abstactActivityFilterByClassroom } from "../../../excel";
import { useState } from "react";

function FilterExcelPage() {
    const location = useLocation();
    const { classrooms, activityId, activity } = location.state;
    const [loading, setLoading] = useState({});

    const handelExportExcel = async (activityId, filterRoom, activity) => {
        setLoading({ ...loading, [filterRoom]: true });
        try {
            await abstactActivityFilterByClassroom(activityId, filterRoom, activity);
        } finally {
            setLoading({ ...loading, [filterRoom]: false });
        }
    };

    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                            สรุปการเข้าร่วมกิจกรรม
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        ดาวน์โหลดรายงานแบ่งตามห้องเรียน
                    </h2>
                    <p className="text-text-color-alt font-body text-sm">
                        ดาวน์โหลดข้อมูลสรุปการเข้าร่วมกิจกรรม โดยแบ่งตามห้องและแต่ละวันนั้นมีใครเข้าร่วมบ้าง
                    </p>
                </div>
                
                {classrooms.length > 0 ? (
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
                                            <button
                                                onClick={() => handelExportExcel(activityId, classroom.className, activity)}
                                                disabled={loading[classroom.className]}
                                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                {loading[classroom.className] ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        กำลังดาวน์โหลด...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                                                        </svg>
                                                        ดาวน์โหลด Excel
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

export default FilterExcelPage;
