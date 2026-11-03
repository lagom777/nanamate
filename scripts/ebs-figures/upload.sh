#!/usr/bin/env bash
# extract.py 가 만든 폴더를 비공개 R2 버킷 nanamate-ebs 의 <세트>/<과목>/ 로 올린다(공개 주소 없음 — worker/ebs.js 가 주인 계정에만 내준다).
# 병렬은 3까지(429 제한).   scripts/ebs-figures/upload.sh <폴더> <세트: 2027-sutk> <과목: bio1|physics1>
set -euo pipefail
dir=$1 set_=$2 sub=$3
cd "$(dirname "$0")/../.."
export EBS_DIR="$dir" EBS_PREFIX="nanamate-ebs/$set_/$sub"
ls "$dir" | grep -E '^(p[0-9]{3}-[0-9]+\.webp|index\.json)$' | xargs -P 3 -n 1 sh -c '
  f=$1; case $f in *.json) t="application/json; charset=utf-8";; *) t=image/webp;; esac
  for i in 1 2 3; do
    npx wrangler r2 object put "$EBS_PREFIX/$f" --file "$EBS_DIR/$f" --content-type "$t" --remote >/dev/null 2>&1 && exit 0
    sleep 3
  done
  echo "실패: $f" >&2' _
echo "올림: $EBS_PREFIX ($(ls "$dir" | grep -cE '\.(webp|json)$')개)"
