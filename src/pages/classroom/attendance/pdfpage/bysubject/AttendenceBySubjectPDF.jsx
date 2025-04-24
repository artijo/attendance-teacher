import { Page, Text, View, Document, PDFViewer, Image } from "@react-pdf/renderer";
import { formatTitle } from "../../../../../helper.js";
import { Link, useLocation } from "react-router-dom";
import { styles } from "../style.js";
function AttendenceBySubjectPDF() {
    const location = useLocation();
    const { studentInfo, dataInfo, className, stdId, classroom } = location.state;
    // console.log(dataInfo);
    // {studentInfo: studentInfoMation,dataInfo: studentInfo, className: className, stdId:stdId, classroom: classroom}}

    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">รายงาน PDF สรุปการเข้าเรียนตามวิชา</h1>
                <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div className="bg-primary/10 text-primary rounded-full p-2 mt-1 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex gap-1">
                        <p className="text-xs font-medium text-white px-2 py-[2px] font-heading rounded-full bg-primary w-fit">{formatTitle(studentInfo.title)}{studentInfo.fName} {studentInfo.lName}</p>
                        <p className="text-xs font-medium text-white px-2 py-[2px] font-heading rounded-full bg-secondary w-fit">ห้องม.{classroom.classLevel}/{classroom.classRoom}</p>
                    </div>
                    <div className="flex gap-2 text-xs px-2 py-2 mt-2 rounded-md bg-gray-50 w-fit">
                        <p>รหัสนักเรียน: {studentInfo.stdId}</p>
                        <p>เบอร์โทรศัพท์: {studentInfo.tel}</p>
                        <p>อีเมล: {studentInfo.email}</p>
                    </div>

                </div>

                <Link
                    to={`/classroom/attendance/student`}
                    state={{
                        classroomsId: classroom.classId,
                        className: className,
                        classroom: classroom,
                        stdId: stdId,
                    }}
                    className="inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-text-color bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปหน้ารายละเอียด
                </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                <div className="p-6">
                    <div className="w-full h-[700px] rounded-xl overflow-hidden border border-line">
                        <PDFViewer width={"100%"} height={"100%"} style={{ borderRadius: "0.5rem" }}>
                            <Document
                                pageMode="fullScreen"
                                title={`เอกสารการเข้าเรียนวิชา`}
                            >
                                <Page size="A4" style={styles.page} orientation="portrait">
                                    <Image src={`/Logo_NPS.png`} style={styles.logoSize} />
                                    <Text style={styles.textHeader}>สรุปการเข้าเรียนตามวิชา</Text>
                                    <View
                                        style={{
                                            // borderWidth: ,
                                            // borderColor: '#EE722A',
                                            width: '20%',
                                            height: '2px',
                                            backgroundColor: '#EE722A',
                                            borderRadius: '5px',
                                            marginBottom: '5px',
                                        }}
                                    ></View>
                                    <Text style={[styles.textParagraph, { marginBottom: 0 }]}>
                                        {formatTitle(studentInfo.title)} {studentInfo.fName} {studentInfo.lName} ห้องเรียน ม.{classroom.classLevel}/{classroom.classRoom} <br />

                                    </Text>
                                    <Text style={styles.textParagraph}>รหัสนักเรียน: {studentInfo.stdId} เบอร์โทรศัพท์: {studentInfo.tel} อีเมล: {studentInfo.email}</Text>
                                    <View style={styles.tableHeader}>
                                        <Text style={styles.tableColumn1}>วิชา</Text>
                                        <Text style={styles.tableColumn2}>ขาดเรียน</Text>
                                        <Text style={styles.tableColumn2}>เข้าสาย</Text>
                                        <Text style={styles.tableColumn2}>ลา</Text>
                                        <Text style={styles.tableColumn2}>กิจกรรม</Text>
                                        <Text style={styles.tableColumn2}>เข้าเรียน</Text>
                                        <Text style={styles.tableColumn2}>ร้อยละการเข้าเรียน</Text>
                                        <Text style={styles.tableColumn2}>สถานะ</Text>
                                    </View>
                                    {Object.keys(dataInfo).map((subject, index) => {
                                        if (index === 0) return null;
                                        const subjectData = dataInfo[subject];
                                        return (
                                            <View style={styles.tableRow} key={subject}>
                                                <Text style={styles.tableColumn1}>
                                                    {subject}
                                                </Text>
                                                <Text style={styles.tableColumn2}>
                                                    {subjectData.attendenceAbsentCount}
                                                </Text>
                                                <Text style={styles.tableColumn2}>
                                                    {subjectData.attendenceLateCount}
                                                </Text>
                                                <Text style={styles.tableColumn2}>
                                                    {subjectData.attendenceLeaveCount}
                                                </Text>
                                                <Text style={styles.tableColumn2}>
                                                    {subjectData.attendenceActivity}
                                                </Text>
                                                <Text style={styles.tableColumn2}>
                                                    {subjectData.attendenceCount}
                                                </Text>
                                                <Text style={styles.tableColumn2}>
                                                    {subjectData.attendencePercent}%
                                                </Text>
                                                <Text style={styles.tableColumn2}>
                                                    {subjectData.canExam}
                                                </Text>
                                            </View>
                                        )
                                    })}
                                    {/* <Text style={styles.textParagraph}>
                                        วิชา {subject.subNameThai} ({subject.subCode}) เดือน {month} ปีการศึกษา {classroomInfo.term.academicYear + 543} เทอม {classroomInfo.term.semester} ห้องเรียน ม.{classroomInfo.classLevel}/{classroomInfo.classRoom}
                                    </Text>
                                    <Text style={[styles.textHeader, { fontSize: 12 }]}>รายละเอียดวันของแต่ละคาบเรียน</Text>
                                    <View style={{ flexDirection: 'row', flexWrap: "wrap", gap: "5px", marginBottom: '5px' }}>

                                        {studentList.data[0].attendance
                                            .filter((att) => att.month === month)
                                            .map((attendance, index) => (
                                                <Text key={index} style={[styles.textSpan, { backgroundColor: '#F5F5F5', padding: '2px 5px', borderRadius: '5px', marginBottom: '2px' }]}>
                                                    คาบที่ {index + 1} {dateTimeFormat(attendance.studingTimeDate)}
                                                </Text>
                                            ))}
                                    </View>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableColumn1,]}>เลขที่</Text>
                                        <Text style={[styles.tableColumn2,]}>รหัสนักเรียน</Text>
                                        <Text style={[styles.tableColumn2,]}>ชือ-นามสกุล</Text>
                                        {studentList.data[0].attendance
                                            .filter((att) => att.month === month)
                                            .map((attendance, index) => (
                                                <Text key={index} style={[styles.tableColumn2]}>
                                                    {++indexReal}
                                                </Text>
                                            ))}
                                    </View>
                                    {studentList.data.map((student, index) => (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={[styles.tableColumn1]}>{student.stdNo}</Text>
                                            <Text style={[styles.tableColumn2]}>{student.stdId}</Text>
                                            <Text style={[styles.tableColumn2]}>{`${student.fName} ${student.lName}`}</Text>
                                            {student.attendance
                                                .filter((att) => att.month === month)
                                                .map((attendance, attIndex) => (
                                                    <Text key={attIndex} style={[styles.tableColumn2, { color: getStatusClass(attendance.attStatus) }]}>
                                                        {formatAttStatus(attendance.attStatus)}
                                                    </Text>
                                                ))}
                                        </View>
                                    ))} */}
                                </Page>
                            </Document>
                        </PDFViewer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendenceBySubjectPDF;