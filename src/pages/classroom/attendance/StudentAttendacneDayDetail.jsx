import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../../config";
import axios from "axios";
import { formatDateToThai, formatTitle } from "../../../helper";
import StudentAttendenceDayDetailList from "../../../components/classroom/attendance/StudentAttendenceDayDetailList";

function StudentAttendanceDayDetail() {
    const location = useLocation();
    const { classrooms, date } = location.state;
    const [studentList, setStudentList] = useState([]);
    // console.log(classrooms);
    // console.log(date);

    const getStudentData = async (classroomId, date) => {
        try {
            const response = await axios.get(`${HOSTNAME}/t/attendence/byDate/${date}/${classroomId}`);
            setStudentList(response.data);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (classrooms && date) {
            getStudentData(classrooms.classId, date);
        };
    }, []);

    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold md:text-3xl text-primary font-heading">
                            ข้อมูลห้อง ม.{classrooms.classLevel}/{classrooms.classRoom}
                        </h1>
                        <div className="w-16 h-1 mt-2 rounded-full bg-secondary"></div>
                    </div>

                    <div className="flex items-center gap-2 font-body text-text-color-alt">
                        <div className="bg-primary/5 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-primary">ปีการศึกษา:</span> {classrooms.term.academicYear + 543}
                        </div>
                        <div className="bg-secondary/5 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-secondary">ภาคเรียน:</span> {classrooms.term.semester}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap justify-between gap-4 p-4 mt-6 bg-white border rounded-lg shadow-sm border-line">
                    <div className="space-y-1 font-body">
                        <p className="text-text-color-alt">หลักสูตร</p>
                        <p className="font-medium text-text-color">{classrooms.classroomType.classTypeNameThai}</p>
                    </div>
                    <div className="space-y-1 font-body">
                        <p className="text-text-color-alt">จำนวนนักเรียน</p>
                        <p className="font-medium text-text-color">{classrooms.classroomMembers.length} คน</p>
                    </div>
                    {classrooms.leader && classrooms.leader.student && (
                        <div className="space-y-1 font-body">
                            <p className="text-text-color-alt">หัวหน้าห้อง</p>
                            <p className="font-medium text-text-color">
                                {formatTitle(classrooms.leader.student.title)}{classrooms.leader.student.fName} {classrooms.leader.student.lName}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="overflow-hidden bg-white border shadow-md rounded-xl border-line">
                <div className="border-b border-line">
                    <nav className="flex">
                        <button
                            className={`px-4 py-3 font-medium font-body border-b-2 border-primary text-primary `}
                        >
                            การเข้าเรียนตามวันที่ {formatDateToThai(date)}
                        </button>
                    </nav>
                </div>

                <div className="p-5">
                    <StudentAttendenceDayDetailList classroomInfo={classrooms} studentList={studentList} date={date}/>
                </div>
            </div>


        </div>
    );
};

export default StudentAttendanceDayDetail;