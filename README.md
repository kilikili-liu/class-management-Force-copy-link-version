<div align="center">
  <img src="docs/images/logo.png" alt="Class Management System Logo" width="130" style="border-radius: 20px;" />
  <h1>🎯 班級智慧作業清點、缺交催繳與錯題訂正系統</h1>
  <p><strong>(PWA 雙模式強化版)</strong></p>
</div>

> 一套專為國小導師與任課教師設計的智慧班級作業管理系統。支援 **純按鈕快速點收**、**手機 QR Code 速掃**、**全班缺交催繳矩陣** 以及 **錯題訂正銷案矩陣**。  
> 具備 **PWA 獨立 App 全螢幕模式**、**手機 QR Code 一秒自動連線配對** 以及 **背景自動偵測升級** 功能！

---

## 🚀 系統快速安裝與部署教學 (5 分鐘輕鬆搞定)

```mermaid
flowchart LR
    A["1. 建立試算表副本<br/>(填入名單)"] --> B["2. 部署 GAS<br/>(取得 API 網址)"]
    B --> C["3. 上傳 Neocities<br/>(靜態網頁託管)"]
    C --> D["4. 手機掃碼連線<br/>(自動綁定 + 安裝App)"]
```


---

## 📸 「作業清點系統」實際運作圖

<div align="center">
  <table style="border-collapse: collapse; border: none;">
    <tr>
      <td align="center" valign="bottom" style="padding: 10px; border: none;">
        <img src="docs/images/operation_button_check.jpg" alt="純按鈕作業點收" width="260" /><br/>
        <b>▲ 純按鈕作業點收介面</b>
      </td>
      <td align="center" valign="bottom" style="padding: 10px; border: none;">
        <img src="docs/images/operation_qr_scan.jpg" alt="作業 QR Code 速掃" width="380" /><br/>
        <b>▲ 作業 QR Code 高速相機速掃</b>
      </td>
      <td align="center" valign="bottom" style="padding: 10px; border: none;">
        <img src="docs/images/operation_matrix_call.jpg" alt="全班未繳催繳矩陣列表" width="260" /><br/>
        <b>▲ 全班未繳催繳矩陣列表</b>
      </td>
    </tr>
  </table>
  <p><em>「作業清點系統」實際運作圖：支援純按鈕號碼點收、鏡頭 QR Code 極速辨識、全班缺交矩陣與批次補登</em></p>
</div>

---

## 📸 「訂正系統」實際運作圖

<div align="center">
  <table style="border-collapse: collapse; border: none;">
    <tr>
      <td align="center" valign="bottom" style="padding: 10px; border: none;">
        <img src="docs/images/correction_button_register.jpg" alt="純按鈕錯題登記" width="450" /><br/>
        <b>▲ 錯題登記介面（批改登記／純按鈕）</b>
      </td>
      <td align="center" valign="bottom" style="padding: 10px; border: none;">
        <img src="docs/images/correction_qr_scan.jpg" alt="訂正掃碼工具" width="450" /><br/>
        <b>▲ 訂正掃碼工具（相機即掃即登）</b>
      </td>
    </tr>
    <tr>
      <td align="center" valign="bottom" style="padding: 10px; border: none;">
        <img src="docs/images/correction_query_clear.jpg" alt="查詢與銷案" width="260" /><br/>
        <b>▲ 查詢與銷案介面（個別學生訂正掌握）</b>
      </td>
      <td align="center" valign="bottom" style="padding: 10px; border: none;">
        <img src="docs/images/correction_matrix_call.jpg" alt="全班催繳矩陣" width="260" /><br/>
        <b>▲ 全班催繳矩陣（錯題未訂正總覽）</b>
      </td>
    </tr>
  </table>
  <p><em>「訂正系統」實際運作圖：支援批改登記、相機條碼即掃即登/銷案、個別學生錯題查詢與全班催繳矩陣</em></p>
</div>

---

### 步驟 1：建立試算表副本與使用前置作業

#### 1-1. 建立試算表副本
請點擊下方連結，在您的 Google 雲端硬碟建立系統試算表副本：

👉 **[點我建立試算表副本 (Google Sheets Copy Link)](https://docs.google.com/spreadsheets/d/1O7rwisRcjLcclZRDfHoGjGl7y8Nk9R9orQuhJqMfkd0/copy)**

#### 1-2. 試算表使用前置作業
* 📝 **修改試算表名稱**：建議將試算表左上方的檔名修改為自己的班級（例如：`三年二班作業清點系統`）。
* ✏️ **編輯貴班全班姓名**：使用前，請在副本 Google Sheets 的 **`工作表1`** 上「學生姓名」B 欄（座號 1 ~ 30 號旁）填入貴班學生的姓名。
* 👥 **人數上限是 30 人**：系統預設與人數上限為 **30 人**（座號 01 ~ 30 號）。
* 🚫 **空號 / 轉出設定**：若貴班人數少於 30 人（例如全班 25 人），或中間有轉學缺號，**請直接在該座號姓名處填入「空號」**（或「轉出」）。
* 💡 **自動扣除與按鈕隱藏**：姓名欄只要填入「空號」，系統前台清點介面與缺交催繳矩陣即**自動不顯示該座號按鈕**，且全班應交總人數也會**自動扣除一人**，計算百分之百精準！

<div align="center">
  <img src="docs/images/spreadsheet_sample.png" alt="試算表學生名單與空號設定範例" width="340" />
  <p><em>▲ 試算表設定範例：B 欄填寫學生姓名，未滿 30 人或轉出者直接填入「空號」即可自動扣減與隱藏按鈕</em></p>
</div>

---

### 步驟 2：新增 Google Apps Script (GAS) 部署作業
1. 開啟剛剛建立的試算表副本。
2. 點選上方選單 **「擴充功能」 ➔ 「Apps Script」**。

<div align="center">
  <img src="docs/images/gas_menu_extensions.png" alt="點選擴充功能中的 Apps Script" width="480" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
  <p><em>▲ 點選試算表選單的「擴充功能」 ➔ 「Apps Script」進入後端編輯器</em></p>
</div>

3. 進入 Apps Script 後，點擊右上角藍色的 **「部署」 ➔ 「新增部署作業」**。
4. 部署設定如下：
   * **選取類型**：點擊齒輪圖示，選擇 **「網頁應用程式」 (Web App)**
   * **說明**：可自由輸入（如：`班級作業系統正式版`）
   * **執行身份** (Execute as)：選擇 **`我 (您的 Google 帳號)`**
   * **誰有存取權** (Who has access)：選擇 **`所有人 (Anyone)`**
5. 點擊 **「部署」** 按鈕，依照畫面指示完成 Google 安全性授權（此為 Google 對自建腳本之標準安全防護機制）：
   * **① 點擊右上角「部署」** ➔ **② 跳出視窗點選「授予存取權」** 選擇您的 Google 帳號。
   * Google 會顯示「Google hasn't verified this app（Google 尚未驗證這個應用程式）」，請點擊左下角 **③「Advanced（進階）」**。

<div align="center">
  <img src="docs/images/gas_auth_step1.png" alt="步驟 1~3：部署、授予存取權與點選進階" width="480" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
  <p><em>▲ 依序點擊「部署」 ➔ 「授予存取權」 ➔ 點選「Advanced（進階）」展開隱藏選項</em></p>
</div>

   * 展開說明後，點選最底部的 **❺「Go to 未命名的專案 (unsafe)（前往專案/不安全）」**。

<div align="center">
  <img src="docs/images/gas_auth_step2.png" alt="步驟 5：點擊前往專案" width="480" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
  <p><em>▲ 點擊底部的「Go to 未命名的專案 (unsafe)」繼續授權</em></p>
</div>

   * 進入最後確認畫面，滾動到最下方點擊 **❻「Continue（繼續 / 允許）」**。

<div align="center">
  <img src="docs/images/gas_auth_step3.png" alt="步驟 6：點擊 Continue 允許" width="280" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
  <p><em>▲ 點選右下角「Continue」確認允許存取試算表</em></p>
</div>

6. 部署成功後，畫面會顯示 **「網頁應用程式網址」 (Web App URL)**，請點擊 **「複製」** 備用（格式如：`https://script.google.com/macros/s/AKfycb.../exec`）。

<div align="center">
  <img src="docs/images/gas_deploy_success.png" alt="部署成功並複製網頁應用程式網址" width="480" style="border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);" />
  <p><em>▲ 部署成功畫面：點擊紅框處「複製」按鈕取得網頁應用程式網址（Web App URL）</em></p>
</div>

> 🎉 **電腦端已可直接使用**：  
> 直接在電腦瀏覽器開啟剛剛複製的網址，即可在電腦大螢幕上使用「純按鈕作業點收與缺交催繳矩陣」！

---

### 步驟 3：上傳 Neocities 免費網頁空間（選用 / 非必要，支援手機相機與 PWA）

> 💡 **此步驟非必要**：若不想自行管理上傳掃碼程式更新，**可直接略過此步驟**！系統配對視窗已預設連線至作者維護的公開穩定版站點，您只要直接執行「步驟 4」掃碼即可開始使用。若您希望在自己的 Neocities 帳號建立獨立託管站點，才需要執行此步驟。

由於 Google 原生 GAS 的安全政策會封鎖手機相機權限 (`getUserMedia`)，凡需在手機上使用相機掃碼或安裝為 PWA App，請使用 **[Neocities (neocities.org)](https://neocities.org/)** 免費靜態網頁託管服務。

#### 3-1. 註冊 Neocities 帳戶
1. 前往 [Neocities 官網](https://neocities.org/) 免費註冊帳號。
2. 登入後點擊 **「Edit Sites」** 進入檔案管理介面。

#### 3-2. 上傳 `neocities/` 資料夾內全部檔案（**無需修改任何程式碼**）
直接將本專案 `neocities/` 資料夾內的所有檔案原封不動上傳至 Neocities 空間根目錄或 `/scanner/` 資料夾中：

| 檔案名稱 | 說明 / 功能 |
|---|---|
| **`index.html`** | 🎯 純按鈕作業點收、單元設定與全班缺交催繳矩陣主頁 |
| **`scanner.html`** | 📱 作業 QR Code 速掃工具 (相機高速辨識，附「🎯 純按鈕清點」無縫切換按鈕) |
| **`correction.html`** | ✏️ 班級作業錯題訂正與銷案矩陣主頁 |
| **`correction_scanner.html`** | 📷 獨立訂正掃碼工具 (橫向雙欄，相機即掃即銷案) |
| **`StickerGenerator.html`** | 🏷️ 班級學生作業條碼 / QR Code 貼紙產出與列印工具 |
| **`manifest.json`** | 📲 PWA 應用程式設定檔（定義 App 捷徑、橫向模式與圖示） |
| **`sw.js`** | ⚡ PWA Service Worker（快取離線資源，負責背景自動偵測新版本更新） |
| **`icon.svg` / `icon-192.png` / `icon-512.png`** | 🎨 App 桌面圖示 |

---

### 步驟 4：手機掃碼連線與安裝 App (Android / iOS)

在電腦瀏覽器打開系統主頁（GAS 部署網址），點擊右上角按鈕 **「📱 連結碼」** 開啟連線視窗，依照您的手機系統進行操作：

---

#### 🤖 Android 手機安裝步驟

1. 在視窗上方切換至 **「🤖 Android 手機」**，點選想開啟的功能頁面（預設為「作業收繳速掃」）。
2. 使用 Android 手機內建相機或 Google 智慧鏡頭（Google Lens），直接掃描螢幕上的 QR Code 開啟網頁。
3. 網頁開啟後，點擊頁面頂部的 **「📲 安裝 App」**（或瀏覽器選單的「加到主畫面」）。
4. 安裝完成後，直接從手機桌面點開 App 即可開始使用！

<div align="center">
  <img src="docs/images/pairing_android.jpg" alt="Android 掃碼與安裝步驟" width="340" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
  <p><em>▲ Android 手機連線視窗：相機掃碼開啟後，點擊「安裝 App」即可加入桌面</em></p>
</div>

---

#### 🍎 iOS (iPhone / iPad) 安裝與綁定步驟

iOS 裝置只需簡單兩步驟即可完成全螢幕 App 安裝與試算表綁定：

##### 【第 1 步】掃碼下載描述檔安裝 App
1. 在連線視窗切換至 **「🍎 iOS (iPhone / iPad) 手機」** 標籤，點選 **「❶ 掃碼下載描述檔安裝 App」**。
2. 使用 iPhone 內建相機掃描螢幕上的 QR Code，點擊彈出的「允許」下載描述檔。
3. 打開 iPhone 的 **「設定」 ➔ 最上方點擊「已下載描述檔」 ➔ 點擊右上角「安裝」** 並輸入手機解鎖密碼。
4. iPhone 主畫面即會出現全螢幕「作業速掃」App 圖示！

<div align="center">
  <img src="docs/images/pairing_ios_step1.png" alt="iOS 步驟 1：掃碼下載描述檔安裝 App" width="340" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
  <p><em>▲ iOS 步驟 1：使用 iPhone 原生相機掃碼下載描述檔，免簽名安裝全螢幕 App</em></p>
</div>

##### 【第 2 步】掃連線碼綁定試算表
1. 打開剛剛出現在 iPhone 主畫面的 **「作業速掃」App**。
2. 在電腦螢幕連線視窗點選 **「❷ 掃連線碼綁定試算表」**。
3. 拿起手機，使用 App 內的掃碼鏡頭對準螢幕上的 QR Code 掃描一次。
4. 手機畫面顯示 **「🎉 試算表綁定成功！」** 即完成所有設定，隨時可以開始高速清點作業！

<div align="center">
  <img src="docs/images/pairing_ios_step2.jpg" alt="iOS 步驟 2：掃連線碼綁定試算表" width="340" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
  <p><em>▲ iOS 步驟 2：打開 App 掃描部署碼，瞬間完成試算表資料庫綁定</em></p>
</div>

---

## ⚡ 獨家功能：PWA 自動偵測更新機制（免下拉重新整理）

針對手機 PWA「獨立應用程式模式（Standalone）」預設鎖定下拉手勢的問題，系統內建 **雙重背景檢查更新機制**：

1. **切回前台自動檢查**：每次解鎖手機螢幕或切換回本 App 時，自動在背景詢問 Neocities 伺服器是否有新版本。
2. **浮動更新提示列**：一旦伺服器有檔案改版，畫面正上方會自動浮出溫馨提示：  
   👉 **「✨ 發現系統新版本！【立即套用更新】」**
3. 老師只需輕點一下按鈕，App 就會在 0.3 秒內自動完成快取刷新並套用最新代碼，輕鬆無痛升級！

---

## 💡 實務操作與高效掃碼工作流程建議 (Best Practice Workflow)

為了達到全班作業點收與錯題銷案最高效率，推薦採用以下經實務驗證的最順暢工作流程：

1. **標籤列印與裁切**：使用 `StickerGenerator.html` 產生全班條碼/QR Code 貼紙後，以 **A4 紙張** 列印，再以 **鋼尺與美工刀** 快速裁切標籤。
2. **標籤張貼位置**：將裁切好的 QR Code 貼紙統一黏貼於作業本的 **右上角**。
3. **雙手流順暢掃描操作**：
   * **右手**：橫向握持手機將鏡頭對準作業本右上角（全靜音運作，內建綠光邊框與震動回饋，不打擾教室秩序）。
   * **左手**：順手快速翻頁或替換下一本作業本。
   * 遇到缺交或要登記單元頁數時，點擊頂部 **「🎯 純按鈕清點」** 隨時切換至號碼輸入介面！

---

## 🌐 系統頁面開啟與存取對照表

| 系統頁面 / 工具名稱 | 推薦存取方式與網址 | 運作說明 |
|---|---|---|
| **🎯 純按鈕作業點收與催繳主頁** | `https://您的帳號.neocities.org/index.html` 或 GAS 原生網址 | 支援科目種類單元備註挑選、號碼點收與全班催繳矩陣 |
| **📥 作業 QR Code 速掃工具** | `https://您的帳號.neocities.org/scanner.html` | 手機相機極速辨識，附「🎯 純按鈕清點」切換按鈕 |
| **✏️ 錯題訂正與銷案矩陣主頁** | `https://您的帳號.neocities.org/correction.html` | 錯題登記、銷案矩陣與全班催繳總覽 |
| **📱 獨立訂正條碼速掃工具** | `https://您的帳號.neocities.org/correction_scanner.html` | 橫向雙欄設計，相機即掃即銷案 |
| **🏷️ 條碼與 QR Code 貼紙產生器** | [線上免安裝版](https://zaca006.neocities.org/scanner/StickerGenerator) 或 `https://您的帳號.neocities.org/StickerGenerator.html` | 批量排版產生全班標籤，支援自選座號補印與 A4 直接列印 |

---

## ✨ 系統主要功能特色

### 1. 🎯 純按鈕作業點收與防呆提醒
* **未選擇項目防呆攔截**：剛進入頁面若未選擇【科目 | 種類】，按壓座號按鈕會自動跳出視覺化彈窗提醒，防止誤觸點收。
* **一鍵狀態切換**：選定作業後，自動載入當日點收紀錄，點擊號碼即可切換 `🟢 已繳` / `🔴 未繳`。
* **豐富科目種類支援**：
  * **國語**（甲本、乙本、習作、圈詞、預習單、學習單、國練、評量、考卷、作業本）
  * **數學**（數習、數課、數練、學習單、評量、考卷、作業本）
  * **社會、自然、英語**（習作、預習單、學習單、評量、考卷、作業本）
  * **聯絡簿、日記**
  * **單據**（同意書、回條、繳費單）
  * **其它**（其它）

### 2. 📱 手機 QR Code 條碼速掃與錯題銷案
* **純靜音無干擾**：教室掃碼以無聲為最高境界，搭配畫面綠光閃爍與手機微震動反饋。
* **條碼相機掃描**：支援手機鏡頭直接掃描學生條碼（相容座號純數字、`座號|科目|種類` 或 `CMS|座號|科目|種類` 格式）。
* **雙模式切換**：
  * 🟧 **登記錯題模式 (標為 X)**：快速標記學生需要訂正的作業，並新增至訂正矩陣。
  * 🟦 **錯題銷案模式 (標為 O)**：學生訂正完成後，掃碼即可將錯題銷案。
* **三層式焦點鎖定機制**：掃碼完成後，下拉選單與燈號矩陣 100% 精準鎖定至該作業，絕不意外跳回第一筆。

### 3. 📊 全班缺交與錯題催繳矩陣
* **即時催繳清單**：自動彙整全班缺交學生與待訂正錯題項目。
* **科目篩選與批次補登**：支援依所有科目頁籤進行快速篩選，並提供全選與「✅ 批次送出補登」功能。

---

## 📱 學生條碼格式說明 (Barcode Format)

系統相容以下三種條碼格式，可直接點擊開啟 👉 **[🏷️ 條碼與 QR Code 貼紙線上產生器](https://zaca006.neocities.org/scanner/StickerGenerator)**（或使用專案內的 `StickerGenerator.html`）批量排版產出全班標籤貼紙，支援全班列印或「自選座號補印」，可直接以 A4 貼紙列印後張貼於學生作業本：

| 條碼格式 | 範例 | 說明 |
|---|---|---|
| **純座號** | `09` | 登錄/銷案 09 號學生當前選取的作業 |
| **座號+作業** | `09\|數學\|數課` | 登錄/銷案 09 號學生的「數學 數課」 |
| **CMS 前綴格式** | `CMS\|09\|數學\|數課` | 完整班級系統標準格式 |

---

## 📁 專案檔案架構

```text
├── docs/                      # 📖 說明文件與附圖
│   └── images/                # 📸 文件圖檔
│       ├── logo.png                        # 標誌與商標圖示
│       ├── spreadsheet_sample.png          # 試算表學生名單與空號設定範例圖
│       ├── gas_menu_extensions.png         # 試算表選單點選 Apps Script 圖
│       ├── gas_auth_step1.png              # 部署與授予存取權步驟圖
│       ├── gas_auth_step2.png              # 點選前往專案(不安全)步驟圖
│       ├── gas_auth_step3.png              # 點選 Continue 允許步驟圖
│       ├── gas_deploy_success.png          # 部署成功並複製網頁應用程式網址圖
│       ├── pairing_android.jpg             # Android 掃碼連線彈窗圖
│       ├── pairing_ios_step1.png           # iOS 步驟1下載描述檔彈窗圖
│       ├── pairing_ios_step2.jpg           # iOS 步驟2掃碼綁定試算表彈窗圖
│       ├── operation_button_check.jpg      # 純按鈕作業點收實際運作圖
│       ├── operation_qr_scan.jpg           # 作業 QR Code 速掃實際運作圖
│       ├── operation_matrix_call.jpg       # 全班未繳催繳矩陣列表實際運作圖
│       ├── correction_button_register.jpg  # 訂正系統錯題登記介面實際運作圖
│       ├── correction_qr_scan.jpg          # 訂正相機速掃工具實際運作圖
│       ├── correction_query_clear.jpg      # 訂正查詢與銷案介面實際運作圖
│       └── correction_matrix_call.jpg      # 訂正全班催繳矩陣實際運作圖
├── gas-project/               # 💻 Google Apps Script 後端專案核心 (clasp 部署用)
│   ├── appsscript.json        # GAS 專案組態檔
│   ├── Code.gs                # 後端 API 與試算表讀寫邏輯 (支援 getGasWebAppUrl、批次補登)
│   ├── Index.html             # 🎯 純按鈕作業點收與催繳矩陣主頁 (GAS 原生直接開啟)
│   ├── Scanner.html           # 📱 作業速掃頁面 (附直連純按鈕按鈕)
│   ├── Correction.html        # ✏️ 錯題訂正矩陣頁面
│   ├── CorrectionScanner.html # 📷 訂正條碼速掃頁面
│   └── StickerGenerator.html  # 🏷️ 標籤貼紙產生器
├── neocities/                 # 🌐 上傳至 Neocities 的完整 PWA 靜態站點
│   ├── index.html             # 🎯 純按鈕作業點收與催繳矩陣主頁 (外部 PWA 版)
│   ├── scanner.html           # 📥 作業速掃點收工具 (相機即掃即登)
│   ├── correction.html        # ✏️ 錯題訂正與銷案矩陣主頁
│   ├── correction_scanner.html# 📱 獨立訂正掃碼工具 (橫向雙欄)
│   ├── StickerGenerator.html  # 🏷️ 條碼與 QR Code 標籤貼紙產生器
│   ├── manifest.json          # 📲 PWA 應用程式設定與捷徑定義
│   ├── sw.js                  # ⚡ Service Worker 快取與自動更新偵測
│   ├── icon.svg               # 🎨 向量 App 圖示
│   ├── icon-192.png           # 🎨 192x192 PWA 圖示
│   └── icon-512.png           # 🎨 512x512 PWA 圖示
└── README.md                  # 📖 專案安裝與說明文件
```

---

## 📄 授權條款 (License)

本專案採用 [MIT License](LICENSE) 授權開放，歡迎各位老師自由建立副本、修改與分享！

<br/>

<div align="center">
  <img src="docs/images/logo.png" alt="Class Management System Brand Logo" width="64" style="border-radius: 12px; vertical-align: middle;" />
  <p style="color: #888; font-size: 0.9em; margin-top: 8px;">
    <strong>Class Management System</strong> · 班級智慧作業清點與錯題管理系統
  </p>
</div>
