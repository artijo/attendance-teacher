import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { HOSTNAME, TIME_ZONE } from "../../config";
import { formatDate, formatTitle } from "../../helper";
import { DateTime } from "luxon";

function CheckIn() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState("all");
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [notes, setNotes] = useState({});
  const [studentStatuses, setStudentStatuses] = useState({});
  const [isValidDate, setIsValidDate] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state

  const checkValidDate = (activity) => {
    const now = DateTime.now().setZone(TIME_ZONE);
    const startDate = DateTime.fromISO(activity.actDate).setZone(TIME_ZONE);
    const endDate = DateTime.fromISO(activity.actDateEnd).setZone(TIME_ZONE);

    return now >= startDate.startOf("day") && now <= endDate.endOf("day");
  };

  const getTodayParticipation = (participations) => {
    const today = DateTime.now().setZone(TIME_ZONE).startOf("day");
    return participations.filter((p) => {
      const participationDate = DateTime.fromISO(p.joinTimestamp)
        .setZone(TIME_ZONE)
        .startOf("day");
      return participationDate.equals(today);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activityResponse, classroomsResponse] = await Promise.all([
          axios.get(`${HOSTNAME}/t/activity/${id}`),
          axios.get(`${HOSTNAME}/t/classrooms/all`),
        ]);

        const activity = activityResponse.data;
        setActivity(activity);

        const canRecordToday = checkValidDate(activity);
        setIsValidDate(canRecordToday);

        if (!canRecordToday) {
          setError(
            "ไม่สามารถบันทึกการเข้าร่วมได้ เนื่องจากไม่อยู่ในช่วงวันที่จัดกิจกรรม",
          );
        }

        // Filter today's participations
        const todayParticipations = getTodayParticipation(
          activity.actParticipate,
        );

        // Initialize notes from today's participation data only
        const participationNotes = {};
        todayParticipations.forEach((participation) => {
          participationNotes[participation.stdId] = participation.note || "";
        });
        setNotes(participationNotes);

        // Initialize statuses from today's participation data only
        const initialStatuses = {};
        todayParticipations.forEach((participation) => {
          initialStatuses[participation.stdId] = "PRESENT";
        });
        setStudentStatuses(initialStatuses);

        if (activityResponse.data.joinLimit) {
          if (activityResponse.data.joinLimitNumber) {
            setAvailableClassrooms(classroomsResponse.data);
            const allStudents = classroomsResponse.data.flatMap(
              (c) => c.classroomMembers,
            );
            setStudents(allStudents);
          } else if (activityResponse.data.classroom) {
            const allowedClassIds = activityResponse.data.classroom.map(
              (c) => c.classId,
            );
            const filteredClassrooms = classroomsResponse.data.filter((c) =>
              allowedClassIds.includes(c.classId),
            );
            setAvailableClassrooms(filteredClassrooms);
            const filteredStudents = classroomsResponse.data
              .filter((c) => allowedClassIds.includes(c.classId))
              .flatMap((c) => c.classroomMembers);
            setStudents(filteredStudents);
          }
        } else {
          setAvailableClassrooms(classroomsResponse.data);
          const allStudents = classroomsResponse.data.flatMap(
            (c) => c.classroomMembers,
          );
          setStudents(allStudents);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    let result = [...students];

    if (selectedClassroomId !== "all") {
      result = result.filter(
        (student) => student.classId === selectedClassroomId,
      );
    }

    // Add search functionality
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter((student) => {
        const studentName =
          `${formatTitle(student.student.title)} ${student.student.fName} ${student.student.lName}`.toLowerCase();
        const studentId = student.stdId.toLowerCase();
        const studentNo = student.stdNo.toString();

        return (
          studentName.includes(query) ||
          studentId.includes(query) ||
          studentNo.includes(query)
        );
      });
    }

    result.sort((a, b) => parseInt(a.stdNo) - parseInt(b.stdNo));

    setFilteredStudents(result);
  }, [students, selectedClassroomId, searchQuery]);

  const handleAttendanceChange = async (
    studentId,
    status,
    note = notes[studentId] || "",
  ) => {
    if (!isValidDate) {
      setError(
        "ไม่สามารถบันทึกการเข้าร่วมได้ เนื่องจากไม่อยู่ในช่วงวันที่จัดกิจกรรม",
      );
      return;
    }

    try {
      await axios.post(`${HOSTNAME}/t/activity/${id}/participate`, {
        stdId: studentId,
        status: status,
        note: status === "ABSENT" ? "" : note,
      });

      setStudentStatuses((prev) => ({
        ...prev,
        [studentId]: status,
      }));

      if (status === "ABSENT") {
        handleNoteChange(studentId, "");
      }

      const response = await axios.get(`${HOSTNAME}/t/activity/${id}`);
      setActivity(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      );
    }
  };

  const handleNoteChange = (studentId, note) => {
    setNotes((prev) => ({
      ...prev,
      [studentId]: note,
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
        <div
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex items-center"
          role="alert"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {activity && (
        <>
          <div className="bg-white rounded-xl shadow-md border border-line p-6 mb-8">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                บันทึกการเข้าร่วมกิจกรรม
              </h1>
              <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-body">
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm4 5V6a4 4 0 11-8 0v1h8zm-2 6a1 1 0 10-2 0v3a1 1 0 102 0v-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg">
                    <span className="font-medium text-text-color">
                      กิจกรรม:
                    </span>
                    <span className="ml-2 text-text-color">
                      {activity.actName}
                    </span>
                  </p>
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg">
                    <span className="font-medium text-text-color">วันที่:</span>
                    <span className="ml-2 text-text-color">
                      {formatDate(activity.actDate)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg">
                    <span className="font-medium text-text-color">เวลา:</span>
                    <span className="ml-2 text-text-color">
                      {activity.actStartTime} - {activity.actEndTime} น.
                    </span>
                  </p>
                </div>
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-primary"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-lg">
                    <span className="font-medium text-text-color">
                      สถานที่:
                    </span>
                    <span className="ml-2 text-text-color">
                      {activity.actLocation}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
            <div className="border-b border-line p-6">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                รายชื่อนักเรียน
              </h2>

              {!isValidDate && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-md flex items-start">
                  <svg
                    className="h-6 w-6 mr-3 mt-0.5 text-yellow-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">
                      สามารถบันทึกการเข้าร่วมได้เฉพาะในวันที่จัดกิจกรรมเท่านั้น
                    </p>
                    <p className="mt-1 text-sm">
                      กิจกรรมนี้จะเริ่มในวันที่ {formatDate(activity.actDate)}{" "}
                      ถึงวันที่ {formatDate(activity.actDateEnd)}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-color-alt mb-2 font-body">
                    กรองตามห้องเรียน
                  </label>
                  <select
                    className="w-full py-2.5 px-3 rounded-lg border-line bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-body"
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

                {/* Add search input */}
                <div>
                  <label className="block text-sm font-medium text-text-color-alt mb-2 font-body">
                    ค้นหานักเรียน
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ค้นหาตามชื่อ รหัสนักเรียน หรือเลขที่..."
                      className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
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
              </div>

              {/* Show search results count when searching */}
              {searchQuery && (
                <div className="mb-4 text-sm">
                  <span className="font-medium text-primary">
                    พบ {filteredStudents.length} คน
                  </span>
                  {filteredStudents.length !== students.length && (
                    <span className="text-text-color-alt">
                      {" "}
                      จากทั้งหมด {students.length} คน
                    </span>
                  )}
                </div>
              )}

              {activity.joinLimit && (
                <div className="mb-6 py-2 px-4 bg-blue-50 text-blue-700 rounded-lg inline-flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span className="font-body">
                    จำกัดการเข้าร่วมเฉพาะห้องที่กำหนด
                  </span>
                </div>
              )}
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y divide-line">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider">
                      เลขที่
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider">
                      รหัสนักเรียน
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider">
                      ชื่อ-นามสกุล
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-text-color-alt uppercase tracking-wider">
                      สถานะ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-color-alt uppercase tracking-wider">
                      หมายเหตุ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-line">
                  {filteredStudents.map((student) => {
                    const todayParticipation = activity.actParticipate.find(
                      (p) => {
                        const participationDate = DateTime.fromISO(
                          p.joinTimestamp,
                        )
                          .setZone(TIME_ZONE)
                          .startOf("day");
                        const today = DateTime.now()
                          .setZone(TIME_ZONE)
                          .startOf("day");
                        return (
                          p.stdId === student.stdId &&
                          participationDate.equals(today)
                        );
                      },
                    );

                    const isAbsent =
                      studentStatuses[student.stdId] === "ABSENT";
                    const canAddNote = todayParticipation && !isAbsent;

                    return (
                      <tr
                        key={student.stdId}
                        className={`hover:bg-gray-50 transition-colors duration-150 ${!isValidDate ? "opacity-60" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-color">
                          {student.stdNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color-alt">
                          {student.stdId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-body text-text-color">
                          {formatTitle(student.student.title)}{" "}
                          {student.student.fName} {student.student.lName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-4">
                            <label
                              className={`relative flex items-center gap-2 ${!isValidDate ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <input
                                type="radio"
                                name={`status-${student.stdId}`}
                                value="PRESENT"
                                defaultChecked={
                                  todayParticipation !== undefined
                                }
                                onChange={(e) =>
                                  handleAttendanceChange(
                                    student.stdId,
                                    e.target.value,
                                  )
                                }
                                className="sr-only peer"
                                disabled={!isValidDate}
                              />
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-green-600 peer-checked:bg-green-600 flex justify-center items-center">
                                <svg
                                  className="w-3 h-3 text-white hidden peer-checked:block"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  ></path>
                                </svg>
                              </div>
                              <span
                                className={`peer-checked:text-green-600 font-medium ${todayParticipation !== undefined ? "text-green-600" : "text-gray-600"}`}
                              >
                                เข้าร่วม
                              </span>
                            </label>
                            <label
                              className={`relative flex items-center gap-2 ${!isValidDate ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <input
                                type="radio"
                                name={`status-${student.stdId}`}
                                value="ABSENT"
                                defaultChecked={
                                  todayParticipation === undefined
                                }
                                onChange={(e) =>
                                  handleAttendanceChange(
                                    student.stdId,
                                    e.target.value,
                                  )
                                }
                                className="sr-only peer"
                                disabled={!isValidDate}
                              />
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full peer-checked:border-red-600 peer-checked:bg-red-600 flex justify-center items-center">
                                <svg
                                  className="w-3 h-3 text-white hidden peer-checked:block"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  ></path>
                                </svg>
                              </div>
                              <span
                                className={`peer-checked:text-red-600 font-medium ${todayParticipation === undefined ? "text-red-600" : "text-gray-600"}`}
                              >
                                ไม่เข้าร่วม
                              </span>
                            </label>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            className={`w-full border rounded-lg px-3 py-2 text-sm font-body ${
                              !canAddNote
                                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                : "focus:ring-2 focus:ring-primary focus:border-primary"
                            }`}
                            placeholder="หมายเหตุ..."
                            value={
                              !canAddNote ? "" : notes[student.stdId] || ""
                            }
                            onChange={(e) => {
                              if (canAddNote) {
                                handleNoteChange(student.stdId, e.target.value);
                                handleAttendanceChange(
                                  student.stdId,
                                  "PRESENT",
                                  e.target.value,
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
              {filteredStudents.length === 0 && (
                <div className="p-6 text-center text-text-color-alt font-body">
                  <svg
                    className="h-12 w-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>ไม่พบรายชื่อนักเรียน</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CheckIn;
