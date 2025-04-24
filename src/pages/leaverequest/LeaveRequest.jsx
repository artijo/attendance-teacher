import { HOSTNAME } from "../../config";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { userStore } from "../../store";

function LeaveRequest() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all'); // all, WAITING, APPROVE, REJECT
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [uniqueSubjects, setUniqueSubjects] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    // Remove the in-component computed value of filteredLeaveRequests

    const user = userStore((state) => state.user);
    const teacherId = user?.tchId || null;
    
    // First useEffect: Fetch data and filter by teacher
    useEffect(() => {
        setLoading(true);
        axios.get(`${HOSTNAME}/t/leave-requests`)
            .then((response) => {
                // Store all leave requests
                const allRequests = response.data;
                
                // Filter leave requests that contain subjects taught by current teacher
                const teacherRequests = allRequests.filter(request => {
                    return request.studingTime.some(time => 
                        time.studingTime?.timetable?.subject?.tchId === teacherId
                    );
                });
                
                setLeaveRequests(teacherRequests);
                
                // Extract unique subjects taught by the current teacher
                const subjects = new Set();
                teacherRequests.forEach(request => {
                    request.studingTime.forEach(studyTime => {
                        if (studyTime.studingTime?.timetable?.subject && 
                            studyTime.studingTime.timetable.subject.tchId === teacherId) {
                            const subject = studyTime.studingTime.timetable.subject;
                            subjects.add(JSON.stringify({
                                id: subject.subId,
                                code: subject.subCode,
                                name: subject.subNameThai
                            }));
                        }
                    });
                });
                
                setUniqueSubjects(Array.from(subjects).map(s => JSON.parse(s)));
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [teacherId]);
    
    // Second useEffect: Apply filters and generate filtered requests
    useEffect(() => {
        // First filter leave requests based on the status and subject filters
        const filtered = leaveRequests.filter(request => {
            // Create a filtered list of studingTime entries that are taught by the current teacher
            const teacherStudyTimes = request.studingTime.filter(time => 
                time.studingTime?.timetable?.subject?.tchId === teacherId
            );
            
            // If there are no study times taught by this teacher, don't include this request
            if (teacherStudyTimes.length === 0) {
                return false;
            }
            
            // Filter by status
            if (statusFilter !== 'all') {
                // Check if any of the teacher's studingTime entries has the matching status
                const hasMatchingStatus = teacherStudyTimes.some(time => time.leaveStatus === statusFilter);
                if (!hasMatchingStatus) return false;
            }
            
            // Filter by subject
            if (subjectFilter !== 'all') {
                // Check if any of the teacher's studingTime entries has the matching subject ID
                const hasMatchingSubject = teacherStudyTimes.some(time => 
                    time.studingTime?.timetable?.subject?.subId === subjectFilter
                );
                if (!hasMatchingSubject) return false;
            }
            
            return true;
        });
        
        // Then modify each request to only include study times for this teacher
        const modified = filtered.map(request => {
            // Create a shallow copy of the request
            const newRequest = {...request};
            
            // Filter studingTime to only include entries for this teacher
            newRequest.studingTime = request.studingTime.filter(time => 
                time.studingTime?.timetable?.subject?.tchId === teacherId
            );
            
            return newRequest;
        });
        
        setFilteredRequests(modified);
    }, [leaveRequests, statusFilter, subjectFilter, teacherId]); // Include all dependencies
    
    const getStatusColor = (status) => {
        switch(status) {
            case 'WAITING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVE':
                return 'bg-green-100 text-green-800';
            case 'REJECT':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    const getStatusText = (status) => {
        switch(status) {
            case 'WAITING':
                return 'รอการอนุมัติ';
            case 'APPROVE':
                return 'อนุมัติแล้ว';
            case 'REJECT':
                return 'ไม่อนุมัติ';
            default:
                return 'ไม่ทราบสถานะ';
        }
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };
    
    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">คำขอลาของนักเรียน</h1>
                        <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
                    </div>
                </div>
            </div>
            
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                {/* Status Filter */}
                <div className="bg-white p-4 rounded-xl shadow-md border border-line flex flex-col">
                    <p className="text-sm font-medium text-text-color-alt mb-2">กรองตามสถานะ</p>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setStatusFilter('all')} 
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                statusFilter === 'all' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-white text-text-color border border-line hover:bg-gray-50'
                            }`}
                        >
                            ทั้งหมด
                        </button>
                        <button 
                            onClick={() => setStatusFilter('WAITING')} 
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                statusFilter === 'WAITING' 
                                    ? 'bg-yellow-500 text-white' 
                                    : 'bg-white text-text-color border border-line hover:bg-gray-50'
                            }`}
                        >
                            รอการอนุมัติ
                        </button>
                        <button 
                            onClick={() => setStatusFilter('APPROVE')} 
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                statusFilter === 'APPROVE' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-white text-text-color border border-line hover:bg-gray-50'
                            }`}
                        >
                            อนุมัติแล้ว
                        </button>
                        <button 
                            onClick={() => setStatusFilter('REJECT')} 
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                statusFilter === 'REJECT' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-white text-text-color border border-line hover:bg-gray-50'
                            }`}
                        >
                            ไม่อนุมัติ
                        </button>
                    </div>
                </div>
                
                {/* Subject Filter */}
                <div className="bg-white p-4 rounded-xl shadow-md border border-line flex flex-col">
                    <p className="text-sm font-medium text-text-color-alt mb-2">กรองตามวิชา</p>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => setSubjectFilter('all')} 
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                subjectFilter === 'all' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-white text-text-color border border-line hover:bg-gray-50'
                            }`}
                        >
                            ทุกวิชา
                        </button>
                        
                        {uniqueSubjects.map((subject) => (
                            <button 
                                key={subject.id}
                                onClick={() => setSubjectFilter(subject.id)} 
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    subjectFilter === subject.id
                                        ? 'bg-primary text-white' 
                                        : 'bg-white text-text-color border border-line hover:bg-gray-50'
                                }`}
                            >
                                {`${subject.code} - ${subject.name}`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {filteredRequests && filteredRequests.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-line">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-line">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                รหัสนักเรียน
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ชื่อ-นามสกุล
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                ประเภทการลา
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                วันที่ลา
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                วิชาที่ขอลา
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                สถานะ
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                การดำเนินการ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-line">
                                        {filteredRequests.map((request) => (
                                            <tr key={request.leaveId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-color">
                                                    {request.stdId}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                                                    {`${request.student?.title || ''} ${request.student?.fName || ''} ${request.student?.lName || ''}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                                                    {request.leaveRequestType?.leaveTypeName || ''}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                                                    {formatDate(request.leaveDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                                                    <div className="flex flex-col gap-1">
                                                        {request.studingTime.map((time, index) => (
                                                            <div key={index} className="text-sm">
                                                                <span className="font-medium">{time.studingTime?.timetable?.subject?.subCode || ''}</span> - 
                                                                <span>{time.studingTime?.timetable?.subject?.subNameThai || ''}</span>
                                                                <span className="text-xs text-gray-500 ml-2">
                                                                    ({formatTime(time.studingTime?.timetable?.timeStart)} - {formatTime(time.studingTime?.timetable?.timeEnd)})
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col gap-1">
                                                        {request.studingTime.map((time, index) => (
                                                            <span key={index} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(time.leaveStatus)}`}>
                                                                {getStatusText(time.leaveStatus)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-color">
                                                    <Link to={`/leavereq/${request.leaveId}`} className="text-primary hover:text-accent">
                                                        ดูรายละเอียด
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
                            <div className="flex justify-center mb-4 text-text-color-alt">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">ไม่พบคำขอลา</h2>
                            <p className="text-text-color-alt font-body">ไม่มีคำขอลาที่ตรงกับเงื่อนไขที่เลือกในขณะนี้</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default LeaveRequest;