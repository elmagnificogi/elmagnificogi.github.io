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
  if command -v node >/dev/null 2>&1; then
    node /root/elmagnificogi.github.io/scripts/build-search-index.mjs /usr/share/nginx/html
  fi
  echo "`date '+%Y%m%d %H:%M'`: build over (jekyll + pagefind)"
fi