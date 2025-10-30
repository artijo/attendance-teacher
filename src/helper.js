import { DateTime } from "luxon";

export const getDayName = (day) => {
  const days = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];
  return days[day];
};
export function convertNumberToThaiMonth(monthNumber) {
  const thaiMonths = [
    "มกราคม", // เดือนที่ 1
    "กุมภาพันธ์", // เดือนที่ 2
    "มีนาคม", // เดือนที่ 3
    "เมษายน", // เดือนที่ 4
    "พฤษภาคม", // เดือนที่ 5
    "มิถุนายน", // เดือนที่ 6
    "กรกฎาคม", // เดือนที่ 7
    "สิงหาคม", // เดือนที่ 8
    "กันยายน", // เดือนที่ 9
    "ตุลาคม", // เดือนที่ 10
    "พฤศจิกายน", // เดือนที่ 11
    "ธันวาคม", // เดือนที่ 12
  ];

  if (monthNumber >= 1 && monthNumber <= 12) {
    return thaiMonths[monthNumber - 1];
  } else {
    return "เลขเดือนไม่ถูกต้อง";
  }
}

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTitle = (title) => {
  switch (title) {
    case "BOY":
      return "เด็กชาย";
    case "GIRL":
      return "เด็กหญิง";
    case "MR":
      return "นาย";
    case "MS":
      return "นางสาว";
    default:
      return title;
  }
};

export function formatTime(time) {
  const timeSplit = time.split(":");
  return `${timeSplit[0]}:${timeSplit[1]}`;
}

export function calculatedTimeToSeconde(hour, miniute) {
  // สำหรับ .
  return parseInt(hour) * 3600 + parseInt(miniute) * 60;
}

export function formatDayOfWeeks(dayOfWeek) {
  const dayOfWeeksThai = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
  for (let i = 0; i <= dayOfWeeksThai.length; i++) {
    if (dayOfWeek - 1 === i) {
      return dayOfWeeksThai[i];
    }
  }
}

export function formatDateTimeISOToDate(dateTimeIso) {
  const utctobangkok = DateTime.fromISO(dateTimeIso).setZone("Asia/Bangkok");
  const dateSpilt = utctobangkok.toString().split("T");
  return dateSpilt[0];
}

export function calculatedTimeToSecondeDouleDot(time) {
  // สำหรับ :
  const timeSplit = time.split(":");
  return parseInt(timeSplit[0]) * 3600 + parseInt(timeSplit[1]) * 60;
  // return (parseInt(hour)*3600)+(parseInt(miniute)*60);
}

export function dateTimeFormat(dateTime) {
  const dateTimeFormat = formatDateTimeISOToDate(dateTime);
  const dateSplit = dateTimeFormat.split("-");
  return `${dateSplit[2]}/${dateSplit[1]}/${parseInt(dateSplit[0]) + 543}`;
}

export function formatDateToThai(date) {
  // YYYY-MM-DD
  const dateSpilt = date.split("-");
  let month = "";
  let year = parseInt(dateSpilt[0]) + 543;
  let day = "";

  if (parseInt(dateSpilt[2].charAt(0)) === 0) {
    day += parseInt(dateSpilt[2].charAt(1));
  } else {
    day += parseInt(dateSpilt[2]);
  }

  const thaiMonths = [
    "มกราคม", // เดือนที่ 1
    "กุมภาพันธ์", // เดือนที่ 2
    "มีนาคม", // เดือนที่ 3
    "เมษายน", // เดือนที่ 4
    "พฤษภาคม", // เดือนที่ 5
    "มิถุนายน", // เดือนที่ 6
    "กรกฎาคม", // เดือนที่ 7
    "สิงหาคม", // เดือนที่ 8
    "กันยายน", // เดือนที่ 9
    "ตุลาคม", // เดือนที่ 10
    "พฤศจิกายน", // เดือนที่ 11
    "ธันวาคม", // เดือนที่ 12
  ];

  // ตรวจสอบว่าเลขเดือนอยู่ในช่วง 1-12
  if (parseInt(dateSpilt[1]) >= 1 && parseInt(dateSpilt[1]) <= 12) {
    month += thaiMonths[parseInt(dateSpilt[1]) - 1];
  } else {
    console.log("เลขเดือนไม่ถูกต้อง");
  }

  return `${day} ${month} ${year}`;
}

export function daybetween(start, end) {
  const dates = [];
  if (start !== "" && end !== "") {
    const startDate = DateTime.fromISO(start).setZone("Asia/Bangkok");
    const endDate = DateTime.fromISO(end).setZone("Asia/Bangkok");
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(currentDate.toISODate().split("-").join("-")); // เพิ่มวันที่ในรูปแบบ YYYY-MM-DD
      currentDate = currentDate.plus({ days: 1 }); // เพิ่มวันทีละ 1
    }
  } else {
    console.error("termStart or termEnd is not set!");
  }
  return dates;
}

export const formatDateToThaiStyle = (date) => {
  const dateformat = DateTime.fromISO(date).setZone("Asia/Bangkok");
  return `${dateformat.day} ${convertNumberToThaiMonth(dateformat.month)} ${dateformat.year + 543}`;
};

export const formatAttStatus = (status) => {
  switch (status.toLowerCase()) {
    case "present": {
      return "เข้าเรียน";
    }
    case "absent": {
      return "ไม่เข้าเรียน";
    }
    case "late": {
      return "มาสาย";
    }
    case "activity": {
      return "เข้าเรียนกิจกรรม";
    }
    case "leave": {
      return "ลา";
    }
    default:
      return status;
  }
};

export const formatThaiDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
