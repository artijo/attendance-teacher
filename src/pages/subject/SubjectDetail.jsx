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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`${HOSTNAME}/t/subject/${id}`)
            .then((response) => {
                setSubject(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [id]);

    return (
        <>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : subject ? (
                <div>
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                            {subject.subNameThai}
                        </h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                        <p className="mt-2 text-text-color-alt font-body">{subject.subNameEng}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-md border border-line p-6 h-full">
                                <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    รายละเอียดวิชา
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-text-color-alt mb-1">รหัสวิชา</p>
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-text-color font-medium">
                                                    {subject.subCode}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-text-color-alt mb-1">ประเภทวิชา</p>
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                                </svg>
                                                <p className="text-text-color">
                                                    {subject.subjectType.subTypeNameThai}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-text-color-alt mb-1">หน่วยกิต</p>
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-text-color">
                                                    <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-sm font-medium">
                                                        {subject.subCredit} หน่วยกิต
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <p className="text-text-color-alt mb-1">คุณครูผู้สอน</p>
                                            <div className="flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                                <p className="text-text-color">
                                                    {subject.teacher.fName} {subject.teacher.lName}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md border border-line p-6 h-full">
                                <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    สถิติ
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-primary/5 p-4 rounded-lg text-center">
                                        <p className="text-4xl font-bold text-primary">
                                            {subject.timetable.length}
                                        </p>
                                        <p className="text-text-color-alt font-body text-sm mt-1">
                                            ตารางเรียน
                                        </p>
                                    </div>
                                    <div className="bg-secondary/5 p-4 rounded-lg text-center">
                                        <p className="text-4xl font-bold text-secondary">
                                            {subject.timetable.reduce((total, time) => total + (time.studyTime?.length || 0), 0)}
                                        </p>
                                        <p className="text-text-color-alt font-body text-sm mt-1">
                                            คาบเรียนทั้งหมด
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                        <div className="border-b border-line p-6">
                            <h2 className="text-xl font-bold text-primary font-heading mb-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                ตารางสอน
                            </h2>
                            <p className="text-text-color-alt font-body">รายละเอียดตารางสอนของรายวิชานี้ทั้งหมด</p>
                        </div>
                        
                        <div className="p-6">
                            {subject.timetable.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {subject.timetable.map((time) => (
                                        <div key={time.timetableId} className="border border-line rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md">
                                            <div className={`h-1 ${time.dayOfWeek % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}></div>
                                            <div 
                                                className={`p-5 cursor-pointer transition-all duration-200 ${
                                                    selectedTimetable === time.timetableId 
                                                        ? 'bg-gray-50' 
                                                        : 'bg-white hover:bg-gray-50'
                                                }`}
                                                onClick={() => setSelectedTimetable(selectedTimetable === time.timetableId ? null : time.timetableId)}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="inline-block bg-primary/10 text-primary px-2 py-1 text-xs font-medium rounded-md">
                                                        ห้อง {time.classroom.classLevel}/{time.classroom.classRoom}
                                                    </span>
                                                    <div className="flex items-center text-text-color-alt text-xs">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V4z" clipRule="evenodd" />
                                                        </svg>
                                                        {time.timeStart.substring(0, 5)} - {time.timeEnd.substring(0, 5)} น.
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center mb-1 text-text-color font-medium">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                    </svg>
                                                    วัน{getDayName(time.dayOfWeek)}
                                                </div>
                                                
                                                <div className="text-text-color-alt text-sm mt-4">
                                                    {time.studyTime && time.studyTime.length > 0 ? (
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            มีทั้งหมด {time.studyTime.length} คาบเรียน
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                            </svg>
                                                            ยังไม่มีคาบเรียนบันทึกไว้
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex justify-end mt-4">
                                                    <button 
                                                        className="flex items-center text-sm text-primary hover:text-accent transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTimetable(selectedTimetable === time.timetableId ? null : time.timetableId);
                                                        }}
                                                    >
                                                        {selectedTimetable === time.timetableId ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                                                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform duration-300 ${selectedTimetable === time.timetableId ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                
                                                {selectedTimetable === time.timetableId && time.studyTime && time.studyTime.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-line">
                                                        <h4 className="font-medium mb-3 text-sm text-text-color">คาบเรียนทั้งหมด:</h4>
                                                        <div className="bg-gray-50 rounded-lg p-2 max-h-64 overflow-y-auto" 
                                                            onClick={(e) => e.stopPropagation()}>
                                                            {time.studyTime
                                                                .sort((a, b) => new Date(a.studingTimeDate) - new Date(b.studingTimeDate))
                                                                .map((study) => (
                                                                <div 
                                                                    key={study.studyTimeId}
                                                                    className="py-2 px-3 rounded bg-white hover:bg-gray-100 mb-1 transition-colors"
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="font-medium text-text-color">{formatDate(study.studingTimeDate)}</span>
                                                                        <span className="text-xs text-text-color-alt">สัปดาห์ที่ {Math.ceil(
                                                                            (new Date(study.studingTimeDate) - new Date(time.studyTime[0].studingTimeDate)) / 
                                                                            (7 * 24 * 60 * 60 * 1000) + 1
                                                                        )}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-text-color-alt">
                                    ไม่พบข้อมูลตารางสอนสำหรับวิชานี้
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
                    <div className="flex justify-center mb-4 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">ไม่พบข้อมูลวิชาที่ต้องการ</h2>
                    <p className="text-text-color-alt font-body">ไม่สามารถโหลดข้อมูลรายวิชาได้ กรุณาลองอีกครั้งในภายหลัง</p>
                </div>
            )}
        </>
    );
}

export default SubjectDetail;