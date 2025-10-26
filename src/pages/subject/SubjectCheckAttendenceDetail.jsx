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
    const [summaryStats, setSummaryStats] = useState({
        total: 0,
        canExam: 0,
        cannotExam: 0,
        percentCanExam: 0,
        percentCannotExam: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // console.log(abStact);

    const summarySetup = (abstact) => {
        const cannotExamCount = abstact.filter(student => student.canExam === "มส.").length;
        const canExamCount = abstact.length - cannotExamCount;

        setSummaryStats({
            total: abstact.length,
            canExam: canExamCount,
            cannotExam: cannotExamCount,
            percentCanExam: Math.round((canExamCount / abstact.length) * 100),
            percentCannotExam: Math.round((cannotExamCount / abstact.length) * 100)
        });
    }

    const fetchDataAbstact = async (subjectId, classroomId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${HOSTNAME}/t/classrooms/classrooms/checkdetail/${subjectId}/${classroomId}`);
            if (response.status === 200) {
                const studentDataSorted = response.data.sort((a, b) => {
                    return parseInt(a.stdNo) - parseInt(b.stdNo);
                });
                summarySetup(studentDataSorted);
                setAbStact(studentDataSorted);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
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
        navigate("/subjects/attendance/checkdetail/pdfpage", {
            state: {
                classroomInfo: classroom,
                subject: subject,
                studentList: abStact
            }
        })
    }

    const getExamStatusClass = (status) => {
        if (status === "มีสิทธิ์สอบ") return "bg-green-100 text-green-800";
        return "bg-red-100 text-red-800";
    }

    useEffect(() => {
        if (!classroom || classroom === undefined) return;
        if (!subject || subject === "") return;
        fetchDataAbstact(subject.subId, classroom.classId);
    }, [classroom, subject])

    // Create a summary component
    const ExamEligibilitySummary = () => {
        if (abStact.length === 0) return null;

        return (
            <div className="grid grid-cols-1 gap-4 px-6 mt-6 mb-6 md:grid-cols-3">
                <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-blue-700">นักเรียนทั้งหมด</h4>
                            <p className="mt-1 text-2xl font-bold text-blue-800">{summaryStats.total} คน</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="p-4 border border-green-100 rounded-lg bg-green-50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-green-700">มีสิทธิ์สอบ</h4>
                            <div className="flex items-baseline mt-1">
                                <p className="text-2xl font-bold text-green-800">{summaryStats.canExam} คน</p>
                                <p className="ml-2 text-sm text-green-700">({summaryStats.percentCanExam}%)</p>
                            </div>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="p-4 border border-red-100 rounded-lg bg-red-50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-red-700">ไม่มีสิทธิ์สอบ (มส)</h4>
                            <div className="flex items-baseline mt-1">
                                <p className="text-2xl font-bold text-red-800">{summaryStats.cannotExam} คน</p>
                                <p className="ml-2 text-sm text-red-700">({summaryStats.percentCannotExam}%)</p>
                            </div>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl text-primary font-heading">
                            สรุปสิทธิ์การสอบของนักเรียน
                        </h1>
                        <div className="w-16 h-1 mt-2 rounded-full bg-secondary"></div>
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

                <div className="p-4 mt-6 bg-white border rounded-lg shadow-sm border-line">
                    <p className="text-lg font-medium text-text-color font-heading">{subject.subNameThai}</p>
                    <p className="text-text-color-alt font-body">{subject.subNameEng}</p>
                </div>
            </div>

            <div className="overflow-hidden bg-white border shadow-md rounded-xl border-line">
                <div className="flex flex-col items-start justify-between gap-4 p-4 border-b border-line md:flex-row md:items-center">
                    <h2 className="flex items-center text-xl font-bold text-primary font-heading">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>

                        รายงานสรุปการเข้าเรียน
                    </h2>

                    <div className="flex w-full gap-3 md:w-auto">
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
                <ExamEligibilitySummary />
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
                    </div>
                ) : abStact.length > 0 ? (
                    <div className="overflow-auto h-[500px]">
                        <table ref={ref} className="w-full text-sm text-left">
                            <thead className="sticky top-0 z-20 text-xs text-white uppercase bg-primary">
                                <tr>
                                    <th className="sticky left-0 z-20 px-6 py-3 bg-primary" style={{ minWidth: '80px' }}>เลขที่</th>
                                    <th className="px-6 py-3 sticky left-[80px] bg-primary z-20" style={{ minWidth: '128px' }}>รหัสนักเรียน</th>
                                    <th className="px-6 py-3 sticky left-[208px] bg-primary z-20" style={{ minWidth: '200px' }}>ชื่อ-นามสกุล</th>
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
                                        className="transition-colors bg-white border-b hover:bg-gray-50"
                                    >
                                        <td className="sticky left-0 px-6 py-4 font-medium bg-white text-text-color" style={{ minWidth: '80px' }}>{parseInt(item.stdNo)}</td>
                                        <td className="px-6 py-4 font-medium text-text-color sticky left-[80px] bg-white" style={{ minWidth: '128px' }}>{item.stdId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap sticky left-[208px] bg-white" style={{ minWidth: '200px' }}>
                                            {formatTitle(item.title)} {item.fName} {item.lName}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${item.attendenceAbsentCount > 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                                                }`}>
                                                {item.attendenceAbsentCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${item.attendenceLateCount > 0 ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
                                                }`}>
                                                {item.attendenceLateCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${item.attendenceLeaveCount > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                                                }`}>
                                                {item.attendenceLeaveCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${item.attendenceActivity > 0 ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-800"
                                                }`}>
                                                {item.attendenceActivity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex justify-center min-w-6 rounded-full px-2.5 py-0.5 text-xs font-medium ${item.attendenceCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
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
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="10" className="px-4 py-3 text-text-color-alt">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs">
                                                รายงานนี้ไม่เป็นทางการ กรุณาตรวจสอบกับครูผู้สอนก่อนการประกาศอย่างเป็นทางการ
                                            </span>
                                            <span className="text-xs">
                                                นักเรียนทั้งหมด: {abStact.length} คน
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mb-1 text-lg font-medium text-text-color">ไม่พบข้อมูล</h3>
                        <p className="text-text-color-alt">ยังไม่มีข้อมูลการเข้าเรียนที่บันทึกไว้</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectCheckAttendenceDetail;