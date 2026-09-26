/**
 * 班級智慧作業清點與錯題訂正系統 - 通用範本版 (Code_Template.gs)
 * 適用於「建立副本」給其他老師使用，自動綁定當前試算表 ID
 */

const HOMEWORK_TAB_NAME       = "工作表1";
const CORRECTION_MATRIX_TAB   = "作業訂正矩陣";

// ── 班級人數設定（轉學/空號請在試算表姓名欄填「空號」或「轉出」）──
const CLASS_SIZE = 30;
const VACANT_KEYWORDS = ['空號', '轉出'];

/**
 * 判斷姓名是否為空號（含轉出）
 * @param {string} name 學生姓名
 * @returns {boolean}
 */
function isVacantSeat(name) {
  const n = String(name || '').trim();
  if (!n) return false;
  return VACANT_KEYWORDS.some(kw => n.includes(kw));
}

function doGet(e) {
  const params = (e && e.parameter) ? e.parameter : {};

  // ── 1. 跨域與外部 API 路由 (供 Firebase / Neocities / 外部 HTML 呼叫) ──
  if (params.action) {
    const result = handleScannerApiAction(params.action, params);
    if (params.callback) {
      return ContentService
          .createTextOutput(params.callback + '(' + JSON.stringify(result) + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
  }

  // ── 2. GAS 原生 HTML 頁面路由 ──────────────────────────────────────────
  if (params.page === 'scanner') {
    return renderGasPage('Scanner', '📱 班級作業 QR碼 速掃工具');
  }

  if (params.page === 'correction' || params.page === 'correction_matrix') {
    return renderGasPage('Correction', '✏️ 班級作業錯題訂正與銷案系統');
  }

  if (params.page === 'correction_scanner' || params.page === 'correctionScanner') {
    return renderGasPage('CorrectionScanner', '✏️ 班級作業【訂正掃碼與銷案】工具');
  }

  if (params.page === 'sticker' || params.page === 'StickerGenerator' || params.page === 'sticker_generator') {
    return renderGasPage('StickerGenerator', '🏷️ 班級學生作業條碼貼紙產出工具');
  }

  // 預設為純按鈕點收與催繳主頁
  return renderGasPage('Index', '🎯 班級智慧作業清點與催繳系統');
}

/**
 * 渲染 GAS 原生頁面，自動注入正式 Web App URL 避免 iframe 沙箱 googleusercontent 網址失效
 */
function renderGasPage(fileName, title) {
  const webAppUrl = getGasWebAppUrl();
  const template = HtmlService.createTemplateFromFile(fileName);
  template._GAS_WEBAPP_URL = webAppUrl;
  return template.evaluate()
      .setTitle(title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

/**
 * 外部 API 動作分派器
 */
function handleScannerApiAction(action, params) {
  try {
    // ── 1. 作業速掃與點收 API ──
    if (action === 'getTodayScanData') {
      return getTodayScanData();
    }
    if (action === 'toggleManualSubmission') {
      return toggleManualSubmission(params);
    }
    if (action === 'doScanRecord') {
      const payload = String(params.payload || '').trim();
      return doScanRecord(payload);
    }
    if (action === 'updateHomeworkMetadata') {
      const colIndex = parseInt(params.colIndex, 10);
      const unit = String(params.unit || '');
      const note = String(params.note || params.page || '');
      const targetSheet = String(params.targetSheet || params.sheet || '').trim();
      return updateHomeworkMetadata(colIndex, unit, note, targetSheet);
    }
    if (action === 'addNewHomeworkRecord') {
      return addNewHomeworkRecord(params);
    }
    if (action === 'getHomeworkUnsubmittedData') {
      return getHomeworkUnsubmittedData();
    }
    if (action === 'batchSubmitMakeUp') {
      const list = typeof params.makeUpList === 'string' ? JSON.parse(params.makeUpList || '[]') : (params.makeUpList || []);
      return batchSubmitMakeUp(list);
    }

    // ── 2. 錯題訂正與催繳矩陣 API ──
    if (action === 'doScanRecordCorrection') {
      return doScanRecordCorrection(params);
    }
    if (action === 'addCorrectionRecordMatrix' || action === 'addErrorRecord') {
      return addCorrectionRecordMatrix(params);
    }
    if (action === 'getCorrectionMatrixData' || action === 'getCorrectionData') {
      return getCorrectionMatrixData(params);
    }
    if (action === 'getStudentUncorrectedMatrix' || action === 'getStudentUncorrectedRecords') {
      return getStudentUncorrectedMatrix(params.seat);
    }
    if (action === 'updateCorrectionMatrixCell' || action === 'updateCorrectionStatus') {
      return updateCorrectionMatrixCell(params);
    }
    if (action === 'getGasWebAppUrl') {
      return { success: true, url: getGasWebAppUrl() };
    }

    return { success: false, message: '未知的 API 動作: ' + action };
  } catch (err) {
    return { success: false, message: 'API 錯誤: ' + err.toString() };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 核心試算表存取邏輯 (自動綁定當前試算表)
// ─────────────────────────────────────────────────────────────────────────────

function getHwSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(HOMEWORK_TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(HOMEWORK_TAB_NAME);
  }
  return sheet;
}

function getTodayString() {
  return Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy/MM/dd");
}

function extractSeatNo(cellVal, rowIndex) {
  if (cellVal !== undefined && cellVal !== null && cellVal !== "") {
    const digits = String(cellVal).replace(/[^0-9]/g, '');
    if (digits) {
      const num = parseInt(digits, 10);
      if (num >= 1 && num <= 30) return num;
    }
  }
  return rowIndex - 5;
}

function normalizeDateString(rawDate) {
  if (!rawDate) return "";
  let str = String(rawDate).trim().replace(/-/g, "/").replace(/\./g, "/");
  const parts = str.split("/");
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1].padStart(2, "0")}/${parts[2].padStart(2, "0")}`;
  }
  return str;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. 作業收繳點收與速掃 API 實現
// ─────────────────────────────────────────────────────────────────────────────

function toggleManualSubmission(params) {
  try {
    const seatNo = parseInt(params.seatNo || params.seat, 10);
    const assignKey = String(params.assignKey || params.key || '').trim();
    let colIndex = parseInt(params.colIndex, 10);

    if (isNaN(seatNo) || seatNo < 1 || seatNo > 30) {
      return { success: false, message: "無效座號: " + params.seatNo };
    }

    const sheet = getHwSheet();
    const todayStr = getTodayString();
    const lastCol = sheet.getLastColumn();

    if (isNaN(colIndex) || colIndex < 3) {
      if (lastCol >= 3 && assignKey) {
        const parts = assignKey.split('_');
        const subject = parts[0] || '';
        const category = parts[1] || '';
        const headers = sheet.getRange(1, 3, 5, lastCol - 2).getDisplayValues();
        for (let c = headers[0].length - 1; c >= 0; c--) {
          let hDate = normalizeDateString(headers[0][c]);
          let hSub = String(headers[1][c] || '').trim();
          let hCat = String(headers[2][c] || '').trim();
          if ((!hDate || hDate === todayStr) && hSub === subject && hCat === category) {
            colIndex = c + 3;
            break;
          }
        }
      }
    }

    if (isNaN(colIndex) || colIndex < 3) {
      if (assignKey) {
        const parts = assignKey.split('_');
        const subject = parts[0] || '';
        const category = parts[1] || '';
        const unit = String(params.unit || '').trim();
        const note = String(params.note || '').trim();

        colIndex = Math.max(lastCol + 1, 3);
        sheet.getRange(1, colIndex, 5, 1).setValues([
          [todayStr],
          [subject],
          [category],
          [unit],
          [note]
        ]);
      }
    }

    if (isNaN(colIndex) || colIndex < 3) {
      return { success: false, message: "找不到或無法建立今日指定的作業項目" };
    }

    const studentData = sheet.getRange(6, 1, CLASS_SIZE, 2).getDisplayValues();
    let studentRow = -1;
    let studentName = seatNo + "號";

    for (let r = 0; r < CLASS_SIZE; r++) {
      if (extractSeatNo(studentData[r][0], r + 6) === seatNo) {
        if (isVacantSeat(studentData[r][1])) {
          return { success: false, message: `${String(seatNo).padStart(2,'0')} 號為空號，無法登錄` };
        }
        studentRow = r + 6;
        if (studentData[r][1]) studentName = studentData[r][1];
        break;
      }
    }
    if (studentRow === -1) studentRow = seatNo + 5;

    const targetCell = sheet.getRange(studentRow, colIndex);
    const currentVal = String(targetCell.getDisplayValue() || '').trim();
    const newStatus = (currentVal === '1') ? '' : '1';

    targetCell.setValue(newStatus);

    return {
      success: true,
      seatNo: seatNo,
      isSubmitted: newStatus === '1',
      message: newStatus === '1' ? `🟢 ${seatNo}號 ${studentName} 打勾已交` : `⚪ ${seatNo}號 ${studentName} 已取消打勾`
    };
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function getTodayScanData() {
  const sheet = getHwSheet();
  const lastCol = sheet.getLastColumn();
  const todayStr = getTodayString();

  if (lastCol < 3) {
    return {
      success: true,
      todayDate: todayStr,
      assignments: [],
      submissionMatrix: {},
      summary: {}
    };
  }

  const metaData = sheet.getRange(1, 3, 5, lastCol - 2).getDisplayValues();
  const submissionMatrixData = sheet.getRange(6, 3, CLASS_SIZE, lastCol - 2).getDisplayValues();
  // 讀取座號與姓名以判斷空號
  const seatNameData = sheet.getRange(6, 1, CLASS_SIZE, 2).getDisplayValues();
  const vacantSeats = [];
  seatNameData.forEach((row, idx) => { if (isVacantSeat(row[1])) vacantSeats.push(idx + 1); });

  const assignments = [];
  const validColIndices = [];

  for (let c = 0; c < metaData[0].length; c++) {
    const rawDate = metaData[0][c];
    const subject = metaData[1][c];
    const category = metaData[2][c];
    const unit = metaData[3][c];
    const note = metaData[4][c];

    const normDate = normalizeDateString(rawDate);
    if (normDate === todayStr || (!rawDate && subject)) {
      const assignKey = `${subject}_${category}`;
      assignments.push({
        key: assignKey,
        colIndex: c + 3,
        date: normDate || todayStr,
        subject: subject,
        category: category,
        unit: unit,
        note: note
      });
      validColIndices.push(c);
    }
  }

  const submissionMatrix = {};
  const summary = {};

  const activeTotal = CLASS_SIZE - vacantSeats.length;
  for (let r = 0; r < CLASS_SIZE; r++) {
    const seatNo = r + 1;
    if (vacantSeats.includes(seatNo)) continue; // 跳過空號
    const seatStr = String(seatNo);
    submissionMatrix[seatStr] = {};

    validColIndices.forEach((colIdx, aIdx) => {
      const assign = assignments[aIdx];
      const assignKey = `${assign.subject}_${assign.category}`;
      const isSubmitted = String(submissionMatrixData[r][colIdx]).trim() === "1";
      submissionMatrix[seatStr][assignKey] = isSubmitted;

      if (!submissionMatrix[assignKey]) {
        submissionMatrix[assignKey] = [];
      }
      if (isSubmitted) {
        submissionMatrix[assignKey].push(seatNo);
      }

      if (!summary[assignKey]) {
        summary[assignKey] = { submitted: 0, total: activeTotal };
      }
      if (isSubmitted) {
        summary[assignKey].submitted++;
      }
    });
  }

  return {
    success: true,
    todayDate: todayStr,
    assignments: assignments,
    submissionMatrix: submissionMatrix,
    summary: summary,
    vacantSeats: vacantSeats,
    activeTotal: activeTotal
  };
}

function doScanRecord(payload) {
  const parts = payload.split('|');
  if (parts.length < 2 || parts[0] !== 'CMS') {
    return { success: false, message: '無效的條碼格式: ' + payload };
  }

  const seatNo = parseInt(parts[1], 10);
  if (isNaN(seatNo) || seatNo < 1 || seatNo > CLASS_SIZE) {
    return { success: false, message: '無效的座號: ' + parts[1] };
  }

  const subject = parts[2] || '通用';
  const category = parts[3] || '作業';
  const todayStr = getTodayString();

  const sheet = getHwSheet();
  const lastCol = sheet.getLastColumn();
  let targetCol = -1;

  if (lastCol >= 3) {
    const metaData = sheet.getRange(1, 3, 5, lastCol - 2).getDisplayValues();
    for (let c = metaData[0].length - 1; c >= 0; c--) {
      const d = normalizeDateString(metaData[0][c]);
      const s = metaData[1][c];
      const cat = metaData[2][c];
      if ((d === todayStr || !metaData[0][c]) && s === subject && cat === category) {
        targetCol = c + 3;
        break;
      }
    }
  }

  if (targetCol === -1) {
    targetCol = Math.max(lastCol + 1, 3);
    sheet.getRange(1, targetCol, 5, 1).setValues([
      [todayStr],
      [subject],
      [category],
      [""],
      [""]
    ]);
  }

  const rowIndex = 5 + seatNo;
  const currentVal = String(sheet.getRange(rowIndex, targetCol).getDisplayValue()).trim();
  const isDuplicate = (currentVal === "1");

  sheet.getRange(rowIndex, targetCol).setValue("1");

  return {
    success: true,
    action: 'recorded',
    isDuplicate: isDuplicate,
    seatNo: seatNo,
    subject: subject,
    category: category,
    colIndex: targetCol,
    message: isDuplicate 
      ? `${seatNo}號【${subject} ${category}】重複點收成功！`
      : `${seatNo}號【${subject} ${category}】點收成功！`
  };
}

function updateHomeworkMetadata(colIndex, unit, note, targetSheetName) {
  let sheet;
  let minCol = 3;
  if (targetSheetName === 'matrix' || targetSheetName === 'correction' || targetSheetName === CORRECTION_MATRIX_TAB || colIndex === 2) {
    sheet = getCorrectionMatrixSheet();
    minCol = 2;
  } else {
    sheet = getHwSheet();
    minCol = 3;
  }

  if (isNaN(colIndex) || colIndex < minCol) return { success: false, message: '無效欄位' };
  sheet.getRange(4, colIndex).setValue(unit);
  sheet.getRange(5, colIndex).setValue(note);

  if (sheet.getName() === CORRECTION_MATRIX_TAB) {
    try {
      const subject = String(sheet.getRange(2, colIndex).getValue() || '').trim();
      const category = String(sheet.getRange(3, colIndex).getValue() || '').trim();
      if (subject && category) {
        const hwSheet = getHwSheet();
        const lastCol = hwSheet.getLastColumn();
        if (lastCol >= 3) {
          const headers = hwSheet.getRange(1, 3, 5, lastCol - 2).getDisplayValues();
          for (let c = headers[0].length - 1; c >= 0; c--) {
            let hSub = String(headers[1][c] || '').trim();
            let hCat = String(headers[2][c] || '').trim();
            if (hSub === subject && hCat === category) {
              hwSheet.getRange(4, c + 3).setValue(unit);
              hwSheet.getRange(5, c + 3).setValue(note);
              break;
            }
          }
        }
      }
    } catch(e) {
      // 忽略非必要同步錯誤
    }
  }

  return { success: true };
}

function getHomeworkUnsubmittedData() {
  const sheet = getHwSheet();
  const lastCol = sheet.getLastColumn();
  if (lastCol < 3) return { assignments: [], unsubmittedRecords: [] };

  const metaData = sheet.getRange(1, 3, 5, lastCol - 2).getDisplayValues();
  const studentData = sheet.getRange(6, 1, CLASS_SIZE, 2).getDisplayValues();
  const submissionMatrix = sheet.getRange(6, 3, CLASS_SIZE, lastCol - 2).getDisplayValues();

  const todayStr = getTodayString();
  const assignments = [];

  for (let c = 0; c < metaData[0].length; c++) {
    let rawDate = metaData[0][c];
    let rawSubject = metaData[1][c];
    if (!rawDate && !rawSubject) continue;

    let dateStr = normalizeDateString(rawDate);
    assignments.push({
      matrixIndex: c,
      colIndex: c + 3,
      date: dateStr || "未設日期",
      subject: String(rawSubject || ""),
      type: String(metaData[2][c] || ""),
      unit: String(metaData[3][c] || ""),
      note: String(metaData[4][c] || "")
    });
  }

  const unsubmittedRecords = [];
  for (let r = 0; r < CLASS_SIZE; r++) {
    const name = studentData[r][1] ? String(studentData[r][1]) : '';
    // 空號不列入催繳
    if (isVacantSeat(name)) continue;
    const seatNo = extractSeatNo(studentData[r][0], r + 6);
    const displayName = name || (seatNo + "號");
    for (let i = 0; i < assignments.length; i++) {
      const assignment = assignments[i];
      const val = String(submissionMatrix[r][assignment.matrixIndex]).trim();
      if (val !== "1") {
        unsubmittedRecords.push({
          seatNo: seatNo,
          name: displayName,
          rowIndex: r + 6,
          colIndex: assignment.colIndex,
          assignment: assignment
        });
      }
    }
  }
  return { assignments: assignments, unsubmittedRecords: unsubmittedRecords };
}

function batchSubmitMakeUp(makeUpList) {
  if (!makeUpList || makeUpList.length === 0) return { success: true, updatedCount: 0 };
  const sheet = getHwSheet();
  makeUpList.forEach(item => {
    sheet.getRange(item.rowIndex, item.colIndex).setValue("1");
  });
  return { success: true, updatedCount: makeUpList.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. 錯題訂正與催繳矩陣 API 實現
// ─────────────────────────────────────────────────────────────────────────────

function getCorrectionMatrixSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CORRECTION_MATRIX_TAB);
  if (!sheet) {
    sheet = ss.insertSheet(CORRECTION_MATRIX_TAB);
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 5) {
    sheet.getRange(1, 1, 5, 1).setValues([
      ["日期"], ["科目"], ["種類"], ["單元"], ["頁數"]
    ]).setFontWeight("bold").setBackground("#e2e8f0");
  }

  if (sheet.getLastRow() < CLASS_SIZE + 5) {
    const seatRows = [];
    for (let i = 1; i <= CLASS_SIZE; i++) {
      seatRows.push([String(i).padStart(2, '0')]);
    }
    sheet.getRange(6, 1, CLASS_SIZE, 1).setValues(seatRows).setFontWeight("bold").setHorizontalAlignment("center");
  }

  return sheet;
}

function findOrCreateAssignmentColumn(sheet, date, subject, category, unit, page) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const todayStr = normalizeDateString(date || getTodayString());

  const matchedCols = [];
  if (lastCol > 1) {
    const headerValues = sheet.getRange(1, 2, 5, lastCol - 1).getDisplayValues();
    for (let c = 0; c < headerValues[0].length; c++) {
      const hDate = normalizeDateString(headerValues[0][c]);
      const hSub = String(headerValues[1][c] || '').trim();
      const hCat = String(headerValues[2][c] || '').trim();

      if (hSub === subject && hCat === category && (hDate === todayStr || !hDate)) {
        matchedCols.push(c + 2);
      }
    }
  }

  if (matchedCols.length > 0) {
    const mainCol = matchedCols[0];

    // 若存在重複新增的同作業欄位，自動合併座號狀態資料並清空重複欄
    if (matchedCols.length > 1) {
      for (let m = 1; m < matchedCols.length; m++) {
        const dupCol = matchedCols[m];
        const dupVals = sheet.getRange(6, dupCol, CLASS_SIZE, 1).getValues();
        const mainVals = sheet.getRange(6, mainCol, CLASS_SIZE, 1).getValues();
        const mergedVals = [];
        for (let r = 0; r < CLASS_SIZE; r++) {
          const mainV = String(mainVals[r][0] || '').trim().toUpperCase();
          const dupV = String(dupVals[r][0] || '').trim().toUpperCase();
          if (mainV === 'X' || dupV === 'X') {
            mergedVals.push(['X']);
          } else if (mainV === 'O' || dupV === 'O') {
            mergedVals.push(['O']);
          } else {
            mergedVals.push(['']);
          }
        }
        sheet.getRange(6, mainCol, CLASS_SIZE, 1).setValues(mergedVals);
        sheet.getRange(1, dupCol, CLASS_SIZE + 5, 1).clearContent().clearFormat();
      }
    }

    return mainCol;
  }

  // 若找不到當日同 科目|種類 的資料，則新開一欄（單元與頁數設為空，僅「補填細節」可改動）
  const newCol = lastCol + 1;
  sheet.getRange(1, newCol, 5, 1).setValues([
    [todayStr], [subject], [category], [''], ['']
  ]).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f1f5f9");

  return newCol;
}

function addCorrectionRecordMatrix(params) {
  const seatNum = parseInt(params.seat, 10);
  if (isNaN(seatNum) || seatNum < 1 || seatNum > 30) {
    return { success: false, message: '無效的座號: ' + params.seat };
  }

  const seatStr = String(seatNum).padStart(2, '0');
  const subject = String(params.subject || '國語').trim();
  const category = String(params.category || '甲本').trim();
  const date = String(params.date || '').trim() || getTodayString();

  const sheet = getCorrectionMatrixSheet();
  let colIndex = parseInt(params.colIndex, 10);
  if (isNaN(colIndex) || colIndex < 2) {
    colIndex = findOrCreateAssignmentColumn(sheet, date, subject, category, '', '');
  }

  const row = 5 + seatNum;
  sheet.getRange(row, colIndex).setValue('X').setHorizontalAlignment("center").setFontWeight("bold");

  return {
    success: true,
    message: `已標記 ${seatStr}號 在【${subject}${category}】需訂正 (X)`,
    colIndex: colIndex,
    key: `${subject}_${category}_${colIndex}`,
    subject: subject,
    category: category,
    seat: seatStr,
    status: 'X'
  };
}

function updateCorrectionMatrixCell(params) {
  const seatNum = parseInt(params.seat, 10);
  const colIndex = parseInt(params.colIndex, 10);
  const status = (params.status !== undefined && params.status !== null) ? String(params.status).trim().toUpperCase() : 'O';

  if (isNaN(seatNum) || seatNum < 1 || seatNum > 30) {
    return { success: false, message: '無效座號: ' + params.seat };
  }
  if (isNaN(colIndex) || colIndex < 2) {
    return { success: false, message: '無效欄位: ' + params.colIndex };
  }

  const sheet = getCorrectionMatrixSheet();
  const row = 5 + seatNum;
  sheet.getRange(row, colIndex).setValue(status).setHorizontalAlignment("center").setFontWeight("bold");

  return {
    success: true,
    message: `座號 ${String(seatNum).padStart(2, '0')} 狀態已更新為【${status}】`,
    colIndex: colIndex,
    seat: String(seatNum).padStart(2, '0'),
    status: status
  };
}

function getCorrectionMatrixData(params = {}) {
  const sheet = getCorrectionMatrixSheet();
  const lastCol = sheet.getLastColumn();
  const lastRow = Math.max(sheet.getLastRow(), 30);

  if (lastCol < 2) {
    return { success: true, assignments: [], seatSummary: {}, records: [] };
  }

  const gridValues = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
  const assignments = [];

  for (let c = 1; c < lastCol; c++) {
    const sub = gridValues[1][c] || '';
    const cat = gridValues[2][c] || '';
    if (!sub && !cat) continue;
    assignments.push({
      colIndex: c + 1,
      key: `${sub}_${cat}_${c + 1}`,
      date: gridValues[0][c] || '',
      subject: sub,
      category: cat,
      unit: gridValues[3][c] || '',
      page: gridValues[4][c] || ''
    });
  }

  const seatSummary = {};
  const records = [];

  // 讀取座號欄以判斷空號（訂正矩陣第 1 欄為座號，但姓名需從作業工作表取得）
  // 使用作業工作表的姓名欄來判斷空號
  const hwSheet = getHwSheet();
  const nameData = hwSheet.getRange(6, 2, CLASS_SIZE, 1).getDisplayValues();
  const vacantSeatNums = [];
  for (let i = 0; i < CLASS_SIZE; i++) {
    if (isVacantSeat(nameData[i][0])) vacantSeatNums.push(i + 1);
  }

  for (let s = 1; s <= CLASS_SIZE; s++) {
    if (vacantSeatNums.includes(s)) continue; // 空號跳過
    const seatStr = String(s).padStart(2, '0');
    const rIndex = 5 + (s - 1);
    let uncorrectedCount = 0;

    for (let c = 1; c < lastCol; c++) {
      const val = String(gridValues[rIndex][c] || '').trim().toUpperCase();
      if (val === 'X') {
        uncorrectedCount++;
      }

      if (val === 'X' || val === 'O') {
        records.push({
          colIndex: c + 1,
          date: gridValues[0][c] || '',
          subject: gridValues[1][c] || '',
          category: gridValues[2][c] || '',
          unit: gridValues[3][c] || '',
          page: gridValues[4][c] || '',
          seat: seatStr,
          status: val
        });
      }
    }

    seatSummary[seatStr] = uncorrectedCount;
  }

  return {
    success: true,
    assignments: assignments,
    seatSummary: seatSummary,
    records: records,
    vacantSeats: vacantSeatNums
  };
}

function getStudentUncorrectedMatrix(seat) {
  const seatNum = parseInt(seat, 10);
  if (isNaN(seatNum)) return { success: false, records: [] };

  const seatStr = String(seatNum).padStart(2, '0');
  const matrixData = getCorrectionMatrixData();
  const studentRecords = (matrixData.records || []).filter(r => r.seat === seatStr && r.status === 'X');

  return { success: true, seat: seatStr, records: studentRecords };
}

function doScanRecordCorrection(params) {
  const payload = String(params.payload || '').trim();
  const mode = String(params.mode || 'register').trim(); // 'register' or 'clear'

  let seatNo = -1;
  let subject = String(params.subject || '通用').trim();
  let category = String(params.category || '作業').trim();

  const parts = payload.split('|');
  if (parts[0] === 'CMS' && parts.length >= 2) {
    seatNo = parseInt(parts[1], 10);
    if (parts[2]) subject = parts[2].trim();
    if (parts[3]) category = parts[3].trim();
  } else if (!isNaN(parseInt(parts[0], 10))) {
    seatNo = parseInt(parts[0], 10);
    if (parts[1]) subject = parts[1].trim();
    if (parts[2]) category = parts[2].trim();
  }

  if (isNaN(seatNo) || seatNo < 1 || seatNo > CLASS_SIZE) {
    return { success: false, message: '無效條碼或座號: ' + payload };
  }

  const seatStr = String(seatNo).padStart(2, '0');
  const unit = String(params.unit || '').trim();
  const page = String(params.page || '').trim();

  // 1. 登記模式 (標為 X)
  if (mode === 'register') {
    const res = addCorrectionRecordMatrix({
      seat: seatStr,
      subject: subject,
      category: category,
      unit: unit,
      page: page
    });
    if (res.success) {
      res.action = 'registered';
      res.seat = seatStr;
      res.subject = subject;
      res.category = category;
      res.message = `🟧 ${seatStr}號【${subject} ${category}】已登錄需訂正 (X)`;
    }
    return res;
  }

  // 2. 銷案模式 (標為 O)
  const matrixData = getCorrectionMatrixData();
  const seatRecords = (matrixData.records || []).filter(r =>
    r.seat === seatStr && r.status === 'X' &&
    (!subject || r.subject === subject) &&
    (!category || r.category === category)
  );

  if (seatRecords.length === 0) {
    const allSeatUncorrected = (matrixData.records || []).filter(r => r.seat === seatStr && r.status === 'X');
    if (allSeatUncorrected.length === 0) {
      return { success: false, message: `座號 ${seatStr} 號目前沒有任何待訂正項目` };
    }
    if (allSeatUncorrected.length === 1) {
      const rec = allSeatUncorrected[0];
      updateCorrectionMatrixCell({ colIndex: rec.colIndex, seat: seatStr, status: 'O' });
      return {
        success: true,
        action: 'cleared',
        seat: seatStr,
        subject: rec.subject,
        category: rec.category,
        message: `🟦 ${seatStr}號【${rec.subject} ${rec.category}】銷案成功！`
      };
    }
    return {
      success: true,
      action: 'select_required',
      seat: seatStr,
      records: allSeatUncorrected,
      message: `🎯 ${seatStr}號 有 ${allSeatUncorrected.length} 筆待訂正，請選擇銷案項目`
    };
  }

  if (seatRecords.length === 1) {
    const rec = seatRecords[0];
    updateCorrectionMatrixCell({ colIndex: rec.colIndex, seat: seatStr, status: 'O' });
    return {
      success: true,
      action: 'cleared',
      seat: seatStr,
      subject: rec.subject,
      category: rec.category,
      message: `🟦 ${seatStr}號【${rec.subject} ${rec.category}】銷案成功！`
    };
  }

  return {
    success: true,
    action: 'select_required',
    seat: seatStr,
    records: seatRecords,
    message: `🎯 ${seatStr}號【${subject} ${category}】有 ${seatRecords.length} 筆待訂正，請選擇銷案章節`
  };
}

/**
 * 取得當前 GAS 專案部署發布之 Web App 網址
 * 供前端 QR Code 掃碼連線設定使用
 */
function getGasWebAppUrl() {
  try {
    return ScriptApp.getService().getUrl() || '';
  } catch (e) {
    return '';
  }
}

