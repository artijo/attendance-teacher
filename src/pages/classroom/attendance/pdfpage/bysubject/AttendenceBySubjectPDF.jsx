import { Page, Text, View, Document, PDFViewer, Image } from "@react-pdf/renderer";
import { formatTitle } from "../../../../../helper.js";
import { Link, useLocation } from "react-router-dom";
import { styles } from "../style.js";
function AttendenceBySubjectPDF() {
    const location = useLocation();
    const { studentInfo, dataInfo, className, stdId, classroom } = location.state;
    // {studentInfo: studentInfoMation,dataInfo: studentInfo, className: className, stdId:stdId, classroom: classroom}}
    // console.log(classroom);
    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold md:text-3xl text-primary font-heading">รายงาน PDF สรุปการเข้าเรียนตามวิชา</h1>
                <div className="w-16 h-1 mt-2 rounded-full bg-secondary"></div>
            </div>
            <div className="flex items-center justify-between mb-6">
                <div className="p-2 mt-1 mr-3 rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex gap-1">
                        <p className="text-xs font-medium text-white px-2 py-[2px] font-heading rounded-full bg-primary w-fit">{formatTitle(studentInfo.title)}{studentInfo.fName} {studentInfo.lName}</p>
                        <p className="text-xs font-medium text-white px-2 py-[2px] font-heading rounded-full bg-secondary w-fit">ห้องม.{classroom.classLevel}/{classroom.classRoom}</p>
                    </div>
                    <div className="flex gap-2 px-2 py-2 mt-2 text-xs rounded-md bg-gray-50 w-fit">
                        <p>รหัสนักเรียน: {studentInfo.stdId}</p>
                        <p>เบอร์โทรศัพท์: {studentInfo.tel}</p>
                        <p>อีเมล: {studentInfo.email ? studentInfo.email : "-"}</p>
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
                    ย้อนกลับ
                </Link>
            </div>
            <div className="overflow-hidden bg-white border shadow-md rounded-xl border-line">
                <div className="p-6">
                    <div className="w-full h-[700px] rounded-xl overflow-hidden border border-line">
                        <PDFViewer width={"100%"} height={"100%"} style={{ borderRadius: "0.5rem" }}>
                            <Document
                                pageMode="fullScreen"
                                title={`เอกสารสรุปการเข้าเรียนตามวิชาและสิทธิ์ในการสอบ_${studentInfo.stdId}_${studentInfo.fName}_${studentInfo.lName}_ปีการศึกษา${classroom.term.AcademicYear + 543}_เทอม${classroom.term.semester}`}
                                
                            >
                                <Page size="A4" style={styles.page} orientation="portrait">
                                    <Image src={`/Logo_NPS.png`} style={styles.logoSize} />
                                    <Text style={styles.textHeader}>สรุปการเข้าเรียนตามวิชา</Text>
                                    <View
                                        style={{
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
                                    <Text style={styles.textParagraph}>รหัสนักเรียน: {studentInfo.stdId} เบอร์โทรศัพท์: {studentInfo.tel} อีเมล: {studentInfo.email ? studentInfo.email : "-"}</Text>
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