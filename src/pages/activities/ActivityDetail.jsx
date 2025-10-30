import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { formatDate, formatTitle } from "../../helper";
import { DateTime } from "luxon";
import { convertNumberToThaiMonth } from "../../helper";
import DropdownExportDocument from "../../components/DropdownExportDocument";
import TextDropdownDocument from "../../components/TextDropdownDocument";

function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state

  useEffect(() => {
    const fetchActivityDetail = async () => {
      console.log(id);
      try {
        setLoading(true);
        const response = await axios.get(`${HOSTNAME}/t/activity/${id}`);
        if (response.status === 200) {
          console.log(response.data);
          setActivity(response.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [id]);

  useEffect(() => {
    if (activity) {
      const now = DateTime.now().setZone(TIME_ZONE);
      const startDate = DateTime.fromISO(activity.actDate).setZone(TIME_ZONE);
      const endDate = DateTime.fromISO(activity.actDateEnd).setZone(TIME_ZONE);

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
      .setZone(TIME_ZONE)
      .set({
        hour: parseInt(activity.actEndTime.split(":")[0]),
        minute: parseInt(activity.actEndTime.split(":")[1]),
      });
    return DateTime.now().setZone(TIME_ZONE) > endDate;
  };

  const isActivityNotStarted = (activity) => {
    const startDate = DateTime.fromISO(activity.actDate)
      .setZone(TIME_ZONE)
      .set({
        hour: parseInt(activity.actStartTime.split(":")[0]),
        minute: parseInt(activity.actStartTime.split(":")[1]),
      });
    return DateTime.now().setZone(TIME_ZONE) < startDate;
  };

  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let current = DateTime.fromISO(startDate).setZone(TIME_ZONE).startOf("day");
    const end = DateTime.fromISO(endDate).setZone(TIME_ZONE).startOf("day");

    while (current <= end) {
      dates.push(current.toISODate());
      current = current.plus({ days: 1 });
    }
    return dates;
  };

  const isRecordMatchingDate = (record) => {
    if (!selectedDate) return true;
    const recordDate = DateTime.fromISO(record.joinTimestamp).setZone(
      TIME_ZONE,
    );
    const filterDate = DateTime.fromISO(selectedDate).setZone(TIME_ZONE);
    return recordDate.hasSame(filterDate, "day");
  };

  const getUniqueClassrooms = (participations) => {
    const classrooms = participations
      .filter(
        (p) => p.student.classroomMembers && p.student.classroomMembers[0],
      )
      .map((p) => ({
        classId: p.student.classroomMembers[0].classroom.classId,
        classLevel: p.student.classroomMembers[0].classroom.classLevel,
        classRoom: p.student.classroomMembers[0].classroom.classRoom,
        className: `${p.student.classroomMembers[0].classroom.classLevel}/${p.student.classroomMembers[0].classroom.classRoom}`,
      }));
    // Remove duplicates
    return Array.from(
      new Map(classrooms.map((item) => [item.classId, item])).values(),
    ).sort((a, b) => {
      if (a.classLevel === b.classLevel) {
        return a.classRoom - b.classRoom;
      }
      return a.classLevel - b.classLevel;
    });
  };

  const filterBySearchQuery = (record) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const studentName =
      `${formatTitle(record.student.title)} ${record.student.fName} ${record.student.lName}`.toLowerCase();
    const studentId = record.stdId.toLowerCase();

    // Get student number if available
    let studentNumber = "";
    if (record.student.classroomMembers && record.student.classroomMembers[0]) {
      studentNumber = record.student.classroomMembers[0].stdNo.toString();
    }

    return (
      studentName.includes(query) ||
      studentId.includes(query) ||
      studentNumber.includes(query)
    );
  };

  const filteredParticipations =
    activity?.actParticipate.filter((record) => {
      const matchesDate = isRecordMatchingDate(record);
      const matchesClassroom =
        selectedClassroom === "all" ||
        (record.student.classroomMembers &&
          record.student.classroomMembers[0]?.classroom.classId ===
            selectedClassroom);
      const matchesSearch = filterBySearchQuery(record);
      return matchesDate && matchesClassroom && matchesSearch;
    }) || [];

  const formatThaiDateTime = (dateTime) => {
    const dt = DateTime.fromISO(dateTime).setZone(TIME_ZONE);
    const day = dt.toFormat("d");
    const month = convertNumberToThaiMonth(dt.month);
    const year = dt.year + 543;
    const time = dt.toFormat("HH:mm 'น.'");
    return `${day} ${month} ${year} ${time}`;
  };

  const handleNaviatePDFFilterByRoom = () => {
    const classrooms = getUniqueClassrooms(activity.actParticipate);
    const activityId = activity.actId;
    navigate(`/activity/participate/filterbyclassroom`, {
      state: {
        classrooms: classrooms,
        activityId: activityId,
        activity: activity,
      },
    });
  };

  const handleNaviatePDFByRoomJoin = () => {
    const classrooms = getUniqueClassrooms(activity.actParticipate);
    const activityId = activity.actId;
    navigate(`/activity/participate/filterbyclassroomjoin`, {
      state: {
        classrooms: classrooms,
        activityId: activityId,
        activity: activity,
      },
    });
  };

  const handleNavigateExcelFilterByRoom = () => {
    const classrooms = getUniqueClassrooms(activity.actParticipate);
    const activityId = activity.actId;
    navigate(`/activity/participate/filterbyclassroom/excel`, {
      state: {
        classrooms: classrooms,
        activityId: activityId,
        activity: activity,
      },
    });
  };

  const handleNavigateExcelFilterPage = () => {
    const classrooms = getUniqueClassrooms(activity.actParticipate);
    const activityId = activity.actId;
    navigate(`/activity/participate/filterbyclassroomjoin/excel`, {
      state: {
        classrooms: classrooms,
        activityId: activityId,
        activity: activity,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line mt-8">
        <div className="flex justify-center mb-4 text-red-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">
          เกิดข้อผิดพลาด
        </h2>
        <p className="text-text-color-alt font-body">{error}</p>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line mt-8">
        <div className="flex justify-center mb-4 text-text-color-alt">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">
          ไม่พบข้อมูลกิจกรรม
        </h2>
        <p className="text-text-color-alt font-body">
          ไม่พบข้อมูลกิจกรรมที่ต้องการ
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
              {activity.actName}
            </h1>
            <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
          </div>

          <div>
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium font-body ${
                isActivityEnded(activity)
                  ? "bg-red-100 text-red-800"
                  : isActivityNotStarted(activity)
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {isActivityEnded(activity)
                ? "สิ้นสุดกิจกรรม"
                : isActivityNotStarted(activity)
                  ? "กิจกรรมยังไม่เริ่ม"
                  : "กิจกรรมกำลังดำเนินการ"}
            </span>
          </div>
        </div>

        {!isActivityEnded(activity) && !isActivityNotStarted(activity) && (
          <div className="mt-4 flex justify-end gap-4">
            <button
              onClick={handleCheckIn}
              className="py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              เช็คชื่อนักเรียน
            </button>
            <Link
              to={`/activities/${id}/qr-code`}
              className="py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              QR Code กิจกรรม
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-line p-6">
            <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              รายละเอียดกิจกรรม
            </h2>

            <div className="space-y-6 font-body">
              <div>
                <p className="text-text-color-alt mb-1">คำอธิบายกิจกรรม</p>
                <p className="text-text-color">{activity.actDesc}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-text-color-alt mb-1">วันที่จัดกิจกรรม</p>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-text-color">
                      {formatDate(activity.actDate)} -{" "}
                      {formatDate(activity.actDateEnd)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-text-color-alt mb-1">เวลากิจกรรม</p>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-text-color">
                      {activity.actStartTime} - {activity.actEndTime} น.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-text-color-alt mb-1">สถานที่จัดกิจกรรม</p>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-text-color">{activity.actLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md border border-line p-6">
            <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              ข้อมูลเพิ่มเติม
            </h2>

            <div className="space-y-4 font-body">
              <div>
                <p className="text-text-color-alt mb-1">ประเภทกิจกรรม</p>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-sm">
                    {activity.activityType.actTypeName}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-text-color-alt mb-1">การจำกัดจำนวน</p>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-secondary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <p className="text-text-color">
                    {activity.joinLimit
                      ? activity.joinLimitNumber
                        ? `จำกัด ${activity.joinLimitNumber} คน`
                        : "จำกัดจำนวน (ไม่ระบุจำนวน)"
                      : "ไม่จำกัดจำนวน"}
                  </p>
                </div>
              </div>

              {activity.classroom && activity.classroom.length > 0 && (
                <div>
                  <p className="text-text-color-alt mb-1">
                    ห้องเรียนที่เข้าร่วมได้
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
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
                          className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
                        >
                          ม.{c.classroom.classLevel}/{c.classroom.classRoom}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {activity.teacher && activity.teacher.length > 0 && (
                <div>
                  <p className="text-text-color-alt mb-1">ครูผู้ดูแล</p>
                  <ul className="space-y-2">
                    {activity.teacher.map((t) => (
                      <li key={t.actTeacherId} className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2 text-secondary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-text-color">
                          {t.teacher.fName} {t.teacher.lName}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
        <div className="border-b border-line p-4">
          <h2 className="text-xl font-bold text-primary font-heading flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            ประวัติการบันทึกการเข้าร่วม
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-color-alt mb-2 font-body">
                ดาวน์โหลดเอกสาร
              </label>
              <DropdownExportDocument className="w-full">
                <TextDropdownDocument
                  title="สรุปการเข้าร่วมแบ่งตามห้อง (Excel)"
                  actionFunction={() => handleNavigateExcelFilterByRoom()}
                />
                <TextDropdownDocument
                  title="สรุปจำนวนการเข้าร่วมแบ่งตามห้อง (Excel)"
                  actionFunction={() => handleNavigateExcelFilterPage()}
                />
                <TextDropdownDocument
                  title="สรุปการเข้าร่วมแบ่งตามห้อง (PDF)"
                  actionFunction={() => handleNaviatePDFFilterByRoom()}
                />
                <TextDropdownDocument
                  title="สรุปจำนวนการเข้าร่วมแบ่งตามห้อง (PDF)"
                  actionFunction={() => handleNaviatePDFByRoomJoin()}
                />
              </DropdownExportDocument>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-color-alt mb-2 font-body">
                กรองตามห้องเรียน
              </label>
              <select
                className="w-full py-2.5 px-3 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-body"
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
              >
                <option value="all">ทุกห้องเรียน</option>
                {activity &&
                  getUniqueClassrooms(activity.actParticipate).map(
                    (classroom) => (
                      <option key={classroom.classId} value={classroom.classId}>
                        ม.{classroom.classLevel}/{classroom.classRoom}
                      </option>
                    ),
                  )}
              </select>
            </div>

            <div className="lg:col-span-1 flex justify-end items-end">
              <button
                className="py-2.5 px-4 text-sm font-medium text-white bg-secondary hover:bg-secondary/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all duration-300 flex items-center"
                onClick={() =>
                  navigate(
                    `/activities/${id}/check-in/edit?date=${selectedDate}`,
                  )
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                แก้ไขการเข้าร่วมของวันที่เลือก
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาตามชื่อ รหัสนักเรียน หรือเลขที่..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary/10 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-color-alt mb-1">
                  จำนวนนักเรียนที่เข้าร่วม
                </p>
                <p className="text-2xl font-bold text-primary">
                  {filteredParticipations.length} คน
                </p>
              </div>
              <div className="bg-primary/20 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-green-800/60 mb-1">ห้องเรียน</p>
                <p className="text-2xl font-bold text-green-800">
                  {getUniqueClassrooms(activity?.actParticipate || []).length}{" "}
                  ห้อง
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>

            {selectedDate && (
              <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-800/60 mb-1">
                    เข้าร่วมในวันที่เลือก
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {
                      filteredParticipations.filter((p) =>
                        isRecordMatchingDate(p),
                      ).length
                    }{" "}
                    คน
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className="relative mb-6">
            <div
              className="overflow-x-auto pb-2 hide-scrollbar"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex gap-2 px-1">
                {activity &&
                  getDatesBetween(activity.actDate, activity.actDateEnd).map(
                    (date) => {
                      const dateTime =
                        DateTime.fromISO(date).setZone(TIME_ZONE);
                      const isToday = DateTime.now()
                        .setZone(TIME_ZONE)
                        .hasSame(dateTime, "day");
                      const thaiMonth = convertNumberToThaiMonth(
                        dateTime.month,
                      );

                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 flex flex-col items-center w-24 py-2 rounded-lg transition-all ${
                            selectedDate === date
                              ? "bg-primary text-white shadow-lg transform scale-105"
                              : "bg-white border-line border hover:bg-gray-50"
                          } ${isToday ? "ring-2 ring-primary" : ""}`}
                        >
                          <span className="text-xs mb-1">
                            {dateTime.toFormat("ccc")}
                          </span>
                          <span className="text-lg font-semibold">
                            {dateTime.day}
                          </span>
                          <span className="text-xs">{thaiMonth}</span>
                        </button>
                      );
                    },
                  )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-line rounded-lg">
            <table className="w-full divide-y divide-line font-body">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider"
                  >
                    รหัสนักเรียน
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider"
                  >
                    ชื่อ-นามสกุล
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-text-color-alt uppercase tracking-wider"
                  >
                    สถานะ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider"
                  >
                    หมายเหตุ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider"
                  >
                    บันทึกโดย
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider"
                  >
                    วันเวลาที่บันทึก
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-line">
                {filteredParticipations.map((record) => (
                  <tr
                    key={record.actParticipateId}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color-alt">
                      {record.stdId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                      {formatTitle(record.student.title)} {record.student.fName}{" "}
                      {record.student.lName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        เข้าร่วม
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                      {record.note || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                      {record.operateBy === "TEACHER" && record.teacher ? (
                        <span className="inline-flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 text-primary"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {record.teacher.tchCode} {record.teacher.fName}
                        </span>
                      ) : (
                        record.operateBy
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                      {formatThaiDateTime(record.joinTimestamp)}
                    </td>
                  </tr>
                ))}
                {filteredParticipations.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-sm text-text-color-alt"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p>
                          {searchQuery
                            ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                            : selectedDate
                              ? "ไม่พบข้อมูลการบันทึกในวันที่เลือก"
                              : "ยังไม่มีประวัติการบันทึก"}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-2 text-primary hover:underline"
                          >
                            ล้างการค้นหา
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityDetail;
