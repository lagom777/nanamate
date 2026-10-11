#!/bin/bash
# 사용: scripts/viz/run-batch.sh <배치이름> <설계서.md>
#  설계서: 단어마다 '## 단어 — 뜻' 절과 n/t/c, 단계별 연출이 적힌 파일 (scripts/viz/specs/*.md). 설계는 사람이(Sonnet), 코드는 Cursor 에이전트가 쓴다.
# 결과는 $VIZ_WORK/<배치>/out/<단어>.svg 에 쌓인다.
set -euo pipefail
NAME="$1"; SPEC="$2"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WORK="${VIZ_WORK:-/tmp/vizwork}/$NAME"
MODEL="${VIZ_MODEL:-grok-4.7-xhigh-fast}"
rm -rf "$WORK"; mkdir -p "$WORK/out"
cp "$ROOT/scripts/viz/GUIDE.md" "$WORK/GUIDE.md"
cp -r "$ROOT/scripts/viz/reference" "$WORK/reference"
cp "$ROOT/scripts/validate-viz.mjs" "$WORK/validate-viz.mjs"
cp "$SPEC" "$WORK/SPEC.md"
cd "$WORK"
PROMPT="너는 영단어장 '그림만 해설' SVG를 코드로 구현하는 개발자다. 설계는 이미 끝났다. 이 폴더의 GUIDE.md(형식·클래스·규칙)를 먼저 읽고 reference/ 의 SVG를 최소 4개 열어 구현 방식을 파악한 뒤, SPEC.md 의 '## 단어' 절을 하나씩 구현해 out/<소문자단어>.svg 를 만들어라.
- 설계(장면 구성, 단계 구성, 단계마다 나타나고 움직이는 것, n/t/c 값)는 SPEC.md 그대로 따라라. 설계를 바꾸거나 요소를 빼고 더하지 마라. 위치·크기·색의 세부는 보기 좋게 다듬어도 된다.
- 설계대로 구현할 수 없는 부분(기술적 한계 등)이 있으면 가장 가까운 방식으로 구현하고 out/NOTES.txt 에 '단어: 무엇을 어떻게 바꿨는지'를 적어라.
- 글자(<text>)는 절대 쓰지 마라. 각 SVG 루트에 data-n / data-t / data-c, viewBox=\"0 0 560 300\", 모든 id는 '<단어>_' 접두사.
- 다 만든 뒤 'node validate-viz.mjs out' 를 실행해 전부 통과할 때까지 고쳐라.
- 이 폴더 밖의 파일은 읽거나 쓰지 마라. 마지막에 만든 단어 목록을 한 줄로 출력해라."
cursor-agent -p --force --trust --model "$MODEL" --workspace "$WORK" "$PROMPT" > "$WORK/agent.log" 2>&1 || echo "agent exit $?" >> "$WORK/agent.log"
echo "done $NAME: $(ls "$WORK/out"/*.svg 2>/dev/null | wc -l) files"
