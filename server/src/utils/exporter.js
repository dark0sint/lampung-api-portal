const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

async function sendAsFormat(res, rows, format, filenameBase) {
  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(rows);
    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment(`${filenameBase}.csv`);
    return res.send(csv);
  }

  if (format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Data');
    if (rows.length > 0) {
      sheet.columns = Object.keys(rows[0]).map((key) => ({ header: key, key, width: 20 }));
      sheet.addRows(rows);
      sheet.getRow(1).font = { bold: true };
    }
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.attachment(`${filenameBase}.xlsx`);
    await workbook.xlsx.write(res);
    return res.end();
  }

  // default JSON
  return res.json(rows);
}

module.exports = { sendAsFormat };
