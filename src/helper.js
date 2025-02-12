export const getDayName = (day) => {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    return days[day];
};




export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatTitle = (title) => {
    switch (title) {
        case 'BOY':
            return 'เด็กชาย';
        case 'GIRL':
            return 'เด็กหญิง';
        case 'MR':
            return 'นาย';
        case 'MS':
            return 'นางสาว';
        default:
            return title;
    }
}


export function formatTime(time) {
    const timeSplit = time.split(':');
    return `${timeSplit[0]}:${timeSplit[1]}`;
  }

export function calculatedTimeToSeconde(hour, miniute) { // สำหรับ .
    return (parseInt(hour)*3600)+(parseInt(miniute)*60);
}

export function formatDayOfWeeks(dayOfWeek) {
    const dayOfWeeksThai = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];
    for (let i = 0; i <= dayOfWeeksThai.length; i++) {
      if ((dayOfWeek-1) === i) {
        return dayOfWeeksThai[i];
      }
    }
}

export function calculatedTimeToSecondeDouleDot(time) { // สำหรับ :
    const timeSplit = time.split(':');
    return (parseInt(timeSplit[0])*3600)+(parseInt(timeSplit[1])*60);
    // return (parseInt(hour)*3600)+(parseInt(miniute)*60);
}

  