import axios from "axios";
import { useEffect, useState } from "react";
import { Await, useLocation } from "react-router-dom";
import { HOSTNAME } from "../../config";
import { formatTitle } from "../../helper";

function SubjectCheckAttendenceDetail() {
    const location = useLocation();
    const classroom = location.state.classroooms;
    const subject = location.state.subject;
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
                <div>
                    <div className="grid gap-2 md:grid-cols-1 overflow-x-auto">
                        <div className=" border border-gray-200 shadow-md overflow-x-auto">
                            <div className="overflow-x-auto">   
                                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                                    <thead className="ltr:text-left rtl:text-right">
                                        <tr className="text-center h-12 shadow-md bg-blue-400">
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">เลขที่</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">ชื่อ</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">นามสกุล</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">ขาดเรียน(ครั้ง)</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">เข้าสาย(ครั้ง)</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">ลา(ครั้ง)</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">กิจกรรม(ครั้ง)</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">เข้าเรียน(ครั้ง)</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">ร้อยละการเข้าเรียนทั้งหมดรวมลา(ครั้ง)</th>
                                            <th className="whitespace-nowrap px-4 py-2 font-bold text-white">สถานะไม่มีสิทธ์สอบ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {
                                            abStact.length > 0 && 
                                            abStact.map((item,index) => (
                                                <tr className="even:bg-slate-100/70 text-center" key={`${item.stdNo} ${index}`}>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {parseInt(item.stdNo)}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {formatTitle(item.title)}{item.fName}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {item.lName}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {item.attendenceAbsentCount}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {item.attendenceLateCount}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {item.attendenceLeaveCount}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {item.attendenceActivity}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {item.attendenceCount}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {item.attendencePercent}%
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                        {item.canExam}
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                        {
                                            !abStact.length &&
                                            <tr>
                                                <td colSpan={10} className="text-center">ไม่มีข้อมูล</td>
                                            </tr>
                                        }
                                            
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
        </div>
    );
};

export default SubjectCheckAttendenceDetail;