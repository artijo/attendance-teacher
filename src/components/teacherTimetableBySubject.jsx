import axios from "axios";
import { HOSTNAME } from "../config";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { getDayName } from "../helper";


const timeStudyList = [
    {
        startDatabaseFormat: "08:40:00",
        endDatabaseFormat: "09:30:00",
        timetableformate: "08.40 - 09.30",
        period: 1
    },
    {
        startDatabaseFormat: "09:30:00",
        endDatabaseFormat: "10:20:00",
        timetableformate: "09.30 - 10.20",
        period: 2
    },
    {
        startDatabaseFormat: "10:20:00",
        endDatabaseFormat: "11:10:00",
        timetableformate: "10.20 - 11.10",
        period: 3
    },
    {
        startDatabaseFormat: "11:10:00",
        endDatabaseFormat: "12:00:00",
        timetableformate: "11.10 - 12.00",
        period: 4
    },
    {
        startDatabaseFormat: "12:00:00",
        endDatabaseFormat: "13:00:00",
        timetableformate: "12.00 - 13.00",
        period: "พักเที่ยง"
    },
    {
        startDatabaseFormat: "13:00:00",
        endDatabaseFormat: "13:50:00",
        timetableformate: "13.00 - 13.50",
        period: 5
    },
    {
        startDatabaseFormat: "13:50:00",
        endDatabaseFormat: "14:40:00",
        timetableformate: "13.50 - 14.40",
        period: 6
    },
    {
        startDatabaseFormat: "14:40:00",
        endDatabaseFormat: "15:30:00",
        timetableformate: "14.40 - 15.30",
        period: 7
    },
    {
        startDatabaseFormat: "15:30:00",
        endDatabaseFormat: "16:20:00",
        timetableformate: "15.30 - 16.20",
        period: 8
    }
];


function TeacherTimetableBySubject({ subject }) {
    const [timetable, setTimetable] = useState(null);
    const [term, setTerm] = useState("");
    // console.log(subject);
    const handleTermChange = (value) => {
        setTerm(value);
    };

    const createTimetable = (termId, subject) => {
        // console.log(termId)
        const timetable = {
            1: [],
            2: [],
            3: [],
            4: [],
            5: [],
        }

        const subjectTimetableFilter = subject.map((subject) => {
            const timetableFilter = subject.timetable.filter((timetable) => timetable.classroom.term.termId === termId);
            return {
                ...subject,
                timetable: timetableFilter
            };
        });

        // create timetable by weekday 
        Object.keys(timetable).forEach((weekday) => {
            subjectTimetableFilter.forEach((subject) => {
                const timetableFilter = subject.timetable.filter((timetable) => parseInt(timetable.dayOfWeek) === parseInt(weekday));
                timetable[weekday].push(...timetableFilter);
            });
            timetable[weekday].sort((a, b) => {
                const aStartTime = DateTime.fromISO(a.timeStart).toMillis();
                const bStartTime = DateTime.fromISO(b.timeStart).toMillis();
                return aStartTime - bStartTime;
            });
        });
        // console.log(timetable);
        setTimetable(timetable);
    };

    const mergeArrayItem = (array) => {
        const arrayIsMerged = array.reduce((accumulator, item) => {
            const findedItem = accumulator.find((acc) => acc.termId === item.termId);
            if (!findedItem) {
                accumulator.push(item);
            }
            return accumulator;
        }, []);
        return arrayIsMerged;
    };

    const filterTerm = mergeArrayItem(subject.map((subject) => subject.timetable.map((timetable) => timetable.classroom.term)).flat()).sort((a, b) => {
        const aStartDate = DateTime.fromISO(a.termStart).toMillis();
        const bStartDate = DateTime.fromISO(b.termStart).toMillis();
        return aStartDate - bStartDate;
    });

    const getSubjectCardStyle = (subject) => {
        // Generate a consistent color based on subject code
        const hash = subject.subCode.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const hue = hash % 360;
        const saturation = 75 + (hash % 20);
        const lightness = 40 + (hash % 10);

        return {
            borderTop: `4px solid hsl(${hue}, ${saturation + 10}%, ${lightness - 10}%)`
        };
    };

    useEffect(() => {
        if (term != "") {
            createTimetable(term, subject);
        }else{
            setTimetable(null);
        };
    }, [term])

    return (
        <div className="w-full">
            <div>
                <h3 className="block text-base font-medium text-text-color-alt mb-2">เลือกปีการศึกษา</h3>
                <select
                    className="w-fit p-2 border border-gray-300 rounded-md"
                    onChange={(e) => handleTermChange(e.target.value)}
                >
                    <option value={""}>เลือกปีการศึกษาที่ต้องการดู</option>
                    {
                        filterTerm.map((term) => (
                            <option key={term.termId} value={term.termId}>
                                ปีการศึกษา {term.academicYear + 543} เทอม {term.semester}
                            </option>
                        ))
                    }
                </select>
            </div>
            
            {timetable && (
                <div className="mt-4 overflow-x-auto pb-2">
                    <table>
                        <thead >
                            <tr className="text-left text-xs">
                                <th className="min-w-24 pb-2"></th>
                                {timeStudyList.map((timeStudy, index) => (
                                    <th key={index} className="min-w-40 pb-2">
                                        <p className="text-blue-600">{timeStudy.period === "พักเที่ยง" ? "พักเที่ยง" : `คาบที่ ${timeStudy.period}`}</p>
                                        <p className="text-gray-700">{timeStudy.timetableformate}</p>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {Object.keys(timetable).map((weekday, index) => (
                                <tr key={index}>
                                    <th className="text-right pr-2">{getDayName(weekday)}</th>
                                    {timeStudyList.map((schedule, index) => {
                                        const timetablethistime = timetable[weekday].find((tt) => tt.timeStart === schedule.startDatabaseFormat);
                                        if (schedule.startDatabaseFormat === "12:00:00") {
                                            return (
                                                <td className="min-w-40 h-20 border border-gray-100" key={index}>
                                                    
                                                </td>
                                            )
                                        } else if (!timetablethistime) {
                                            return (
                                                <td className="min-w-40 h-20 border border-gray-100 bg-gray-50" key={index}></td>
                                            )
                                        } else {
                                            return (
                                                <td 
                                                    className="min-w-40 h-20 border border-gray-100 p-2"
                                                    style={getSubjectCardStyle(timetablethistime.subject)}
                                                    key={index}
                                                >
                                                    <div className="w-full h-full flex flex-col items-start space-y-1">
                                                        <p className="text-sm font-medium text-gray-500">{timetablethistime.subject.subCode}</p>
                                                        <h5 className="text-base font-bold text-gray-800">{timetablethistime.subject.subNameThai}</h5>
                                                        <p className="text-xs font-medium text-gray-500">ห้องม.{timetablethistime.classroom.classLevel}/{timetablethistime.classroom.classRoom}</p>
                                                    </div>
                                                </td>
                                            )
                                        }
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default TeacherTimetableBySubject;