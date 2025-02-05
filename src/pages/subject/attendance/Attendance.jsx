import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { HOSTNAME } from '../../../config';
import { formatDate, formatTitle } from '../../../helper';

function Attendance() {
    const { studingid } = useParams();
    const navigate = useNavigate();
    const [studyTime, setStudyTime] = useState(null);
    const [attendanceStatus, setAttendanceStatus] = useState({});
    const [notes, setNotes] = useState({}); // Add notes state
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        axios.get(`${HOSTNAME}/t/studyTime/${studingid}`)
            .then((response) => {
                console.log(response.data);
                setStudyTime(response.data);
                // Initialize attendance status from existing data
                const initialStatus = {};
                const initialNotes = {}; // Initialize notes
                response.data.attendance.forEach(att => {
                    initialStatus[att.stdId] = {
                        status: att.attStatus,
                        method: att.attMethod.attMethodName,
                        timestamp: att.attTimestamp
                    };
                    initialNotes[att.stdId] = att.note || ''; // Set initial notes
                });
                setAttendanceStatus(initialStatus);
                setNotes(initialNotes);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [studingid]);

    const handleStatusChange = (stdId, status) => {
        setAttendanceStatus(prev => ({
            ...prev,
            [stdId]: { ...prev[stdId], status }
        }));
        // TODO: Add API call to update attendance
    };

    const handleNoteChange = (stdId, note) => {
        setNotes(prev => ({
            ...prev,
            [stdId]: note
        }));
    };

    const handleSaveAttendance = async () => {
        try {
            setIsSaving(true);
            const attendanceData = Object.entries(attendanceStatus).map(([stdId, data]) => ({
                stdId,
                studingTimeId: studingid,
                attStatus: data.status,
                note: notes[stdId] || '', // Include notes in save data
            }));
            console.log(attendanceData);

            await axios.post(`${HOSTNAME}/t/attendance/bulk`, attendanceData);
            alert('บันทึกการเข้าเรียนเรียบร้อย');
            navigate(-1);
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setIsSaving(false);
        }
    };

    const statusOptions = [
        { value: 'PRESENT', label: 'มาเรียน', color: 'bg-green-100' },
        { value: 'ABSENT', label: 'ขาดเรียน', color: 'bg-red-100' },
        { value: 'LATE', label: 'มาสาย', color: 'bg-yellow-100' },
        { value: 'ACTIVITY', label: 'กิจกรรม', color: 'bg-blue-100' },
        { value: 'LEAVE', label: 'ลา', color: 'bg-purple-100' }
    ];

    return (
        <div className="container mx-auto">
            {studyTime && (
                <>
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h1 className="text-3xl font-bold mb-6">บันทึกการเข้าเรียน</h1>
                        <div className="space-y-3">
                            <p className="text-xl">
                                <span className="font-bold">วันที่:</span> {formatDate(studyTime.studingTimeDate)}
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">เวลา:</span> {studyTime.timetable.timeStart.substring(0, 5)} - {studyTime.timetable.timeEnd.substring(0, 5)} น.
                            </p>
                            <p className="text-lg">
                                <span className="font-bold">ห้องเรียน:</span> {studyTime.timetable.classroom.classLevel}/{studyTime.timetable.classroom.classRoom}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">เลขที่</th>
                                        <th className="px-4 py-2 text-left">รหัสนักศึกษา</th>
                                        <th className="px-4 py-2 text-left">ชื่อ-สกุล</th>
                                        <th className="px-4 py-2">สถานะ</th>
                                        <th className="px-4 py-2">หมายเหตุ</th>
                                        <th className="px-4 py-2">การบันทึก</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studyTime.timetable.classroom.classroomMembers
                                        .sort((a, b) => parseInt(a.stdNo) - parseInt(b.stdNo))
                                        .map((member) => {
                                            const attendance = studyTime.attendance.find(att => att.stdId === member.stdId);
                                            return (
                                                <tr key={member.stdId} className="border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2">{member.stdNo}</td>
                                                    <td className="px-4 py-2">{member.stdId}</td>
                                                    <td className="px-4 py-2">
                                                        {formatTitle(member.student.title)} {member.student.fName} {member.student.lName}
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex gap-3 justify-center">
                                                            {statusOptions.map(option => (
                                                                <label 
                                                                    key={option.value}
                                                                    className={`flex items-center space-x-2 p-2 rounded cursor-pointer
                                                                        ${attendanceStatus[member.stdId]?.status === option.value ? option.color : ''}`}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`status-${member.stdId}`}
                                                                        value={option.value}
                                                                        checked={attendanceStatus[member.stdId]?.status === option.value}
                                                                        onChange={() => handleStatusChange(member.stdId, option.value)}
                                                                        className="hidden"
                                                                    />
                                                                    <span className="text-sm whitespace-nowrap">
                                                                        {option.label}
                                                                    </span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <input
                                                            type="text"
                                                            value={notes[member.stdId] || ''}
                                                            onChange={(e) => handleNoteChange(member.stdId, e.target.value)}
                                                            placeholder="เพิ่มหมายเหตุ..."
                                                            className="w-full p-2 border rounded-lg focus:outline-none focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        {attendanceStatus[member.stdId]?.method && (
                                                            <div className="text-sm text-gray-600">
                                                                {attendanceStatus[member.stdId].method}
                                                                <br />
                                                                {new Date(attendanceStatus[member.stdId].timestamp).toLocaleTimeString('th-TH')}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleSaveAttendance}
                                disabled={isSaving}
                                className={`px-6 py-2 bg-green-500 text-white rounded-lg transition-colors
                                    ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'}`}
                            >
                                {isSaving ? 'กำลังบันทึก...' : 'บันทึกการเข้าเรียน'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Attendance;