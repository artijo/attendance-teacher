import { useState } from "react";
import { Link } from "react-router-dom";
import ExportExcelButton from "../exportExcelButton";

function ClassroomDetailTable({classrooms}) {
    const [selectedPage, setSelectedPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filter students based on search term
    const filteredStudents = classrooms.classroomMembers.filter(std => 
        std.student.stdId.toLowerCase().includes(searchTerm.toLowerCase()) || 
        std.student.fName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        std.student.lName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const totalPages = Math.ceil(filteredStudents.length / 20);
    const currentPage = selectedPage;
    const sliceStudentList = filteredStudents
        .slice((selectedPage - 1) * 20, selectedPage * 20)
        .sort((a,b) => parseInt(a.stdNo) - parseInt(b.stdNo));
    
    return (
        <>
            <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-text-color-alt" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="bg-gray-50 border border-line text-text-color text-sm rounded-lg focus:ring-primary focus:border-primary block w-full ps-10 p-2.5"
                        placeholder="ค้นหานักเรียน..."
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setSelectedPage(1);
                        }}
                    />
                </div>
                
                <ExportExcelButton
                    // อาจเพิ่มฟังก์ชันส่งออกได้ที่นี่
                    className="text-sm bg-primary hover:bg-accent text-white font-medium py-2.5 px-4 rounded-lg inline-flex items-center transition-colors"
                >
                    <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                    <span>ส่งออกรายงาน Excel</span>
                </ExportExcelButton>
            </div>
            
            <div className="overflow-x-auto">   
                <table className="w-full text-sm text-left">
                    <thead className="text-sm text-white uppercase bg-primary">
                        <tr>
                            <th className="px-6 py-3">เลขที่</th>
                            <th className="px-6 py-3">รหัสนักเรียน</th>
                            <th className="px-6 py-3">ชื่อ</th>
                            <th className="px-6 py-3">นามสกุล</th>
                            <th className="px-6 py-3">คะแนนจิตวิสัย</th>
                            <th className="px-6 py-3">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sliceStudentList.length > 0 ? (
                            sliceStudentList.map((std, index) => (
                                <tr 
                                    key={`student-${std.stdId}`}
                                    className="bg-white border-b hover:bg-gray-50 font-body"
                                >
                                    <td className="px-6 py-4 font-medium">
                                        {parseInt(std.stdNo)}
                                    </td>
                                    <td className="px-6 py-4 text-text-color-alt">
                                        {std.student.stdId}
                                    </td>
                                    <td className="px-6 py-4">
                                        {std.student.fName}
                                    </td>
                                    <td className="px-6 py-4">
                                        {std.student.lName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            std.behaviourScore >= 80 ? "bg-green-100 text-green-800" :
                                            std.behaviourScore >= 60 ? "bg-blue-100 text-blue-800" :
                                            "bg-red-100 text-red-800"
                                        }`}>
                                            {std.behaviourScore} คะแนน
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link 
                                            to={`/classroom/attendance/student`} 
                                            state={{
                                                stdId:std.stdId,
                                                classroomsId: classrooms.classId,
                                                className: `ม.${classrooms.classLevel}/${classrooms.classRoom}`
                                            }}
                                            className="text-xs inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-primary hover:bg-accent transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            การเข้าเรียนตามรายวิชา
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="bg-white">
                                <td colSpan="6" className="px-6 py-4 text-center text-text-color-alt">
                                    ไม่พบข้อมูลนักเรียน
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {filteredStudents.length > 0 && (
                <div className="flex items-center justify-between p-4 border-t border-line">
                    <div className="text-text-color-alt text-sm font-body">
                        แสดง {((currentPage - 1) * 20) + 1} ถึง {Math.min(currentPage * 20, filteredStudents.length)} จาก {filteredStudents.length} รายการ
                    </div>
                    
                    <div className="flex gap-1 text-xs font-medium">
                        <button
                            onClick={() => setSelectedPage(currentPage - 1)}
                            className={`inline-flex size-8 items-center justify-center rounded border border-line bg-white text-text-color rtl:rotate-180 ${
                                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                            }`}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">หน้าก่อนหน้า</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setSelectedPage(page)}
                                className={`block size-8 rounded ${
                                    currentPage === page
                                        ? "border-primary bg-primary text-white"
                                        : "border border-line bg-white text-text-color hover:bg-gray-50"
                                } text-center leading-8`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setSelectedPage(currentPage + 1)}
                            className={`inline-flex size-8 items-center justify-center rounded border border-line bg-white text-text-color rtl:rotate-180 ${
                                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                            }`}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">หน้าถัดไป</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClassroomDetailTable;