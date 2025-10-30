import { useEffect, useRef, useState } from "react";
import ExportPdfButton from "../../exportPdfButton";
import ExportExcelButton from "../../exportExcelButton";
import { formatAttStatus, formatDateToThai, formatDayOfWeeks } from "../../../helper";
import { useNavigate } from "react-router-dom";
import { HOSTNAME, TIME_ZONE } from "../../../config.js";
import { DateTime } from "luxon";
import { summaryAttendeanceByDay } from "../../../excel.js";

function StudentAttendenceDayDetailList({ studentList, classroomInfo, date }) {
    const ref = useRef(null);
    const navigate = useNavigate();
    const [periodStatus, setPeriodStatus] = useState([]);

    const setupTotalStatus = () => {
        if (!studentList || !studentList.length) return;
        const periodStats = studentList[0].attendance.map((att) => ({
            subjectName: `${att.subjectName}`,
            present: 0,
            late: 0,
            absent: 0,
            activity: 0,
            leave: 0
        }));
        studentList.forEach((student) => {
            student.attendance.forEach((attendance, periodIndex) => {
                if (attendance.attStatus !== null) {
                    const status = attendance.attStatus.toLowerCase();
                    if (periodStats[periodIndex].hasOwnProperty(status)) {
                        periodStats[periodIndex][status]++;
                    }
                }
            });
        });
        setPeriodStatus(periodStats);
    };

    const getAttStatusClassName = (status) => {
        if (!status) return "text-gray-400";

        const statusClasses = {
            'present': 'text-green-600 font-medium',
            'absent': 'text-red-600 font-medium',
            'late': 'text-orange-500 font-medium',
            'activity': 'text-blue-600 font-medium',
            'leave': 'text-purple-600 font-medium'
        };

        return statusClasses[status.toLowerCase()] || "";
    };


    const navigatePdfPage = () => {
        navigate('/classroom/attendance/byday/detail/pdf', {
            state: {
                studentList: studentList,
                periodStatus: periodStatus,
                date: date,
                classroomInfo: classroomInfo
            }
        });
    };

    const handleExportExcel = () => {
        try {
            const dateformat = DateTime.fromISO(`${date}T00:00:00`).setZone(TIME_ZONE);
            const fileName = `สรุปการเข้าเรียนตามรายวันห้องม.${classroomInfo.classLevel}/${classroomInfo.classRoom} วัน${formatDayOfWeeks(dateformat.weekday)} วันที่${formatDateToThai(dateformat.toString())}`;
            summaryAttendeanceByDay(studentList, fileName, classroomInfo, dateformat);
        } catch (error) {
            console.error("Export Excel error:", error);
        }
    };

    useEffect(() => {
        setupTotalStatus();
    }, [studentList, classroomInfo]);

    if (studentList.length === 0) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-10 h-10 border-b-2 rounded-full animate-spin border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            {(studentList.length > 0 && classroomInfo && periodStatus.length > 0) && (
                <div className="flex items-center justify-end mb-4 space-x-2">
                    <ExportExcelButton handelOnClickFunction={handleExportExcel} />
                    <ExportPdfButton onClikFunction={navigatePdfPage} />

                </div>
            )}

            <div className="h-[500px] border border-gray-200 rounded-lg">
                <div className="h-full overflow-auto">
                    <table
                        ref={ref}
                        className="w-full text-sm bg-white border-collapse border-gray-200 rounded-lg"
                    >
                        <thead className="sticky top-0 z-20 bg-white">
                            <tr>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium text-text-color-alt tracking-wider sticky left-0 outline-1 outline-gray-200 bg-white"
                                    colSpan={3}
                                >
                                    คาบที่
                                </th>
                                {studentList[0].attendance.map((attendance, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-3.5 text-left text-xs font-medium text-text-color-alt tracking-wider outline-1 outline-gray-200"
                                        style={{ minWidth: '200px' }}
                                    >
                                        {index + 1}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium text-text-color-alt tracking-wider sticky left-0 outline-1 outline-gray-200 bg-white"
                                    colSpan={3}
                                >
                                    รหัสวิชา
                                </th>
                                {studentList[0].attendance.map((attendance, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-3.5 text-left text-xs font-medium text-text-color-alt tracking-wider outline-1 outline-gray-200"
                                        style={{ minWidth: '200px' }}
                                    >
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {attendance.subjectCode}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium text-text-color-alt tracking-wider sticky left-0 outline-1 outline-gray-200 bg-white"
                                    style={{ minWidth: '80px' }}
                                >
                                    เลขที่
                                </th>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium text-text-color-alt tracking-wider sticky left-[80px] outline-1 outline-gray-200 bg-white"
                                    style={{ minWidth: '128px' }}
                                >
                                    รหัสนักเรียน
                                </th>
                                <th
                                    className="px-6 py-3.5 text-left text-xs font-medium text-text-color-alt tracking-wider sticky left-[208px] outline-1 outline-gray-200 bg-white"
                                    style={{ minWidth: '200px' }}
                                >
                                    ชื่อ-นามสกุล
                                </th>
                                {studentList[0].attendance.map((attendance, index) => (
                                    <th
                                        key={index}
                                        className="px-6 py-3.5 text-left text-xs font-medium text-text-color-alt tracking-wider outline-1 outline-gray-200"
                                        style={{ minWidth: '200px' }}
                                    >
                                        <div className="truncate max-w-[150px]">
                                            วิชา {attendance.subjectName}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {studentList.map((student, index) => (
                                <tr key={index} className="transition-colors duration-150 hover:bg-gray-50">
                                    <td
                                        className="sticky left-0 z-0 px-6 py-4 font-medium bg-white text-text-color outline-1 outline-gray-200"
                                        style={{ minWidth: '80px' }}
                                    >
                                        {student.stdNo}
                                    </td>
                                    <td
                                        className="px-6 py-4 font-medium text-text-color sticky left-[80px] bg-white z-0 outline-1 outline-gray-200"
                                        style={{ minWidth: '128px' }}
                                    >
                                        {student.stdId}
                                    </td>
                                    <td
                                        className="px-6 py-4 font-medium text-text-color sticky left-[208px] bg-white z-0 outline-1 outline-gray-200"
                                        style={{ minWidth: '200px' }}
                                    >
                                        {`${student.fName} ${student.lName}`}
                                    </td>
                                    {student.attendance.map((attendance, idx) => (
                                        <td
                                            key={idx}
                                            className={`px-6 py-4 outline-1 outline-gray-200 ${getAttStatusClassName(attendance.attStatus?.toLowerCase())}`}
                                            style={{ minWidth: '200px' }}
                                        >
                                            {attendance.attStatus != null
                                                ? formatAttStatus(attendance.attStatus.toLowerCase())
                                                : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>

                        <tfoot>
                            {[
                                { label: "มาเรียน", color: "text-green-600", key: "present" },
                                { label: "มาสาย", color: "text-orange-500", key: "late" },
                                { label: "ขาดเรียน", color: "text-red-600", key: "absent" },
                                { label: "ลา", color: "text-purple-600", key: "leave" },
                                { label: "กิจกรรม", color: "text-blue-600", key: "activity" },
                            ].map((row, idx) => (
                                <tr key={idx} className="bg-gray-50">
                                    <td
                                        colSpan={3}
                                        className="sticky left-0 z-20 px-6 py-3 font-medium bg-gray-50 text-text-color outline-1 outline-gray-200"
                                        style={{ width: '280px' }}
                                    >
                                        {row.label}
                                    </td>
                                    {periodStatus.map((period, index) => (
                                        <td
                                            key={index}
                                            className={`px-6 py-3 border-r border-gray-200 font-medium text-center ${row.color}`}
                                            style={{ minWidth: '150px' }}
                                        >
                                            {period[row.key] || 0} คน
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="mt-6">
                <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                    <h4 className="mb-3 text-sm font-medium text-text-color">คำอธิบายสถานะ:</h4>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 bg-green-600 rounded-full"></span>
                            <span className="text-sm">เข้าเรียน</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 bg-red-600 rounded-full"></span>
                            <span className="text-sm">ไม่เข้าเรียน</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 bg-orange-500 rounded-full"></span>
                            <span className="text-sm">มาสาย</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 bg-blue-600 rounded-full"></span>
                            <span className="text-sm">เข้าร่วมกิจกรรม</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 bg-purple-600 rounded-full"></span>
                            <span className="text-sm">ลา</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentAttendenceDayDetailList;
