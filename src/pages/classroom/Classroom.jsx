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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {classroooms.map((item, index) => (
                            <div
                                key={`box-number-${index}`}
                                className="border border-gray-200 p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
                            >
                                <div id={`box-number-${index}`} className="w-full">
                                    <div className="flex flex-col space-y-3">
                                        <h2 className="text-2xl font-semibold text-gray-800">
                                            ปีการศึกษา {item.term.academicYear + 543}
                                        </h2>
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
                                    <div className="mt-6">
                                        <Link
                                            to={'/classroom/detail'}
                                            state={{ classroooms: item }}
                                        >
                                            <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium">
                                                รายละเอียด
                                            </button>
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