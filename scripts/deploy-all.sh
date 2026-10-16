#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_DIR="$ROOT_DIR/gas-project"
NEO_DIR="$ROOT_DIR/neocities"

# 載入 .env
if [ -f "$ROOT_DIR/.env" ]; then
  export $(grep -v '^#' "$ROOT_DIR/.env" | xargs)
fi

echo "=========================================="
echo "📦 步驟 0: 同步最新 HTML 檔案至 neocities 資料夾..."
echo "=========================================="
cp "$PROJECT_DIR/Index.html" "$NEO_DIR/index.html"
cp "$PROJECT_DIR/Correction.html" "$NEO_DIR/correction.html"
cp "$PROJECT_DIR/Grading.html" "$NEO_DIR/grading.html"
cp "$PROJECT_DIR/Scanner.html" "$NEO_DIR/scanner.html"
cp "$PROJECT_DIR/CorrectionScanner.html" "$NEO_DIR/correction_scanner.html"
cp "$PROJECT_DIR/StickerGenerator.html" "$NEO_DIR/StickerGenerator.html"
cp "$PROJECT_DIR/Sidebar.html" "$NEO_DIR/sidebar.html"
echo "✅ 本地 neocities 檔案同步完畢！"

echo ""
echo "=========================================="
echo "🚀 步驟 1: 推送代碼至 Google Apps Script..."
echo "=========================================="
"$SCRIPT_DIR/push-all.sh"

echo ""
echo "=========================================="
echo "🌐 步驟 2: 上傳至 Neocities (zaca006.neocities.org/scanner/)..."
echo "=========================================="
if [ -z "$NEOCITIES_API_KEY" ]; then
  echo "⚠️ 未設定 NEOCITIES_API_KEY，略過 Neocities 上傳"
else
  RES=$(curl -s -H "Authorization: Bearer $NEOCITIES_API_KEY" \
    -F "scanner/index.html=@$NEO_DIR/index.html" \
    -F "scanner/correction.html=@$NEO_DIR/correction.html" \
    -F "scanner/grading.html=@$NEO_DIR/grading.html" \
    -F "scanner/scanner.html=@$NEO_DIR/scanner.html" \
    -F "scanner/correction_scanner.html=@$NEO_DIR/correction_scanner.html" \
    -F "scanner/StickerGenerator.html=@$NEO_DIR/StickerGenerator.html" \
    -F "scanner/sidebar.html=@$NEO_DIR/sidebar.html" \
    https://neocities.org/api/upload)
  echo "Neocities 回應: $RES"
  echo "✅ Neocities 靜態網頁已全部更新覆蓋完畢！"
fi

echo ""
echo "=========================================="
echo "✨ 全部完成！三端同步就緒："
echo "   1. 母檔範本 (GAS) 🟢"
echo "   2. 教室副本 (GAS) 🟢"
echo "   3. Neocities PWA  🟢"
echo "=========================================="
