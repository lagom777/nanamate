#!/bin/zsh
cd /Users/kg/coding/nanamate/public/learn/suneung-exam
f=$1
SC=/private/tmp/claude-501/-Users-kg-coding-nanamate/54028521-c701-4f1e-8e4f-1c419a017b6f/scratchpad
[ -z "$FORCE" ] && [ "$(curl -s -o /dev/null -w '%{http_code}' "https://pub-920d78ae5be2443d84da6b3e8a54a5af.r2.dev/$f")" = "200" ] && exit 0
for try in 1 2 3 4 5 6; do
  $SC/wr/node_modules/.bin/wrangler r2 object put "nanamate-suneung/$f" --file "$f" --content-type image/webp --cache-control "public, max-age=31536000, immutable" --remote >/dev/null 2>&1 && exit 0
  sleep $((try*8))
done
echo "$f" >> $SC/r2-fail.txt
