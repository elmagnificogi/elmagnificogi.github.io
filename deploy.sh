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
  # search-index.json is normally created by _plugins/search_index_generator.rb during jekyll build.
  # Node script is a fallback if the plugin did not run:
  if [[ ! -f /usr/share/nginx/html/search-index.json ]] && command -v node >/dev/null 2>&1; then
    node /root/elmagnificogi.github.io/scripts/build-search-index.mjs /usr/share/nginx/html || \
      echo "`date '+%Y%m%d %H:%M'`: WARN search-index.json build failed"
  fi
  if [[ -f /usr/share/nginx/html/search-index.json ]]; then
    echo "`date '+%Y%m%d %H:%M'`: search-index.json ok ($(wc -c < /usr/share/nginx/html/search-index.json) bytes)"
  else
    echo "`date '+%Y%m%d %H:%M'`: ERROR search-index.json missing"
  fi
  echo "`date '+%Y%m%d %H:%M'`: build over (jekyll + pagefind)"
fi