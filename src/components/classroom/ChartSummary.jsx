import axios from "axios";
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { HOSTNAME, TIME_ZONE } from "../../config";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    elements
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatTitle } from "../../helper";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function InputStartDateEndDate({
    term,
    handleChange,
    startDate,
    endDate,
}) {
    // console.log(term);
    const limitStartDate = DateTime.fromISO(`${term.termStart}`).setZone(TIME_ZONE).toFormat('yyyy-MM-dd');
    const limitEndDate = DateTime.fromISO(`${term.termEnd}`).setZone(TIME_ZONE).toFormat('yyyy-MM-dd');
    return (
        <div>
            <div className="w-full mb-5">
                <label
                    htmlFor="startDate"
                    className="text-sm w-full font-medium text-text-color font-body mb-2 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    วันที่เริ่มต้น
                </label>
                <input
                    type="date"
                    name="startDate"
                    className="w-full rounded-lg border-gray-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary font-body text-text-color"
                    onChange={(e) => handleChange(e)}
                    value={startDate}
                    min={limitStartDate}
                    max={limitEndDate}
                />
            </div>
            <div className="w-full">
                <label
                    htmlFor="startDate"
                    className="text-sm w-full font-medium text-text-color font-body mb-2 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2 text-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    วันที่สิ้นสุด
                </label>
                <input
                    type="date"
                    name="endDate"
                    className="w-full rounded-lg border-gray-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary font-body text-text-color"
                    onChange={(e) => handleChange(e)}
                    value={endDate}
                    min={startDate}
                    max={limitEndDate}
                />
            </div>
        </div>
    )
};

function SelectOptionsClassroom({
    classroom,
    selectedClassroom,
    handleChange
}) {

    useEffect(() => {
        const event = {
            target: {
                name: "selectedClassroom",
                value: classroom[0].classId
            }
        };
        handleChange(event);
    }, [])

    return (
        <div className="w-full">
            <label
                htmlFor="selectedClassroom"
                className="text-sm w-full font-medium text-text-color font-body mb-2 flex items-center"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                </svg>
                ห้องเรียน
            </label>
            <select
                name="selectedClassroom"
                id="selectedClassroom"
                className="w-full rounded-lg border-gray-300 py-2.5 px-3 shadow-sm focus:border-primary focus:ring-primary font-body text-text-color"
                value={selectedClassroom}
                onChange={(e) => handleChange(e)}
            >
                {/* Group by class level */}
                {classroom.map((classroom, index) => (
                    <option key={index} value={classroom.classId}  >
                        ม.{classroom.classLevel}/{classroom.classRoom} ปีการศึกษา {classroom.term.academicYear + 543} เทอม {classroom.term.semester}
                    </option>
                ))}
            </select>
        </div>
    );
};

function ChartSummary({ classroom }) {

    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [term, setTerm] = useState({});
    const [filterOption, setFilterOption] = useState({
        selectedClassroom: "",
        // selectedStatus: "",
        startDate: "",
        endDate: ""
    });

    const handleFilterStatusChange = (e) => { // e = event
        const eventName = e.target.name;
        const eventValue = e.target.value;
        setFilterOption((prevState) => ({
            ...prevState,
            [eventName]: eventValue
        }));
    };

    const filterDate = (date) => {
        // console.log(date);
        const filter = date.filter((study) => {
            const startDate = DateTime.fromISO(filterOption.startDate).setZone(TIME_ZONE).startOf('day');
            const endDate = DateTime.fromISO(filterOption.endDate).setZone(TIME_ZONE).endOf('day');
            return study.date >= startDate && study.date <= endDate;
        })
        return filter.sort((a,b) => a.date - b.date);
        // console.log(test);
    };


    const prepareData = (classroomSelected) => {
        let studyTimesId = [];
        let studyTimeDate = [];
        classroomSelected.timetable.forEach((timetable) => {
            timetable.studyTime.forEach((study) => {
                const idStudyTime = study.studyTimeId;
                const date = DateTime.fromISO(study.studingTimeDate).setZone(TIME_ZONE);
                const dateFormat = date.toFormat('dd/MM/') + (date.year + 543);
                // const date = new Date(study.studingTimeDate);
                // const dateFormat = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                studyTimesId.push(idStudyTime);
                const findDate = studyTimeDate.find((st) => st.dateFormat === dateFormat);
                if (!findDate) {
                    studyTimeDate.push({ dateFormat, date });
                }
            });
        });
        // console.log(studyTimeDate);
        let classroomMembers = classroomSelected.classroomMembers.map((member) => {
            // console.log(member.student.attendance);
            // console.log(classroomSelected.classroomMembers[0]);
            if (!member.student.attendance || member.student.attendance.length === 0) { return member; }
            const attendance = member.student.attendance.filter((attend) => {
                if (studyTimesId.includes(attend.studingTimeId)) {
                    return attend;
                }
            });
            return {
                ...member,
                student: {
                    ...member.student,
                    attendance: attendance
                }
            };
        });

        const presentData = [];
        const absentData = [];
        const lateData = [];
        const leaveData = [];
        const activityData = [];

        const presentMemberData = [];
        const absentMemberData = [];
        const lateMemberData = [];
        const leaveMemberData = [];
        const activityMemberData = [];

        

        filterDate(studyTimeDate)
            .forEach((study) => {
                let present = 0;
                let absent = 0;
                let late = 0;
                let leave = 0;
                let activity = 0;

                const startDay = study.date.startOf('day');
                const endDay = study.date.endOf('day');
                classroomMembers.forEach((member) => {
                    // console.log(member.student.fName);
                    member.student.attendance.forEach((att) => {
                        const dateStudyTime = DateTime.fromISO(att.studingTime.studingTimeDate).setZone(TIME_ZONE);
                        if (
                            att.attStatus === "PRESENT" &&
                            dateStudyTime >= startDay &&
                            dateStudyTime <= endDay
                        ) {
                            presentMemberData.push({
                                stdNo: member.stdNo,
                                fullName: `${formatTitle(member.student.title)} ${member.student.fName} ${member.student.lName}`
                            });
                            present++;
                        } else if (
                            att.attStatus === "ABSENT" &&
                            dateStudyTime >= startDay &&
                            dateStudyTime <= endDay
                        ) {
                            absentMemberData.push({
                                stdNo: member.stdNo,
                                fullName: `${formatTitle(member.student.title)} ${member.student.fName} ${member.student.lName}`
                            });
                            absent++;
                        } else if (
                            att.attStatus === "LATE" &&
                            dateStudyTime >= startDay &&
                            dateStudyTime <= endDay
                        ) {
                            lateMemberData.push({
                                stdNo: member.stdNo,
                                fullName: `${formatTitle(member.student.title)} ${member.student.fName} ${member.student.lName}`
                            });
                            late++;
                        } else if (
                            att.attStatus === "ACTIVITY" &&
                            dateStudyTime >= startDay &&
                            dateStudyTime <= endDay
                        ) {
                            
                            activityMemberData.push({
                                stdNo: member.stdNo,
                                fullName: `${formatTitle(member.student.title)} ${member.student.fName} ${member.student.lName}`
                            });
                            activity++
                        } else if (
                            att.attStatus === "LEAVE" &&
                            dateStudyTime >= startDay &&
                            dateStudyTime <= endDay
                        ) {
                            leaveMemberData.push({
                                stdNo: member.stdNo,
                                fullName: `${formatTitle(member.student.title)} ${member.student.fName} ${member.student.lName}`
                            });
                            leave++
                        };
                    });
                });
                presentData.push(present);
                absentData.push(absent);
                lateData.push(late);
                leaveData.push(leave);
                activityData.push(activity);
            });
        const chartData = {
            labels: filterDate(studyTimeDate).map((ss) => ss.dateFormat),
            datasets: [
                {
                    label: 'มาเรียน',
                    data: presentData,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                },
                {
                    label: 'ขาดเรียน',
                    data: absentData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgb(255, 99, 132)',
                    borderWidth: 1
                },
                {
                    label: 'มาสาย',
                    data: lateData,
                    backgroundColor: 'rgba(255, 205, 86, 0.7)',
                    borderColor: 'rgb(255, 205, 86)',
                    borderWidth: 1
                },
                {
                    label: 'ลา',
                    data: leaveData,
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: 'rgb(153, 102, 255)',
                    borderWidth: 1
                },
                {
                    label: 'กิจกรรม',
                    data: activityData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }
            ]
        };

        console.log(presentMemberData);
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    font: {
                        family: 'lineseed'
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function (tooltipItems) {
                            return `วันที่: ${tooltipItems[0].label}`;
                        },
                        label: function (context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: ${value} คน`;
                        },
                        afterLabel: function (context) {
                            let students = [];
                            if (context.dataset.label === 'มาเรียน') {
                                students = presentMemberData.sort((a,b) => a.stdNo - b.stdNo);
                            } else if (context.dataset.label === 'ขาดเรียน') {
                                students = absentMemberData.sort((a,b) => a.stdNo - b.stdNo);;
                            } else if (context.dataset.label === 'มาสาย') {
                                students = lateMemberData.sort((a,b) => a.stdNo - b.stdNo);;
                            } else if (context.dataset.label === 'ลา') {
                                students = leaveMemberData.sort((a,b) => a.stdNo - b.stdNo);;
                            } else if (context.dataset.label === 'กิจกรรม') {
                                students = activityMemberData.sort((a,b) => a.stdNo - b.stdNo);;
                            }

                            return students.map(student =>
                                `${student.stdNo} ${student.fullName}`
                            );
                        }
                    }
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'วันที่'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'จำนวนนักเรียน (คน)'
                    },
                    ticks: {
                        stepSize: 1
                    }
                }
            },
        };
        setChartData({ data: chartData, options: chartOptions })
    };

    useEffect(() => {
        const classroomSelected = classroom.find(c => c.classId === filterOption.selectedClassroom);
        if (classroomSelected) {
            // setLoading(true);
            prepareData(classroomSelected);
            setTerm(classroomSelected.term)
        }
    }, [filterOption]);

    return (

        <div className="bg-white rounded-xl shadow-md p-6 border border-line mb-6">
            <div className="flex flex-col md:justify-between md:flex-row">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-primary font-heading">แผนภูมิสรุปข้อมูล</h3>
                </div>
            </div>

            {/* filter section สรุปตามห้องเรียนที่เป็นที่ปรึกษา */}
            <div className="grid md:grid-cols-1 gap-5 w-full mb-2">
                <SelectOptionsClassroom
                    classroom={classroom}
                    selectedClassroom={filterOption.selectedClassroom}
                    handleChange={handleFilterStatusChange}
                />
                <InputStartDateEndDate
                    term={term}
                    handleChange={handleFilterStatusChange}
                    startDate={filterOption.startDate}
                    endDate={filterOption.endDate}
                />
            </div>
            <div>
                <div className="h-80">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : chartData ? (
                        <Bar data={chartData.data} options={chartData.options} />
                    ) : (
                        <div className="flex flex-col justify-center items-center h-full text-text-color-alt">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-lg font-medium mb-2">ไม่พบข้อมูลการเข้าเรียน</p>
                            <p>ยังไม่มีข้อมูลการบันทึกการเข้าเรียนสำหรับวิชาและคาบเรียนที่เลือก</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChartSummary;