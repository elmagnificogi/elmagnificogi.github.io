#! /bin/bash

result=$(cd /root/elmagnificogi.github.io && git pull origin master | grep "Already up-to-date" )
if [[ "$result" != "" ]]
then
  exit 0
else
  echo "`date '+%Y%m%d %H:%M'`: post update,start build"
  result=$(jekyll build --source /root/elmagnificogi.github.io --destination /usr/share/nginx/html)
  echo $result
  cd /root/elmagnificogi.github.io
  if command -v npm >/dev/null 2>&1; then
    npm install --no-audit --no-fund 2>/dev/null || true
    npx pagefind --site /usr/share/nginx/html
  else
    npx -y pagefind@latest --site /usr/share/nginx/html
  fi
  # Sharded index is created by _plugins/search_index_generator.rb during jekyll build.
  if [[ ! -f /usr/share/nginx/html/search-index/manifest.json ]] && command -v node >/dev/null 2>&1; then
    node /root/elmagnificogi.github.io/scripts/build-search-index.mjs /usr/share/nginx/html || \
      echo "`date '+%Y%m%d %H:%M'`: WARN search-index build failed"
  fi
  if [[ -f /usr/share/nginx/html/search-index/manifest.json ]]; then
    total=0
    for f in /usr/share/nginx/html/search-index/*.json; do
      [[ -f "$f" ]] || continue
      total=$((total + $(wc -c < "$f")))
    done
    echo "`date '+%Y%m%d %H:%M'`: search-index ok ($(ls /usr/share/nginx/html/search-index/*.json 2>/dev/null | wc -l) files, ${total} bytes total)"
  else
    echo "`date '+%Y%m%d %H:%M'`: ERROR search-index/manifest.json missing"
  fi
  echo "`date '+%Y%m%d %H:%M'`: build over (jekyll + pagefind)"
fi
