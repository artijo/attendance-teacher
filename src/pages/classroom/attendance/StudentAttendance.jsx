import axios from "axios";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import { useEffect,useState } from "react";

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
            <div className="grid grid-cols-1 gap-8">
                <h1 className="text-3xl font-bold text-start">
                    รายละเอียดการเข้าเรียนตามรายวิชาของ <span>{
                        studentInfo != null &&
                        `${studentInfo.studentInfo.student.fName} ${studentInfo.studentInfo.student.lName}` 
                    }</span>
                </h1>
                <div className="grid gap-2 md:grid-cols-1 overflow-x-auto">
                    <div className=" border border-gray-200 shadow-md overflow-x-auto">
                        <div className="overflow-x-auto">   
                            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                                <thead className="ltr:text-left rtl:text-right">
                                    <tr className="text-center h-12 shadow-md bg-blue-400">
                                        <th className="whitespace-nowrap px-4 py-2 font-bold text-white">วิชา</th>
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
                                        studentInfo != null &&
                                        Object.keys(studentInfo).map( (key, index) =>{
                                            if(index === 0) return;
                                            return (
                                                
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
                                            )
                                        })
                                        
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

export default StudentAttendance;