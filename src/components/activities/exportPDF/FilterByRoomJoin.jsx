import { useEffect, useState } from "react";
import { styles } from "./style.js";
import { Page, Text, Document, Image, PDFViewer } from "@react-pdf/renderer";
import { Table, TR, TH, TD } from "@ag-media/react-pdf-table";
import axios from "axios";
import { HOSTNAME } from "../../../config.js";
import { useLocation } from "react-router-dom";
import { formatTitle } from "../../../helper.js";

function FilterByRoomJoin() {
  const [participate, setParticipate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { activityId, className, filterRoom, activity } = location.state;

  const getParticipateList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${HOSTNAME}/a/activity/abstact/${activityId}`);
      if (response.status === 200) {
        setParticipate(response.data[filterRoom]);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getParticipateList();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
              สรุปการเข้าร่วมกิจกรรม
            </h1>
            <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
          </div>
          
          <div className="flex items-center gap-2 font-body">
            <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
              <span className="font-medium text-primary">กิจกรรม:</span> {activity.actName}
            </div>
            <div className="bg-secondary/10 px-3 py-1.5 rounded-lg">
              <span className="font-medium text-secondary">ห้อง:</span> {className}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 mt-6 shadow-sm border border-line">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-body">
            <div className="space-y-1">
              <p className="text-text-color-alt">สถานที่จัดกิจกรรม</p>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-text-color">{activity.actLocation}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-text-color-alt">เวลากิจกรรม</p>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-text-color">{activity.actStartTime} - {activity.actEndTime} น.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
        <div className="border-b border-line p-6">
          <h2 className="text-xl font-bold text-primary font-heading mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            ตัวอย่างเอกสาร PDF
          </h2>
          <p className="text-text-color-alt font-body text-sm">
            แสดงตัวอย่างรายงานสรุปจำนวนการเข้าร่วมกิจกรรมสำหรับพิมพ์หรือบันทึก
          </p>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[560px] bg-gray-50 rounded-lg border border-line">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
                <p className="text-text-color-alt font-body">กำลังโหลดข้อมูล...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[560px] bg-gray-50 rounded-lg border border-line">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-medium mb-1 text-text-color">{error}</h3>
                <button 
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                  onClick={getParticipateList}
                >
                  ลองอีกครั้ง
                </button>
              </div>
            </div>
          ) : participate && participate.length > 0 ? (
            <div className="w-full h-[560px] overflow-hidden rounded-lg shadow-sm border border-line">
              <PDFViewer
                width="100%"
                height="100%"
                style={{ borderRadius: "0.5rem" }}
              >
                <Document
                  pageMode="fullScreen"
                  title={`เอกสารการเข้าร่วมกิจกรรม ${activity.actName} ห้อง ${className}`}
                >
                  <Page size="A4" style={styles.page} orientation="portrait">
                    <Image src={`/Logo_NPS.png`} style={styles.logoSize} />
                    <Text style={styles.textHeader}>สรุปการเข้าร่วมกิจกรรม {activity.actName} ห้อง {className}</Text>
                    <Text style={styles.textParagraph}>
                      สถานที่: {activity.actLocation} เวลา: {activity.actStartTime} - {activity.actEndTime} น.
                    </Text>
                    <Table style={styles.table}>
                      <TH style={styles.tableHeader}>
                        <TD style={[styles.td, { flex: 1 }]}>รหัสนักเรียน</TD>
                        <TD style={[styles.td, { flex: 1 }]}>ชื่อ-นามสกุล</TD>
                        <TD style={[styles.td, { flex: 1 }]}>จำนวนการเข้าร่วม</TD>
                      </TH>
                      {participate.map((pati, patiIndex) => (
                        <TR key={patiIndex}>
                          <TD style={[styles.td, { flex: 1 }]}>{pati.stdId}</TD>
                          <TD style={[styles.td, { flex: 1 }]}>{formatTitle(pati.title)} {pati.fName} {pati.lName}</TD>
                          <TD style={[styles.td, { flex: 1 }]}>{pati.participateCount}</TD>
                        </TR>
                      ))}
                    </Table>
                  </Page>
                </Document>
              </PDFViewer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[560px] bg-gray-50 rounded-lg border border-line">
              <div className="flex flex-col items-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="text-lg font-medium mb-1 text-text-color">ไม่พบข้อมูลการเข้าร่วมกิจกรรม</h3>
                <p className="text-text-color-alt">ไม่มีข้อมูลการเข้าร่วมกิจกรรมของห้องเรียนนี้</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-line bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-white border border-line hover:bg-gray-50 transition-colors text-text-color rounded-lg inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              กลับไปหน้าก่อนหน้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterByRoomJoin;