import axios from "axios";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import { useEffect,useRef,useState } from "react";
import PaticepateBySubject from "../../../components/classroom/attendance/PaticepateBySubject";
import { formatTitle } from "../../../helper";
import { tabletojson } from "tabletojson";
import { Table_to_Excel } from "../../../excel";
import ExportExcelButton from "../../../components/exportExcelButton";

function StudentAttendance(){
    const location = useLocation();
    const classroomId = location.state.classroomsId;
    const className = location.state.className;
    const stdId = location.state.stdId;
    const [studentInfo, setStudentInfo] = useState(null);
    const studentInfoMation = studentInfo != null && studentInfo.studentInfo.student;
    const tableRef = useRef(null);

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
                // console.log(response.data);
                // setStudentInfo(response.data);
                changeIdToName(response.data);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error);
        }
    }

    const handleDownloandExcel = (table,studentInfo) => {
        Table_to_Excel(table, `สรุปการเข้าเรียนตามวิชาของ ${formatTitle(studentInfo.title)} ${studentInfo.fName} ${studentInfo.lName}`, "สรุปการเข้าเรียนตามวิชา");
    };

    useEffect(() => {
        fecthAttendenceStudent();
    },[])
 

    return(
        <div className="mx-auto container">
            <div className="grid grid-cols-1 gap-8">
                <div>
                    <h1 className="text-lg font-bold text-center">
                        รายละเอียดการเข้าเรียนตามรายวิชาของ <span>{
                            `${formatTitle(studentInfoMation.title)} ${studentInfoMation.fName} ${studentInfoMation.lName}` 
                        }</span>
                    </h1>

                </div>
                <div>
                    <div>
                        {tableRef.current != null &&
                            <div className="flex w-fit ml-auto">
                                <ExportExcelButton
                                    handelOnClickFunction={() => handleDownloandExcel(tableRef.current,studentInfoMation )}
                                />
                                <PaticepateBySubject
                                    personInfo={studentInfoMation}
                                    studentInfo={studentInfo}
                                    className={className}
                                />
                            </div>
                        }
                        <div className="relative overflow-x-auto shadow-md sm:rounded-2xl">
                            <table ref={tableRef}  className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">วิชา</th>
                                        <th className="px-6 py-3">ขาดเรียน(ครั้ง)</th>
                                        <th className="px-6 py-3">เข้าสาย(ครั้ง)</th>
                                        <th className="px-6 py-3">ลา(ครั้ง)</th>
                                        <th className="px-6 py-3">กิจกรรม(ครั้ง)</th>
                                        <th className="px-6 py-3">เข้าเรียน(ครั้ง)</th>
                                        <th className="px-6 py-3">ร้อยละการเข้าเรียนทั้งหมดรวมลา(ครั้ง)</th>
                                        <th className="px-6 py-3">สถานะไม่มีสิทธ์สอบ</th>
                                    </tr>
                                </thead>
                                <tbody >
                                    {
                                        studentInfo != null &&
                                        Object.keys(studentInfo).map( (key, index) =>{
                                            if(index === 0) return;
                                            return (
                                                
                                                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200" key={`${key} ${index}`}>
                                                        <th  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                            {key}
                                                        </th>
                                                        <td  className="px-6 py-4">
                                                            {studentInfo[key].attendenceAbsentCount}
                                                        </td>
                                                        <td  className="px-6 py-4">
                                                            {studentInfo[key].attendenceLateCount}
                                                        </td>
                                                        <td  className="px-6 py-4">
                                                            {studentInfo[key].attendenceLeaveCount}
                                                        </td>
                                                        <td  className="px-6 py-4">
                                                            {studentInfo[key].attendenceActivity}
                                                        </td>
                                                        <td  className="px-6 py-4">
                                                            {studentInfo[key].attendenceCount}
                                                        </td>
                                                        <td  className="px-6 py-4">
                                                            {studentInfo[key].attendencePercent}%
                                                        </td>
                                                        <td  className="px-6 py-4">
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