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
    const [changes, setChanges] = useState({}); // Track changes

    useEffect(() => {
        axios.get(`${HOSTNAME}/t/studyTime/${studingid}`)
            .then((response) => {
                setStudyTime(response.data);
                // Initialize attendance status from existing data
                const initialStatus = {};
                const initialNotes = {}; // Initialize notes
                response.data.attendance.forEach(att => {
                    initialStatus[att.stdId] = {
                        status: att.attStatus,
                        method: att.attMethod.attMethodName,
                        timestamp: att.attTimestamp,
                        attId: att.attId // Store existing attendance ID
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
        // Track change
        setChanges(prev => ({
            ...prev,
            [stdId]: true
        }));
    };

    const handleNoteChange = (stdId, note) => {
        setNotes(prev => ({
            ...prev,
            [stdId]: note
        }));
        // Track change
        setChanges(prev => ({
            ...prev,
            [stdId]: true
        }));
    };

    const handleSaveAttendance = async () => {
        try {
            setIsSaving(true);
            // Filter only changed records
            const changedRecords = Object.keys(changes).map(stdId => ({
                attId: attendanceStatus[stdId]?.attId, // Include if updating existing record
                stdId,
                studingTimeId: studingid,
                attStatus: attendanceStatus[stdId]?.status || 'ABSENT', // Default to ABSENT if not set
                note: notes[stdId] || ''
            }));

            if (changedRecords.length === 0) {
                alert('ไม่มีการเปลี่ยนแปลงข้อมูล');
                return;
            }

            // Separate new and existing records
            const newRecords = changedRecords.filter(record => !record.attId);
            const updatedRecords = changedRecords.filter(record => record.attId);

            // Send updates in parallel if needed
            await Promise.all([
                newRecords.length > 0 && axios.post(`${HOSTNAME}/t/attendance/bulk`, newRecords),
                updatedRecords.length > 0 && axios.post(`${HOSTNAME}/t/attendance/bulk`, updatedRecords)
            ]);

            alert('บันทึกการเข้าเรียนเรียบร้อย');
            navigate(-1);
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setIsSaving(false);
        }
    };

    // Add reset changes function
    const handleReset = (stdId) => {
        const attendance = studyTime.attendance.find(att => att.stdId === stdId);
        if (attendance) {
            setAttendanceStatus(prev => ({
                ...prev,
                [stdId]: {
                    status: attendance.attStatus,
                    method: attendance.attMethod.attMethodName,
                    timestamp: attendance.attTimestamp,
                    attId: attendance.attId
                }
            }));
            setNotes(prev => ({
                ...prev,
                [stdId]: attendance.note || ''
            }));
            setChanges(prev => {
                const newChanges = { ...prev };
                delete newChanges[stdId];
                return newChanges;
            });
        }
    };

    const statusOptions = [
        { value: 'PRESENT', label: 'มาเรียน', color: 'bg-green-100', hoverColor: 'hover:bg-green-200', borderColor: 'border-green-300' },
        { value: 'ABSENT', label: 'ขาดเรียน', color: 'bg-red-100', hoverColor: 'hover:bg-red-200', borderColor: 'border-red-300' },
        { value: 'LATE', label: 'มาสาย', color: 'bg-yellow-100', hoverColor: 'hover:bg-yellow-200', borderColor: 'border-yellow-300' },
        { value: 'ACTIVITY', label: 'กิจกรรม', color: 'bg-blue-100', hoverColor: 'hover:bg-blue-200', borderColor: 'border-blue-300' },
        { value: 'LEAVE', label: 'ลา', color: 'bg-purple-100', hoverColor: 'hover:bg-purple-200', borderColor: 'border-purple-300' }
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
                            <table className="min-w-full whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-2 py-2 text-left w-16">เลขที่</th>
                                        <th className="px-2 py-2 text-left w-32">รหัสนักเรียน</th>
                                        <th className="px-2 py-2 text-left w-48">ชื่อ-สกุล</th>
                                        <th className="px-2 py-2" style={{ minWidth: '400px' }}>สถานะ</th>
                                        <th className="px-2 py-2 w-48">หมายเหตุ</th>
                                        <th className="px-2 py-2 w-32">การบันทึก</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studyTime.timetable.classroom.classroomMembers
                                        .sort((a, b) => parseInt(a.stdNo) - parseInt(b.stdNo))
                                        .map((member) => {
                                            const attendance = studyTime.attendance.find(att => att.stdId === member.stdId);
                                            return (
                                                <tr key={member.stdId} className={`border-b hover:bg-gray-50 ${changes[member.stdId] ? 'bg-yellow-50' : ''}`}>
                                                    <td className="px-2 py-2">{member.stdNo}</td>
                                                    <td className="px-2 py-2">{member.stdId}</td>
                                                    <td className="px-2 py-2">
                                                        {formatTitle(member.student.title)} {member.student.fName} {member.student.lName}
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <div className="flex gap-2 items-center">
                                                            {statusOptions.map(option => (
                                                                <label 
                                                                    key={option.value}
                                                                    className={`
                                                                        relative flex items-center px-3 py-1.5 rounded-full border-2 
                                                                        transition-all duration-200 cursor-pointer select-none
                                                                        ${attendanceStatus[member.stdId]?.status === option.value 
                                                                            ? `${option.color} ${option.borderColor} shadow-sm` 
                                                                            : 'bg-white border-gray-300 hover:border-gray-400'}
                                                                        ${option.hoverColor}
                                                                    `}
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={`status-${member.stdId}`}
                                                                        value={option.value}
                                                                        checked={attendanceStatus[member.stdId]?.status === option.value}
                                                                        onChange={() => handleStatusChange(member.stdId, option.value)}
                                                                        className="absolute opacity-0"
                                                                    />
                                                                    <div className="flex items-center whitespace-nowrap">
                                                                        <div className={`
                                                                            w-2.5 h-2.5 rounded-full mr-1.5 border
                                                                            ${attendanceStatus[member.stdId]?.status === option.value 
                                                                                ? 'bg-white border-gray-600' 
                                                                                : 'bg-gray-200 border-gray-400'}
                                                                        `}></div>
                                                                        <span className="text-sm">
                                                                            {option.label}
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <input
                                                            type="text"
                                                            value={notes[member.stdId] || ''}
                                                            onChange={(e) => handleNoteChange(member.stdId, e.target.value)}
                                                            placeholder="เพิ่มหมายเหตุ..."
                                                            className="w-full p-1.5 border rounded-lg focus:outline-none focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2 text-center text-sm text-gray-600">
                                                        {changes[member.stdId] && attendanceStatus[member.stdId]?.attId && (
                                                            <button
                                                                onClick={() => handleReset(member.stdId)}
                                                                className="text-blue-500 hover:text-blue-700 underline mb-2 block"
                                                            >
                                                                ยกเลิกการแก้ไข
                                                            </button>
                                                        )}
                                                        {attendanceStatus[member.stdId]?.method && (
                                                            <>
                                                                {attendanceStatus[member.stdId].method}
                                                                <br />
                                                                {new Date(attendanceStatus[member.stdId].timestamp).toLocaleTimeString('th-TH')}
                                                            </>
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