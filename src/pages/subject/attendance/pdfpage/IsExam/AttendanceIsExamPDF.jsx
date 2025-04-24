import { Page, Text, View, Document, PDFViewer, Image } from "@react-pdf/renderer";
import { formatTitle } from "../../../../../helper.js";
import { Link, useLocation } from "react-router-dom";
import { styles } from "../style.js";

function AttendanceIsExamPDF() {
    const location = useLocation();
    const { classroomInfo, subject, abstact  } = location.state; 
    // console.log(abstact);
    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">รายงาน PDF สรุปสิทธิ์การสอบของนักเรียน</h1>
                <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
            </div>
            <div className="flex justify-between items-center mb-6">
                <div className="bg-primary/10 text-primary rounded-full p-2 mt-1 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-medium text-text-color font-heading">
                        {location.state.subject.subNameThai}
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {location.state.subject.subCode}
                        </span>
                    </h2>
                    <p className="text-sm text-text-color-alt font-body mt-1">
                        {location.state.subject.subNameEng}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            ม.{classroomInfo.classLevel}/{classroomInfo.classRoom}
                        </span>
                        <span className="text-sm text-text-color-alt">
                            ปีการศึกษา {classroomInfo.term.academicYear + 543} เทอม {classroomInfo.term.semester}
                        </span>
                    </div>
                </div>

                <Link
                    to={`/activity/participate/filterbyclassroomjoin`}
                    // state={{ classrooms: location.state.classrooms, activityId: activityId, activity: activity }}
                    className="inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-text-color bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    กลับไปหน้าเลือกห้อง
                </Link>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                <div className="p-6">
                    <div className="mb-6">
                        <div className="bg-gray-50 border border-line rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-text-color font-body">รายละเอียดสรุปสิทธิ์การสอบของนักเรียน</h4>
                                    <p className="text-sm text-text-color-alt font-body mt-1">
                                        {/* ประจำวันที่ {formatDateToThai(date)} | ห้อง ม.{classroomInfo.classLevel}/{classroomInfo.classRoom} */}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full h-[700px] rounded-xl overflow-hidden border border-line">
                        <PDFViewer width={"100%"} height={"100%"} style={{ borderRadius: "0.5rem" }}>
                            <Document
                                pageMode="fullScreen"
                                title={`เอกสารการเข้าเรียนวิชา`}
                            >
                                <Page size="A4" style={styles.page} orientation="portrait">
                                    <Image src={`/Logo_NPS.png`} style={styles.logoSize} />
                                    <Text style={styles.textHeader}>สรุปสิทธิ์การสอบของนักเรียน</Text>
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
                                    <Text style={[styles.textParagraph, {fontSize:12}]}>{subject.subNameThai}-{subject.subNameEng} ({subject.subCode})</Text>
                                    <Text style={[styles.textParagraph, {fontSize:12}]}>ห้องม.{classroomInfo.classLevel}/{classroomInfo.classRoom} ปีการศึกษา {classroomInfo.term.academicYear+543} เทอม {classroomInfo.term.semester}</Text>
                                    <View style={styles.tableHeader}>
                                        <Text style={styles.tableColumn1}>เลขที่</Text>
                                        <Text style={styles.tableColumn2}>รหัสนักเรียน</Text>
                                        <Text style={styles.tableColumn2}>ชื่อ-นามสกุล</Text>
                                        <Text style={styles.tableColumn2}>ขาดเรียน</Text>
                                        <Text style={styles.tableColumn2}>เข้าสาย</Text>
                                        <Text style={styles.tableColumn2}>ลา</Text>
                                        <Text style={styles.tableColumn2}>กิจกรรม</Text>
                                        <Text style={styles.tableColumn2}>เข้าเรียน</Text>
                                        <Text style={styles.tableColumn2}>ร้อยละการเข้าเรียน</Text>
                                        <Text style={styles.tableColumn2}>สถานะ</Text>
                                    </View>
                                    {abstact.map((summary, index) => (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={styles.tableColumn1}>{parseInt(summary.stdNo)}</Text>
                                            <Text style={styles.tableColumn2}>{summary.stdId}</Text>
                                            <Text style={styles.tableColumn2}>{formatTitle(summary.title)} {summary.fName} {summary.lName}</Text>
                                            <Text style={styles.tableColumn2}>{summary.attendenceAbsentCount}</Text>
                                            <Text style={styles.tableColumn2}>{summary.attendenceLateCount}</Text>
                                            <Text style={styles.tableColumn2}>{summary.attendenceLeaveCount}</Text>
                                            <Text style={styles.tableColumn2}>{summary.attendenceActivity}</Text>
                                            <Text style={styles.tableColumn2}>{summary.attendenceCount}</Text>
                                            <Text style={styles.tableColumn2}>{summary.attendencePercent}%</Text>
                                            <Text style={styles.tableColumn2}>{summary.canExam}</Text>
                                        </View>
                                    ))}
                                    <View style={{display:'flex',marginTop: 5, flexDirection:'row', gap: 5, justifyContent:'flex-end', fontSize:10}}>
                                        <Text>จำนวนนักเรียนที่ไม่มีสิทธิ์สอบ (มส):</Text>
                                        <Text>{abstact.filter(item => item.canExam === "มส.").length} คน</Text>
                                    </View>
                                    <View style={{display:'flex',marginTop: 5, flexDirection:'row', gap: 5, justifyContent:'flex-end', fontSize:10}}>
                                        <Text>จำนวนนักเรียนทั้งหมด:</Text>
                                        <Text>{abstact.length} คน</Text>
                                    </View>
                                   
                                </Page>
                            </Document>
                        </PDFViewer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceIsExamPDF;