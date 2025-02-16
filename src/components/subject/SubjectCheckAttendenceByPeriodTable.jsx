import { useNavigate } from "react-router-dom";
import ExportPdfButton from "../exportPdfButton";
import ExportExcelButton from "../exportExcelButton";
import { TapAttendenceSummaryOpen } from "../tapAttendenceSummaryOpen";
import { useEffect, useRef, useState } from "react";
import { convertNumberToThaiMonth } from "../../helper";

export const SubjectCheckAttendenceByPeriodTable = ({studentList, classrooms, subject}) => {
    // const subject = subject;
    // const classroom = classrooms;
    console.log(studentList);
    const ref = useRef([]);
    const [classroomInfo, setClassroomInfo] = useState(null);
    const [isTabOpen, setIsTabOpen] = useState([]);
    let indexReal = 0;

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
            <tr className="shadow-md text-center h-12 bg-blue-300">
                <th className="whitespace-nowrap px-4 py-2 font-bold text-white" >เลขที่</th>
                <th className="whitespace-nowrap px-4 py-2 font-bold text-white" >รหัสนักเรียน</th>
                <th className="whitespace-nowrap px-4 py-2 font-bold text-white" >ชื่อ-นามสกุล</th>
                {
                    studentList.data[0].attendance.map((attendance, index) => (
                    attendance.month === month && (
                        <th key={index} className="whitespace-nowrap px-4 py-2 font-bold text-white">
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
                <tr key={index} className="even:bg-slate-100/70 text-center">
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">{student.stdNo}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">{student.stdId}</td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">{`${student.fName} ${student.lName}`}</td>
                    {
                        student.attendance.map((attendance, index) => (
                            attendance.month === month && (
                            <td key={index} className="whitespace-nowrap px-4 py-2 text-gray-700 text-center">{attendance.attStatus != null ? formatAttStatus(attendance.attStatus.toLowerCase()) : '-'}</td>
                            )
                        ))
                    }
                </tr>
            ))
        )
    }

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
                <div ref={(element) => (ref.current[index] = element)} className="grid gap-2 md:grid-cols-1 overflow-x-auto ">
                    {/* <span>{month}</span> */}
                    <div className="border shadow-md border-gray-200 overflow-x-auto">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                                <thead className="ltr:text-left rtl:text-right">
                                    <TableHeader month={month}/>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <TableBody month={month}/>
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

    const handelExportExcel = (index) => {
        if(ref.current[index]){
            AttendanceSummaryByDay(ref.current[index]);
        }
    }
    // const [jsonElement, setJsonElement] = useState([]);
    const navigate = useNavigate();
    const handelExportPdf = (index, month) => {
        const tableElement = ref.current[index];
        if (tableElement) {
            // const tableJson = tabletojson.convert(tableElement.outerHTML);
            navigate('/att/bysubject/pdf', { state: { tableJson: tableJson, classroomInfo:classroomInfo,  subject:subject, month: convertNumberToThaiMonth(month)} });
        }
    }

    const ExportPdfButtonKK = ({ index , month}) => {
        return (
            <>
                <div onClick={() => handelExportPdf(index, month)}>
                    <ExportPdfButton />
                </div>
            </>
        );
    }
    return (
        <>
            <div className="mx-auto container flex flex-col gap-2">
                {
                    studentList != null && (
                        studentList.month.map((month, index) => (
                            <div key={index}>
                                
                                {console.log(month)}
                                <TapAttendenceSummaryOpen
                                    title={convertNumberToThaiMonth(month)} 
                                    index={index} 
                                    isTabOpen={isTabOpen} 
                                    handleIsTabOpen={handleIsTabOpen}
                                >
                                    <Table 
                                        month={month} 
                                        index={index} 
                                        exportPdf={<ExportPdfButtonKK index={index} month={month}/>}
                                        exportExcel={ <ExportExcelButton handelOnClickFunction={() => handelExportExcel(index)}/>}
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