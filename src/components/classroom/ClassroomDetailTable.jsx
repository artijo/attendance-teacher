import { useState } from "react";
import { Link } from "react-router-dom";
import ExportExcelButton from "../exportExcelButton";
import { ClassroomsAbstacTable } from "../../excel";

function ClassroomDetailTable({classrooms}) {
    // console.log(classrooms);
    const [selectedPage, setSelectedPage] = useState(1);
    const totalPages = Math.ceil(classrooms.classroomMembers.length / 20);
    const currentPage = selectedPage;
    const sliceStudentList = classrooms.classroomMembers.slice((selectedPage - 1) * 20, selectedPage * 20).sort((a,b) => parseInt(a.stdNo) - parseInt(b.stdNo));
    return (
        <>
            {/* <ExportExcelButton handelOnClickFunction={handleExportExcelButton}/> */}
            <div>
                <div>
                    <div className="relative overflow-x-auto shadow-md sm:rounded-2xl">   
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                                {
                                    sliceStudentList.map((std, index) => (
                                        <tr 
                                            key={`student ${index}`}
                                            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                                        >
                                            <td className="px-6 py-4">
                                                {parseInt(std.stdNo)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {std.student.stdId}
                                            </td>
                                            <td className="px-6 py-4">
                                                {std.student.fName}
                                            </td>
                                            <td className="px-6 py-4">
                                                {std.student.lName}
                                            </td>
                                            <td className="px-6 py-4">
                                                {std.behaviourScore} คะแนน
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className='inline-flex overflow-hidden rounded-md border bg-white shadow-sm'>
                                                    <Link 
                                                        to={`/classroom/attendance/student`} 
                                                        state={
                                                            {
                                                                stdId:std.stdId,
                                                                classroomsId: classrooms.classId,
                                                                className: `ม.${classrooms.classLevel}/${classrooms.classRoom}`
                                                            }
                                                        }
                                                    >
                                                        <button 
                                                            className="text-xs inline-flex items-center gap-2 p-3 text-blue-600 hover:bg-gray-50 focus:relative"

                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                            </svg>
                                                            การเข้าเรียนตามรายวิชา
                                                        </button>
                                                    </Link>
                                                </span>
                                                
                                            </td>
                                            
                                        </tr>
                                    ))
                                                                    
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="rounded-b-lg border-t border-gray-200 px-4 py-2">
                <ol className="flex flex-wrap justify-end gap-1 text-xs font-medium">
                    <li>
                        <button
                            onClick={() => setSelectedPage(currentPage - 1)}
                            className={`inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 ${
                                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Prev Page</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page}>
                            <button
                                onClick={() => setSelectedPage(page)}
                                className={`block size-8 rounded border ${
                                    currentPage === page
                                        ? "border-blue-600 bg-blue-600 text-white"
                                        : "border-gray-100 bg-white text-gray-900"
                                } text-center leading-8`}
                            >
                                {page}
                            </button>
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={() => setSelectedPage(currentPage + 1)}
                            className={`inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 ${
                                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Next Page</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </li>
                </ol>
            </div>
                
        </>
    );
};


export default ClassroomDetailTable;