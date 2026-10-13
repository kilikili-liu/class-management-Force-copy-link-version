#!/bin/bash
set -e

# 定義兩個專案的 Script ID
MASTER_SCRIPT_ID="1Coh-aANXxepnrEh9tUpDtu7ZC-SdVMGFwm1C0woSM-U__cGWLywhej5P"
CLASSROOM_SCRIPT_ID="1tX6NI-qrxGnhkmbEEsp1B_uTodYJBWISaZ4ANV1K9FNCCklmemHQbz_Z"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")/gas-project"

cd "$PROJECT_DIR"

echo "=========================================="
echo "🚀 1/2: 推送代碼至【母檔範本】..."
echo "=========================================="
echo "{\"scriptId\":\"$MASTER_SCRIPT_ID\",\"rootDir\":\"./\"}" > .clasp.json
npx @google/clasp push -f

echo ""
echo "=========================================="
echo "🚀 2/2: 推送代碼至【教室實戰副本】..."
echo "=========================================="
echo "{\"scriptId\":\"$CLASSROOM_SCRIPT_ID\",\"rootDir\":\"./\"}" > .clasp.json
npx @google/clasp push -f

# 恢復為母檔設定（避免 git 混亂）
echo "{\"scriptId\":\"$MASTER_SCRIPT_ID\",\"rootDir\":\"./\"}" > .clasp.json

echo ""
echo "🎉 雙推完成！母檔範本與教室副本已同步更新至最新版！"
