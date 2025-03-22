import { Link, useLocation } from "react-router-dom";
import { daybetween, formatDateToThai, formatDayOfWeeks, formatTitle } from "../../../helper";
import { useEffect, useState } from "react";
import axios from "axios";
import { HOSTNAME } from "../../../config";
import { DateTime } from "luxon";

function StudentAttendanceFilterByDay() {
    const location = useLocation();
    const { student, classroom, className } = location.state;
    const studentInfomation = student.student;
    const [daybetweenTerm, setDaybetweenTerm] = useState([]);
    const totalPages = Math.ceil(daybetweenTerm.length / 10);
    const [currentPage, setCurrentPage] = useState(1);
    const sliceDayList = daybetweenTerm.slice((currentPage - 1) * 10, currentPage * 10);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getTermDateList = async () => {
        try {
            const response = await axios.get(`${HOSTNAME}/t/term/${classroom.term.termId}`);
            setDaybetweenTerm(response.data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        if (classroom) {
            getTermDateList();
        }
    }, [classroom]);

    return (
        <div>
            <h1 className="text-lg font-bold text-center">การเข้าเรียนตามวันที่ของ {formatTitle(studentInfomation.title)} {studentInfomation.fName} {studentInfomation.lName}</h1>
            <div className="relative overflow-x-auto shadow-md sm:rounded-2xl">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">วันที่</th>
                            <th className="px-6 py-3">วัน</th>
                            <th className="px-6 py-3">
                                <span className="sr-only">การเข้าเรียน</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sliceDayList.map((date) => (
                            <tr className="bg-white border-b border-gray-200" key={date}>
                                <td className="px-6 py-4">
                                    {formatDateToThai(date)}
                                </td>
                                <td className="px-6 py-4">
                                    {formatDayOfWeeks(DateTime.fromISO(`${date}T00:00:00`).setZone('Asia/Bangkok').weekday)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm'">
                                        <Link to={`/classroom/attendance/byday/student/infomation`} state={{ date: date, student: student.student, classroom: classroom }} >
                                            <button
                                                className="flex items-center gap-2 p-3 text-blue-600 hover:bg-gray-50 focus:relative"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                </svg>
                                                การเข้าเรียน
                                            </button>
                                        </Link>
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="rounded-b-lg border-gray-200 px-4 py-2">
                <ol className="flex flex-wrap justify-end gap-1 text-xs font-medium">
                    <li>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={`inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Prev Page</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page}>
                            <button
                                onClick={() => handlePageChange(page)}
                                className={`block size-8 rounded border ${currentPage === page
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-gray-100 bg-white text-gray-900"
                                    } text-center leading-8`}
                            >
                                {page}
                            </button>
                        </li>
                    ))}

                    <li>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={`inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Next Page</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default StudentAttendanceFilterByDay;