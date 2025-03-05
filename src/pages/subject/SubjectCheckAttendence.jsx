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
                                    className="rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div 
                                        className=" w-full h-20 flex items-center justify-center bg-gradient-to-r rounded-t-lg from-indigo-300 via-blue-300 to-sky-300 text-white"
                                    ></div>
                                    <div id={`box-number-${index}`} className="w-full p-6 pt-2">
                                        <div className="flex flex-col">
                                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                                ห้อง {item.classLevel}/{item.classRoom} <span className="text-base font-normal">(หลักสูตร {item.classroomType.classTypeNameThai})</span>
                                            </h2>
                                            <span className="font-medium text-sm text-gray-800">อาจารย์ที่ปรึกษา</span>
                                            <p className="text-lg text-gray-600 grid">
                                                {
                                                    item.teacher.length > 0 && (
                                                        item.teacher.map((teacher, index) => (
                                                            <span className="text-xs text-black bg-blue-300 rounded-lg py-[2px] px-2 w-fit" key={`${teacher.fName} ${teacher.lName} ${index}`}>{teacher.fName} {teacher.lName}</span>
                                                        ))
                                                    )
                                                }
                                            </p>
                                        </div>
                                        <div className="menu-section mt-2 grid grid-col-1 gap-2">
                                            <Link
                                                to={'/subjects/attendance/checkdetail'}
                                                state={{ classroooms: item , subject:subjectInfo}}
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
                                                            รายละเอียดการมีสิทธิ์สอบ
                                                    </span>
                                                </div>
                                            </Link>
                                            <Link
                                                to={'/subjects/attendance/byperiod'}
                                                state={{ classroooms: item , subject:subjectInfo}}
                                            >
                                                <div className="group/item flex items-center">
                                                    <span
                                                        className="text-violet-400 border border-violet-400 rounded-full p-1 group-hover/item:rounded-e-none group-hover/item:border-e-0"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                                        </svg>
                                                    </span>
                                                    <span 
                                                        className="
                                                            font-medium text-black
                                                            border-violet-400  align-middle w-0 py-1 pe-2 truncate invisible group-hover/item:visible group-hover/item:w-fit group-hover/item:text-clip text-xs
                                                            group-hover/item:border group-hover/item:rounded-e-full  group-hover/item:border-s-0 
                                                            "
                                                        >
                                                             รายละเอียดการเข้าเรียนตามคาบ
                                                    </span>
                                                </div>
                                            </Link>
                                        
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};


export default SubjectCheckAttendence;