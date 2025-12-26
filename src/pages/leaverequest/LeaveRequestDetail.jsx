import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { userStore } from "../../store";
import { formatTitle, formatThaiDateTime } from "../../helper";

function LeaveRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const user = userStore((state) => state.user);
  const teacherId = user?.tchId || null;

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${HOSTNAME}/t/leave-requests/${id}`)
      .then((response) => {
        // Make sure response.data exists before attempting to filter
        if (response.data) {
          const data = response.data;

          // Check if studingTime exists before trying to filter it
          if (
            data.studingTime &&
            Array.isArray(data.studingTime) &&
            teacherId
          ) {
            // Improved filtering logic to check all possible places where teacher ID might be stored
            data.studingTime = data.studingTime.filter((time) => {
              // Get the subject from the studying time
              const subject = time.studingTime?.timetable?.subject;

              // Check all possible locations where teacher ID might be present
              return (
                // Direct teacher ID on subject
                subject?.tchId === teacherId ||
                // Teacher ID in nested teacher object
                subject?.teacher?.tchId === teacherId ||
                // Additional check for any other possible location
                time.studingTime?.tchId === teacherId ||
                // Check if the teacher is responsible for this class
                time.studingTime?.timetable?.tchId === teacherId
              );
            });

            console.log(
              "Filtered studying time entries:",
              data.studingTime.length,
            );
          } else {
            // Initialize as empty array if undefined
            data.studingTime = data.studingTime || [];
          }

          setLeaveRequest(data);
        } else {
          // Handle case when response.data is empty or invalid
          console.error("No data received from API");
          setError("ไม่พบข้อมูลคำขอลา");
        }
      })
      .catch((error) => {
        console.error(error);
        setError("ไม่สามารถดึงข้อมูลคำขอลาได้");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, teacherId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "WAITING":
        return "รอการอนุมัติ";
      case "APPROVED":
        return "อนุมัติแล้ว";
      case "REJECTED":
        return "ไม่อนุมัติ";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const openConfirmationDialog = (leaveRequestStudingTimeId, action) => {
    setCurrentRequestId(leaveRequestStudingTimeId);
    setDialogAction(action);
    setRejectReason(""); // Clear previous reason
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setCurrentRequestId(null);
    setDialogAction(null);
    setRejectReason("");
  };

  const confirmAction = () => {
    if (!currentRequestId || !dialogAction) return;

    // If rejecting without a reason, show an error
    if (dialogAction === "REJECTED" && !rejectReason.trim()) {
      alert("กรุณาระบุเหตุผลในการไม่อนุมัติ");
      return;
    }

    // Proceed with the action
    handleAction(currentRequestId, dialogAction);
    closeDialog();
  };

  const handleAction = (leaveRequestStudingTimeId, action) => {
    setProcessingIds((prev) => [...prev, leaveRequestStudingTimeId]);
    setError(null);
    setSuccess(null);

    // Create request payload
    const payload = {
      action,
      teacherId,
    };

    // Add reason if rejecting
    if (action === "REJECTED") {
      payload.rejectReason = rejectReason;
    }

    axios
      .put(
        `${HOSTNAME}/t/leave-requests/studingtime/${leaveRequestStudingTimeId}`,
        payload,
      )
      .then((response) => {
        setSuccess(
          `${action === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"}คำขอลาสำเร็จ`,
        );

        // Update the leave request data in state
        setLeaveRequest((prevState) => {
          if (!prevState || !prevState.studingTime) return prevState;

          const updatedStudingTime = prevState.studingTime.map((time) => {
            if (time.leaveRequestStudingTimeId === leaveRequestStudingTimeId) {
              return {
                ...time,
                leaveStatus: action === "APPROVED" ? "APPROVED" : "REJECTED",
                tacherApproveId: teacherId,
                rejectReason: action === "REJECTED" ? rejectReason : null,
                approverTimestamp: new Date().toISOString(),
              };
            }
            return time;
          });

          return {
            ...prevState,
            studingTime: updatedStudingTime,
          };
        });
      })
      .catch((error) => {
        console.error(error);
        setError(
          `ไม่สามารถ${action === "APPROVED" ? "อนุมัติ" : "ปฏิเสธ"}คำขอลาได้ กรุณาลองอีกครั้ง`,
        );
      })
      .finally(() => {
        setProcessingIds((prev) =>
          prev.filter((id) => id !== leaveRequestStudingTimeId),
        );
      });
  };

  // Add a safe check for allApprovedOrRejected
  const allApprovedOrRejected =
    leaveRequest?.studingTime && leaveRequest.studingTime.length > 0
      ? leaveRequest.studingTime.every(
          (time) =>
            time.leaveStatus === "APPROVED" || time.leaveStatus === "REJECTED",
        )
      : true;

  const formatStudyDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Link to="/leavereq" className="text-primary hover:text-accent">
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
              รายละเอียดคำขอลา
            </h1>
            <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex">
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
            <span>{success}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : leaveRequest &&
        (!leaveRequest.studingTime || leaveRequest.studingTime.length === 0) ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">
            ไม่พบวิชาที่คุณสอนในคำขอลานี้
          </h2>
          <p className="text-text-color-alt font-body mb-6">
            คำขอลานี้ไม่เกี่ยวข้องกับวิชาที่คุณสอน
          </p>

          <Link to="/leavereq">
            <button className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-200 text-sm font-medium">
              กลับไปหน้ารายการคำขอลา
            </button>
          </Link>
        </div>
      ) : leaveRequest ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-line">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-text-color font-heading mb-4">
                  ข้อมูลนักเรียน
                </h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-text-color-alt">รหัสนักเรียน</p>
                    <p className="text-base font-medium">
                      {leaveRequest.stdId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-color-alt">ชื่อ-นามสกุล</p>
                    <p className="text-base font-medium">
                      {`${formatTitle(leaveRequest.student?.title) || ""}${leaveRequest.student?.fName || ""} ${leaveRequest.student?.lName || ""}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-color-alt">อีเมล</p>
                    <p className="text-base">
                      {leaveRequest.student?.email || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-color-alt">เบอร์โทรศัพท์</p>
                    <p className="text-base">
                      {leaveRequest.student?.tel || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Request Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-line mb-6">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-text-color font-heading mb-4">
                  รายละเอียดการลา
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-text-color-alt">หมายเลขคำร้อง</p>
                    <p className="text-base font-medium">
                      {leaveRequest.leaveId?.substring(0, 8) || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-color-alt">ประเภทการลา</p>
                    <p className="text-base font-medium">
                      {leaveRequest.leaveRequestType?.leaveTypeName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-text-color-alt">วันที่ลา</p>
                    <p className="text-base font-medium">
                      {formatDate(leaveRequest.leaveDate)}
                    </p>
                  </div>

                  {/* Add submission date */}
                  <div>
                    <p className="text-sm text-text-color-alt">
                      วันที่ส่งคำร้อง
                    </p>
                    <p className="text-base font-medium">
                      {formatDateTime(
                        leaveRequest.createdDate || leaveRequest.createdAt,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-text-color-alt mb-1">
                    เหตุผลการลา
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg border border-line">
                    <p className="text-base">
                      {leaveRequest.leaveReason || "-"}
                    </p>
                  </div>
                </div>

                {leaveRequest.LeaveFile && (
                  <div className="mb-6">
                    <p className="text-sm text-text-color-alt mb-1">
                      เอกสารแนบ
                    </p>
                    <div className="flex items-center bg-gray-50 p-3 rounded-lg border border-line">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-primary mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <a
                        href={`${leaveRequest.LeaveFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-accent"
                      >
                        ดูเอกสาร
                      </a>
                    </div>
                  </div>
                )}

                <h3 className="text-lg font-bold text-text-color font-heading mb-3 mt-6">
                  รายวิชาที่ขอลา
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-line">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          รหัสวิชา
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ชื่อวิชา
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          วัน/เวลา
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          สถานะ
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          การดำเนินการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-line">
                      {leaveRequest.studingTime &&
                      leaveRequest.studingTime.length > 0 ? (
                        leaveRequest.studingTime.map((timeEntry) => (
                          <tr
                            key={timeEntry.leaveRequestStudingTimeId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-text-color">
                              {timeEntry.studingTime?.timetable?.subject
                                ?.subCode || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-text-color">
                              {timeEntry.studingTime?.timetable?.subject
                                ?.subNameThai || "-"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-text-color">
                              <div>
                                {formatStudyDate(
                                  timeEntry.studingTime?.studingTimeDate,
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(
                                  timeEntry.studingTime?.timetable?.timeStart,
                                )}{" "}
                                -{" "}
                                {formatTime(
                                  timeEntry.studingTime?.timetable?.timeEnd,
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                ห้อง{" "}
                                {
                                  timeEntry.studingTime?.timetable?.classroom
                                    ?.classLevel
                                }
                                /
                                {
                                  timeEntry.studingTime?.timetable?.classroom
                                    ?.classRoom
                                }
                              </div>
                              {timeEntry.studingTime?.timetable?.subject
                                ?.teacher && (
                                <div className="text-xs text-gray-500 italic">
                                  คุณครู:{" "}
                                  {
                                    timeEntry.studingTime?.timetable?.subject
                                      ?.teacher?.fName
                                  }{" "}
                                  {
                                    timeEntry.studingTime?.timetable?.subject
                                      ?.teacher?.lName
                                  }
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(timeEntry.leaveStatus)}`}
                              >
                                {getStatusText(timeEntry.leaveStatus)}
                              </span>
                              {timeEntry.leaveStatus === "REJECTED" &&
                                timeEntry.rejectedNote && (
                                  <div className="mt-1 text-xs text-red-600">
                                    เหตุผล: {timeEntry.rejectedNote}
                                  </div>
                                )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {timeEntry.leaveStatus === "WAITING" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      openConfirmationDialog(
                                        timeEntry.leaveRequestStudingTimeId,
                                        "APPROVED",
                                      )
                                    }
                                    disabled={processingIds.includes(
                                      timeEntry.leaveRequestStudingTimeId,
                                    )}
                                    className="bg-green-600 text-white py-1 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                                  >
                                    {processingIds.includes(
                                      timeEntry.leaveRequestStudingTimeId,
                                    )
                                      ? "กำลังดำเนินการ..."
                                      : "อนุมัติ"}
                                  </button>
                                  <button
                                    onClick={() =>
                                      openConfirmationDialog(
                                        timeEntry.leaveRequestStudingTimeId,
                                        "REJECTED",
                                      )
                                    }
                                    disabled={processingIds.includes(
                                      timeEntry.leaveRequestStudingTimeId,
                                    )}
                                    className="bg-red-600 text-white py-1 px-3 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                                  >
                                    {processingIds.includes(
                                      timeEntry.leaveRequestStudingTimeId,
                                    )
                                      ? "กำลังดำเนินการ..."
                                      : "ไม่อนุมัติ"}
                                  </button>
                                </div>
                              ) : timeEntry.leaveStatus === "APPROVED" ? (
                                // <div className="text-green-600 flex items-center">
                                //     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                //     </svg>
                                //     อนุมัติแล้ว
                                // </div>
                                <span className="text-xs text-gray-500 text-wrap">
                                  {" "}
                                  ดำเนินการเมื่อ{" "}
                                  {formatThaiDateTime(
                                    timeEntry.approverTimestamp,
                                  )}{" "}
                                </span>
                              ) : (
                                // <div className="text-red-600 flex items-center">
                                //     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                //     </svg>
                                //     ไม่อนุมัติ
                                // </div>
                                <span className="text-xs text-gray-500 text-wrap">
                                  {" "}
                                  ดำเนินการเมื่อ{" "}
                                  {formatThaiDateTime(
                                    timeEntry.approverTimestamp,
                                  )}{" "}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-4 py-4 text-center text-sm text-gray-500"
                          >
                            ไม่พบรายวิชาที่ขอลา
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              {allApprovedOrRejected ? (
                <Link to="/leavereq">
                  <button className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-200 text-sm font-medium">
                    กลับไปหน้ารายการคำขอลา
                  </button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">
            ไม่พบข้อมูลคำขอลา
          </h2>
          <p className="text-text-color-alt font-body mb-6">
            ไม่พบข้อมูลคำขอลาที่ต้องการ หรือคำขออาจถูกลบไปแล้ว
          </p>

          <Link to="/leavereq">
            <button className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-accent transition-colors duration-200 text-sm font-medium">
              กลับไปหน้ารายการคำขอลา
            </button>
          </Link>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-text-color mb-4">
              {dialogAction === "APPROVED"
                ? "ยืนยันการอนุมัติ"
                : "ยืนยันการไม่อนุมัติ"}
            </h3>

            <p className="text-text-color-alt mb-6">
              {dialogAction === "APPROVED"
                ? "คุณต้องการอนุมัติคำขอลาหรือไม่?"
                : "คุณต้องการไม่อนุมัติคำขอลาหรือไม่?"}
            </p>

            {dialogAction === "REJECTED" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-color mb-1">
                  เหตุผลในการไม่อนุมัติ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-line rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  rows="3"
                  placeholder="กรุณาระบุเหตุผลในการไม่อนุมัติ"
                ></textarea>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDialog}
                className="px-4 py-2 border border-line rounded-lg text-text-color hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmAction}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  dialogAction === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveRequestDetail;
