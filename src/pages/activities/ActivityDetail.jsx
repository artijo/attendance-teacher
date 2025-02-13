import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HOSTNAME } from "../../config";
import { formatDate } from "../../helper";

function ActivityDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleCheckIn = () => {
        navigate(`/activities/${id}/check-in`);
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
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">
                        {activity.actName}
                    </h1>

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

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleCheckIn}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                            >
                                เช็คชื่อนักเรียน
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ActivityDetail;
