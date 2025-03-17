import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { formatDate } from "../../helper";
import { DateTime } from "luxon";

function EditCheckIn() {
    const { id } = useParams();
    // const location = useLocation();
    // const searchParams = new URLSearchParams(location.search);
    // const date = searchParams.get('date');
    let [searchParams, setSearchParams] = useSearchParams();
    const date = searchParams.get('date');

    const [targetDate, setTargetDate] = useState(null);
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
    const [isValidDate, setIsValidDate] = useState(false);

    const checkValidDate = (activity) => {
        if (!activity || !targetDate) return false;
        
        const startDate = DateTime.fromISO(activity.actDate).setZone('Asia/Bangkok');
        const endDate = DateTime.fromISO(activity.actDateEnd).setZone('Asia/Bangkok');
        const checkDate = DateTime.fromISO(targetDate).setZone('Asia/Bangkok');
        
        return checkDate >= startDate.startOf('day') && checkDate <= endDate.endOf('day');
    };

    const getDateParticipation = (participations) => {
        if (!targetDate) return [];
        
        const checkDate = DateTime.fromISO(targetDate).setZone('Asia/Bangkok').startOf('day');
        return participations.filter(p => {
            const participationDate = DateTime.fromISO(p.joinTimestamp)
                .setZone('Asia/Bangkok')
                .startOf('day');
            return participationDate.equals(checkDate);
        });
    };

    useEffect(() => {
        if (date) {
            setTargetDate(date);
        } else {
            // If no date parameter provided, use today's date
            setTargetDate(DateTime.now().setZone('Asia/Bangkok').toISODate());
        }
    }, [date]);

    useEffect(() => {
        const fetchData = async () => {
            if (!targetDate) return;
            
            try {
                setLoading(true);
                const [activityResponse, classroomsResponse] = await Promise.all([
                    axios.get(`${HOSTNAME}/t/activity/${id}`),
                    axios.get(`${HOSTNAME}/t/classrooms/all`)
                ]);

                const activity = activityResponse.data;
                setActivity(activity);
                
                const isDateValid = checkValidDate(activity);
                setIsValidDate(isDateValid);
                
                if (!isDateValid) {
                    setError('ไม่สามารถบันทึกการเข้าร่วมได้ เนื่องจากไม่อยู่ในช่วงวันที่จัดกิจกรรม');
                }

                // Filter participations by the selected date
                const dateParticipations = getDateParticipation(activity.actParticipate);
                
                // Initialize notes from date's participation data
                const participationNotes = {};
                dateParticipations.forEach(participation => {
                    participationNotes[participation.stdId] = participation.note || '';
                });
                setNotes(participationNotes);

                // Initialize statuses from date's participation data
                const initialStatuses = {};
                dateParticipations.forEach(participation => {
                    initialStatuses[participation.stdId] = 'PRESENT';
                });
                setStudentStatuses(initialStatuses);

                if (activityResponse.data.joinLimit) {
                    if (activityResponse.data.joinLimitNumber) {
                        setAvailableClassrooms(classroomsResponse.data);
                        const allStudents = classroomsResponse.data.flatMap(c => c.classroomMembers);
                        setStudents(allStudents);
                    } else if (activityResponse.data.classroom) {
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
    }, [id, targetDate]);

    useEffect(() => {
        let result = [...students];
        
        if (selectedClassroomId !== 'all') {
            result = result.filter(student => 
                student.classId === selectedClassroomId
            );
        }

        result.sort((a, b) => parseInt(a.stdNo) - parseInt(b.stdNo));
        
        setFilteredStudents(result);
    }, [students, selectedClassroomId]);

    const handleAttendanceChange = async (studentId, status, note = notes[studentId] || '') => {
        if (!isValidDate) {
            setError('ไม่สามารถบันทึกการเข้าร่วมได้ เนื่องจากไม่อยู่ในช่วงวันที่จัดกิจกรรม');
            return;
        }

        try {
            await axios.post(`${HOSTNAME}/t/activity/${id}/participate`, {
                stdId: studentId,
                status: status,
                note: status === 'ABSENT' ? '' : note,
                date: targetDate // Send the target date to the API
            });
            
            setStudentStatuses(prev => ({
                ...prev,
                [studentId]: status
            }));

            if (status === 'ABSENT') {
                handleNoteChange(studentId, '');
            }

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
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            
            {activity && (
                <>
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h1 className="text-3xl font-bold mb-6">บันทึกการเข้าร่วมกิจกรรม</h1>
                        <div className="space-y-3">
                            <p className="text-xl">
                                <span className="font-bold">กิจกรรม:</span> {activity.actName}
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">ช่วงวันที่กิจกรรม:</span> {formatDate(activity.actDate)} - {formatDate(activity.actDateEnd)}
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">เวลา:</span> {activity.actStartTime} - {activity.actEndTime} น.
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">สถานที่:</span> {activity.actLocation}
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">วันที่บันทึกการเข้าร่วม:</span> {formatDate(targetDate)}
                            </p>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    เลือกวันที่ต้องการแก้ไข:
                                </label>
                                <input 
                                    type="date" 
                                    className="border rounded-md px-3 py-2"
                                    value={targetDate || ''}
                                    onChange={(e) => {
                                        setTargetDate(e.target.value)
                                        setSearchParams({ date: e.target.value });
                                    }}
                                    min={DateTime.fromISO(activity.actDate).setZone('Asia/Bangkok').toISODate()}
                                    max={DateTime.fromISO(activity.actDateEnd).setZone('Asia/Bangkok').toISODate()}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold mb-4">รายชื่อนักเรียน</h2>
                            
                            {!isValidDate && (
                                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                                    <p className="font-bold">แจ้งเตือน</p>
                                    <p>สามารถบันทึกการเข้าร่วมได้เฉพาะในช่วงวันที่จัดกิจกรรมเท่านั้น</p>
                                </div>
                            )}
                            
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
                                        const dateParticipation = activity.actParticipate.find(p => {
                                            const participationDate = DateTime.fromISO(p.joinTimestamp)
                                                .setZone('Asia/Bangkok')
                                                .startOf('day');
                                            const checkDate = DateTime.fromISO(targetDate)
                                                .setZone('Asia/Bangkok')
                                                .startOf('day');
                                            return p.stdId === student.stdId && 
                                                   participationDate.equals(checkDate);
                                        });
                                        
                                        const isAbsent = studentStatuses[student.stdId] === 'ABSENT';
                                        const canAddNote = dateParticipation && !isAbsent;
                                        
                                        return (
                                            <tr key={student.stdId} className={`hover:bg-gray-50 ${!isValidDate ? 'opacity-50' : ''}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.stdNo}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{student.stdId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {student.student.title === 'BOY' ? 'เด็กชาย' : 'เด็กหญิง'} {student.student.fName} {student.student.lName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex justify-center gap-3">
                                                        <label className={`relative flex items-center gap-2 ${!isValidDate ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            <input
                                                                type="radio"
                                                                name={`status-${student.stdId}`}
                                                                value="PRESENT"
                                                                checked={dateParticipation !== undefined}
                                                                onChange={(e) => handleAttendanceChange(student.stdId, e.target.value)}
                                                                className="sr-only peer"
                                                                disabled={!isValidDate}
                                                            />
                                                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full peer-checked:border-green-500 peer-checked:bg-green-500"></div>
                                                            <span className="peer-checked:text-green-500">เข้าร่วม</span>
                                                        </label>
                                                        <label className={`relative flex items-center gap-2 ${!isValidDate ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                                            <input
                                                                type="radio"
                                                                name={`status-${student.stdId}`}
                                                                value="ABSENT"
                                                                checked={dateParticipation === undefined}
                                                                onChange={(e) => handleAttendanceChange(student.stdId, e.target.value)}
                                                                className="sr-only peer"
                                                                disabled={!isValidDate}
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

export default EditCheckIn;