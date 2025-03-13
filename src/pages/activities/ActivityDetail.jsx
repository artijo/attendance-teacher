import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { formatDate } from "../../helper";
import { DateTime } from "luxon";
import { convertNumberToThaiMonth } from "../../helper";
import DropdownExportDocument from "../../components/DropdownExportDocument";
import TextDropdownDocument from "../../components/TextDropdownDocument";
import { abstactActivity, abstactActivityFilterByClassroom } from "../../excel";

function ActivityDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState('all');

    useEffect(() => {
        const fetchActivityDetail = async () => {
            console.log(id)
            try {
                setLoading(true);
                const response = await axios.get(`${HOSTNAME}/t/activity/${id}`);
                if (response.status === 200) {
                    console.log(response.data);
                    setActivity(response.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
            } finally {
                setLoading(false);
            }
        };

        fetchActivityDetail();
    }, [id]);

    useEffect(() => {
        if (activity) {
            const now = DateTime.now().setZone('Asia/Bangkok');
            const startDate = DateTime.fromISO(activity.actDate).setZone('Asia/Bangkok');
            const endDate = DateTime.fromISO(activity.actDateEnd).setZone('Asia/Bangkok');
            
            // Check if current date is within activity period
            if (now >= startDate && now <= endDate) {
                setSelectedDate(now.toISODate());
            } else {
                // If not in period, set to activity end date
                setSelectedDate(endDate.toISODate());
            }
        }
    }, [activity]);

    const handleCheckIn = () => {
        navigate(`/activities/${id}/check-in`);
    };

    const isActivityEnded = (activity) => {
        const endDate = DateTime.fromISO(activity.actDateEnd)
            .setZone('Asia/Bangkok')
            .set({
                hour: parseInt(activity.actEndTime.split(':')[0]),
                minute: parseInt(activity.actEndTime.split(':')[1])
            });
        return DateTime.now().setZone('Asia/Bangkok') > endDate;
    };

    const getDatesBetween = (startDate, endDate) => {
        const dates = [];
        let current = DateTime.fromISO(startDate).setZone('Asia/Bangkok').startOf('day');
        const end = DateTime.fromISO(endDate).setZone('Asia/Bangkok').startOf('day');
        
        while (current <= end) {
            dates.push(current.toISODate());
            current = current.plus({ days: 1 });
        }
        return dates;
    };

    const isRecordMatchingDate = (record) => {
        if (!selectedDate) return true;
        const recordDate = DateTime.fromISO(record.joinTimestamp).setZone('Asia/Bangkok');
        const filterDate = DateTime.fromISO(selectedDate).setZone('Asia/Bangkok');
        return recordDate.hasSame(filterDate, 'day');
    };

    const getUniqueClassrooms = (participations) => {
        const classrooms = participations
            .filter(p => p.student.classroomMembers && p.student.classroomMembers[0])
            .map(p => ({
                classId: p.student.classroomMembers[0].classroom.classId,
                classLevel: p.student.classroomMembers[0].classroom.classLevel,
                classRoom: p.student.classroomMembers[0].classroom.classRoom
            }));

        // Remove duplicates
        return Array.from(new Map(classrooms.map(item => 
            [item.classId, item]
        )).values()).sort((a, b) => {
            if (a.classLevel === b.classLevel) {
                return a.classRoom - b.classRoom;
            }
            return a.classLevel - b.classLevel;
        });
    };

    const filteredParticipations = activity?.actParticipate
        .filter(record => {
            const matchesDate = isRecordMatchingDate(record);
            const matchesClassroom = selectedClassroom === 'all' || 
                (record.student.classroomMembers && 
                 record.student.classroomMembers[0]?.classroom.classId === selectedClassroom);
            return matchesDate && matchesClassroom;
        }) || [];

    const formatThaiDateTime = (dateTime) => {
        const dt = DateTime.fromISO(dateTime).setZone('Asia/Bangkok');
        const day = dt.toFormat('d');
        const month = convertNumberToThaiMonth(dt.month);
        const year = dt.year + 543;
        const time = dt.toFormat("HH:mm 'น.'");
        return `${day} ${month} ${year} ${time}`;
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">กำลังโหลด...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">ไม่พบข้อมูลกิจกรรม</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                {activity.actName}
                            </h1>
                            <div className="mt-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isActivityEnded(activity) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                    {isActivityEnded(activity) ? 'สิ้นสุดกิจกรรม' : 'กิจกรรมกำลังดำเนินการ'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end pb-4">
                            {!isActivityEnded(activity) && (
                                <button
                                    onClick={handleCheckIn}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                                >
                                    เช็คชื่อนักเรียน
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-700">รายละเอียด</h2>
                            <p className="text-gray-600 mt-2">{activity.actDesc}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">วันที่จัดกิจกรรม</h2>
                                <p className="text-gray-600">
                                    {formatDate(activity.actDate)} - {formatDate(activity.actDateEnd)}
                                </p>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">เวลา</h2>
                                <p className="text-gray-600">
                                    {activity.actStartTime} - {activity.actEndTime} น.
                                </p>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">สถานที่</h2>
                            <p className="text-gray-600">{activity.actLocation}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">ประเภทกิจกรรม</h2>
                            <p className="text-gray-600">{activity.activityType.actTypeName}</p>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-700">การจำกัดจำนวน</h2>
                            <p className="text-gray-600">
                                {activity.joinLimit ? 
                                    (activity.joinLimitNumber ? 
                                        `จำกัด ${activity.joinLimitNumber} คน` : 
                                        'จำกัดจำนวน (ไม่ระบุจำนวน)') : 
                                    'ไม่จำกัดจำนวน'}
                            </p>
                        </div>

                        {activity.classroom && activity.classroom.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">ห้องเรียนที่เข้าร่วมได้</h2>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {activity.classroom
                                        .sort((a, b) => {
                                            if (a.classroom.classLevel === b.classroom.classLevel) {
                                                return a.classroom.classRoom - b.classroom.classRoom;
                                            }
                                            return a.classroom.classLevel - b.classroom.classLevel;
                                        })
                                        .map((c) => (
                                            <span
                                                key={c.classCanjoinId}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                ม.{c.classroom.classLevel}/{c.classroom.classRoom}
                                            </span>
                                        ))}
                                </div>
                            </div>
                        )}

                        {activity.teacher && activity.teacher.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-700">ครูผู้ดูแล</h2>
                                <div className="mt-2">
                                    {activity.teacher.map((t) => (
                                        <div key={t.actTeacherId} className="text-gray-600">
                                            {t.teacher.fName} {t.teacher.lName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">ประวัติการบันทึก</h2>
                            
                            {/* Add classroom filter */}
                            <div className="flex flex-col  md:flex-row  justify-start gap-4 mb-4 ">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ดาวน์โหลดเอกสาร:
                                    </label>
                                    <DropdownExportDocument>
                                        {
                                            selectedClassroom != 'all' &&
                                            <TextDropdownDocument 
                                                title={`สรุปการเข้ากิจกรรมของห้องเรียนที่เลือก (EXCEL)`}
                                                actionFunction={() => abstactActivity(activity.actId,selectedClassroom)}
                                            />
                                        }
                                        <TextDropdownDocument
                                            title={`สรุปการเข้ากิจกรรมโดยแบ่งตามห้องเรียนที่ความเข้าร่วม (EXCEL)`}
                                            actionFunction={() => abstactActivityFilterByClassroom(activity.actId)}
                                        />
                                    </DropdownExportDocument>
                                </div>
                               
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        กรองตามห้องเรียน:
                                    </label>
                                    <select
                                        className="border rounded-md px-3 py-2 w-full max-w-xs"
                                        value={selectedClassroom}
                                        onChange={(e) => setSelectedClassroom(e.target.value)}
                                    >
                                        <option value="all">ทุกห้องเรียน</option>
                                        {activity && getUniqueClassrooms(activity.actParticipate).map((classroom) => (
                                            <option key={classroom.classId} value={classroom.classId}>
                                                ม.{classroom.classLevel}/{classroom.classRoom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            

                            {/* Date selector */}
                            <div className="relative mb-6">
                                <div className="overflow-x-auto pb-2 hide-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
                                    <div className="flex gap-2 px-1">
                                        {activity && getDatesBetween(activity.actDate, activity.actDateEnd).map((date) => {
                                            const dateTime = DateTime.fromISO(date).setZone('Asia/Bangkok');
                                            const isToday = DateTime.now().setZone('Asia/Bangkok').hasSame(dateTime, 'day');
                                            const thaiMonth = convertNumberToThaiMonth(dateTime.month);
                                            
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => setSelectedDate(date)}
                                                    className={`flex-shrink-0 flex flex-col items-center w-24 py-2 rounded-lg transition-all ${
                                                        selectedDate === date
                                                            ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                                            : 'bg-white border hover:bg-gray-50'
                                                    } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                                                >
                                                    <span className="text-xs mb-1">
                                                        {dateTime.toFormat('ccc')}
                                                    </span>
                                                    <span className="text-lg font-semibold">
                                                        {dateTime.day}
                                                    </span>
                                                    <span className="text-xs">
                                                        {thaiMonth}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Participation table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-fixed">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-6 py-3 text-left w-32">รหัสนักเรียน</th>
                                            <th className="px-6 py-3 text-left">ชื่อ-นามสกุล</th>
                                            <th className="px-6 py-3 text-center w-32">สถานะ</th>
                                            <th className="px-6 py-3 text-left w-64">หมายเหตุ</th>
                                            <th className="px-6 py-3 text-left w-48">บันทึกโดย</th>
                                            <th className="px-6 py-3 text-left w-48">วันเวลาที่บันทึก</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredParticipations.map((record) => (
                                            <tr key={record.actParticipateId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">{record.stdId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {record.student.title === 'BOY' ? 'เด็กชาย' : 'เด็กหญิง'} {record.student.fName} {record.student.lName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        เข้าร่วม
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {record.note || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {record.operateBy === 'TEACHER' && record.teacher ? (
                                                        `${record.teacher.tchCode} ${record.teacher.fName}`
                                                    ) : record.operateBy}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {formatThaiDateTime(record.joinTimestamp)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredParticipations.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        {selectedDate ? 'ไม่พบข้อมูลการบันทึกในวันที่เลือก' : 'ยังไม่มีประวัติการบันทึก'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityDetail;
