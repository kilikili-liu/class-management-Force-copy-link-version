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
  if (!n) return true;
  return VACANT_KEYWORDS.some(kw => n.includes(kw)) || n === '空' || n.includes('空號') || n.includes('轉出');
}

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🎯 班級作業管理')
      .addItem('📁 一鍵初始化 8 大成績分頁', 'initAllScoreSheets')
      .addToUi();
  } catch (e) {}
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

  if (params.page === 'grading' || params.page === 'grade') {
    return renderGasPage('Grading', '✍️ 班級作業批改與成績登記');
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
  const rawHtml = HtmlService.createHtmlOutputFromFile(fileName).getContent();
  const injection = '<script>window._GAS_WEBAPP_URL = ' + JSON.stringify(webAppUrl) + '; window.GAS_API_URL = ' + JSON.stringify(webAppUrl) + ';</script>';
  let finalHtml = rawHtml;
  if (finalHtml.includes('</head>')) {
    finalHtml = finalHtml.replace('</head>', injection + '</head>');
  } else if (finalHtml.includes('</HEAD>')) {
    finalHtml = finalHtml.replace('</HEAD>', injection + '</HEAD>');
  } else {
    finalHtml = injection + finalHtml;
  }
  return HtmlService.createHtmlOutput(finalHtml)
      .setTitle(title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
}

/**
 * 外部 API 動作分派器
 */
function handleScannerApiAction(action, params) {
  params = params || {};
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
    if (action === 'getCheckinAssignments') {
      const sub = String(params.subject || '').trim();
      const cat = String(params.category || '').trim();
      return { success: true, list: getCheckinAssignmentsList(sub, cat) };
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

    // ── 3. 作業批改與成績登記 API ──
    if (action === 'getGradingData') {
      return getGradingData(params);
    }
    if (action === 'saveStudentGrade') {
      return saveStudentGrade(params);
    }
    if (action === 'createScoreAssignment') {
      return createScoreAssignment(params);
    }
    if (action === 'getScorePresets') {
      return getScorePresets();
    }
    if (action === 'saveScorePresets') {
      return saveScorePresets(params);
    }
    if (action === 'initAllScoreSheets') {
      return initAllScoreSheets();
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
  if (sheet) return sheet;

  // 嘗試常見分頁名稱（避免使用者修改分頁名稱導致找不到）
  const candidates = ["作業清點", "清點", "作業點收", "點收", "Sheet1", "作業收繳", "收繳"];
  for (let i = 0; i < candidates.length; i++) {
    sheet = ss.getSheetByName(candidates[i]);
    if (sheet) return sheet;
  }

  // 自動尋找第一個非「訂正」的分頁作為清點分頁
  const allSheets = ss.getSheets();
  for (let i = 0; i < allSheets.length; i++) {
    const name = allSheets[i].getName();
    if (name !== CORRECTION_MATRIX_TAB && !name.includes("訂正")) {
      return allSheets[i];
    }
  }

  sheet = ss.insertSheet(HOMEWORK_TAB_NAME);
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
  if (rawDate instanceof Date) {
    return Utilities.formatDate(rawDate, "Asia/Taipei", "yyyy/MM/dd");
  }
  let str = String(rawDate).trim().replace(/-/g, "/").replace(/\./g, "/");
  const parts = str.split("/");
  if (parts.length === 3) {
    return `${parts[0]}/${parts[1].padStart(2, "0")}/${parts[2].padStart(2, "0")}`;
  }
  if (parts.length === 2) {
    const y = new Date().getFullYear();
    return `${y}/${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}`;
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

/**
 * 從「工作表1」(作業清點表) 讀取所有作業欄位（由最新到最舊排列）
 * @param {string} [targetSubject] 可選：篩選科目
 * @param {string} [targetCategory] 可選：篩選種類
 * @returns {Array} 作業清單 [{ colIndex, date, subject, category, unit, page }, ...]
 */
function getCheckinAssignmentsList(targetSubject, targetCategory) {
  const sheet = getHwSheet();
  const lastCol = sheet.getLastColumn();
  if (lastCol < 3) return [];

  const headers = sheet.getRange(1, 3, 5, lastCol - 2).getDisplayValues();
  const list = [];
  const seen = new Set();

  const filterSub = String(targetSubject || '').trim();
  const filterCat = String(targetCategory || '').trim();

  // 由右向左 (最新欄到最舊欄) 讀取
  for (let c = headers[0].length - 1; c >= 0; c--) {
    const rawDate = headers[0][c];
    const sub = String(headers[1][c] || '').trim();
    const cat = String(headers[2][c] || '').trim();
    const unit = String(headers[3][c] || '').trim();
    const page = String(headers[4][c] || '').trim();

    if (!sub && !cat) continue;
    if (filterSub && sub !== filterSub) continue;
    if (filterCat && cat !== filterCat) continue;

    const normDate = normalizeDateString(rawDate);
    const uniqueKey = `${normDate}_${sub}_${cat}_${unit}_${page}`;
    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey);
      list.push({
        colIndex: c + 3,
        date: normDate,
        subject: sub,
        category: cat,
        unit: unit,
        page: page
      });
    }
  }
  return list;
}

function findOrCreateAssignmentColumn(sheet, date, subject, category, unit, page) {
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const targetSub = String(subject || '').trim();
  const targetCat = String(category || '').trim();
  const targetUnit = String(unit || '').trim();
  const targetPage = String(page || '').trim();
  let targetDate = normalizeDateString(date || '');

  // 1. 若有指定單元或頁數，優先比對「科目 + 種類 + 單元 + 頁數」
  if (lastCol > 1) {
    const headerValues = sheet.getRange(1, 2, 5, lastCol - 1).getDisplayValues();

    if (targetUnit || targetPage) {
      for (let c = 0; c < headerValues[0].length; c++) {
        const hSub = String(headerValues[1][c] || '').trim();
        const hCat = String(headerValues[2][c] || '').trim();
        const hUnit = String(headerValues[3][c] || '').trim();
        const hPage = String(headerValues[4][c] || '').trim();

        if (hSub === targetSub && hCat === targetCat && hUnit === targetUnit && hPage === targetPage) {
          return c + 2;
        }
      }
    }

    // 2. 若有日期，比對「科目 + 種類 + 日期」
    if (targetDate) {
      for (let c = 0; c < headerValues[0].length; c++) {
        const hDate = normalizeDateString(headerValues[0][c]);
        const hSub = String(headerValues[1][c] || '').trim();
        const hCat = String(headerValues[2][c] || '').trim();
        if (hSub === targetSub && hCat === targetCat && hDate === targetDate) {
          return c + 2;
        }
      }
    }

    // 3. 若有完全空白單元/頁數的同科目同種類欄位，可進行補填復用
    for (let c = headerValues[0].length - 1; c >= 0; c--) {
      const hSub = String(headerValues[1][c] || '').trim();
      const hCat = String(headerValues[2][c] || '').trim();
      const hUnit = String(headerValues[3][c] || '').trim();
      const hPage = String(headerValues[4][c] || '').trim();

      if (hSub === targetSub && hCat === targetCat && !hUnit && !hPage) {
        if (targetUnit || targetPage) {
          sheet.getRange(4, c + 2, 2, 1).setValues([[targetUnit], [targetPage]]);
        }
        if (targetDate) {
          sheet.getRange(1, c + 2).setValue(targetDate);
        }
        return c + 2;
      }
    }
  }

  // 若 targetDate 為空，嘗試從「工作表1」找出該 (subject, category, unit, page) 之收繳日期對齊
  if (!targetDate) {
    const checkinList = getCheckinAssignmentsList(targetSub, targetCat);
    const matchedCheckin = checkinList.find(item => item.unit === targetUnit && item.page === targetPage);
    if (matchedCheckin && matchedCheckin.date) {
      targetDate = matchedCheckin.date;
    }
  }

  // 4. 若訂正分頁完全無匹配欄位，則新增一欄（對齊清點日期與單元頁數）
  const finalDate = targetDate || getTodayString();
  const newCol = lastCol + 1;
  sheet.getRange(1, newCol, 5, 1).setValues([
    [finalDate], [targetSub], [targetCat], [targetUnit], [targetPage]
  ]).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f1f5f9");

  return newCol;
}

function findCheckinColumn(hwSheet, date, subject, category, unit, page) {
  const lastCol = hwSheet.getLastColumn();
  if (lastCol < 3) return -1;
  const headers = hwSheet.getRange(1, 3, 5, lastCol - 2).getDisplayValues();

  const normTargetDate = normalizeDateString(date);
  const targetSub = String(subject || '').trim();
  const targetCat = String(category || '').trim();
  const targetUnit = String(unit || '').trim();
  const targetPage = String(page || '').trim();

  // 1. 精準比對 (date, subject, category, unit, page)
  for (let c = headers[0].length - 1; c >= 0; c--) {
    const hDate = normalizeDateString(headers[0][c]);
    const hSub = String(headers[1][c] || '').trim();
    const hCat = String(headers[2][c] || '').trim();
    const hUnit = String(headers[3][c] || '').trim();
    const hPage = String(headers[4][c] || '').trim();

    if (hSub === targetSub && hCat === targetCat && hUnit === targetUnit && hPage === targetPage) {
      if (!normTargetDate || hDate === normTargetDate) {
        return c + 3;
      }
    }
  }

  // 2. 次優比對 (subject, category, unit, page)
  for (let c = headers[0].length - 1; c >= 0; c--) {
    const hSub = String(headers[1][c] || '').trim();
    const hCat = String(headers[2][c] || '').trim();
    const hUnit = String(headers[3][c] || '').trim();
    const hPage = String(headers[4][c] || '').trim();

    if (hSub === targetSub && hCat === targetCat && hUnit === targetUnit && hPage === targetPage) {
      return c + 3;
    }
  }

  return -1;
}

function addCorrectionRecordMatrix(params) {
  const seatNum = parseInt(params.seat, 10);
  const subject = String(params.subject || '國語').trim();
  const category = String(params.category || '甲本').trim();
  const unit = String(params.unit || '').trim();
  const page = String(params.page || '').trim();
  const date = String(params.date || '').trim();

  const sheet = getCorrectionMatrixSheet();
  let colIndex = parseInt(params.colIndex, 10);
  if (isNaN(colIndex) || colIndex < 2) {
    colIndex = findOrCreateAssignmentColumn(sheet, date, subject, category, unit, page);
  }

  // 支援只建欄或切換欄位（不標記座號）
  if (params.createOnly || !params.seat || isNaN(seatNum)) {
    return {
      success: true,
      message: `作業欄位已就緒【${subject} ${category} ${unit}】`,
      colIndex: colIndex,
      key: `${subject}_${category}_${colIndex}`,
      subject: subject,
      category: category,
      unit: unit,
      page: page,
      date: date
    };
  }

  if (seatNum < 1 || seatNum > 30) {
    return { success: false, message: '無效的座號: ' + params.seat };
  }

  const seatStr = String(seatNum).padStart(2, '0');

  // ── 檢查在「作業清點表」(工作表1) 中該生是否已有繳交紀錄 ──
  let madeUpCheckin = false;
  let checkinStatus = 'already_submitted';
  let checkinDateFound = date;

  const hwSheet = getHwSheet();
  const hwCol = findCheckinColumn(hwSheet, date, subject, category, unit, page);
  if (hwCol >= 3) {
    const studentRow = 5 + seatNum;
    const checkinVal = String(hwSheet.getRange(studentRow, hwCol).getValue() || '').trim();
    const hasSubmitted = (checkinVal === "1");
    const actualHwDate = normalizeDateString(hwSheet.getRange(1, hwCol).getValue()) || date;
    checkinDateFound = actualHwDate;

    if (!hasSubmitted) {
      if (params.makeUpCheckin === false) {
        madeUpCheckin = false;
        checkinStatus = 'unsubmitted_kept';
      } else {
        // 預設直接自動同步在清點表補登為已繳交 (1)
        hwSheet.getRange(studentRow, hwCol).setValue("1");
        madeUpCheckin = true;
        checkinStatus = 'made_up';
      }
    }
  }

  const row = 5 + seatNum;
  sheet.getRange(row, colIndex).setValue('X').setHorizontalAlignment("center").setFontWeight("bold");

  let msg = `已標記 ${seatStr}號 在【${subject}${category}】需訂正 (X)`;
  if (madeUpCheckin) {
    msg += `（📢 該生原未在清點表登記，已為其自動補登為已繳交 1）`;
  }

  return {
    success: true,
    message: msg,
    colIndex: colIndex,
    key: `${subject}_${category}_${colIndex}`,
    subject: subject,
    category: category,
    unit: unit,
    page: page,
    date: checkinDateFound,
    seat: seatStr,
    status: 'X',
    madeUpCheckin: madeUpCheckin,
    checkinStatus: checkinStatus
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
  const vacantSeatNums = [];
  if (hwSheet.getLastRow() >= 6) {
    const numRows = Math.min(CLASS_SIZE, hwSheet.getLastRow() - 5);
    const nameData = hwSheet.getRange(6, 2, numRows, 1).getDisplayValues();
    for (let i = 0; i < numRows; i++) {
      if (isVacantSeat(nameData[i][0])) vacantSeatNums.push(i + 1);
    }
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
    vacantSeats: vacantSeatNums,
    checkinAssignments: getCheckinAssignmentsList()
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
      page: page,
      date: String(params.date || ''),
      colIndex: params.colIndex
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

// ─────────────────────────────────────────────────────────────────────────────
// 3. 作業批改・成績登記與錯題訂正一體化系統 (Grading & Scores)
// ─────────────────────────────────────────────────────────────────────────────

const SCORE_SHEET_NAMES = [
  "國語|甲本",
  "國語|乙本",
  "國語|習作",
  "國語|圈詞",
  "數學|數習",
  "社會|社習",
  "日記|日記",
  "國語|作文"
];

const DEFAULT_GRADE_PRESETS = {
  "甲上上": 98,
  "甲上": 95,
  "甲": 90,
  "甲下": 85,
  "乙上": 79,
  "乙": 75,
  "乙下": 70
};

/**
 * 取得或建立指定的成績分頁
 * 結構：
 *   第 1 列: 日期 (A1="", B1="日期", C1起為各次作業日期)
 *   第 2 列: 單元 (A2="", B2="單元", C2起為各次單元)
 *   第 3 列: 頁數 (A3="", B3="頁數", C3起為各次頁數)
 *   第 4 列起: 座號與姓名 (A4:A33=01..30, B4:B33=姓名, C4起為分數)
 */
function getScoreSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        initScoreSheetStructure(sheet);
      }
    } catch (e) {
      sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        throw new Error(`無法建立成績分頁【${sheetName}】: ${e.message}`);
      }
    } finally {
      try { lock.releaseLock(); } catch(e){}
    }
  } else {
    if (sheet.getLastRow() < 3) {
      initScoreSheetStructure(sheet);
    }
  }
  return sheet;
}

function initScoreSheetStructure(sheet) {
  if (!sheet) return;
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) {
    sheet.getRange(1, 1, 3, 2).setValues([
      ["", "日期"],
      ["", "單元"],
      ["", "頁數"]
    ]).setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");
  }

  // 讀取「工作表1」的學生名冊 (第 6 列到第 35 列)
  if (sheet.getLastRow() < CLASS_SIZE + 3) {
    const hwSheet = getHwSheet();
    let studentNames = [];
    if (hwSheet.getLastRow() >= 6) {
      const numRows = Math.min(CLASS_SIZE, hwSheet.getLastRow() - 5);
      studentNames = hwSheet.getRange(6, 2, numRows, 1).getDisplayValues();
    }

    const studentRows = [];
    for (let i = 1; i <= CLASS_SIZE; i++) {
      const seatStr = String(i).padStart(2, '0');
      const name = (studentNames[i - 1] && studentNames[i - 1][0]) ? studentNames[i - 1][0] : '';
      studentRows.push([seatStr, name]);
    }
    sheet.getRange(4, 1, CLASS_SIZE, 2).setValues(studentRows).setHorizontalAlignment("center");
    sheet.getRange(4, 1, CLASS_SIZE, 1).setFontWeight("bold").setBackground("#f8fafc");
  }
}

function initAllScoreSheets() {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. 預先讀取學生名單
    const hwSheet = getHwSheet();
    let studentNames = [];
    if (hwSheet.getLastRow() >= 6) {
      const numRows = Math.min(CLASS_SIZE, hwSheet.getLastRow() - 5);
      studentNames = hwSheet.getRange(6, 2, numRows, 1).getDisplayValues();
    }
    const studentRows = [];
    for (let i = 1; i <= CLASS_SIZE; i++) {
      const seatStr = String(i).padStart(2, '0');
      const name = (studentNames[i - 1] && studentNames[i - 1][0]) ? studentNames[i - 1][0] : '';
      studentRows.push([seatStr, name]);
    }

    // 2. 批次初始化 8 大分頁
    SCORE_SHEET_NAMES.forEach(name => {
      let sheet = ss.getSheetByName(name);
      if (!sheet) {
        sheet = ss.insertSheet(name);
      }
      if (sheet.getLastRow() < 3) {
        sheet.getRange(1, 1, 3, 2).setValues([
          ["", "日期"],
          ["", "單元"],
          ["", "頁數"]
        ]).setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");
      }
      if (sheet.getLastRow() < CLASS_SIZE + 3) {
        sheet.getRange(4, 1, CLASS_SIZE, 2).setValues(studentRows).setHorizontalAlignment("center");
        sheet.getRange(4, 1, CLASS_SIZE, 1).setFontWeight("bold").setBackground("#f8fafc");
      }
    });

    // 3. 確保作業訂正矩陣分頁亦就緒
    getCorrectionMatrixSheet();

    return { success: true, message: `已成功初始化 8 大成績分頁與訂正矩陣！` };
  } catch (err) {
    return { success: false, message: '初始化失敗: ' + err.toString() };
  } finally {
    try { lock.releaseLock(); } catch(e){}
  }
}

function findOrCreateScoreAssignmentColumn(sheet, date, unit, page) {
  const lastCol = Math.max(sheet.getLastColumn(), 2);
  const targetUnit = String(unit || '').trim();
  const targetPage = String(page || '').trim();
  const targetDate = normalizeDateString(date || '');

  if (lastCol > 2) {
    const headers = sheet.getRange(1, 3, 3, lastCol - 2).getDisplayValues();
    for (let c = 0; c < headers[0].length; c++) {
      const hDate = normalizeDateString(headers[0][c]);
      const hUnit = String(headers[1][c] || '').trim();
      const hPage = String(headers[2][c] || '').trim();

      if (hUnit === targetUnit && hPage === targetPage) {
        if (!targetDate || hDate === targetDate) {
          return c + 3;
        }
      }
    }

    for (let c = 0; c < headers[0].length; c++) {
      const hUnit = String(headers[1][c] || '').trim();
      const hPage = String(headers[2][c] || '').trim();
      if (hUnit === targetUnit && hPage === targetPage) {
        return c + 3;
      }
    }
  }

  const finalDate = targetDate || getTodayString();
  const newCol = Math.max(lastCol, 2) + 1;
  sheet.getRange(1, newCol, 3, 1).setValues([
    [finalDate], [targetUnit], [targetPage]
  ]).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f1f5f9");

  return newCol;
}

function getGradingData(params) {
  params = params || {};
  let sheetName = String(params.sheetName || '國語|甲本').trim();
  if (!SCORE_SHEET_NAMES.includes(sheetName)) {
    sheetName = SCORE_SHEET_NAMES[0];
  }

  const parts = sheetName.split('|');
  const subject = parts[0] || '國語';
  const category = parts[1] || '甲本';

  const scoreSheet = getScoreSheet(sheetName);
  const lastCol = scoreSheet.getLastColumn();
  const assignments = [];

  if (lastCol >= 3) {
    const headers = scoreSheet.getRange(1, 3, 3, lastCol - 2).getDisplayValues();
    for (let c = 0; c < headers[0].length; c++) {
      const d = normalizeDateString(headers[0][c]);
      const u = String(headers[1][c] || '').trim();
      const p = String(headers[2][c] || '').trim();
      if (!u && !p && !d) continue;
      assignments.push({
        colIndex: c + 3,
        date: d,
        unit: u,
        page: p
      });
    }
  }

  // 取得清點表（工作表1）對應科目與種類的所有收繳作業（依日期由新至舊）
  const checkinAssignments = getCheckinAssignmentsList(subject, category);

  // 決定當前選定的作業欄位
  let targetCol = parseInt(params.colIndex, 10);
  let activeAssignment = null;

  if (!isNaN(targetCol) && targetCol >= 3) {
    activeAssignment = assignments.find(a => a.colIndex === targetCol);
  }

  if (!activeAssignment && (params.unit || params.page)) {
    const u = String(params.unit || '').trim();
    const p = String(params.page || '').trim();
    activeAssignment = assignments.find(a => a.unit === u && a.page === p);
  }

  // 若仍無匹配，預設取最後一筆作業；若成績分頁尚無作業但清點表有作業，自動對齊清點表最新作業
  if (!activeAssignment) {
    if (assignments.length > 0) {
      activeAssignment = assignments[assignments.length - 1];
    } else if (checkinAssignments.length > 0) {
      const latestChk = checkinAssignments[0];
      const newCol = findOrCreateScoreAssignmentColumn(scoreSheet, latestChk.date, latestChk.unit, latestChk.page);
      activeAssignment = {
        colIndex: newCol,
        date: latestChk.date,
        unit: latestChk.unit,
        page: latestChk.page
      };
      assignments.push(activeAssignment);
    }
  }

  const students = [];
  const studentMetadata = scoreSheet.getRange(4, 1, CLASS_SIZE, 2).getDisplayValues();

  let scores = [];
  if (activeAssignment && activeAssignment.colIndex >= 3) {
    scores = scoreSheet.getRange(4, activeAssignment.colIndex, CLASS_SIZE, 1).getDisplayValues();
  }

  // 讀取工作表1（清點表）狀態
  const hwSheet = getHwSheet();
  let hwCol = -1;
  let checkinVals = [];
  if (activeAssignment) {
    hwCol = findCheckinColumn(hwSheet, activeAssignment.date, subject, category, activeAssignment.unit, activeAssignment.page);
    if (hwCol >= 3 && hwSheet.getLastRow() >= 6) {
      checkinVals = hwSheet.getRange(6, hwCol, CLASS_SIZE, 1).getDisplayValues();
    }
  }

  // 讀取作業訂正矩陣狀態
  const matrixSheet = getCorrectionMatrixSheet();
  let matrixCol = -1;
  let matrixVals = [];
  if (activeAssignment) {
    const mLastCol = matrixSheet.getLastColumn();
    if (mLastCol >= 2) {
      const mHeaders = matrixSheet.getRange(1, 2, 5, mLastCol - 1).getDisplayValues();
      for (let c = 0; c < mHeaders[0].length; c++) {
        if (mHeaders[1][c] === subject && mHeaders[2][c] === category &&
            mHeaders[3][c] === activeAssignment.unit && mHeaders[4][c] === activeAssignment.page) {
          matrixCol = c + 2;
          break;
        }
      }
      if (matrixCol >= 2 && matrixSheet.getLastRow() >= 6) {
        matrixVals = matrixSheet.getRange(6, matrixCol, CLASS_SIZE, 1).getDisplayValues();
      }
    }
  }

  for (let s = 1; s <= CLASS_SIZE; s++) {
    const seatStr = String(s).padStart(2, '0');
    const name = studentMetadata[s - 1] ? studentMetadata[s - 1][1] : '';
    const rawScore = (scores[s - 1] && scores[s - 1][0]) ? String(scores[s - 1][0]).trim() : '';
    const isSubmitted = (checkinVals[s - 1] && String(checkinVals[s - 1][0]).trim() === "1");
    const mVal = (matrixVals[s - 1] && matrixVals[s - 1][0]) ? String(matrixVals[s - 1][0]).trim().toUpperCase() : '';

    students.push({
      seat: seatStr,
      name: name,
      isVacant: isVacantSeat(name),
      score: rawScore,
      checkin: isSubmitted,
      correction: (mVal === 'X' || mVal === 'O') ? mVal : '',
      graded: (rawScore !== '' && rawScore !== '--')
    });
  }

  const presetsRes = getScorePresets();

  return {
    success: true,
    sheetName: sheetName,
    subject: subject,
    category: category,
    assignments: assignments,
    checkinAssignments: checkinAssignments,
    currentAssignment: activeAssignment,
    students: students,
    presets: presetsRes.presets || DEFAULT_GRADE_PRESETS
  };
}

function saveStudentGrade(params) {
  params = params || {};
  const sheetName = String(params.sheetName || '國語|甲本').trim();
  const seatNum = parseInt(params.seat, 10);
  const score = String(params.score || '').trim();
  const needCorrection = (params.needCorrection === true || params.needCorrection === 'true');
  const unit = String(params.unit || '').trim();
  const page = String(params.page || '').trim();
  const date = String(params.date || '').trim();

  if (isNaN(seatNum) || seatNum < 1 || seatNum > CLASS_SIZE) {
    return { success: false, message: '無效座號: ' + params.seat };
  }

  const parts = sheetName.split('|');
  const subject = parts[0] || '國語';
  const category = parts[1] || '甲本';

  const scoreSheet = getScoreSheet(sheetName);
  let colIndex = parseInt(params.colIndex, 10);
  if (isNaN(colIndex) || colIndex < 3) {
    colIndex = findOrCreateScoreAssignmentColumn(scoreSheet, date, unit, page);
  }

  // 1. 登記成績至對應成績分頁 (Row 4 為 1 號)
  const scoreRow = 3 + seatNum;
  scoreSheet.getRange(scoreRow, colIndex).setValue(score).setHorizontalAlignment("center").setFontWeight("bold");

  // 2. 自動在「工作表1」(清點表) 補登為已繳交 (1)
  let madeUpCheckin = false;
  const hwSheet = getHwSheet();
  const hwCol = findCheckinColumn(hwSheet, date, subject, category, unit, page);
  if (hwCol >= 3) {
    const hwStudentRow = 5 + seatNum;
    const currentCheckinVal = String(hwSheet.getRange(hwStudentRow, hwCol).getValue() || '').trim();
    if (currentCheckinVal !== "1") {
      hwSheet.getRange(hwStudentRow, hwCol).setValue("1");
      madeUpCheckin = true;
    }
  }

  // 3. 同步至「作業訂正矩陣」
  const matrixSheet = getCorrectionMatrixSheet();
  const matrixCol = findOrCreateAssignmentColumn(matrixSheet, date, subject, category, unit, page);
  const matrixRow = 5 + seatNum;
  let correctionStatus = '';

  if (needCorrection) {
    matrixSheet.getRange(matrixRow, matrixCol).setValue('X').setHorizontalAlignment("center").setFontWeight("bold");
    correctionStatus = 'X';
  } else {
    const curVal = String(matrixSheet.getRange(matrixRow, matrixCol).getValue() || '').trim().toUpperCase();
    if (curVal === 'X') {
      matrixSheet.getRange(matrixRow, matrixCol).setValue('');
    } else if (curVal === 'O') {
      correctionStatus = 'O';
    }
  }

  const seatStr = String(seatNum).padStart(2, '0');
  let msg = `已登記 ${seatStr}號 成績【${score}分】${needCorrection ? ' (需訂正 X)' : ''}`;
  if (madeUpCheckin) {
    msg += `（📢 該生原未在清點表登記，已為其自動補登為已繳交 1）`;
  }

  return {
    success: true,
    seat: seatStr,
    score: score,
    colIndex: colIndex,
    checkin: true,
    correction: correctionStatus,
    graded: (score !== '' && score !== '--'),
    madeUpCheckin: madeUpCheckin,
    message: msg
  };
}

function createScoreAssignment(params) {
  params = params || {};
  const sheetName = String(params.sheetName || '國語|甲本').trim();
  const date = String(params.date || getTodayString()).trim();
  const unit = String(params.unit || '').trim();
  const page = String(params.page || '').trim();

  const parts = sheetName.split('|');
  const subject = parts[0] || '國語';
  const category = parts[1] || '甲本';

  const scoreSheet = getScoreSheet(sheetName);
  const colIndex = findOrCreateScoreAssignmentColumn(scoreSheet, date, unit, page);

  // 同步在「工作表1」與「作業訂正矩陣」建立或對齊欄位
  const hwSheet = getHwSheet();
  findOrCreateCheckinColumn(hwSheet, date, subject, category, unit, page);

  const matrixSheet = getCorrectionMatrixSheet();
  findOrCreateAssignmentColumn(matrixSheet, date, subject, category, unit, page);

  return {
    success: true,
    colIndex: colIndex,
    date: date,
    unit: unit,
    page: page,
    message: `已建立新作業【${subject} ${category} ${unit} ${page}】`
  };
}

function findOrCreateCheckinColumn(hwSheet, date, subject, category, unit, page) {
  let col = findCheckinColumn(hwSheet, date, subject, category, unit, page);
  if (col >= 3) return col;

  const lastCol = Math.max(hwSheet.getLastColumn(), 2);
  const newCol = lastCol + 1;
  hwSheet.getRange(1, newCol, 5, 1).setValues([
    [date], [subject], [category], [unit], [page]
  ]).setFontWeight("bold").setHorizontalAlignment("center").setBackground("#f1f5f9");
  return newCol;
}

function getScorePresets() {
  const props = PropertiesService.getScriptProperties();
  const saved = props.getProperty('GRADE_PRESETS');
  if (saved) {
    try {
      return { success: true, presets: JSON.parse(saved) };
    } catch (e) {}
  }
  return { success: true, presets: DEFAULT_GRADE_PRESETS };
}

function saveScorePresets(params) {
  params = params || {};
  const presets = typeof params.presets === 'string' ? JSON.parse(params.presets) : (params.presets || DEFAULT_GRADE_PRESETS);
  const props = PropertiesService.getScriptProperties();
  props.setProperty('GRADE_PRESETS', JSON.stringify(presets));
  return { success: true, presets: presets, message: '等第分數設定已儲存！' };
}

