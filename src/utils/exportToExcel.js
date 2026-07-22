import * as XLSX from "xlsx";

const exportToExcel = (data, name, fileName,multiple=false) => {

  const workbook = XLSX.utils.book_new();
  if(multiple){
   data.forEach(({ name, values }) => {
    const worksheet = XLSX.utils.json_to_sheet(values);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });
  }
  else{
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  }
  XLSX.writeFile(workbook, fileName);
   
};

export default exportToExcel;
