import ExportExcelButton from "../exportExcelButton";
import { TapAttendenceSummaryOpen } from "../tapAttendenceSummaryOpen";
import { useEffect, useRef, useState } from "react";
import { convertNumberToThaiMonth, formatTitle } from "../../helper";
import { Table_to_Excel } from "../../excel";
import FilterByPeriod from "./exportPDF/FilterByPeriod";
import { tabletojson } from "tabletojson";

export const SubjectCheckAttendenceByPeriodTable = ({studentList, classrooms, subject}) => {
    // const subject = subject;
    // const classroom = classrooms;
    const ref = useRef([]);
    // const [classroomInfo, setClassroomInfo] = useState(null);
    const [isTabOpen, setIsTabOpen] = useState([]);
    let indexReal = 0;

    // Function to calculate attendance summary for each period
    const calculatePeriodSummary = (month) => {
        // Get all periods for the month
        const periodAttendances = studentList.data[0].attendance.filter(att => att.month === month);
        
        // Initialize summary object for each period
        const summary = {};
        
        periodAttendances.forEach((_, periodIndex) => {
            summary[periodIndex] = {
                present: 0,
                absent: 0,
                late: 0,
                activity: 0,
                leave: 0,
                total: 0,
                null: 0
            };
            
            // Count each status for this period across all students
            studentList.data.forEach(student => {
                const attendance = student.attendance.filter(att => att.month === month)[periodIndex];
                if (attendance) {
                    const status = attendance.attStatus?.toLowerCase() || null;
                    summary[periodIndex][status || 'null'] += 1;
                    summary[periodIndex].total += 1;
                }
            });
        });
        
        return summary;
    };

    const formatAttStatus = (status) => {
        switch (status) {
            case 'present':
                return 'เข้าเรียน';
            case 'absent':
                return 'ไม่เข้าเรียน';
            case 'late':
                return 'มาสาย';
            case 'activity':
                return 'เข้าเรียนกิจกรรม';
            case 'leave':
                return 'ลา';
            default:
                return status;
        }
    };

    const TableHeader = ({month}) => {
        return (
            <tr>
                <th className="px-6 py-3" >เลขที่</th>
                <th className="px-6 py-3" >รหัสนักเรียน</th>
                <th className="px-6 py-3" >ชื่อ-นามสกุล</th>
                {
                    studentList.data[0].attendance.map((attendance, index) => (
                    attendance.month === month && (
                        <th key={index} className="px-6 py-3">
                            คาบที่ {++indexReal}
                        </th>
                    )
                    ))
                }   
            </tr>
        )
    }

    const TableBody = ({month}) => {
        return (
            studentList.data.map((student, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                    <td className="px-6 py-4">{student.stdNo}</td>
                    <td className="px-6 py-4">{student.stdId}</td>
                    <td className="px-6 py-4">{ `${formatTitle(student.title)} ${student.fName} ${student.lName}`}</td>
                    {
                        student.attendance.map((attendance, index) => (
                            attendance.month === month && (
                            <td key={index} className="px-6 py-4">{attendance.attStatus != null ? formatAttStatus(attendance.attStatus.toLowerCase()) : '-'}</td>
                            )
                        ))
                    }
                </tr>
            ))
        )
    }

    // New component for summary rows
    const TableSummary = ({ month }) => {
        const summary = calculatePeriodSummary(month);
        
        return (
            <>
                <tr className="bg-gray-100 font-medium text-gray-700 border-t-2 border-gray-300">
                    <td colSpan={3} className="px-6 py-3 text-right font-bold">สรุปการเข้าเรียน:</td>
                    {Object.keys(summary).map((periodIndex) => (
                        <td key={periodIndex} className="px-6 py-3 text-left">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-700">มาเรียน: {summary[periodIndex].present}</span>
                                <span className="text-gray-700">ขาดเรียน: {summary[periodIndex].absent}</span>
                                <span className="text-gray-700">มาสาย: {summary[periodIndex].late}</span>
                                <span className="text-gray-700">กิจกรรม: {summary[periodIndex].activity}</span>
                                <span className="text-gray-700">ลา: {summary[periodIndex].leave}</span>
                            </div>
                        </td>
                    ))}
                </tr>
                <tr className="bg-gray-100 font-medium text-gray-700 border-b border-gray-300">
                    <td colSpan={3} className="px-6 py-3 text-right">รวมทั้งหมด:</td>
                    {Object.keys(summary).map((periodIndex) => (
                        <td key={periodIndex} className="px-6 py-3 text-center font-bold">
                            {summary[periodIndex].total} คน
                        </td>
                    ))}
                </tr>
            </>
        );
    };

    const Table = ({month,exportPdf, exportExcel,index}) => {
        return(
            <>
                <ul className="flex ml-auto w-fit">
                    <li>
                        {exportPdf}
                    </li>
                    <li>
                        {exportExcel}
                    </li>
                </ul>
                <div ref={(element) => (ref.current[index] = element)}>
                    {/* <span>{month}</span> */}
                    <div>
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <TableHeader month={month}/>
                                </thead>
                                <tbody>
                                    <TableBody month={month}/>
                                    <TableSummary month={month} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        )
        
    }

    const handleIsTabOpen = (index) => {
        let newIsTabOpen = isTabOpen.slice();
        newIsTabOpen[index] = !newIsTabOpen[index];
        setIsTabOpen(newIsTabOpen)
        
    }

    const makeValueIsOpen = () => {
        const arrayState = new Array(1).fill(false);
        setIsTabOpen(arrayState);
    }

    useEffect(() => {
        if(studentList != null){
            makeValueIsOpen();
        }
    },[studentList])

    const handelExportExcel = (index,classroominfo, month , subject) => {
        if(ref.current[index]){
            Table_to_Excel(ref.current[index],`สรุปการเข้าเรียนตามคาบวิชา ${subject.subNameThai} เดือน ${convertNumberToThaiMonth(month)} ห้องม.${classroominfo.classLevel}/${classroominfo.classRoom} `);
        }
    }

    const ButtonExportPDF = ({index,classroomInfo,month,subject}) => {
        const tableElement = ref.current[index];
        if(tableElement != null){
            const tableJson = tabletojson.convert(tableElement.outerHTML);
            return <FilterByPeriod tableJson={tableJson[0]} classroomInfo={classroomInfo} month={month} subject={subject}/>
        }
        return null;
    }

    return (
        <>
            <div className="mx-auto container flex flex-col gap-2">
                {
                    studentList != null && (
                        studentList.month.map((month, index) => (
                            <div key={index}>
                                {/* {console.log(month)} */}
                                <TapAttendenceSummaryOpen
                                    title={convertNumberToThaiMonth(month)} 
                                    index={index} 
                                    isTabOpen={isTabOpen} 
                                    handleIsTabOpen={handleIsTabOpen}
                                >
                                    <Table 
                                        month={month} 
                                        index={index} 
                                        exportPdf={<ButtonExportPDF index={index} classroomInfo={classrooms} month={month} subject={subject}/>}//<ExportPdfButtonKK index={index} month={month}/>}
                                        exportExcel={ <ExportExcelButton handelOnClickFunction={() => handelExportExcel(index, classrooms, month, subject)}/>}
                                    />
                                </TapAttendenceSummaryOpen>
                            </div>
                            
                        ))
                    )
                }
            </div>
        </>
        
    )
};