#! /bin/bash

result=$(cd /root/elmagnificogi.github.io && git pull origin master | grep "Already up-to-date" )
if [[ "$result" != "" ]]
then
  exit 0
  #echo "`date '+%Y%m%d %H:%M'`:不需要更新代码"
else
  echo "`date '+%Y%m%d %H:%M'`:代码已经更新,开始build"
  #jekyll build --source /root/elmagnificogi.github.io --destination /usr/share/nginx/html --incremental 
  #ps -ef|grep jekyll | awk '{print $2}'| sed -n '1,1p' | xargs -i kill {}
  #rm -rf /usr/share/nginx/html
  #jekyll serve -H '0.0.0.0' -s '/root/blog' >/dev/null 2>&1 &
fi