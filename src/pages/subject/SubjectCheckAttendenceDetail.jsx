import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HOSTNAME } from "../../config";
import { formatTitle } from "../../helper";
import ExportExcelButton from "../../components/exportExcelButton";
import { summarySubjectIsExam, Table_to_Excel } from "../../excel";
// import FilterByIsExam from "../../components/subject/exportPDF/FilterByIsExam";
import ExportPdfButton from "../../components/exportPdfButton";

function SubjectCheckAttendenceDetail() {
    const location = useLocation();
    const classroom = location.state.classroooms;
    const subject = location.state.subject;
    const ref = useRef();
    const [abStact, setAbStact] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // console.log(classroom);

    const fetchDataAbstact = async (subjectId, classroomId) => {
        setLoading(true);
        try{
            const response = await axios.get(`${HOSTNAME}/t/classrooms/classrooms/checkdetail/${subjectId}/${classroomId}`);
            if(response.status === 200) {
                const studentDataSorted = response.data.sort((a, b) => {
                    return parseInt(a.stdNo) - parseInt(b.stdNo);
                });
                // console.log(studentDataSorted);
                setAbStact(studentDataSorted);
                // console.log(response.data);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcelButton = () => {
        summarySubjectIsExam(abStact, classroom, subject);
    }

    const getAttendancePercentClass = (percent) => {
        if (percent >= 90) return "bg-green-100 text-green-800";
        if (percent >= 80) return "bg-blue-100 text-blue-800";
        if (percent >= 70) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    }

    const navigateToPDFpage = () => {
        navigate("/subjects/attendance/checkdetail/pdfpage", {state: {
            classroomInfo: classroom,
            subject: subject,
            abstact: abStact
        }})
    }

    const getExamStatusClass = (status) => {
        if (status === "มีสิทธิ์สอบ") return "bg-green-100 text-green-800";
        return "bg-red-100 text-red-800";
    }

    useEffect(() => {
        if(!classroom || classroom === undefined) return;
        if(!subject || subject === "") return;
        fetchDataAbstact(subject.subId, classroom.classId);
    },[classroom, subject])

    return(
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                            สรุปสิทธิ์การสอบของนักเรียน
                        </h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center gap-2 font-body">
                        <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-primary">รหัสวิชา:</span> {subject.subCode}
                        </div>
                        <div className="bg-secondary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-secondary">ห้อง:</span> ม.{classroom.classLevel}/{classroom.classRoom}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 mt-6 shadow-sm border border-line">
                    <p className="text-lg font-medium text-text-color font-heading">{subject.subNameThai}</p>
                    <p className="text-text-color-alt font-body">{subject.subNameEng}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                <div className="border-b border-line p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-xl font-bold text-primary font-heading flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2" />
                        </svg>
                        รายงานสรุปการเข้าเรียน
                    </h2>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <ExportExcelButton 
                            handelOnClickFunction={handleExportExcelButton}
                            className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg inline-flex items-center transition-colors flex-1 md:flex-none justify-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                            ส่งออก Excel
                        </ExportExcelButton>
                        <ExportPdfButton
                            onClikFunction={navigateToPDFpage}
                        />
                        
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : abStact.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table ref={ref} className="w-full text-sm text-left">
                            <thead className="text-xs text-white uppercase bg-primary">
                                <tr>
                                    <th className="px-6 py-3">เลขที่</th>
                                    <th className="px-6 py-3">รหัสนักเรียน</th>
                                    <th className="px-6 py-3">ชื่อ-นามสกุล</th>
                                    <th className="px-6 py-3 text-center">ขาดเรียน</th>
                                    <th className="px-6 py-3 text-center">เข้าสาย</th>
                                    <th className="px-6 py-3 text-center">ลา</th>
                                    <th className="px-6 py-3 text-center">กิจกรรม</th>
                                    <th className="px-6 py-3 text-center">เข้าเรียน</th>
                                    <th className="px-6 py-3 text-center">ร้อยละการเข้าเรียน</th>
                                    <th className="px-6 py-3 text-center">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="font-body">
                                {abStact.map((item, index) => (
                                    <tr 
                                        key={`${item.stdNo}-${index}`} 
                                        className="bg-white border-b hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-medium text-text-color">{parseInt(item.stdNo)}</td>
                                        <td className="px-6 py-4 font-medium text-text-color">{item.stdId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {formatTitle(item.title)} {item.fName} {item.lName}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.attendenceAbsentCount > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {item.attendenceAbsentCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.attendenceLateCount > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {item.attendenceLateCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.attendenceLeaveCount > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {item.attendenceLeaveCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.attendenceActivity > 0 ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {item.attendenceActivity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                item.attendenceCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                            }`}>
                                                {item.attendenceCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-12 rounded-full px-2.5 py-0.5 text-xs font-medium ${getAttendancePercentClass(item.attendencePercent)}`}>
                                                {item.attendencePercent}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-24 rounded-full px-2.5 py-0.5 text-xs font-medium ${getExamStatusClass(item.canExam)}`}>
                                                {item.canExam}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                
                                {/* Add summary row for students without exam rights */}
                                <tr className="bg-gray-50 border-t-2 border-gray-300 font-medium">
                                    <td colSpan={9} className="px-6 py-4 text-right">
                                        จำนวนนักเรียนที่ไม่มีสิทธิ์สอบ (มส):
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex justify-center min-w-12 rounded-full px-3 py-1 text-sm font-bold bg-red-100 text-red-800">
                                            {abStact.filter(item => item.canExam === "มส.").length} คน
                                        </span>
                                    </td>
                                </tr>
                                
                                {/* Add summary row for total students */}
                                <tr className="bg-gray-50 border-b-2 border-gray-300 font-medium">
                                    <td colSpan={9} className="px-6 py-4 text-right">
                                        จำนวนนักเรียนทั้งหมด:
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex justify-center min-w-12 rounded-full px-3 py-1 text-sm font-bold bg-gray-100 text-gray-800">
                                            {abStact.length} คน
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-lg font-medium mb-1 text-text-color">ไม่พบข้อมูล</h3>
                        <p className="text-text-color-alt">ยังไม่มีข้อมูลการเข้าเรียนที่บันทึกไว้</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectCheckAttendenceDetail;