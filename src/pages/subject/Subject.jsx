import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import TeacherTimetableBySubject from "../../components/teacherTimetableBySubject";

function Subject() {
    const [subjects, setSubjects] = useState([]);
    const [isShowTable, setIsShowTable] = useState(false);
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
    const handleShow = () => {
        setIsShowTable(!isShowTable);
    }
    
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">วิชาที่สอน</h1>
            <button className={`inline-flex items-center gap-2  border rounded-lg p-2 align-middle font-medium ${isShowTable ? 'bg-gray-100 text-slate-600' : 'bg-gray-50 text-black'}`} onClick={() => handleShow()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                </svg>
                ตารางสอน
            </button>
            {
                subjects.length > 0  && 
                <div className={`mt-4 ${isShowTable ? 'block' : 'hidden'}`}>
                    <div className="overflow-auto">
                        <TeacherTimetableBySubject subject={subjects}/>
                    </div>    
                </div>
            }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {subjects && subjects.map((subject) => (
                    <div key={subject.subId} className="rounded-3xl border shadow-lg hover:shadow-xl transition-shadow">
                        {/* <div 
                            className="w-full h-40 flex items-center justify-center "
                        >
                            <img src="/classroomPicture.jpg" className="w-full h-full object-cover rounded-t-lg"/>
                        </div> */}
                        <div className="p-6">
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
                                    <span 
                                        className="inline-flex text-sm px-4 py-1 rounded-full font-bold text-white bg-blue-700 hover:text-gray-50 hover:bg-blue-600 hover:shadow-md"
                                    >
                                        ดูรายละเอียด
                                    </span>
                                </Link>
                                <Link 
                                    to={`/subjects/${subject.subId}/attendance`}
                                    // className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-center"
                                >
                                    {/* <div className="group/item flex items-center">
                                        <span
                                            className="text-lime-500 border border-lime-500 rounded-full p-1 group-hover/item:rounded-e-none group-hover/item:border-e-0"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                            </svg>

                                        </span>
                                        
                                    </div> */}
                                    <span 
                                        className="inline-flex text-sm px-4 py-1 rounded-full font-bold text-white bg-green-700 hover:text-gray-50 hover:bg-green-600 hover:shadow-md"
                                    >
                                        บันทึกการเข้าเรียน
                                    </span>
                                </Link>
                                <Link 
                                    to={`/subjects/${subject.subId}/attendance/check`}
                                    state={{subject: subject}}
                                >
                                    <span 
                                        className="inline-flex text-sm px-4 py-1 rounded-full font-bold text-white bg-violet-700 hover:text-gray-50 hover:bg-violet-600 hover:shadow-md"
                                    >
                                        บันทึกการเข้าเรียน
                                    </span>
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