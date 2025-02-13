import axios from "axios";
import { HOSTNAME } from "../../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Activities() {
    const [groupedActivities, setGroupedActivities] = useState({});
    const [expandedSections, setExpandedSections] = useState({});

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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
        try {
            const response = await axios.get(`${HOSTNAME}/t/activities`);
            if (response.data.not_found) {
                setGroupedActivities({});
            } else if (response.status === 200) {
                setGroupedActivities(groupActivities(response.data));
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {Object.keys(groupedActivities).length === 0 ? (
                <div className="text-center text-gray-500 text-xl mt-10">
                    ไม่พบกิจกรรม
                </div>
            ) : (
                <div className="mx-auto container px-4">
                    <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
                        กิจกรรมทั้งหมด
                    </h1>
                    {Object.entries(groupedActivities).map(([year, types]) => (
                        <div key={year} className="mb-12">
                            <h2 className="text-3xl font-bold mb-6 text-gray-700">
                                ปีการศึกษา {year}
                            </h2>
                            {types.continuous.length > 0 && (
                                <div className="mb-8">
                                    <button
                                        onClick={() => toggleSection(`${year}-continuous`)}
                                        className="w-full flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-4 hover:bg-gray-200 transition-colors"
                                    >
                                        <h3 className="text-2xl font-semibold text-gray-600">
                                            กิจกรรมต่อเนื่อง
                                        </h3>
                                        <span className="text-2xl">
                                            {expandedSections[`${year}-continuous`] ? '▼' : '▶'}
                                        </span>
                                    </button>
                                    {expandedSections[`${year}-continuous`] && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                            {types.continuous.map((item) => (
                                                <div key={item.activity.actId} className="border border-gray-200 p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                                                    <div className="flex flex-col space-y-3">
                                                        <h2 className="text-2xl font-semibold text-gray-800">
                                                            {item.activity.actName}
                                                        </h2>
                                                        <p className="text-lg text-gray-600">
                                                            {item.activity.actDesc}
                                                        </p>
                                                        <p className="text-gray-700">
                                                            {formatDate(item.activity.actDate)} - {formatDate(item.activity.actDateEnd)}
                                                        </p>
                                                        <Link to={`/activities/${item.activity.actId}`} className="text-blue-500 hover:underline">
                                                            รายละเอียด
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {types.nonContinuous.length > 0 && (
                                <div>
                                    <button
                                        onClick={() => toggleSection(`${year}-nonContinuous`)}
                                        className="w-full flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-4 hover:bg-gray-200 transition-colors"
                                    >
                                        <h3 className="text-2xl font-semibold text-gray-600">
                                            กิจกรรมไม่ต่อเนื่อง
                                        </h3>
                                        <span className="text-2xl">
                                            {expandedSections[`${year}-nonContinuous`] ? '▼' : '▶'}
                                        </span>
                                    </button>
                                    {expandedSections[`${year}-nonContinuous`] && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                            {types.nonContinuous.map((item) => (
                                                <div key={item.activity.actId} className="border border-gray-200 p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                                                    <div className="flex flex-col space-y-3">
                                                        <h2 className="text-2xl font-semibold text-gray-800">
                                                            {item.activity.actName}
                                                        </h2>
                                                        <p className="text-lg text-gray-600">
                                                            {item.activity.actDesc}
                                                        </p>
                                                        <p className="text-gray-700">
                                                            {formatDate(item.activity.actDate)} - {formatDate(item.activity.actDateEnd)}
                                                        </p>
                                                        <Link to={`/activities/${item.activity.actId}`} className="text-blue-500 hover:underline">
                                                            รายละเอียด
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Activities;