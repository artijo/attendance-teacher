import axios from "axios";
import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Classroom() {
    const [classroooms, setClassrooms] = useState([]);
    const fecthTeacherAdvisorClassroom = async () => {
        try{
            const response = await axios.get(`${HOSTNAME}/t/classrooms`);
            if(response.data.not_found) {
                setClassrooms([]);
                return;
                // console.log(response.data)
            
            }else if(response.status === 200 ){
                setClassrooms(response.data);
                return;
            }else{
                throw new Error(response.data.message);

            }
        }catch(error) {
            console.error(error);
        }
    }
    
    useEffect(() => {
        fecthTeacherAdvisorClassroom();
    },[])

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {classroooms.length === 0 && (
                <div className="text-center text-gray-500 text-xl mt-10">
                    ท่านไม่มีห้องที่เป็นที่ปรึกษา
                </div>
            )}
            {classroooms.length > 0 && (
                <div className="mx-auto container px-4">
                    <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
                        ห้องเรียนที่ปรึกษา
                    </h1>
                    <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {classroooms.map((item, index) => (
                            <div
                                key={`box-number-${index}`}
                                className="relative grid grid-cols-1 gap-2 border border-gray-200 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
                            >
                                <div id={`box-number-${index}`} className="w-full p-6 relative">
                                    <div className="grid grid-cols-1 gap-1">
                                        <p className="text-xl font-semibold text-gray-800">
                                            ปีการศึกษา {item.term.academicYear + 543}
                                        </p>
                                        <p className="text-lg text-gray-600">
                                            เทอม {item.term.semester}
                                        </p>
                                        <p className="text-gray-700">
                                            ห้อง {item.classLevel}/{item.classRoom}
                                        </p>
                                        <p className="text-gray-700">
                                            หลักสูตร {item.classroomType.classTypeNameThai}
                                        </p>
                                    </div>
                                    <div className="menu-section mt-2">
                                        <Link
                                            to={'/classroom/detail'}
                                            state={{ classroooms: item }}
                                        >
                                            <span 
                                                className="inline-flex text-sm px-4 py-1 rounded-full font-bold text-white bg-blue-700 hover:text-gray-50 hover:bg-blue-600 hover:shadow-md"
                                            >
                                                รายละเอียดการเข้าเรียน
                                            </span> 
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Classroom;