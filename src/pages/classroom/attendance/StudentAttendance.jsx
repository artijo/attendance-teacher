import axios from "axios";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import { useEffect, useState } from "react";

function StudentAttendance(){
    const location = useLocation();
    const classroomId = location.state.classroomsId;
    const stdId = location.state.stdId;
    const [studentInfo, setStudentInfo] = useState(null);

    async function getSubjectName(subId) {
        try{
            const response = await axios.get(`${HOSTNAME}/t/subject/${subId}`)
            if(response.status === 200){
                // console.log(response.data);
                // setStudentInfo(response.data);
                return response.data
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error)
        }
        
    }

    async function changeIdToName(studentInfo) {
        const ObjectKeys = await Object.keys(studentInfo).reduce(async (prevPromise, curr, index) => {
            const prev = await prevPromise;
            // console.log("curr" + curr);
            if(index === 0) return {studentInfo: studentInfo[curr]};
            const subjectName = await getSubjectName(curr);
            return {
                ...prev,
                [subjectName.subNameThai]: studentInfo[curr]
            };
        }, Promise.resolve({}));
        setStudentInfo(ObjectKeys);
    }

    const fecthAttendenceStudent = async () => {
        try{
            const response =  await axios.get(`${HOSTNAME}/t/classrooms/${classroomId}/${stdId}`);
            if(response.status === 200){
                console.log(response.data);
                setStudentInfo(response.data);
                changeIdToName(response.data);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error);
        }
    }

    useEffect(() => {
        fecthAttendenceStudent();
    },[])
 

    return(
        <div className="mx-auto container">
            <div>
                <h1 className="text-3xl font-bold text-start mb-8">
                    รายละเอียดการเข้าเรียนตามรายวิชาของ <span>{
                        studentInfo != null &&
                        `${studentInfo.studentInfo.student.fName} ${studentInfo.studentInfo.student.lName}` 
                    }</span>
                </h1>
                <div className="grid gap-2 md:grid-cols-1">
                    <div className=" border border-gray-200 shadow-md">
                        <div className="overflow-x-auto">   
                            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                                <thead className="ltr:text-left rtl:text-right">
                                    <tr className="text-center h-12 shadow-md">
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">วิชา</th>
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">ขาดเรียน(ครั้ง)</th>
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">เข้าสาย(ครั้ง)</th>
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">ลา(ครั้ง)</th>
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">กิจกรรม(ครั้ง)</th>
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">เข้าเรียน(ครั้ง)</th>
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">ร้อยละการเข้าเรียนทั้งหมดรวมลา(ครั้ง)</th>
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-gray-900">สถานะไม่มีสิทธ์สอบ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {
                                        studentInfo != null &&
                                        Object.keys(studentInfo).map( (key, index) =>{
                                            if(index === 0) return;
                                            return (
                                                <>
                                                    <tr className="even:bg-slate-100/70 text-center" key={`${key} ${index}`}>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {key}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {studentInfo[key].attendenceAbsentCount}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {studentInfo[key].attendenceLateCount}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {studentInfo[key].attendenceLeaveCount}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {studentInfo[key].attendenceActivity}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {studentInfo[key].attendenceCount}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {studentInfo[key].attendencePercent}%
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                                                            {studentInfo[key].canExam}
                                                        </td>
                                                    </tr>
                                                    
                                                </>
                                                
                                                
                                            )
                                        })
                                        
                                    }
                                    {/* {
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
                                        
                                    } */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        
        
        </div>
    );
};

export default StudentAttendance;