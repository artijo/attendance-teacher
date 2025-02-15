import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { formatDate } from "../../helper";

function CheckIn() {
    const { id } = useParams();
    const [activity, setActivity] = useState(null);
    const [classrooms, setClassrooms] = useState([]);
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedClassroom, setSelectedClassroom] = useState(null);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState('all');
    const [availableClassrooms, setAvailableClassrooms] = useState([]);
    const [notes, setNotes] = useState({});
    const [studentStatuses, setStudentStatuses] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [activityResponse, classroomsResponse] = await Promise.all([
                    axios.get(`${HOSTNAME}/t/activity/${id}`),
                    axios.get(`${HOSTNAME}/t/classrooms/all`)
                ]);

                setActivity(activityResponse.data);
                setClassrooms(classroomsResponse.data);

                // Initialize notes from existing participation data
                const participationNotes = {};
                activityResponse.data.actParticipate.forEach(participation => {
                    participationNotes[participation.stdId] = participation.note || '';
                });
                setNotes(participationNotes);

                // Initialize statuses from participation data
                const initialStatuses = {};
                activityResponse.data.actParticipate.forEach(participation => {
                    initialStatuses[participation.stdId] = 'PRESENT';
                });
                setStudentStatuses(initialStatuses);

                // Modified classroom filtering logic
                if (activityResponse.data.joinLimit) {
                    if (activityResponse.data.joinLimitNumber) {
                        // If there's a number limit, show all classrooms
                        setAvailableClassrooms(classroomsResponse.data);
                        const allStudents = classroomsResponse.data.flatMap(c => c.classroomMembers);
                        setStudents(allStudents);
                    } else if (activityResponse.data.classroom) {
                        // If there's classroom restriction, filter by allowed classrooms
                        const allowedClassIds = activityResponse.data.classroom.map(c => c.classId);
                        const filteredClassrooms = classroomsResponse.data.filter(c => 
                            allowedClassIds.includes(c.classId)
                        );
                        setAvailableClassrooms(filteredClassrooms);
                        const filteredStudents = classroomsResponse.data
                            .filter(c => allowedClassIds.includes(c.classId))
                            .flatMap(c => c.classroomMembers);
                        setStudents(filteredStudents);
                    }
                } else {
                    // No limits, show all
                    setAvailableClassrooms(classroomsResponse.data);
                    const allStudents = classroomsResponse.data.flatMap(c => c.classroomMembers);
                    setStudents(allStudents);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        let result = [...students];
        
        // Apply classroom filter
        if (selectedClassroomId !== 'all') {
            result = result.filter(student => 
                student.classId === selectedClassroomId
            );
        }

        // Sort by student number
        result.sort((a, b) => parseInt(a.stdNo) - parseInt(b.stdNo));
        
        setFilteredStudents(result);
    }, [students, selectedClassroomId]);

    const handleAttendanceChange = async (studentId, status, note = notes[studentId] || '') => {
        try {
            await axios.post(`${HOSTNAME}/t/activity/${id}/participate`, {
                stdId: studentId,
                status: status,
                note: status === 'ABSENT' ? '' : note
            });
            
            // Update local status state
            setStudentStatuses(prev => ({
                ...prev,
                [studentId]: status
            }));

            // Clear note if status is ABSENT
            if (status === 'ABSENT') {
                handleNoteChange(studentId, '');
            }

            // Refresh activity data
            const response = await axios.get(`${HOSTNAME}/t/activity/${id}`);
            setActivity(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
    };

    const handleNoteChange = (studentId, note) => {
        setNotes(prev => ({
            ...prev,
            [studentId]: note
        }));
    };

    const handleClassroomFilter = (classroomId) => {
        setSelectedClassroomId(classroomId);
    };

    if (loading) return <div className="text-center p-4">กำลังโหลด...</div>;
    if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

    return (
        <div className="container mx-auto">
            {activity && (
                <>
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h1 className="text-3xl font-bold mb-6">บันทึกการเข้าร่วมกิจกรรม</h1>
                        <div className="space-y-3">
                            <p className="text-xl">
                                <span className="font-bold">กิจกรรม:</span> {activity.actName}
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">วันที่:</span> {formatDate(activity.actDate)}
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">เวลา:</span> {activity.actStartTime} - {activity.actEndTime} น.
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">สถานที่:</span> {activity.actLocation}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-4">รายชื่อนักเรียน</h2>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    กรองตามห้องเรียน:
                                </label>
                                <select
                                    className="border rounded-md px-3 py-2 w-full max-w-xs"
                                    value={selectedClassroomId}
                                    onChange={(e) => handleClassroomFilter(e.target.value)}
                                >
                                    <option value="all">ทุกห้องเรียน</option>
                                    {availableClassrooms.map((classroom) => (
                                        <option key={classroom.classId} value={classroom.classId}>
                                            ม.{classroom.classLevel}/{classroom.classRoom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {activity.joinLimit && (
                                <p className="text-gray-600 mb-4">
                                    จำกัดการเข้าร่วมเฉพาะห้องที่กำหนด
                                </p>
                            )}
                        </div>

                        <div className="overflow-x-auto w-full">
                            <table className="min-w-full table-fixed">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-6 py-3 text-left w-20">เลขที่</th>
                                        <th className="px-6 py-3 text-left w-32">รหัสนักเรียน</th>
                                        <th className="px-6 py-3 text-left">ชื่อ-นามสกุล</th>
                                        <th className="px-6 py-3 text-center w-64">สถานะ</th>
                                        <th className="px-6 py-3 text-left w-64">หมายเหตุ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredStudents.map((student) => {
                                        const participation = activity.actParticipate.find(p => p.stdId === student.stdId);
                                        const isAbsent = studentStatuses[student.stdId] === 'ABSENT';
                                        const canAddNote = participation && !isAbsent;
                                        
                                        return (
                                            <tr key={student.stdId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">{student.stdNo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.stdId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.student.title === 'BOY' ? 'เด็กชาย' : 'เด็กหญิง'} {student.student.fName} {student.student.lName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex justify-center gap-3">
                                                        <label className="relative flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`status-${student.stdId}`}
                                                                value="PRESENT"
                                                                defaultChecked={participation !== undefined}
                                                                onChange={(e) => handleAttendanceChange(student.stdId, e.target.value)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full peer-checked:border-green-500 peer-checked:bg-green-500"></div>
                                                            <span className="peer-checked:text-green-500">เข้าร่วม</span>
                                                        </label>
                                                        <label className="relative flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`status-${student.stdId}`}
                                                                value="ABSENT"
                                                                defaultChecked={participation === undefined}
                                                                onChange={(e) => handleAttendanceChange(student.stdId, e.target.value)}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full peer-checked:border-red-500 peer-checked:bg-red-500"></div>
                                                            <span className="peer-checked:text-red-500">ไม่เข้าร่วม</span>
                                                        </label>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        type="text"
                                                        className={`w-full border rounded px-2 py-1 ${
                                                            !canAddNote ? 'bg-gray-100 cursor-not-allowed' : ''
                                                        }`}
                                                        placeholder="หมายเหตุ..."
                                                        value={!canAddNote ? '' : (notes[student.stdId] || '')}
                                                        onChange={(e) => {
                                                            if (canAddNote) {
                                                                handleNoteChange(student.stdId, e.target.value);
                                                                handleAttendanceChange(
                                                                    student.stdId,
                                                                    'PRESENT',
                                                                    e.target.value
                                                                );
                                                            }
                                                        }}
                                                        disabled={!canAddNote}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default CheckIn;