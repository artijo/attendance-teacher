import { useLocation, useNavigate } from "react-router-dom";
import Calendar from "../../../components/classroom/Calendar";
import { formatTitle } from "../../../helper";

function StudentAttendanceCalendar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { classrooms } = location.state;
    // console.log(classrooms);
    const navigateDetailPage = (date) => {
        // navigate to detail page
        navigate('/classroom/attendance/byday/detail', {state: {classrooms, date}});
    };

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
                            ตารางปฎิทิน
                        </button>
                    </nav>
                </div>
                
                <div className="p-5">
                    <Calendar term={classrooms.term} navigateDetailPage={navigateDetailPage}/>
                </div>
            </div>
            
        </div>
    )
}

export default StudentAttendanceCalendar;