import { useState } from "react";
import { Link } from "react-router-dom";

function ClassroomDetailTable({classrooms}) {
    console.log(classrooms);
    const [selectedPage, setSelectedPage] = useState(1);
    const totalPages = Math.ceil(classrooms.classroomMembers.length / 20);
    const currentPage = selectedPage;
    const sliceStudentList = classrooms.classroomMembers.slice((selectedPage - 1) * 20, selectedPage * 20).sort((a,b) => parseInt(a.stdNo) - parseInt(b.stdNo));
    return (
        <>
            <div className="grid gap-2 md:grid-cols-1">
                <div className=" border border-gray-200 shadow-md">
                    <div className="overflow-x-auto">   
                        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                            <thead className="ltr:text-left rtl:text-right">
                                <tr className="text-center h-12 shadow-md bg-blue-400">
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-white">เลขที่</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-white">รหัสนักเรียน</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-white">ชื่อ</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-white">นามสกุล</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-white">คะแนนจิตวิสัย</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-white">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {
                                    sliceStudentList.map((std, index) => (
                                        <tr 
                                            key={`student ${index}`}
                                            className="even:bg-slate-100/70 text-center"
                                        >
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                {parseInt(std.stdNo)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                {std.student.stdId}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                {std.student.fName}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                {std.student.lName}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                {std.behaviourScore} คะแนน
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-2">
                                                <Link 
                                                    to={`/classroom/attendance/student`} 
                                                    state={
                                                        {
                                                            stdId:std.stdId,
                                                            classroomsId: classrooms.classId
                                                        }
                                                    }
                                                >
                                                    <button className="cursor-pointer bg-blue-300/60 text-blue-500 px-5 py-[2px] rounded-sm hover:bg-blue-300/100 hover:text-blue-700">
                                                        การเข้าเรียนตามรายวิชา
                                                    </button>
                                                </Link>
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