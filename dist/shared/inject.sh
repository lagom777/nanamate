#!/bin/bash
# 모든 about*/  HTML에 공통 라이트 테마 + 다국어 + 난이도 자동 주입
# 이미 주입된 파일은 건너뛴다.

set -e
ROOT="/Users/kg/coding/studywithai"

inject_into() {
  local file="$1"
  # 깊이 계산
  local rel="${file#$ROOT/}"
  local depth=$(echo "$rel" | tr -cd '/' | wc -c)
  local prefix=""
  for ((i=0; i<depth; i++)); do prefix+="../"; done

  # 이미 주입되었는지 확인
  if grep -q "shared/light-theme.css" "$file"; then
    return 0
  fi

  # </head> 직전에 삽입
  local css_link="<link rel=\"stylesheet\" href=\"${prefix}shared/light-theme.css\">"
  local i18n_script="<script defer src=\"${prefix}shared/i18n.js\"></script>"
  local diff_script="<script defer src=\"${prefix}shared/difficulty.js\"></script>"

  # macOS sed compatibility
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' -e "s|</head>|  ${css_link}\n  ${i18n_script}\n  ${diff_script}\n</head>|" "$file"
  else
    sed -i -e "s|</head>|  ${css_link}\n  ${i18n_script}\n  ${diff_script}\n</head>|" "$file"
  fi
}

# 모든 about*/index.html 과 chapters/*.html, ch*.html 처리
find "$ROOT" -type d -name "about*" | while read dir; do
  for f in "$dir"/index.html "$dir"/chapters/*.html "$dir"/ch*.html; do
    [ -f "$f" ] && inject_into "$f"
  done
done

# 메인 허브 index도 라이트 처리 (옵션)
# inject_into "$ROOT/index.html"

echo "Done injecting light theme + i18n + difficulty"
