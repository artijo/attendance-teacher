import * as XLSX from 'xlsx';

export function Table_to_Excel(table){
    const worksheet = XLSX.utils.table_to_sheet(table);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SheetDay");
    XLSX.writeFile(workbook, "Sheets.xlsx", {compression :true});
}


export function ClassroomsAbstacTable(json) {
    const data = json;
    console.log(data);
}