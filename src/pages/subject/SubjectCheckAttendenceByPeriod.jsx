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
    const [loading, setLoading] = useState(true);

    const fetchStudentList = async () => {
        setLoading(true);
        try{
            const response = await axios.get(`${HOSTNAME}/t/attendence/${subject.subId}/${classrooms.classId}`);
            if(response.status === 200){
                // console.log(response.data);
                const studentDataSorted = response.data.data.sort((a, b) => {
                   return parseInt(a.stdNo) - parseInt(b.stdNo); 
                });
                // console.log(studentDataSorted);
                setStudentList({...response.data, data: studentDataSorted});
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudentList();
    },[])

    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                            การเข้าเรียนตามคาบเรียน
                        </h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center gap-2 font-body">
                        <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-primary">รหัสวิชา:</span> {subject.subCode}
                        </div>
                        <div className="bg-secondary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-secondary">ห้อง:</span> ม.{classrooms.classLevel}/{classrooms.classRoom}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 mt-6 shadow-sm border border-line">
                    <p className="text-lg font-medium text-text-color font-heading">{subject.subNameThai}</p>
                    <p className="text-text-color-alt font-body">{subject.subNameEng}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : studentList && Object.keys(studentList).length > 0 ? (
                <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                    <div className="border-b border-line p-6">
                        <h2 className="text-xl font-bold text-primary font-heading mb-2 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            รายละเอียดการเข้าเรียน
                        </h2>
                        <p className="text-text-color-alt font-body text-sm">
                            แสดงข้อมูลการเข้าเรียนของนักเรียนแยกตามคาบเรียน
                        </p>
                    </div>
                    
                    <SubjectCheckAttendenceByPeriodTable 
                        studentList={studentList} 
                        classrooms={classrooms} 
                        subject={subject}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
                    <div className="flex justify-center mb-4 text-text-color-alt">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">ไม่พบข้อมูลการเข้าเรียน</h2>
                    <p className="text-text-color-alt font-body">ยังไม่มีการบันทึกข้อมูลการเข้าเรียนสำหรับคาบเรียนนี้</p>
                </div>
            )}
        </div>
    );
};

export default SubjectCheckAttendenceByPeriod;