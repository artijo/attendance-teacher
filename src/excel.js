import * as XLSX from 'xlsx';
import { HOSTNAME } from './config';
import axios from 'axios';
import { convertNumberToThaiMonth, dateTimeFormat, formatTitle } from './helper';
import { DateTime } from 'luxon';

export function Table_to_Excel(table, fileName, sheetTitle){
    const worksheet = XLSX.utils.table_to_sheet(table);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
    XLSX.writeFile(workbook, `${fileName}.xlsx`, {compression :true});
}

export function summaryAttendeanceBySubjectFilterByDay(objectJson, month, fileName, classroomInfo, subject){
    try{
        let index = 0;
        const sheetData = [
            ['สรุปรายละเอียดการเข้าเรียนตามวิชา'],
            [`วิชา: ${subject.subNameThai} (${subject.subCode})`],
            [`เดือน: ${convertNumberToThaiMonth(month)}`],
            [`ห้อง: ${classroomInfo.classLevel}/${classroomInfo.classRoom} ปีการศึกษา: ${classroomInfo.term.academicYear + 543} เทอม: ${classroomInfo.term.semester}`],   
            [],
            ['เลขที่','รหัสนักเรียน', 'ชื่อ-นามสกุล'],
        ]
    
        //Header 1
        objectJson.data[0].attendance.forEach((attInfo) => {
            if(attInfo.month == month){
                index++;
                sheetData[5].push(`${index}\n(${dateTimeFormat(attInfo.studingTimeDate)})`);
            }
        });
    
        //Body info
        objectJson.data.forEach((object, objectIndex) => {
            const arraySheet = [
                object.stdNo,
                object.stdId,
                `${formatTitle(object.title)} ${object.fName} ${object.lName}`
            ]
            
            object.attendance.forEach((attend, index) => {
                if(attend.attStatus == null) {
                    arraySheet.push('-');
                }else if(attend.month == month && attend.attStatus != null ){
                    let attendStatus = attend.attStatus.toLowerCase();
                    if(attendStatus == "absent"){
                        arraySheet.push("ไม่เข้าเรียน");
                    }else if(attendStatus == "present"){
                        arraySheet.push("เข้าเรียน");
                    }else if(attendStatus == "late"){
                        arraySheet.push("มาสาย");
                    }else if(attendStatus == "activity"){
                        arraySheet.push("เข้าร่วมกิจกรรม");
                    }else if(attendStatus == "leave"){
                        arraySheet.push("ลา");
                    }else{
                        arraySheet.push("-")
                    }
                }
            })
            sheetData.push(arraySheet);
        });
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        worksheet["!cols"] =[
            { wch: 10 },
            { wch: 10 },
            { wch: 25 },

        ]
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "สรุป");
        XLSX.writeFile(workbook, `${fileName}.xlsx`, {compression :true});
    }catch(error){
        console.error(error);
    }   
    

}

export function summaryAttendeanceByDay(objectJson, fileName, classroomInfo, dateformat) {
    try {
        const sheetData = [
            ['สรุปรายละเอียดการเข้าเรียนตามวัน'],
            [`ประจำวันที: ${dateformat.day}/${dateformat.month}/${dateformat.year + 543}`],
            [`ห้อง: ${classroomInfo.classLevel}/${classroomInfo.classRoom}`],
            [],
            ['คาบที่', '', ''],
            ['รหัสวิชา', '', ''],
            ['เลขที่', 'รหัสนักเรียน', 'ชื่อ-นามสกุล'],
        ]
        //summary 
        const summaryData = [
            ['มาเรียน', '', ''],
            ['มาสาย', '', ''],
            ['ขาดเรียน', '', ''],
            ['ลา', '', ''],
            ['กิจกรรม', '', '']
        ];

        // console.log(objectJson);
        // tableHeader 1
        objectJson[0].attendance.forEach((_, index) => {
            sheetData[4].push(`${index + 1}`);
            summaryData[0].push(0);
            summaryData[1].push(0);
            summaryData[2].push(0);
            summaryData[3].push(0);
            summaryData[4].push(0);
        })

        // console.log(summaryData[0][3]);
        //tableHeader 2
        objectJson[0].attendance.forEach((object) => {
            sheetData[5].push(`${object.subjectCode}`);
        })
        //tableHeader 3
        objectJson[0].attendance.forEach((object) => {
            sheetData[6].push(`${object.subjectName}`);
        })

        //Add Data
        objectJson.forEach((object, objectIndex) => {
            const studentData = [
                object.stdNo,
                object.stdId,
                `${formatTitle(object.title)} ${object.fName} ${object.lName}`
            ];
            // console.log(object.attendance);
            object.attendance.forEach((attend, index) => {
                if(attend.attStatus == null) {
                    studentData.push('-');
                }else if (attend.attStatus) {
                    let attendStatus = attend.attStatus.toLowerCase();
                    if (attendStatus == "absent") {
                        summaryData[2][index + 3] += 1;
                        studentData.push("ขาดเรียน");
                    } else if (attendStatus == "present") {
                        summaryData[0][index + 3] += 1;
                        studentData.push("เข้าเรียน");
                    } else if (attendStatus == "late") {
                        summaryData[1][index + 3] += 1;
                        studentData.push("มาสาย");
                    } else if (attendStatus == "activity") {
                        summaryData[4][index + 3] += 1;
                        studentData.push("เข้าเรียนกิจกรรม");
                    } else if (attendStatus == "leave") {
                        summaryData[3][index + 3] += 1;
                        studentData.push("ลา");
                    } else {
                        studentData.push("-")
                    }
                }

            })
            sheetData.push(studentData);

        })
        sheetData.push(...summaryData);
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        worksheet["!merges"] = [
            XLSX.utils.decode_range("A5:C5"),
            XLSX.utils.decode_range("A6:C6"),
        ]
        worksheet["!cols"] = [
            { wch: 10 },
            { wch: 10 },
            { wch: 30 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
            { wch: 25 },
        ]
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "สรุป");

        XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression: true });
    } catch (error) {
        console.error(error);
    }
}

export function summarySubjectIsExam(objectJson, classroom, subject) {
    // console.log(objectJson);
    // console.log(classroom);
    try{
        const sheetData = [
            ['สรุปสิทธิ์การสอบของนักเรียน'],
            [`วิชา ${subject.subNameThai}-${subject.subNameEng}(${subject.subCode})`],
            [`ห้องม.${classroom.classLevel}/${classroom.classRoom} ปีการศึกษา ${classroom.term.academicYear + 543} เทอม ${classroom.term.semester}`],
            [],
            ['เลขที่', 'รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ขาดเรียน', 'เข้าสาย', 'ลา', 'กิจกรรม', 'เข้าเรียน', 'ร้อยละการเข้าเรียน', 'สถานะ']
        ];

        objectJson.forEach((summary) => { 
            const data = [
                summary.stdNo,
                summary.stdId,
                `${formatTitle(summary.title)} ${summary.fName} ${summary.lName}`,
                summary.attendenceAbsentCount,
                summary.attendenceLateCount,
                summary.attendenceLeaveCount,
                summary.attendenceActivity,
                summary.attendenceCount,
                summary.attendencePercent,
                summary.canExam
            ]    
            sheetData.push(data);
        });

        //สรุป
        const summaryLenght = [
            [`จำนวนนักเรียนที่ไม่มีสิทธิ์สอบ (มส): ${objectJson.filter(item => item.canExam === "มส.").length} คน`],
            [`จำนวนนักเรียนทั้งหมด: ${objectJson.length} คน`]
        ]
        sheetData.push(...summaryLenght);
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        worksheet["!cols"] =[
            { wch: 15 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "สรุป");
        XLSX.writeFile(workbook, `สรุปการมีสิทธ์สอบวิชา ${subject.subNameThai} ปีการศึกษา ${classroom.term.academicYear + 543} เทอม ${classroom.term.semester} ห้องม_${classroom.classLevel}/${classroom.classRoom}.xlsx`, {compression :true});
    }catch(error){
        console.error(error);
    }
}

export function summaryJoinSubjectPeriod(objectJson, classroom) {
    // console.log(objectJson);
    // console.log(classroom);
    try{
        const sheetData = [
            ['การเข้าเรียนตามรายวิชา'],
            [`ชื่อนักเรียน: ${formatTitle(objectJson.studentInfo.student.title)}${objectJson.studentInfo.student.fName} ${objectJson.studentInfo.student.lName}`, `ชั้นม.${classroom.classLevel}/${classroom.classRoom}`],
            [`รหัสนักเรียน:${objectJson.studentInfo.stdId}`, `เบอร์โทรศัพท์:${objectJson.studentInfo.student.tel}`, `อีเมล:${objectJson.studentInfo.student.email}`],
            [],
            ['วิชา', 'ขาดเรียน', 'เข้าสาย', 'ลา', 'กิจกรรม', 'เข้าเรียน', 'ร้อยละการเข้าเรียน', 'สถานะ']
        ];

        Object.keys(objectJson).forEach((subject,index) => {
            if(index != 0) {
                const subjectObject = objectJson[subject];
                const data = [
                    subject,
                    subjectObject.attendenceAbsentCount,
                    subjectObject.attendenceLateCount,
                    subjectObject.attendenceLeaveCount,
                    subjectObject.attendenceActivity,
                    subjectObject.attendenceCount,
                    subjectObject.attendencePercent,
                    subjectObject.canExam
                ]
                sheetData.push(data);
            } 
        });
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        worksheet["!cols"] =[
            { wch: 15 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "สรุป");
        XLSX.writeFile(workbook, `สรุปการเข้าเรียนตามรายวิชาของ${objectJson.studentInfo.stdId}_ห้องม_${classroom.classLevel}/${classroom.classRoom}.xlsx`, {compression :true});

    }catch(error){
        console.error(error);
    }
}

export function ClassroomsAbstacTable(json) {
    const data = json;
    console.log(data);
}

export async function abstactActivity(activityId, classId, startDate, endDate, className, activityName, activity) {
    let response;
    try{
        const responsed = await axios.get(`${HOSTNAME}/a/activity/abstact/byclassroom/${activityId}/${classId}`);
        if(responsed.status == 200){
            response = responsed.data;
        }else{
            throw new Error(response.data.message);
        };
    }catch(error){
        console.error(error);
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
    const filterParticipate = (participate) => {
        const date = getDatesBetween(startDate, endDate);
        const objectKeys = Object.keys(participate).filter((dateKey) => {
          if(date.includes(dateKey)) {
            return dateKey
          }
        });
        return objectKeys;
    };
    const workbook = XLSX.utils.book_new();

    

    filterParticipate(response).forEach(key => {
        // const arrayOfJsonObject = [];
        const dateSplit = key.split('-');
        const dateFormatToThai = `${dateSplit[2]} ${convertNumberToThaiMonth(parseInt(dateSplit[1]))} ${parseInt(dateSplit[0]) + 543}`;
        const sheetData = [
            [`กิจกรรม: ${activityName}`],
            [`สถานที่จัดกิจกรรม: ${activity.actLocation}`],
            [`วันที่: ${dateFormatToThai}`],
            [`ห้อง: ${className}`],
            [],
            ['รหัสนักเรียน', 'ชื่อ-นามสกุล', 'เวลาที่ลงชื่อ', 'สถานะการเข้าร่วม'],
        ];
        response[key].forEach((pati) => {
            if (pati.isJoin) {
                const dateTime = DateTime.fromISO(pati.joinTimestamp).setZone("Asia/Bangkok");
                const thaiDateTime = dateTime.setLocale("th").toFormat("d LLLL ") + (dateTime.year + 543) + dateTime.toFormat(" HH:mm น.");
                sheetData.push([
                    pati.stdId,
                    `${formatTitle(pati.student.title)} ${pati.student.fName} ${pati.student.lName}`,
                    thaiDateTime,
                    "เข้าร่วม"
                ]);
            } else {
                sheetData.push([
                    pati.stdId,
                    `${formatTitle(pati.student.title)} ${pati.student.fName} ${pati.student.lName}`,
                    "-",
                    "ไม่เข้าร่วม"
                ]);
            }
        });

        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        // console.log(worksheet);
        worksheet['!cols'] = [
            { wch: 15 },  // รหัสนักเรียน
            { wch: 25 },  // ชื่อ-นามสกุล
            { wch: 30 },  // เวลาที่ลงชื่อ
            { wch: 15 },  // สถานะการเข้าร่วม
        ];
        XLSX.utils.book_append_sheet(workbook , worksheet, dateFormatToThai)
    });

    try{
        XLSX.writeFile(workbook, `สรุปการเข้ากิจกรรม ${activityName} ห้อง ${className} วันที่ (${startDate})-(${endDate}).xlsx`, {compression :true});
    }catch(error){
        console.error(error);
    }    
}

export async function abstactActivityFilterByClassroom(activityId, filterRoom, activity) {
    // console.log(filterRoom);
    let response;
    try{
        const responsed = await axios.get(`${HOSTNAME}/a/activity/abstact/${activityId}`);
        if(responsed.status == 200){
            response = responsed.data[filterRoom];
            console.log(responsed.data[filterRoom]);
        }else{
            throw new Error(response.data.message);
        };
    }catch(error){
        console.error(error);
    };

    const sheetData = [
        [`กิจกรรม: ${activity.actName}`],
        [`สถานที่จัดกิจกรรม: ${activity.actLocation}`],
        [`ห้อง: ${filterRoom}`],
        [],
        ['รหัสนักเรียน', 'ชื่อ-นามสกุล', 'จำนวนการเข้าร่วม'],
    ];

    // const arrayOfJsonObject = [];
    response.forEach((member) => {
        sheetData.push([
            member.stdId,
            `${formatTitle(member.title)} ${member.fName} ${member.lName}`,
            member.participateCount
        ]);
    });
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet['!cols'] = [
        { wch: 15 },  
        { wch: 25 },  
        { wch: 10 }, 
    ];
    const nameSplit = filterRoom.split('/');
    XLSX.utils.book_append_sheet(workbook, worksheet, `ห้อง${nameSplit[0]}_${nameSplit[1]}`);
    try{
        XLSX.writeFile(workbook, `เอกสารสรุปการเข้าร่วมกิจกรรม ${activity.actName} ห้อง${filterRoom}.xlsx`, {compression :true});
    }catch(error){
        console.error(error);
    };
}