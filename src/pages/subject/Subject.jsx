import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import TeacherTimetableBySubject from "../../components/teacherTimetableBySubject";

function Subject() {
    const [subjects, setSubjects] = useState([]);

    function fetchSubjects() {
        axios.get(`${HOSTNAME}/subjects`)
            .then((response) => {
                setSubjects(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }
    
    useEffect(() => {
        axios.get(`${HOSTNAME}/t/subjects`)
            .then((response) => {
                setSubjects(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);
    
    return (
        <div className="container mx-auto">
            {
                subjects.length > 0  && 
                <>
                    <div className="overflow-auto">
                        <TeacherTimetableBySubject subject={subjects}/>
                    </div>    
                
                </>
            }
            <h1 className="text-3xl font-bold text-center mb-8">วิชาที่สอน</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects && subjects.map((subject) => (
                    <div key={subject.subId} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <h2 className="text-xl font-semibold mb-2">{subject.subNameThai}</h2>
                        <p className="text-gray-600 mb-2">{subject.subNameEng}</p>
                        <div className="mb-4">
                            <p className="text-gray-700">รหัสวิชา: {subject.subCode}</p>
                            <p className="text-gray-700">{subject.subCredit} หน่วยกิต</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Link 
                                to={`/subjects/${subject.subId}`}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center"
                            >
                                ดูรายละเอียด
                            </Link>
                            <Link 
                                to={`/subjects/${subject.subId}/attendance`}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
                            >
                                บันทึกการเข้าเรียน
                            </Link>
                            <Link 
                                to={''}
                                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 text-center"
                            >
                                ตรวจสอบการเข้าเรียน
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Subject;