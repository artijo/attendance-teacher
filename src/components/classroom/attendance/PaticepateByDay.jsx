import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import { dateTimeFormat } from "../../../helper";

function PaticepateByDay() {
    const location = useLocation();
    const { date, student, classroom } = location.state;
    const [totalStatus, setTotalStatus] = useState(null);
    const [attendanceAbstact, setAttendanceAbstact] = useState(null);

    const setuptotalstatus = () => {
        const updatedTotalStatus = {
            present: 0,
            late: 0,
            absent: 0,
            activity: 0,
            leave: 0
        };
        attendanceAbstact.attendance.forEach((attendance) => {
            if (attendance.attStatus !== null) {
                if (attendance.attStatus.toLowerCase() === 'present') {
                    updatedTotalStatus.present++;
                } else if (attendance.attStatus.toLowerCase() === 'late') {
                    updatedTotalStatus.late++;
                } else if (attendance.attStatus.toLowerCase() === 'absent') {
                    updatedTotalStatus.absent++;
                } else if (attendance.attStatus.toLowerCase() === 'activity') {
                    updatedTotalStatus.activity++;
                } else if (attendance.attStatus.toLowerCase() === 'leave') {
                    updatedTotalStatus.leave++;
                }
            };
        });
        // console.log(updatedTotalStatus);
        setTotalStatus(updatedTotalStatus);
    }

    const formatAttStatus = (status) => {

        switch (status) {
            case 'present': {
                return 'เข้าเรียน';
            }
            case 'absent': {
                return 'ไม่เข้าเรียน';
            }
            case 'late': {
                return 'มาสาย';
            }
            case 'activity': {

                return 'เข้าเรียนกิจกรรม';
            }
            case 'leave': {

                return 'ลา';
            }
            default:
                return status;
        }
    };

    const getPaticipateResult = async () => {
        try {
            const data = {
                date: date,
                classroom: classroom,
                student: student
            }
            const response = await axios.post(`${HOSTNAME}/t/attendence/byday`, data);
            setAttendanceAbstact(response.data);
            console.log(response.data);
        } catch (err) {
            console.error(err);
        };
    };

    useEffect(() => {
        getPaticipateResult()
    }, [])

    useEffect(() => {
        if (attendanceAbstact != null) {
            setuptotalstatus();
        }

    }, [attendanceAbstact]);

    return (
        <div>
            {attendanceAbstact != null ? (
                <div className="relative border overflow-x-auto shadow-md sm:rounded-2xl">
                    <table className="w-full border-collapse text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 border-r border-b" colSpan={3}>
                                    คาบที่
                                </th>
                                {
                                    attendanceAbstact.attendance.map((attendance, index) => (
                                        <th className="px-6 py-4 border-r border-b" key={index}>{index + 1}({dateTimeFormat(attendance.studingTimeDate)})</th>
                                    ))
                                }
                            </tr>
                            <tr>
                                <th className="px-6 py-4 border-r border-b" colSpan={3}>
                                    รหัสวิชา
                                </th>
                                {
                                    attendanceAbstact.attendance.map((attendance, index) => (
                                        <th className="px-6 py-4 border-r border-b" key={index}>{attendance.subjectCode}</th>
                                    ))
                                }
                            </tr>
                            <tr>
                                <th className="px-6 py-4 border-r border-b">เลขที่</th>
                                <th className="px-6 py-4 border-r border-b">รหัสนักศึกษา</th>
                                <th className="px-6 py-4 border-r border-b">ชื่อ-นามสกุล</th>
                                {
                                    attendanceAbstact.attendance.map((attendance, index) => (
                                        <th className="px-6 py-4 border-r border-b" key={index}>{attendance.subjectName}</th>
                                    ))
                                }
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                                <td className="px-6 py-4 border-r border-b">{attendanceAbstact.stdNo}</td>
                                <td className="px-6 py -4 border-r border-b">{attendanceAbstact.stdId}</td>
                                <td className="px-6 py-4 border-r border-b">{attendanceAbstact.fName} {student.lName}</td>
                                {
                                    attendanceAbstact.attendance.map((attendance, index) => (
                                        <td className="px-6 py-4 border-r border-b" key={index}>{attendance.attStatus != null ? formatAttStatus(attendance.attStatus.toLowerCase()) : '-'}</td>
                                    ))
                                }
                            </tr>
                        </tbody>
                        <tfoot>
                            {totalStatus != null && (
                                <>
                                    <tr>
                                        <td className="px-6 py-4 border-r border-b" colSpan={3}>มาเรียน</td>
                                        <td className="px-6 py-4 border-r border-b" colSpan={attendanceAbstact.attendance.length}>{totalStatus.present}</td>
                                    </tr>
                                    <tr >
                                        <td className="px-6 py-4 border-r border-b" colSpan={3}>ขาดเรียน</td>
                                        <td className="px-6 py-4 border-r border-b" colSpan={attendanceAbstact.attendance.length}>{totalStatus.absent}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 border-r border-b" colSpan={3}>ลา</td>
                                        <td className="px-6 py-4 border-r border-b" colSpan={attendanceAbstact.attendance.length}>{totalStatus.leave}</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4 border-r border-b" colSpan={3}>กิจกรรม</td>
                                        <td className="px-6 py-4 border-r border-b" colSpan={attendanceAbstact.attendance.length}>{totalStatus.activity}</td>
                                    </tr>
                                </>

                            )}

                        </tfoot>
                    </table>
                </div>) : <div className="text-xl font-bold">กำลังโหลดข้อมูล...</div>
            }

        </div>


    );
};

export default PaticepateByDay;