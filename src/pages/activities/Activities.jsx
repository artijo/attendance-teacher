import axios from "axios";
import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../helper";

function Activities() {
    const [groupedActivities, setGroupedActivities] = useState({});
    const [expandedSections, setExpandedSections] = useState({});
    const [loading, setLoading] = useState(true);

    // Initialize expanded sections when activities are loaded
    useEffect(() => {
        const initialExpanded = {};
        Object.keys(groupedActivities).forEach(year => {
            initialExpanded[`${year}-continuous`] = true;
            initialExpanded[`${year}-nonContinuous`] = true;
        });
        setExpandedSections(initialExpanded);
    }, [groupedActivities]);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const groupActivities = (activities) => {
        const grouped = activities.reduce((acc, item) => {
            const year = item.activity.classroom?.[0]?.classroom?.term?.academicYear || 
                        new Date(item.activity.actDate).getFullYear();
            
            if (!acc[year]) {
                acc[year] = {
                    continuous: [],
                    nonContinuous: []
                };
            }

            if (item.activity.activityType.actTypeName === "กิจกรรมต่อเนื่อง") {
                acc[year].continuous.push(item);
            } else {
                acc[year].nonContinuous.push(item);
            }

            return acc;
        }, {});

        // Sort years in descending order
        return Object.keys(grouped)
            .sort((a, b) => b - a)
            .reduce((acc, year) => {
                acc[year] = grouped[year];
                return acc;
            }, {});
    };

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${HOSTNAME}/t/activities`);
            if (response.data.not_found) {
                setGroupedActivities({});
            } else if (response.status === 200) {
                setGroupedActivities(groupActivities(response.data));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading">กิจกรรมทั้งหมด</h1>
                <div className="mt-2 h-1 w-16 bg-secondary rounded-full"></div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : Object.keys(groupedActivities).length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center border border-line">
                    <div className="flex justify-center mb-4 text-text-color-alt">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-text-color mb-2 font-heading">ไม่พบข้อมูลกิจกรรม</h2>
                    <p className="text-text-color-alt font-body">ไม่มีกิจกรรมที่คุณดูแลในขณะนี้</p>
                </div>
            ) : (
                Object.entries(groupedActivities).map(([year, types]) => (
                    <div key={year} className="mb-10">
                        <div className="flex items-center mb-4">
                            <div className="bg-primary/10 px-4 py-2 rounded-lg inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <h2 className="text-xl font-bold text-primary font-heading">
                                    ปีการศึกษา {parseInt(year) + 543}
                                </h2>
                            </div>
                        </div>
                        
                        {types.continuous.length > 0 && (
                            <div className="mb-8">
                                <button
                                    onClick={() => toggleSection(`${year}-continuous`)}
                                    className={`w-full flex items-center justify-between p-4 rounded-t-lg transition-colors ${
                                        expandedSections[`${year}-continuous`] 
                                            ? "bg-primary text-white" 
                                            : "bg-white text-primary hover:bg-gray-50"
                                    } border ${expandedSections[`${year}-continuous`] ? "border-primary" : "border-line"}`}
                                >
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <h3 className="text-lg font-medium font-heading">
                                            กิจกรรมต่อเนื่อง
                                        </h3>
                                    </div>
                                    <span className="text-lg font-medium transition-transform duration-300 transform">
                                        {expandedSections[`${year}-continuous`] ? '▼' : '▶'}
                                    </span>
                                </button>
                                
                                {expandedSections[`${year}-continuous`] && (
                                    <div className={`bg-white border-x border-b ${expandedSections[`${year}-continuous`] ? "border-primary/30" : "border-line"} rounded-b-lg p-6`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {types.continuous.map((item) => (
                                                <div key={item.activity.actId} className="border border-line rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                                    <div className="h-2 bg-gradient-to-r from-primary to-secondary"></div>
                                                    <div className="p-5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 text-xs font-medium rounded-full font-body">
                                                                ต่อเนื่อง
                                                            </span>
                                                            <div className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold">
                                                                {item.activity.classroom?.[0]?.classroom?.classLevel}/{item.activity.classroom?.[0]?.classroom?.classRoom || "ทั้งโรงเรียน"}
                                                            </div>
                                                        </div>
                                                        
                                                        <h4 className="text-lg font-bold text-text-color font-heading mb-2 line-clamp-2">
                                                            {item.activity.actName}
                                                        </h4>
                                                        
                                                        <p className="text-text-color-alt text-sm mb-3 line-clamp-2 h-10">
                                                            {item.activity.actDesc}
                                                        </p>
                                                        
                                                        <div className="flex items-center text-xs text-text-color-alt mb-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {formatDate(item.activity.actDate)} - {formatDate(item.activity.actDateEnd)}
                                                        </div>
                                                        
                                                        <Link 
                                                            to={`/activities/${item.activity.actId}`} 
                                                            className="w-full py-2 px-4 text-center text-sm font-medium text-white bg-primary hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 inline-block"
                                                        >
                                                            รายละเอียด
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {types.nonContinuous.length > 0 && (
                            <div className="mb-8">
                                <button
                                    onClick={() => toggleSection(`${year}-nonContinuous`)}
                                    className={`w-full flex items-center justify-between p-4 rounded-t-lg transition-colors ${
                                        expandedSections[`${year}-nonContinuous`] 
                                            ? "bg-secondary text-white" 
                                            : "bg-white text-secondary hover:bg-gray-50"
                                    } border ${expandedSections[`${year}-nonContinuous`] ? "border-secondary" : "border-line"}`}
                                >
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                        </svg>
                                        <h3 className="text-lg font-medium font-heading">
                                            กิจกรรมไม่ต่อเนื่อง
                                        </h3>
                                    </div>
                                    <span className="text-lg font-medium transition-transform duration-300 transform">
                                        {expandedSections[`${year}-nonContinuous`] ? '▼' : '▶'}
                                    </span>
                                </button>
                                
                                {expandedSections[`${year}-nonContinuous`] && (
                                    <div className={`bg-white border-x border-b ${expandedSections[`${year}-nonContinuous`] ? "border-secondary/30" : "border-line"} rounded-b-lg p-6`}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {types.nonContinuous.map((item) => (
                                                <div key={item.activity.actId} className="border border-line rounded-xl overflow-hidden bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                                    <div className="h-2 bg-secondary"></div>
                                                    <div className="p-5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 text-xs font-medium rounded-full font-body">
                                                                ไม่ต่อเนื่อง
                                                            </span>
                                                            <div className="bg-secondary/10 text-secondary px-2 py-0.5 rounded text-xs font-semibold">
                                                                {item.activity.classroom?.[0]?.classroom?.classLevel}/{item.activity.classroom?.[0]?.classroom?.classRoom || "ทั้งโรงเรียน"}
                                                            </div>
                                                        </div>
                                                        
                                                        <h4 className="text-lg font-bold text-text-color font-heading mb-2 line-clamp-2">
                                                            {item.activity.actName}
                                                        </h4>
                                                        
                                                        <p className="text-text-color-alt text-sm mb-3 line-clamp-2 h-10">
                                                            {item.activity.actDesc}
                                                        </p>
                                                        
                                                        <div className="flex items-center text-xs text-text-color-alt mb-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {formatDate(item.activity.actDate)} - {formatDate(item.activity.actDateEnd)}
                                                        </div>
                                                        
                                                        <Link 
                                                            to={`/activities/${item.activity.actId}`} 
                                                            className="w-full py-2 px-4 text-center text-sm font-medium text-white bg-secondary hover:bg-secondary/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-all duration-300 inline-block"
                                                        >
                                                            รายละเอียด
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default Activities;