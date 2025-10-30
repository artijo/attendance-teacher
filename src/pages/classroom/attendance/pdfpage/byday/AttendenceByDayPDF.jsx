import { useLocation } from "react-router-dom";
import { formatAttStatus, formatDateToThai, formatTitle } from "../../../../../helper.js";
import { styles } from "../style.js";
import { Page, Text, View, Document, PDFViewer, Image } from "@react-pdf/renderer";
import { useEffect, useState } from "react";

function AttendenceByDayPDF() {
    const location = useLocation();
    const { studentList, periodStatus, date, classroomInfo } = location.state;
    const [newStudentList, setNewStudentList] = useState([]);
   
    // console.log(classroomInfo.classRoom);

    useEffect(() => {
        let listPerPage = 25;
        let totalPage = Math.ceil(studentList.length / listPerPage); // ปัดเศษขึ้น 
        let itemsPage = [];
        // Array structure
        /*
            [
                [],[]
            ]
        */
        for (let i = 1; i <= totalPage; i++) {
            let sliceStudentList = studentList.slice((i - 1) * listPerPage, i * listPerPage)
            // console.log(sliceStudentList);
            itemsPage.push(sliceStudentList);
        };
        // console.log(itemsPage);
        setNewStudentList(itemsPage);
    }, [])



    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold md:text-3xl text-primary font-heading">รายงาน PDF สรุปการเข้าเรียนตามวัน</h1>
                <div className="w-16 h-1 mt-2 rounded-full bg-secondary"></div>
            </div>
            <div className="flex items-center justify-between mb-6">
                <div className="p-2 mt-1 mr-3 rounded-full bg-primary/10 text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <div className="flex-1">
                    <div className="flex gap-1">
                        <p className="text-xs font-medium text-white px-2 py-[2px] font-heading rounded-full bg-primary w-fit">รายละเอียดการเข้าเรียนตามวัน</p>
                        <p className="text-xs font-medium text-white px-2 py-[2px] font-heading rounded-full bg-secondary w-fit">ห้องม.{classroomInfo.classLevel}/{classroomInfo.classRoom}</p>
                    </div>
                </div>

                {/* <Link
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
                </Link> */}
            </div>
            <div className="overflow-hidden bg-white border shadow-md rounded-xl border-line">
                <div className="p-6">
                    <div className="w-full h-[700px] rounded-xl overflow-hidden border border-line">
                        {(newStudentList.length > 0 && periodStatus.length > 0) && (
                            <PDFViewer width={"100%"} height={"100%"} style={{ borderRadius: "0.5rem" }}>
                                <Document pageMode="fullScreen" title={`เอกสารการเข้าเรียประจำวันที่ ${formatDateToThai(date)}`}>
                                    {(newStudentList.length > 0) && newStudentList.map((students, pageIndex) => (
                                        <Page size={"A4"} style={styles.page} key={`Page ${pageIndex + 1}`}>
                                            <Image src={`/Logo_NPS.png`} style={styles.logoSize} />
                                            <Text style={styles.textHeader}>
                                                รายละเอียดการเข้าเรียนประจำวันที่ {formatDateToThai(date)} | ห้องม.{classroomInfo.classLevel}/{classroomInfo.classRoom}
                                            </Text>
                                            <View
                                                style={{
                                                    width: '20%',
                                                    height: '2px',
                                                    backgroundColor: '#EE722A',
                                                    borderRadius: '5px',
                                                    marginBottom: '5px'
                                                }}
                                            > </View>
                                            {/* First Row - Period Numbers */}
                                            <View style={styles.tableHeader}>
                                                <Text style={[styles.tableColumn1, { width: '5%' }]}>คาบที่</Text>
                                                <Text style={[styles.tableColumn1, { width: '15%' }]}></Text>
                                                <Text style={[styles.tableColumn1, { width: '15%' }]}></Text>
                                                {studentList[0].attendance.map((_, index) => (
                                                    <Text key={`table first row ${index + 1}`} style={[styles.tableColumn2, { textAlign: 'center' }]}>{index + 1}</Text>
                                                ))}
                                            </View>
                                            {/* Second Row - Subject Codes */}
                                            <View style={styles.tableRow}>
                                                <Text style={[styles.tableColumn1, { width: '5%' }]}>รหัสวิชา</Text>
                                                <Text style={[styles.tableColumn1, { width: '15%' }]}></Text>
                                                <Text style={[styles.tableColumn1, { width: '15%' }]}></Text>
                                                {studentList[0].attendance.map((att, index) => (
                                                    <Text key={`table second row ${index + 1}`} style={[styles.tableColumn2, { textAlign: 'center' }]}>{att.subjectCode}</Text>
                                                ))}
                                            </View>
                                            {/* Third row - Column Headers */}
                                            <View style={styles.tableRow}>
                                                <Text style={[styles.tableColumn1, { width: '5%' }]}>เลขที่</Text>
                                                <Text style={[styles.tableColumn1, { width: '15%' }]}>รหัสนักเรียน</Text>
                                                <Text style={[styles.tableColumn1, { width: '15%' }]}>ชื่อ-นามสกุล</Text>
                                                {studentList[0].attendance.map((att, index) => (
                                                    <Text key={`table third row ${index + 1}`} style={[styles.tableColumn2, { textAlign: 'center' }]}>{att.subjectName}</Text>
                                                ))}
                                            </View>
                                            {/* Student Row */}
                                            {students.map((student, studentIndex) => (
                                                <View
                                                    key={`student-${student.stdNo}-${studentIndex}`}
                                                    style={styles.tableRow}
                                                >
                                                    <Text style={[styles.tableColumn1, { width: '5%' }]}>{student.stdNo}</Text>
                                                    <Text style={[styles.tableColumn1, { width: '15%' }]}>{student.stdId}</Text>
                                                    <Text style={[styles.tableColumn1, { width: '15%' }]}>
                                                        {`${formatTitle(student.title)}${student.fName} ${student.lName}`}
                                                    </Text>

                                                    {student.attendance.map((attendance, attIndex) => (
                                                        <Text
                                                            key={`student-${student.stdNo}-att-${attendance.subjectName}-${attIndex}`}
                                                            style={[styles.tableColumn2, { textAlign: 'center' }]}
                                                        >
                                                            {attendance.attStatus != null
                                                                ? formatAttStatus(attendance.attStatus.toLowerCase())
                                                                : "-"}
                                                        </Text>
                                                    ))}
                                                </View>
                                            ))}
                                            {/* Period Table */}
                                            {(pageIndex === newStudentList.length - 1) && (
                                                <View style={{marginTop : '7px', marginBottom: '7px'}}>
                                                    <Text style={styles.textHeader}>สรุปการเข้าเรียนทั้งหมด</Text>
                                                    <View style={styles.tableHeader}>
                                                        <Text style={styles.tableColumn1}>วิชา</Text>
                                                        <Text style={styles.tableColumn2}>มาเรียน</Text>
                                                        <Text style={styles.tableColumn2}> มาสาย</Text>
                                                        <Text style={styles.tableColumn2}>ขาดเรียน</Text>
                                                        <Text style={styles.tableColumn2}>ลา</Text>
                                                        <Text style={styles.tableColumn2}>กิจกรรม</Text>
                                                    </View>
                                                    {periodStatus.map((period, periodIndex) => (
                                                        <View key={`${period.subjectName} index ${periodIndex}`} style={styles.tableRow}>
                                                            <Text style={styles.tableColumn1}>{period.subjectName}</Text>
                                                            <Text style={styles.tableColumn2}>{period.present}</Text>
                                                            <Text style={styles.tableColumn2}>{period.late}</Text>
                                                            <Text style={styles.tableColumn2}>{period.absent}</Text>
                                                            <Text style={styles.tableColumn2}>{period.leave}</Text>
                                                            <Text style={styles.tableColumn2}>{period.activity}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </Page>
                                    ))}
                                </Document>
                            </PDFViewer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



export default AttendenceByDayPDF;