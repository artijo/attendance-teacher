import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Await, useLocation } from "react-router-dom";
import { HOSTNAME } from "../../config";
import { formatTitle } from "../../helper";
import ExportExcelButton from "../../components/exportExcelButton";
import { Table_to_Excel } from "../../excel";

function SubjectCheckAttendenceDetail() {
    const location = useLocation();
    const classroom = location.state.classroooms;
    const subject = location.state.subject;
    const ref = useRef();
    const [abStact, setAbStact] = useState([]);
    const fetchDataAbstact =  async (subjectId, classroomId) => {
        try{
            const response = await axios.get(`${HOSTNAME}/t/classrooms/classrooms/checkdetail/${subjectId}/${classroomId}`);
            if(response.status === 200) {
                console.log(response.data);
                setAbStact(response.data);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error);
        };
    };

    const handleExportExcelButton = () => {
        if(ref.current){
            const table = ref.current;
            Table_to_Excel(table);
        }
    }

    useEffect(() => {
        if(!classroom || classroom === undefined) return;
        if(!subject || subject==="") return;
        fetchDataAbstact(subject.subId,classroom.classId);

    },[classroom, subject])

    return(
        <div className="mx-auto container">
                
                <h1 className="text-3xl font-bold text-center mb-8">รายละเอียดการเข้าเรียน</h1>
                <p className="text-2xl font-medium mb-8">
                    {
                        subject != null && (
                            <span>วิชา {subject.subNameThai}({subject.subNameEng}) - {subject.subCode}</span> 
                        )
                    }
                </p>
                <ExportExcelButton handelOnClickFunction={handleExportExcelButton}/>
                <div>
                    <div>
                        <div>
                            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">   
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400" ref={ref}>
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-3">เลขที่</th>
                                            <th className="px-6 py-3">ชื่อ</th>
                                            <th className="px-6 py-3">นามสกุล</th>
                                            <th className="px-6 py-3">ขาดเรียน(ครั้ง)</th>
                                            <th className="px-6 py-3">เข้าสาย(ครั้ง)</th>
                                            <th className="px-6 py-3">ลา(ครั้ง)</th>
                                            <th className="px-6 py-3">กิจกรรม(ครั้ง)</th>
                                            <th className="px-6 py-3">เข้าเรียน(ครั้ง)</th>
                                            <th className="px-6 py-3">ร้อยละการเข้าเรียนทั้งหมดรวมลา(ครั้ง)</th>
                                            <th className="px-6 py-3">สถานะไม่มีสิทธ์สอบ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            abStact.length > 0 && 
                                            abStact.map((item,index) => (
                                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200" key={`${item.stdNo} ${index}`}>
                                                    <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                        {parseInt(item.stdNo)}
                                                    </th>
                                                    <td className="px-6 py-4">
                                                        {formatTitle(item.title)}{item.fName}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.lName}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.attendenceAbsentCount}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.attendenceLateCount}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.attendenceLeaveCount}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.attendenceActivity}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.attendenceCount}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.attendencePercent}%
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.canExam}
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                       
                                            
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                {!abStact.length && (
                    <div className="mt-2">
                        <span className="flex flex-col items-center justify-center gap-2 py-3 border rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
                            </svg>
                            ไม่พบข้อมูล
                        </span>
                    </div>
                )}
                
        </div>
    );
};

export default SubjectCheckAttendenceDetail;