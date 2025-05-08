import axios from "axios";
import { useEffect, useState } from "react";
import { HOSTNAME } from "../../config";
import { Link, useLocation, useParams } from "react-router-dom";

function SubjectCheckAttendence() {
    const params = useParams();
    const location = useLocation();
    const subjectInfo = location.state.subject;
    const subjectid = params.id === undefined || params.id === null || params.id === "" ? "no id" : params.id
    const [termList, setTermList] = useState([]);
    const [selectValue, setSelectValue] = useState("");
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try{
            const response = await axios.get(`${HOSTNAME}/t/terms`);
            if(response.status === 200) {
                const startValue = response.data[0].termId;
                setTermList(response.data);
                setSelectValue(startValue.toString());
                await fetchClassroomByTerm(startValue);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClassroomByTerm = async (termId) => {
        setLoading(true);
        try{
            const response = await axios.get(`${HOSTNAME}/t/classrooms/check/${termId}/${subjectid}`);
            if(response.status === 200) {
                setClassrooms(response.data);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (value) => {
        setSelectValue(value);
        fetchClassroomByTerm(value);
    }

    useEffect(() => {
        fetchData();
    },[]);

    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                            ตรวจสอบการเข้าเรียน
                        </h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center gap-2 font-body">
                        <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-primary">รหัสวิชา:</span> {subjectInfo.subCode}
                        </div>
                        <div className="bg-secondary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-secondary">{subjectInfo.subCredit}</span> หน่วยกิต
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 mt-6 shadow-sm border border-line">
                    <p className="text-lg font-medium text-text-color font-heading">{subjectInfo.subNameThai}</p>
                    <p className="text-text-color-alt font-body">{subjectInfo.subNameEng}</p>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden mb-8">
                <div className="border-b border-line p-4 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-primary font-heading flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        เลือกปีการศึกษา
                    </h2>
                    
                    {termList.length > 0 && (
                        <div className="relative">
                            <select 
                                name="term" 
                                value={selectValue} 
                                onChange={(e) => handleSelectOption(e.target.value)}
                                className="w-full md:w-72 py-2 px-3 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-body pr-10"
                            >
                                {termList.map((term, index) => (
                                    <option value={term.termId} key={`option for term ${index}`}>
                                        ปีการศึกษา {term.academicYear + 543} ภาคเรียนที่ {term.semester}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : classrooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classrooms.map((item, index) => (
                        <div
                            key={`box-number-${index}`}
                            className="bg-white border border-line rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
                        >
                            <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
                            <div className="p-6 flex flex-col h-full">
                                <div className="mb-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="bg-primary/10 text-primary rounded-md px-3 py-1.5 text-sm font-medium">
                                            ม.{item.classLevel}/{item.classRoom}
                                        </div>
                                        <div className="bg-secondary/10 text-secondary rounded-md px-3 py-1.5 text-sm font-medium">
                                            {item.classroomType.classTypeNameThai}
                                        </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <p className="text-text-color-alt text-sm font-body">ครูที่ปรึกษา</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.classTeacher.length > 0 ? (
                                                item.teacher.map((teacher, idx) => (
                                                    <span 
                                                        key={`${teacher.fName}-${idx}`}
                                                        className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded-md"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                        {teacher.fName} {teacher.lName}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-text-color-alt text-sm">-</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 gap-1 mt-auto space-y-2">
                                    <Link to={'/subjects/attendance/checkdetail'} state={{ classroooms: item, subject: subjectInfo }} className="w-full">
                                        <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-200 flex items-center justify-center text-sm font-medium">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            รายการมีสิทธิ์สอบ
                                        </button>
                                    </Link>
                                    
                                    <Link to={'/subjects/attendance/byperiod'} state={{ classroooms: item, subject: subjectInfo }} className="w-full">
                                        <button className="w-full py-2 px-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors duration-200 flex items-center justify-center text-sm font-medium">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                            </svg>
                                            รายการเข้าเรียนตามคาบ
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
                    <div className="flex justify-center mb-4 text-text-color-alt">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">ไม่พบข้อมูลห้องเรียน</h2>
                    <p className="text-text-color-alt font-body">ไม่พบข้อมูลห้องเรียนในเทอมที่เลือก</p>
                </div>
            )}
        </div>
    );
};

export default SubjectCheckAttendence;