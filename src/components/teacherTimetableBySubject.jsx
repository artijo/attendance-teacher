import axios from "axios";
import { HOSTNAME } from "../config";
import { useEffect, useState } from "react";
import { calculatedTimeToSeconde, calculatedTimeToSecondeDouleDot, formatDayOfWeeks, formatTime } from "../helper";

function TeacherTimetableBySubject({subject}) {
    const [timetables, setTimetables] = useState(null);
    // console.log(timetables);
    const fecthData = async () => {
        try{
            const response = await axios.post(`${HOSTNAME}/t/timetable/teacher`,{subject:subject});
            setTimetables(response.data);
        }catch(error){
            console.error(error);
        };
    };

    const timeList = [
        "08.40 - 09.30",
        "09.30 - 10.20",
        "10.20 - 11.10",
        "11.10 - 12.00",
        "12.00 - 13.00",
        "13.00 - 13.50",
        "13.50 - 14.40",
        "14.40 - 15.30",
        "15:30 - 16.20"
    ]

    useEffect(() => {
        if(subject.length > 0) {
            fecthData();
        }
    },[subject])

    const secondInTimeStudyArray = timeList.map((time) => {
        let startTime = time.split(' - ')[0];
        let startTimeSplitDot = startTime.split('.');
        return calculatedTimeToSeconde(startTimeSplitDot[0], startTimeSplitDot[1]);
    });

    const TableHead = () => {
        return (
            <thead className="ltr:text-left rtl:text-right bg-background-alt">
            <tr className="h-16 text-white">
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>คาบที่</span>
                </th>
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>1</span>
                </th>
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>2</span>
                </th>
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>3</span>
                </th>
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>4</span>
                </th>
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>พักเที่ยง</span>
                </th>
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>5</span>
                </th>
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>6</span>
                </th>
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>7</span>
                </th>
            </tr>
            <tr className="h-16 shadow-md">
                <th className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                <span>เวลา</span>
                </th>
                {timeList.map((time, index) => (
                <th key={index} className="whitespace-nowrap border px-4 py-2 font-medium text-white">
                    <span>{time}</span>
                </th>
                ))}
            </tr>
            </thead>
        );
    };

    const TableBodyRow = ({row,day}) => {
        return (
            <tr>
                <td className="border text-center h-16">
                   <span>{formatDayOfWeeks(day)}</span> 
                </td>
                {
                    secondInTimeStudyArray.map((time, timeIndex) => {
                        const rows = row.find(rowTimetable => time === calculatedTimeToSecondeDouleDot(rowTimetable.timeStart));
                        
                        if (rows) {
                            return ( 
                                <td key={timeIndex} className="cursor-default relative whitespace-nowrap border px-4 py-2 font-medium text-center text-xs text-gray-900 bg-blue-300/50">
                                    <p>วิชา {rows.subject.subNameThai}</p>
                                    <p>ห้องม. {rows.classroom.classLevel}/ {rows.classroom.classRoom}</p>
                                    <p>({formatTime(rows.timeStart)}-{formatTime(rows.timeEnd)})</p>
                                </td>
                            );
                        
                        } else if(time === calculatedTimeToSeconde('12', '00')) {
                            return (
                                <td key={timeIndex} className="whitespace-nowrap border px-4 py-2 font-medium text-gray-900">
                                </td>
                            );

                        } else {
                            return <td key={timeIndex} className="whitespace-nowrap border px-4 py-2 font-medium text-gray-900">
                                </td>
                        }
                    })
                }
            </tr>
        );
    };

    const TableBody = () => {
        return (
            <tbody>
                {   timetables != null &&
                    Object.keys(timetables).map((day, index) => (
                        <TableBodyRow 
                            key={index}
                            row={timetables[day]}
                            day={(parseInt(day))}
                        />
                    ))
                }
            </tbody>
        );
    };

    useEffect(() => {
        fecthData();
    },[]); 

    return (
        <>
            <div className="w-full">
                <table className="w-full mx-auto bg-white border-collapse border ">
                    <TableHead/>
                    <TableBody/>
                </table>
            </div>
        </>
    );
};

export default TeacherTimetableBySubject;