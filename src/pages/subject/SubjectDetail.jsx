import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { HOSTNAME } from '../../config';
import { getDayName, formatDate } from '../../helper';
import TeacherTimetableBySubject from '../../components/teacherTimetableBySubject';

function SubjectDetail() {
    const { id } = useParams();
    const [subject, setSubject] = useState(null);
    const [selectedTimetable, setSelectedTimetable] = useState(null);

    useEffect(() => {
        axios.get(`${HOSTNAME}/t/subject/${id}`)
            .then((response) => {
                setSubject(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [id]);

    return (
        <>
            
            <div className="container mx-auto">
                {subject && (
                    <>
                        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                            <h1 className="text-3xl font-bold mb-6">รายละเอียดวิชา</h1>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <p className="text-base leading-relaxed">
                                        <span className="font-bold">รหัสวิชา:</span> {subject.subCode}
                                    </p>
                                    <p className="text-base leading-relaxed">
                                        <span className="font-bold">ชื่อวิชา (ไทย):</span> {subject.subNameThai}
                                    </p>
                                    <p className="text-base leading-relaxed">
                                        <span className="font-bold">ชื่อวิชา (อังกฤษ):</span> {subject.subNameEng}
                                    </p>
                                    <p className="text-base leading-relaxed">
                                        <span className="font-bold">หน่วยกิต:</span> {subject.subCredit}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-base leading-relaxed">
                                        <span className="font-bold">คุณครูผู้สอน:</span> {subject.teacher.fName} {subject.teacher.lName}
                                    </p>
                                    <p className="text-base leading-relaxed">
                                        <span className="font-bold">ประเภทวิชา:</span> {subject.subjectType.subTypeNameThai}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">ตารางสอน</h2>
                            {subject.timetable.map((time) => (
                                <div key={time.timetableId} className="mb-6 border-b pb-4">
                                    <div 
                                        className={`bg-gray-50 p-4 rounded-lg cursor-pointer transition-colors
                                            ${selectedTimetable === time.timetableId ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-100'}`}
                                        onClick={() => setSelectedTimetable(selectedTimetable === time.timetableId ? null : time.timetableId)}
                                    >
                                        <h3 className="text-xl font-semibold mb-2">
                                            ห้องเรียน {time.classroom.classLevel}/{time.classroom.classRoom}
                                        </h3>
                                        <p className="text-lg mb-2">
                                            <span className="font-semibold">วัน:</span> วัน{getDayName(time.dayOfWeek)}
                                        </p>
                                        <p className="text-lg mb-2">
                                            <span className="font-semibold">เวลา:</span> {time.timeStart.substring(0, 5)} - {time.timeEnd.substring(0, 5)} น.
                                        </p>
                                        
                                        {selectedTimetable === time.timetableId && time.studyTime && time.studyTime.length > 0 && (
                                            <div className="mt-4 border-t pt-4">
                                                <h4 className="font-semibold mb-2">ตารางเรียนทั้งหมด:</h4>
                                                <div className="bg-white rounded p-3 max-h-60 overflow-y-auto">
                                                    {time.studyTime
                                                        .sort((a, b) => new Date(a.studingTimeDate) - new Date(b.studingTimeDate))
                                                        .map((study) => (
                                                        <div 
                                                            key={study.studyTimeId}
                                                            className="py-2 px-3 rounded hover:bg-gray-50 mb-1"
                                                        >
                                                            {formatDate(study.studingTimeDate)}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
        
    );
}

export default SubjectDetail;