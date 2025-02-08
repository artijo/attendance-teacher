import { useLocation } from "react-router-dom";
import ClassroomDetailTable from "../../components/classroom/ClassroomDetailTable";

function ClassroomDetail() {
    const location = useLocation();
    const classrooms = location.state.classroooms;
    // console.log(classrooms);
    return (
        <div className="mx-auto container ">
            <div>
                <h1 className="text-3xl font-bold text-start mb-8">รายละเอียดห้อง {classrooms.classLevel}/{classrooms.classRoom} ปีการศึกษา {classrooms.term.academicYear + 543} เทอม {classrooms.term.semester}</h1>
            </div>
            {
                classrooms != null && <ClassroomDetailTable classrooms={classrooms}/>
            }
        </div>
    );
};

export default ClassroomDetail;