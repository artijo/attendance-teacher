import { DateTime } from "luxon";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { formatDateToThai } from "../../../helper";
import { abstactActivity } from "../../../excel";
import ErrorAlertActivity from "../../../components/alert/activity/activity/error";

function ExcelByFilterRoom() {
    const location = useLocation();
    const { classrooms, activityId, activity } = location.state;
    const firstDate = DateTime.fromISO(activity.actDate).setZone('Asia/Bangkok').startOf('day').toISODate();
    
    const [alert, setAlert] = useState(false);
    const [startDate, setStartDate] = useState(`${firstDate}`);
    const [endDate, setEndDate] = useState(`${firstDate}`);
    const [loading, setLoading] = useState({});

    const handleStartDate = (value) => {
        setStartDate(value);
    };

    const handleEndDate = (value) => {
        setEndDate(value);
    };

    const checkDate = (startDate, endDate) => {
        const startDateTime = DateTime.fromISO(startDate).setZone('Asia/Bangkok').startOf('day');
        const endDateTime = DateTime.fromISO(endDate).setZone('Asia/Bangkok').startOf('day');
        if(startDateTime > endDateTime) {
            setAlert(true);
        }else{
            setAlert(false);
        };
    };

    const getDatesBetween = (startDate, endDate) => {
        const dates = [];
        let current = DateTime.fromISO(startDate).setZone('Asia/Bangkok').startOf('day');
        const end = DateTime.fromISO(endDate).setZone('Asia/Bangkok').startOf('day');
        
        while (current <= end) {
            dates.push(current.toISODate());
            current = current.plus({ days: 1 });
        }
        return dates;
    };

    const handelExportExcel = async (activityId, classId, startDate, endDate, className, activityName) => {
        setLoading({...loading, [classId]: true});
        try {
            await abstactActivity(activityId, classId, startDate, endDate, className, activityName);
        } finally {
            setLoading({...loading, [classId]: false});
        }
    };

    useEffect(() => {
        checkDate(startDate, endDate);
    },[startDate, endDate]);

    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">
                            รายงานการเข้าร่วมกิจกรรม
                        </h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center gap-2 font-body">
                        <div className="bg-primary/10 px-3 py-1.5 rounded-lg">
                            <span className="font-medium text-primary">กิจกรรม:</span> {activity.actName}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-line overflow-hidden">
                <div className="border-b border-line p-6">
                    <h2 className="text-xl font-bold text-primary font-heading mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        ดาวน์โหลดรายงานแบ่งตามห้องเรียน
                    </h2>
                    <p className="text-text-color-alt font-body text-sm">
                        ดาวน์โหลดข้อมูลการเข้าร่วมกิจกรรมตามช่วงวันที่ โดยแบ่งตามห้องเรียน
                    </p>
                </div>
                
                {classrooms.length > 0 && (
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label htmlFor="startDate" className="block text-sm font-medium text-text-color-alt font-body">
                                    วันที่เริ่มต้น
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <select 
                                        id="startDate" 
                                        name="startDate" 
                                        className="block w-full pl-10 py-2.5 text-sm text-text-color border border-line rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body"
                                        onChange={(e) => handleStartDate(e.target.value)}
                                        value={startDate}
                                    >
                                        {activity && getDatesBetween(activity.actDate, activity.actDateEnd).map((date) => {
                                            const dateTimeFormat = formatDateToThai(date);
                                            return (
                                                <option value={date} key={date}>
                                                    {dateTimeFormat}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="endDate" className="block text-sm font-medium text-text-color-alt font-body">
                                    วันที่สิ้นสุด
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <select 
                                        id="endDate" 
                                        name="endDate" 
                                        className="block w-full pl-10 py-2.5 text-sm text-text-color border border-line rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-body"
                                        onChange={(e) => handleEndDate(e.target.value)}
                                        value={endDate}
                                    >
                                        {activity && getDatesBetween(activity.actDate, activity.actDateEnd).map((date) => {
                                            const dateTimeFormat = formatDateToThai(date);
                                            return (
                                                <option value={date} key={date}>
                                                    {dateTimeFormat}
                                                </option>
                                            )
                                        })}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        {alert && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-md flex items-start">
                                <svg className="h-5 w-5 mr-2 mt-0.5 text-yellow-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div>
                                    <p className="font-medium">วันที่ไม่ถูกต้อง</p>
                                    <p className="mt-1 text-sm">วันที่เริ่มต้นต้องน้อยกว่าหรือเท่ากับวันที่สิ้นสุด</p>
                                </div>
                            </div>
                        )}

                        {!alert && (
                            <div className="overflow-x-auto">   
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white uppercase bg-primary">
                                        <tr>
                                            <th className="px-6 py-3">ห้องเรียน</th>
                                            <th className="px-6 py-3 text-center">ช่วงเวลา</th>
                                            <th className="px-6 py-3 text-center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-body">
                                        {classrooms.map((classroom) => (
                                            <tr key={classroom.classId} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-medium">
                                                    ม.{classroom.className}
                                                </td>
                                                <td className="px-6 py-4 text-center text-text-color-alt">
                                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs">
                                                        {formatDateToThai(startDate)} - {formatDateToThai(endDate)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handelExportExcel(activityId, classroom.classId, startDate, endDate, classroom.className, activity.actName)}
                                                        disabled={loading[classroom.classId]}
                                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        {loading[classroom.classId] ? (
                                                            <>
                                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                กำลังดาวน์โหลด...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
                                                                </svg>
                                                                ดาวน์โหลด Excel
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {classrooms.length === 0 && (
                    <div className="p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="text-lg font-medium mb-1 text-text-color">ไม่พบข้อมูลห้องเรียน</h3>
                        <p className="text-text-color-alt">ไม่มีห้องเรียนที่สามารถดาวน์โหลดข้อมูลได้</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ExcelByFilterRoom;
