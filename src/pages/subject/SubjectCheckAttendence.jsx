import axios from "axios";
import { useEffect, useState } from "react";
import { HOSTNAME } from "../../config";
import { Link, useLocation, useParams } from "react-router-dom";

function SubjectCheckAttendence() {
    const params = useParams();
    const location = useLocation();
    const subjectInfo = location.state.subject;
    // console.log(location.state);
    // console.log(params.id);
    const subjectid = params.id === undefined || params.id === null || params.id === "" ? "no id" : params.id
    // console.log(subjectid)
    const [termList, setTermList] = useState([]);
    const [selectValue, setSelectValue] = useState("");
    const [classrooms, setClassrooms] = useState([]);

    const fetchData = async () => {
        try{
            const response = await axios.get(`${HOSTNAME}/t/terms`);
            if(response.status === 200) {
                const startValue = response.data[0].termId;
                setTermList(response.data);
                setSelectValue(startValue.toString());
                fetchClassroomByTerm(startValue);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error){
            console.error(error);
        };
    };

    const fetchClassroomByTerm = async (termId) => {
        try{
            const response = await axios.get(`${HOSTNAME}/t/classrooms/check/${termId}/${subjectid}`);
            if(response.status === 200) {
                setClassrooms(response.data);
                console.log(response.data);
            }else{
                throw new Error(response.data.message);
            }
        }catch(error) {
            console.error(error);
        };
    };


    const handleSelectOption = (value) => {
        setSelectValue(value);
        fetchClassroomByTerm(value);
    }

    useEffect(() => {
        fetchData();
    },[]);


    return (
        <>
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">ตรวจสอบการเข้าเรียน</h1>
                <p className="text-2xl font-medium mb-8">
                    {
                        subjectInfo != null && (
                            <span>วิชา {subjectInfo.subNameThai}({subjectInfo.subNameEng}) - {subjectInfo.subCode}</span> 
                        )
                    }
                </p>
                <div>
                    <label>ปีการศึกษา: </label>
                    { termList.length > 0 && 
                        <select name="term" value={selectValue}  className="px-2 border border-slate-700  rounded-lg" onChange={(e) => handleSelectOption(e.target.value)}>
                            {
                                termList.map((term, index) => (
                                    <option value={term.termId} key={`option for term ${index}`}>
                                        ปีการศึกษา {term.academicYear + 543} เทอม {term.semester}
                                    </option>
                                ))
                            }
                        </select>
                    }
                </div>
                {classrooms.length > 0 && (
                    <div className="mx-auto container mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {classrooms.map((item, index) => (
                                <div
                                    key={`box-number-${index}`}
                                    className="h-[230px] rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div id={`box-number-${index}`} className="w-full h-full flex flex-col justify-between p-6">
                                        <div className="flex flex-col">
                                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                                ห้อง {item.classLevel}/{item.classRoom} <span className="text-base font-normal">(หลักสูตร {item.classroomType.classTypeNameThai})</span>
                                            </h2>
                                            <span className="font-medium text-sm text-gray-800">อาจารย์ที่ปรึกษา</span>
                                            <p className="text-lg text-gray-600 grid">
                                                {
                                                    item.teacher.length > 0 && (
                                                        item.teacher.map((teacher, index) => (
                                                            <span className="text-xs text-black bg-blue-200 rounded-lg py-[2px] px-2 w-fit" key={`${teacher.fName} ${teacher.lName} ${index}`}>{teacher.fName} {teacher.lName}</span>
                                                        ))
                                                    )
                                                }
                                            </p>
                                        </div>
                                        <div className="menu-section grid grid-col-1 gap-2 text-xs md:text-sm">
                                            <Link
                                                to={'/subjects/attendance/checkdetail'}
                                                state={{ classroooms: item , subject:subjectInfo}}
                                            >
                                                <span 
                                                    className="inline-flex px-4 py-1 rounded-full font-bold text-white bg-blue-700 hover:text-gray-50 hover:bg-blue-600 hover:shadow-md"
                                                >
                                                    รายการมีสิทธิ์สอบ
                                                </span>
                                                
                                            </Link>
                                            <Link
                                                to={'/subjects/attendance/byperiod'}
                                                state={{ classroooms: item , subject:subjectInfo}}
                                            >
                                                <span 
                                                    className="inline-flex px-4 py-1 rounded-full font-bold text-white bg-violet-700 hover:text-gray-50 hover:bg-violet-600 hover:shadow-md"
                                                >
                                                    รายการเข้าเรียนตามคาบ
                                                </span>

                                            </Link>
                                        
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {classrooms.length === 0 && (
                    <div className="mt-10">
                        <span className="flex flex-col items-center justify-center gap-2 py-3 border rounded-md">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
                        </svg>
                        ไม่พบห้องเรียนที่ต้องแสดง 
                        </span>
                    </div>
                )}
            </div>
        </>
    );
};


export default SubjectCheckAttendence;