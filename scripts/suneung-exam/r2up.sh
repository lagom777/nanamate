#!/bin/zsh
# usage: r2up.sh <회차/과목/파일> — ROOT(기본: 메인 저장소 suneung-exam) 아래 그 파일을 R2 nanamate-suneung 같은 경로로 올린다(문항 webp · 영어 듣기 mp3)
cd ${ROOT:-/Users/kg/coding/nanamate/public/learn/suneung-exam}
f=$1
SC=/private/tmp/claude-501/-Users-kg-coding-nanamate/54028521-c701-4f1e-8e4f-1c419a017b6f/scratchpad
WR=${WR:-$SC/wr/node_modules/.bin/wrangler}
ct=image/webp; [[ $f == *.mp3 ]] && ct=audio/mpeg
[ -z "$FORCE" ] && [ "$(curl -s -o /dev/null -w '%{http_code}' "https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/$f")" = "200" ] && exit 0
for try in 1 2 3 4 5 6; do
  ${=WR} r2 object put "nanamate-suneung/$f" --file "$f" --content-type $ct --cache-control "public, max-age=31536000, immutable" --remote >/dev/null 2>&1 && exit 0
  sleep $((try*8))
done
echo "$f" >> $SC/r2-fail.txt
