import axios from "axios";
import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Classroom() {
    const [classroooms, setClassrooms] = useState([]);
    const fecthTeacherAdvisorClassroom = async () => {
        try{
            const response = await axios.get(`${HOSTNAME}/t/classrooms`);
            if(response.status === 200) {
                setClassrooms(response.data);
                console.log(response.data)
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
        <>
            <div className="mx-auto container">
                <h1 className="text-3xl font-bold text-center mb-8">ห้องเรียน</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {classroooms.map((item, index) => (
                    <div 
                        key={`box-number-${index}`}
                        className="border p-6 rounded-lg shadow-lg bg-white"
                    >
                        <div id={`box-number-${index}`} className="w-full">
                            <div className="flex flex-col"> 
                                <h1 className="text-xl">
                                    ปีการศึกษา {item.term.academicYear + 543} เทอม {item.term.semester}
                                </h1>
                                <p>
                                    ห้อง {item.classLevel}/{item.classRoom} หลักสูตร {item.classroomType.classTypeNameThai}
                                </p>
                                </div>
                                <div className="spancer h-[20px]"></div>
                                <Link 
                                    to={'/classroom/detail'}
                                    state={
                                        {
                                            classroooms: item
                                        }
                                    }
                                >
                                    <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-center">
                                        รายละเอียด
                                    </button>
                                </Link>
                            </div>
                        </div>
                ))}
                </div>

                
            </div>
        </>
    );
};

export default Classroom;