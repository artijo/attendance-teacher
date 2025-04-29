import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { HOSTNAME } from '../../config';
import {QRCodeSVG as QRCode} from 'qrcode.react';

function AttendanceQRCode() {
    const { subjectId, studyTimeId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [subject, setSubject] = useState(null);
    const [studyTime, setStudyTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const timerRef = useRef(null);

    // Function to format time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Function to generate a new QR code
    const generateQRCode = async () => {
        setLoading(true);
        setError(null);
        try {
            // Request QR code link from backend
            const packdata = {
                studyTimeId: studyTimeId,
            }
            const response = await axios.post(`${HOSTNAME}/t/attendance/generate-qr`, packdata);
            setQrCodeData(response.data);
            setTimeLeft(600); // Reset timer to 10 minutes
        } catch (err) {
            console.error('Error generating QR code:', err);
            setError('เกิดข้อผิดพลาดในการสร้าง QR Code กรุณาลองใหม่อีกครั้ง');
        } finally {
            setLoading(false);
        }
    };

    // Fetch initial data
    useEffect(() => {
        const fetchSubjectDetails = async () => {
            try {
                // Fetch subject details
                const subjectResponse = await axios.get(`${HOSTNAME}/t/subject/${subjectId}`);
                setSubject(subjectResponse.data);
                
                // Find study time info
                if (subjectResponse.data && subjectResponse.data.timetable) {
                    for (const timetable of subjectResponse.data.timetable) {
                        if (timetable.studyTime) {
                            const foundStudyTime = timetable.studyTime.find(
                                st => st.studyTimeId === studyTimeId
                            );
                            if (foundStudyTime) {
                                setStudyTime({
                                    ...foundStudyTime,
                                    timeStart: timetable.timeStart,
                                    timeEnd: timetable.timeEnd,
                                    classroom: timetable.classroom
                                });
                                break;
                            }
                        }
                    }
                }
                
                // Generate QR code
                await generateQRCode();
            } catch (err) {
                console.error('Error fetching details:', err);
                setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
                setLoading(false);
            }
        };
        
        fetchSubjectDetails();
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [subjectId, studyTimeId]);

    // Setup countdown timer
    useEffect(() => {
        if (qrCodeData) {
            // Clear any existing timer
            if (timerRef.current) clearInterval(timerRef.current);
            
            // Set up new timer
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Time's up, generate new QR code
                        clearInterval(timerRef.current);
                        generateQRCode();
                        return 600;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [qrCodeData]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };

    return (
        <div className="bg-background min-h-screen pb-12">
            <div className="max-w-4xl mx-auto px-4 pt-8">
                {/* Header Section with Animation */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative">
                            <h1 className="text-3xl md:text-4xl font-bold text-primary font-heading">
                                QR Code เช็คชื่อ
                            </h1>
                            <div className="mt-2 h-1.5 w-24 bg-secondary rounded-full"></div>
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-secondary/10 rounded-full blur-md animate-pulse"></div>
                        </div>
                        
                        <Link
                            to={`/subjects/${subjectId}/attendance`}
                            className="bg-white text-primary border border-line px-5 py-2.5 rounded-lg inline-flex items-center hover:bg-primary/5 transition-colors shadow-sm group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            กลับไปหน้าจัดการเช็คชื่อ
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-line p-12 flex flex-col justify-center items-center h-[400px] animate-fade-in">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-line"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary absolute top-0"></div>
                        </div>
                        <p className="mt-4 text-text-color-alt font-medium">กำลังโหลดข้อมูล...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-line overflow-hidden animate-fade-in">
                        <div className="bg-red-50 p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-medium text-red-800 mb-2">เกิดข้อผิดพลาด</h2>
                            <p className="text-red-700 mb-6">{error}</p>
                            <button 
                                onClick={generateQRCode}
                                className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg inline-flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    </div>
                ) : subject && studyTime && qrCodeData ? (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-lg border border-line overflow-hidden">
                            {/* Subject Info */}
                            <div className="p-6 md:p-8 border-b border-line bg-gradient-to-r from-primary/5 to-transparent">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1.5 h-12 bg-primary rounded-full"></div>
                                    <h2 className="text-2xl font-medium text-primary">
                                        {subject.subNameThai}
                                        <span className="ml-2 text-sm text-text-color-alt font-normal">({subject.subCode})</span>
                                    </h2>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-background p-4 rounded-lg hover:shadow-md transition-shadow border border-line hover:border-secondary/20 group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-text-color-alt text-sm mb-1 group-hover:text-secondary transition-colors">วันที่</p>
                                                <p className="font-medium text-lg">{formatDate(studyTime.studingTimeDate)}</p>
                                            </div>
                                            <div className="bg-secondary/10 p-2 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-background p-4 rounded-lg hover:shadow-md transition-shadow border border-line hover:border-primary/20 group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-text-color-alt text-sm mb-1 group-hover:text-primary transition-colors">เวลา</p>
                                                <p className="font-medium text-lg">{studyTime.timeStart?.substring(0, 5)} - {studyTime.timeEnd?.substring(0, 5)} น.</p>
                                            </div>
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {studyTime.classroom && (
                                        <div className="bg-background p-4 rounded-lg hover:shadow-md transition-shadow border border-line hover:border-secondary/20 group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-text-color-alt text-sm mb-1 group-hover:text-secondary transition-colors">ห้องเรียน</p>
                                                    <p className="font-medium text-lg">ม.{studyTime.classroom.classLevel}/{studyTime.classroom.classRoom}</p>
                                                </div>
                                                <div className="bg-secondary/10 p-2 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* QR Code Section */}
                            <div className="p-6 md:p-8 flex flex-col items-center">
                                <div className="mb-8 text-center max-w-lg mx-auto">
                                    <h3 className="text-2xl md:text-3xl font-medium text-primary mb-2">สแกน QR Code เพื่อเช็คชื่อ</h3>
                                    <p className="text-text-color-alt text-sm md:text-base">กรุณาให้นักเรียนสแกน QR Code เพื่อบันทึกการเข้าเรียน</p>
                                    
                                    <div className="flex items-center justify-center gap-3 mt-4 bg-red-50 py-2.5 px-4 rounded-full border border-red-100">
                                        <div className="relative w-5 h-5">
                                            <div className="absolute inset-0 rounded-full bg-red-200 animate-ping opacity-75"></div>
                                            <div className="relative w-5 h-5 rounded-full bg-red-500"></div>
                                        </div>
                                        <p className="text-sm text-red-800">
                                            QR Code จะหมดอายุในอีก <span className="font-bold">{formatTime(timeLeft)}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="relative mb-8 group">
                                    {/* Decoration elements */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 rounded-2xl blur-xl opacity-60 animate-pulse scale-105 group-hover:scale-110 transition-transform"></div>
                                    <div className="absolute -top-3 -left-3 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-xl"></div>
                                    <div className="absolute -bottom-3 -right-3 w-12 h-12 border-b-4 border-r-4 border-secondary rounded-br-xl"></div>
                                    
                                    {/* QR Code container */}
                                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border-2 border-primary/30 relative z-10 group-hover:shadow-xl transition-shadow transform group-hover:scale-[1.02] duration-300">
                                        
                                        {/* QR Code */}
                                        <div className="p-2 bg-white rounded-lg border border-line/50">
                                            <QRCode 
                                                value={qrCodeData.link || "https://example.com"} 
                                                size={350}
                                                level="H"
                                                includeMargin={true}
                                                renderAs="svg"
                                                bgColor={"#FFFFFF"}
                                                fgColor={"#0054A6"}
                                                imageSettings={{
                                                    src: "/Logo_NPS.png",
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 60,
                                                    width: 60,
                                                    excavate: true,
                                                }}
                                            />
                                        </div>
                                        
                                        <div className="mt-4 text-center">
                                            <p className="text-sm text-text-color-alt">สแกน QR Code ด้วย Mobile Application หรือกดที่ QR Code</p>
                                            <p className="mt-2 text-xs font-medium px-3 py-1.5 bg-primary/10 text-primary rounded-full inline-block">
                                                Link: {qrCodeData.link?.substring(0, 30)}...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="w-full flex flex-col sm:flex-row justify-center gap-4">
                                    <button 
                                        onClick={generateQRCode} 
                                        className="bg-secondary text-white px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors shadow-md hover:shadow-lg flex items-center justify-center group"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        สร้าง QR Code ใหม่
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(qrCodeData.link)} 
                                        className="bg-white text-primary border border-primary px-6 py-3 rounded-lg hover:bg-primary/5 transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                        คัดลอกลิงก์
                                    </button>
                                </div>
                            </div>
                            
                            {/* Tips Section */}
                            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-2 border-t border-line">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 p-2 rounded-full mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-blue-800 mb-1">คำแนะนำในการใช้งาน</h4>
                                            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                                                <li>QR Code จะหมดอายุทุก 10 นาที เพื่อความปลอดภัย</li>
                                                <li>นักเรียนสามารถสแกน QR Code ผ่าน Mobile Application</li>
                                                <li>หากต้องการเช็คชื่อใหม่ กรุณากดปุ่ม "สร้าง QR Code ใหม่"</li>
                                                <li>สามารถคัดลอกลิงก์เพื่อแชร์ให้นักเรียนได้</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg border border-line overflow-hidden animate-fade-in">
                        <div className="bg-yellow-50 p-8 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-medium text-yellow-800 mb-2">ไม่พบข้อมูล</h2>
                            <p className="text-yellow-700">ไม่พบข้อมูลคาบเรียนที่ระบุ กรุณาตรวจสอบความถูกต้องของข้อมูลและลองใหม่อีกครั้ง</p>
                            <Link
                                to={`/subjects/${subjectId}/attendance`}
                                className="mt-6 bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg inline-flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                กลับไปหน้าจัดการเช็คชื่อ
                            </Link>
                        </div>
                    </div>
                )}
                
                {/* Footer */}
                <div className="mt-8 text-center text-text-color-alt text-sm">
                    <p>© {new Date().getFullYear()} ระบบจัดการเช็คชื่อนักเรียน</p>
                </div>
            </div>
        </div>
    );
}

export default AttendanceQRCode;
