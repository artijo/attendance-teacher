import { Page, Text, View, Document, PDFViewer, PDFDownloadLink, Image } from "@react-pdf/renderer";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";
import { styles } from "./style.js";
import { convertNumberToThaiMonth, formatTitle } from "../../../helper.js";

function FilterByPeriod({
    tableJson,
    month,
    subject,
    classroomInfo,
}){
    const keyThai = ["ชื่อ-นามสกุล", "รหัสนักเรียน", "เลขที่"];
    const tableJsonKey = Object.keys(tableJson[0]).filter((key) => {if(!keyThai.includes(key)) return key;});
    const MyPDFDocument = () => {
        return (
            <Document
                pageMode="fullScreen"
            >
                <Page size="A4" style={styles.page} orientation="portrait">
                    <Table  style={styles.table}>
                        <Image src={`/Logo_NPS.png`} style={styles.logoSize} />
                        <Text style={styles.textHeader}>รายละเอียดการเข้าเรียนตามคาบห้อง {classroomInfo.classLevel}/{classroomInfo.classRoom}</Text>
                        <Text style={styles.textParagraph}>วิชา {subject.subNameThai}({subject.subNameEng}) เดือน {convertNumberToThaiMonth(month)}</Text>
                        <TH style={styles.tableHeader}>
                            <TD style={[styles.td, { flex: 1, fontSize: 8 }]}>
                                เลขที่
                            </TD>
                            <TD style={[styles.td, { flex: 1, fontSize: 8 }]}>
                                รหัสนักเรียน
                            </TD>
                            <TD style={[styles.td, { flex: 2, fontSize: 8 }]}>
                                ชื่อ-นามสกุล
                            </TD>
                            {tableJsonKey.map((key, index) => (
                                <TD key={index} style={[styles.td, { flex: 1, fontSize: 8 }]}>
                                    {key}
                                </TD>
                            ))}
                        </TH>
                        {tableJson.map((student, key) => (
                            <TR key={key}>
                                <TD style={[styles.td, { flex: 1, fontSize: 8 }]}>
                                    {student[keyThai[2]]}
                                </TD>
                                <TD style={[styles.td, { flex: 1, fontSize: 8 }]}>
                                    {student[keyThai[1]]}
                                </TD>
                                <TD style={[styles.td, { flex: 2, fontSize: 8 }]}>
                                    {student[keyThai[0]]}
                                </TD>
                                {tableJsonKey.map((tablekey) => (
                                    <TD key={tablekey} style={[styles.td, { flex: 1, fontSize: 8 }]}>
                                        {student[tablekey]}
                                    </TD>
                                ))}
                            </TR>
                        ))}
                    </Table>
                </Page>

            </Document>
        ); 
    };

    return (
        <div>
            {tableJson.length  > 0 && subject != null && classroomInfo != null && (
                <PDFDownloadLink document={<MyPDFDocument/>} fileName={`รายละเอียดการเข้าเรียนตามคาบเดือน${convertNumberToThaiMonth(month)}ห้องม.${classroomInfo.classLevel}/${classroomInfo.classRoom}.pdf`}>
                    <div 
                        className="cursor-pointer ml-auto flex items-center gap-2 w-fit text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800 dark:border-red-700"
                    >
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
                            </svg>
                        </div>
                        <span>ดาวน์โหลดไฟล์ <span className="font-bold">PDF</span></span>
                    </div>
                </PDFDownloadLink>
            )}
        </div>
    );
};


export default FilterByPeriod;