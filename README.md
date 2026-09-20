# 🎯 班級智慧作業清點、缺交催繳與錯題訂正系統 (Google Apps Script 版)

> 一套專為國小導師與任課教師設計的智慧班級作業管理系統。支援 **純按鈕快速點收**、**手機 QR Code 速掃**、**全班缺交催繳矩陣** 以及 **錯題訂正銷案矩陣**。

---

## 🚀 系統快速安裝與部署教學 (5 分鐘輕鬆搞定)

### 步驟 1：建立試算表副本 (Google Sheets Copy)
請點擊下方連結，在您的 Google 雲端硬碟建立系統試算表副本：

👉 **[點我建立試算表副本 (Google Sheets Copy Link)](https://docs.google.com/spreadsheets/d/1O7rwisRcjLcclZRDfHoGjGl7y8Nk9R9orQuhJqMfkd0/copy)**

> 📌 **說明**：點擊後請按下 **「建立副本」**，這張試算表將作為您班級作業清點與訂正矩陣的雲端資料庫。

---

### 步驟 2：新增 Google Apps Script (GAS) 部署作業
1. 開啟剛剛建立的試算表副本。
2. 點選上方選單 **「擴充功能」 ➔ 「Apps Script」**。
3. 點擊右上角藍色的 **「部署」 ➔ 「新增部署作業」**。
4. 部署設定如下：
   * **選取類型**：點擊齒輪圖示，選擇 **「網頁應用程式」 (Web App)**
   * **說明**：可自由輸入（如：`班級作業系統正式版`）
   * **執行身份** (Execute as)：選擇 **`我 (您的 Google 帳號)`**
   * **誰有存取權** (Who has access)：選擇 **`所有人 (Anyone)`**
5. 點擊 **「部署」** 按鈕，依照畫面指示完成 Google 帳號權限授權。
6. 部署成功後，畫面會顯示 **「網頁應用程式網址」 (Web App URL)**，請點擊 **「複製」** 備用（格式如：`https://script.google.com/macros/s/AKfycb.../exec`）。

---

### 步驟 3：將 `GAS_API_URL` 複製貼至 HTML 檔案程式碼中
將步驟 2 複製的 **網頁應用程式網址 (Web App URL)**，填入本專案中以下三個 HTML 檔案程式碼的 `GAS_API_URL` 位置：

1. **`correction.html`**：搜尋 `GAS_API_URL` 或 `getGasApiUrl()`，將預設網址替換為您的 `GAS_API_URL`。
2. **`correction_scanner.html`**：搜尋 `GAS_API_URL` 或 `getGasApiUrl()`，替換為您的 `GAS_API_URL`。
3. **`scanner.html`**：搜尋 `GAS_API_URL` 或 `getGasApiUrl()`，替換為您的 `GAS_API_URL`。

*(註：若直接於網址帶入 `?api_url=您的GAS網址`，系統亦會自動記憶於本地瀏覽器中。)*

---

### 步驟 4：推薦免費 Web 託管空間 (Neocities)
推薦使用免費且穩定快速的 **[Neocities (neocities.org)](https://neocities.org/)** 靜態網頁託管服務，讓您免伺服器費用、隨時隨地用手機或電腦開啟網頁：

1. 前往 [Neocities 官網](https://neocities.org/) 註冊一個免費帳戶（只需填寫帳號與密碼）。
2. 登入後點擊 **「Edit Sites」 (編輯網站)** 進入檔案管理介面。

---

### 步驟 5：上傳 4 個 HTML 檔案至 Neocities 即可開始使用！
將修改好的以下 **4 個 HTML 檔案** 上傳至 Neocities 空間中：

| 檔案名稱 | 說明 / 功能 |
|---|---|
| **`StickerGenerator.html`** | 🏷️ 班級學生作業條碼 / QR Code 貼紙產出工具 |
| **`correction.html`** | ✏️ 班級作業錯題訂正與銷案矩陣主頁 (純按鈕/矩陣) |
| **`correction_scanner.html`** | 📱 獨立【訂正掃碼工具】(橫向雙欄，掃碼即銷案/登記) |
| **`scanner.html`** | 📥 班級作業 QR Code 快速點收與繳交狀態工具 |

🎉 **大功告成！**  
上傳完成後，直接開啟 Neocities 提供的網頁連結（例：`https://您的帳號.neocities.org/correction.html`），即可在手機、平板或電腦上輕鬆使用本系統！

---

## ✨ 系統主要功能特色

### 1. 🎯 純按鈕作業點收與防呆提醒
* **未選擇項目防呆攔截**：剛進入頁面若未選擇【科目 | 種類】，按壓座號按鈕會自動跳出視覺化彈窗提醒，防止誤觸點收。
* **一鍵狀態切換**：選定作業後，自動載入當日點收紀錄，點擊號碼即可切換 `🟢 已繳` / `🔴 未繳`。

### 2. 📱 手機 QR Code 條碼速掃與錯題銷案
* **條碼相機掃描**：支援手機鏡頭直接掃描學生條碼（相容座號純數字、`座號|科目|種類` 或 `CMS|座號|科目|種類` 格式）。
* **雙模式切換**：
  * 🟧 **登記錯題模式 (標為 X)**：快速標記學生需要訂正的作業，並新增至訂正矩陣。
  * 🟦 **錯題銷案模式 (標為 O)**：學生訂正完成後，掃碼即可將錯題銷案。
* **三層式焦點鎖定機制**：掃碼完成後，下拉選單與燈號矩陣 100% 精準鎖定至該作業，絕不意外跳回第一筆。
* **獨立「補填細節」modal**：作業單元與頁數僅能透過點擊「補填細節」並儲存時寫入，儲存或關閉後即刻清空輸入框暫存。

### 3. 📊 全班缺交與錯題催繳矩陣
* **即時催繳清單**：自動彙整全班缺交學生與待訂正錯題項目。
* **科目篩選與一鍵補登**：支援依「國語、數學、社會、自然、英語、聯絡簿、日記」進行頁籤篩選，並提供「✍️ 一鍵補登」功能。

---

## 📱 學生條碼格式說明 (Barcode Format)

系統相容以下三種條碼格式（可使用 `StickerGenerator.html` 直接產生標籤貼紙貼在學生作業本上）：

| 條碼格式 | 範例 | 說明 |
|---|---|---|
| **純座號** | `09` | 登錄/銷案 09 號學生當前選取的作業 |
| **座號+作業** | `09\|數學\|數課` | 登錄/銷案 09 號學生的「數學 數課」 |
| **CMS 前綴格式** | `CMS\|09\|數學\|數課` | 完整班級系統標準格式 |

---

## 📁 專案檔案架構

```text
├── neocities/                 # 🌐 供上傳至 Neocities 託管空間的 4 個前端頁面
│   ├── StickerGenerator.html  # 🏷️ 條碼與 QR Code 標籤貼紙產生器
│   ├── correction.html        # ✏️ 錯題訂正與銷案矩陣主頁
│   ├── correction_scanner.html# 📱 獨立訂正掃碼工具
│   └── scanner.html           # 📥 作業速掃點收工具
├── template-project/           # 💻 Google Apps Script 專案核心程式碼
│   ├── appsscript.json        # Apps Script 專案組態檔
│   ├── Code.gs                # 後端 API 與試算表讀寫邏輯
│   ├── Index.html             # 🎯 純按鈕作業點收與催繳矩陣主頁
│   ├── Scanner.html           # 📱 作業速掃頁面
│   ├── Correction.html        # ✏️ 錯題訂正矩陣頁面
│   └── CorrectionScanner.html # 📷 訂正條碼速掃頁面
├── templates/                 # 📦 開源範本備份目錄
└── README.md                  # 📖 專案安裝與說明文件
```

---

## 📄 授權條款 (License)

本專案採用 [MIT License](LICENSE) 授權開放，歡迎各位老師自由建立副本、修改與分享！
