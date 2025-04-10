import axios from "axios";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import { useEffect, useRef, useState } from "react";
import PaticepateBySubject from "../../../components/classroom/attendance/PaticepateBySubject";
import { formatTitle } from "../../../helper";
import ExportExcelButton from "../../../components/exportExcelButton";
import { Table_to_Excel } from "../../../excel.js"

function StudentAttendance(){
    const location = useLocation();
    const classroomId = location.state.classroomsId;
    const className = location.state.className;
    const stdId = location.state.stdId;
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const studentInfoMation = studentInfo != null && studentInfo.studentInfo.student;
    const tableRef = useRef(null);

    async function getSubjectName(subId) {
        try{
            const response = await axios.get(`${HOSTNAME}/t/subject/${subId}`)
            if(response.status === 200){
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
        setLoading(true);
        try{
            const response = await axios.get(`${HOSTNAME}/t/classrooms/${classroomId}/${stdId}`);
            if(response.status === 200){
                changeIdToName(response.data);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDownloandExcel = (table,studentInfo) => {
        Table_to_Excel(table, `สรุปการเข้าเรียนตามวิชาของ ${formatTitle(studentInfo.title)} ${studentInfo.fName} ${studentInfo.lName}`, "สรุปการเข้าเรียนตามวิชา");
    };

    useEffect(() => {
        fecthAttendenceStudent();
    },[])
 
    const getAttendancePercentClass = (percent) => {
        if (percent >= 90) return "bg-green-100 text-green-800";
        if (percent >= 80) return "bg-blue-100 text-blue-800";
        if (percent >= 70) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    }

    const getExamStatusClass = (status) => {
        if (status === "มีสิทธิ์สอบ") return "bg-green-100 text-green-800";
        return "bg-red-100 text-red-800";
    }
    
    return(
        <div>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                                    การเข้าเรียนตามรายวิชา
                                </h1>
                                <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                            </div>
                            
                            <div className="flex items-center gap-2 font-body">
                                <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                                    <span className="font-medium text-primary">ชื่อนักเรียน:</span> {studentInfoMation && `${formatTitle(studentInfoMation.title)} ${studentInfoMation.fName} ${studentInfoMation.lName}`}
                                </div>
                                <div className="bg-secondary/10 px-3 py-1.5 rounded-lg">
                                    <span className="font-medium text-secondary">ชั้น:</span> {className}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 mt-6 shadow-sm border border-line">
                            {studentInfo && studentInfo.studentInfo && (
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-body">
                                    <div className="space-y-1">
                                        <p className="text-text-color-alt">รหัสนักเรียน</p>
                                        <p className="font-medium text-text-color">{studentInfoMation.stdId}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-text-color-alt">เบอร์โทรศัพท์</p>
                                        <p className="font-medium text-text-color">{studentInfoMation.phone || "-"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-text-color-alt">อีเมล</p>
                                        <p className="font-medium text-text-color">{studentInfoMation.email || "-"}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                        <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-line">
                            <h2 className="text-xl font-medium text-primary font-heading">สรุปการเข้าเรียน</h2>
                            
                            {tableRef.current != null && (
                                <div className="flex gap-2">
                                    <ExportExcelButton
                                        handelOnClickFunction={() => handleDownloandExcel(tableRef.current, studentInfoMation)}
                                        className="text-sm bg-primary hover:bg-accent text-white font-medium py-2.5 px-4 rounded-lg inline-flex items-center transition-colors"
                                    >
                                        <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                                        </svg>
                                        ส่งออกรายงาน Excel
                                    </ExportExcelButton>
                                    
                                    <PaticepateBySubject
                                        personInfo={studentInfoMation}
                                        studentInfo={studentInfo}
                                        className={className}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table ref={tableRef} className="w-full text-sm text-left">
                                <thead className="text-sm text-white uppercase bg-primary">
                                    <tr>
                                        <th className="px-6 py-3">วิชา</th>
                                        <th className="px-6 py-3 text-center">ขาดเรียน</th>
                                        <th className="px-6 py-3 text-center">เข้าสาย</th>
                                        <th className="px-6 py-3 text-center">ลา</th>
                                        <th className="px-6 py-3 text-center">กิจกรรม</th>
                                        <th className="px-6 py-3 text-center">เข้าเรียน</th>
                                        <th className="px-6 py-3 text-center">ร้อยละการเข้าเรียน</th>
                                        <th className="px-6 py-3 text-center">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentInfo ? (
                                        Object.keys(studentInfo).map((key, index) => {
                                            if(index === 0) return null;
                                            const subjectData = studentInfo[key];
                                            
                                            return (
                                                <tr className="bg-white border-b hover:bg-gray-50 font-body" key={`${key}-${index}`}>
                                                    <td className="px-6 py-4 font-medium">
                                                        {key}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block min-w-6 text-center rounded-full px-2 py-0.5 text-xs font-medium ${subjectData.attendenceAbsentCount > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                                                            {subjectData.attendenceAbsentCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block min-w-6 text-center rounded-full px-2 py-0.5 text-xs font-medium ${subjectData.attendenceLateCount > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                                                            {subjectData.attendenceLateCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block min-w-6 text-center rounded-full px-2 py-0.5 text-xs font-medium ${subjectData.attendenceLeaveCount > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                                                            {subjectData.attendenceLeaveCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block min-w-6 text-center rounded-full px-2 py-0.5 text-xs font-medium ${subjectData.attendenceActivity > 0 ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800"}`}>
                                                            {subjectData.attendenceActivity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block min-w-6 text-center rounded-full px-2 py-0.5 text-xs font-medium ${subjectData.attendenceCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                                            {subjectData.attendenceCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block min-w-12 text-center rounded-full px-2 py-0.5 text-xs font-medium ${getAttendancePercentClass(subjectData.attendencePercent)}`}>
                                                            {subjectData.attendencePercent}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block min-w-24 text-center rounded-full px-2 py-0.5 text-xs font-medium ${getExamStatusClass(subjectData.canExam)}`}>
                                                            {subjectData.canExam}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr className="bg-white">
                                            <td colSpan="8" className="px-6 py-4 text-center text-text-color-alt">
                                                ไม่พบข้อมูลการเข้าเรียน
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StudentAttendance;