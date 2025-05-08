import { useLocation } from "react-router-dom";
import ClassroomDetailTable from "../../components/classroom/ClassroomDetailTable";
import { useState } from "react";
import { formatTitle } from "../../helper";

function ClassroomDetail() {
    const location = useLocation();
    const classrooms = location.state.classroooms;
    const [activeTab, setActiveTab] = useState("students");
    

    
    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                            ข้อมูลห้อง ม.{classrooms.classLevel}/{classrooms.classRoom}
                        </h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
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
                
                <div className="bg-white rounded-lg p-4 mt-6 shadow-sm border border-line flex flex-wrap gap-4 justify-between">
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

            <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                <div className="border-b border-line">
                    <nav className="flex">
                        <button
                            className={`px-4 py-3 font-medium font-body border-b-2 ${
                                activeTab === "students" 
                                ? "border-primary text-primary" 
                                : "border-transparent text-text-color-alt hover:text-text-color"
                            }`}
                            onClick={() => setActiveTab("students")}
                        >
                            รายชื่อนักเรียน
                        </button>
                    </nav>
                </div>
                
                <div className="p-1">
                    {classrooms != null && <ClassroomDetailTable classrooms={classrooms}/>}
                </div>
            </div>
        </div>
    );
};

export default ClassroomDetail;