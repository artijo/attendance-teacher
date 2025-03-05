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
                    <div key={subject.subId} className="rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        <div 
                            className=" w-full h-20 flex items-center justify-center bg-gradient-to-r rounded-t-lg from-indigo-300 via-blue-300 to-sky-300 text-white"
                        ></div>
                        <div className="p-6 pt-2">
                            <h2 className="text-xl font-semibold mb-2">{subject.subNameThai}</h2>
                            <p className="text-gray-600 mb-2">{subject.subNameEng}</p>
                            <div className="mb-4">
                                <p className="text-gray-700">รหัสวิชา: {subject.subCode}</p>
                                <p className="text-gray-700">{subject.subCredit} หน่วยกิต</p>
                            </div>
                            <div className="menu-section mt-2 grid grid-col-1 gap-2">
                                <Link 
                                    to={`/subjects/${subject.subId}`}
                                >
                                    <div className="group/item flex items-center">
                                        <span
                                            className="text-sky-400 border border-sky-400 rounded-full p-1 group-hover/item:rounded-e-none group-hover/item:border-e-0"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                            </svg>
                                        </span>
                                        <span 
                                            className="
                                                font-medium text-black
                                                border-sky-400  align-middle w-0 py-1 pe-2 truncate invisible group-hover/item:visible group-hover/item:w-fit group-hover/item:text-clip text-xs
                                                group-hover/item:border group-hover/item:rounded-e-full  group-hover/item:border-s-0 
                                                "
                                            >
                                                ดูรายละเอียด
                                        </span>
                                    </div>
                                    
                                </Link>
                                <Link 
                                    to={`/subjects/${subject.subId}/attendance`}
                                    // className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
                                >
                                    <div className="group/item flex items-center">
                                        <span
                                            className="text-lime-500 border border-lime-500 rounded-full p-1 group-hover/item:rounded-e-none group-hover/item:border-e-0"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>

                                        </span>
                                        <span 
                                            className="
                                                font-medium text-black
                                                border-lime-500  align-middle w-0 py-1 pe-2 truncate invisible group-hover/item:visible group-hover/item:w-fit group-hover/item:text-clip text-xs
                                                group-hover/item:border group-hover/item:rounded-e-full  group-hover/item:border-s-0 
                                                "
                                            >
                                                บันทึกการเข้าเรียน
                                        </span>
                                    </div>
                                </Link>
                                <Link 
                                    to={`/subjects/${subject.subId}/attendance/check`}
                                    state={{subject: subject}}
                                >
                                    <div className="group/item flex items-center">
                                        <span
                                            className="text-violet-500 border border-violet-500 rounded-full p-1 group-hover/item:rounded-e-none group-hover/item:border-e-0"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                                            </svg>
                                        </span>
                                        <span 
                                            className="
                                                font-medium text-black
                                                border-violet-500  align-middle w-0 py-1 pe-2 truncate invisible group-hover/item:visible group-hover/item:w-fit group-hover/item:text-clip text-xs
                                                group-hover/item:border group-hover/item:rounded-e-full  group-hover/item:border-s-0 
                                                "
                                            >
                                                ตรวจสอบการเข้าเรียน
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Subject;