import { useState } from "react";
import { Link } from "react-router-dom";

function ClassroomDetailTable({classrooms}) {
    const page = Math.ceil(classrooms.classroomMembers.length/20);
    console.log(classrooms);
    const [seletedPage, setSeletedPage] = useState(1);
    const sliceStudentList = classrooms.classroomMembers.slice((seletedPage - 1) * 20, seletedPage * 20).sort((a,b) => parseInt(a.stdNo) - parseInt(b.stdNo));
    return (
        <>
            <div className="grid gap-2 md:grid-cols-1">
                <div className=" border border-gray-200 shadow-md">
                    <div className="overflow-x-auto">   
                        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                            <thead className="ltr:text-left rtl:text-right">
                                <tr className="text-center h-12 shadow-md">
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">เลขที่</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">รหัสนักเรียน</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">ชื่อ</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">นามสกุล</th>
                                    <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">คะแนนจิตวิสัย</th>
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
                                                <Link to={``} state={{stdId:std.stdId}}>
                                                    <button className="cursor-pointer bg-blue-300/60 text-blue-500 px-5 py-[2px] rounded-sm hover:bg-blue-300/100 hover:text-blue-700">
                                                        การเข้าเรียนตามรายวิชา
                                                    </button>
                                                </Link>
                                            </td>
                                            
                                        </tr>
                                    ))
                                    // sliceDayList.map((day, index) => (
                                    //     <tr key={index} className="even:bg-slate-100/70 text-center">
                                    //         {/* {
                                    //             <td className="whitespace-nowrap px-4 py-2 text-gray-700">{((seletedPage - 1)*10)+(index+1) }</td>
                                    //         }
                                    //         <td className="whitespace-nowrap px-4 py-2 text-gray-700">{formatDateToThai(day)}</td>
                                    //         <td className="whitespace-nowrap px-4 py-2 text-blue-700 cursor-pointer">
                                    //             <Link to={`/attendances/details/byday`} state={{ classroomId: classroomId, date: day }} >
                                    //             <button className="cursor-pointer bg-blue-300/60 text-blue-500 px-5 py-[2px] rounded-sm hover:bg-blue-300/100 hover:text-blue-700">รายละเอียด</button>
                                    //             </Link>
                                    //         </td> */}
                                    //     </tr>
                                    // ))
                                    
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        
        </>
    );
};


export default ClassroomDetailTable;