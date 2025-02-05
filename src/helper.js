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