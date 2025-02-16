import axios from "axios";
import { useLocation } from "react-router-dom";
import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import { SubjectCheckAttendenceByPeriodTable } from "../../components/subject/SubjectCheckAttendenceByPeriodTable";

function SubjectCheckAttendenceByPeriod(){
    const location = useLocation();
    const classrooms = location.state.classroooms;
    const subject = location.state.subject;
    const [studentList, setStudentList] = useState({});


    const fecthStudentList = async () => {
        try{
            const response = await axios.get(`${HOSTNAME}/t/attendence/${subject.subId}/${classrooms.classId}`);
            if(response.status === 200){
                console.log(response.data);
                setStudentList(response.data);
            }else{
                throw new Error(response.data.message);
            };
        }catch(error){
            console.error(error);
        };
    };

    useEffect(() => {
        fecthStudentList();
    },[])


    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">รายละเอียดการเข้าเรียนตามคาบ</h1>
            <p className="text-2xl font-medium mb-8">
                {
                    subject != null && (
                        <span>วิชา {subject.subNameThai}({subject.subNameEng}) - {subject.subCode}</span> 
                    )
                }
            </p>
            {
                studentList != null && Object.keys(studentList).length !== 0 && <SubjectCheckAttendenceByPeriodTable studentList={studentList} classrooms={classrooms} subject={subject}/>
            }
        </div>
    );
};

export default SubjectCheckAttendenceByPeriod;