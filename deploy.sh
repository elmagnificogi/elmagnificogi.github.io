#! /bin/bash

result=$(cd /root/elmagnificogi.github.io && git pull origin master | grep "Already up-to-date" )
if [[ "$result" != "" ]]
then
  exit 0
  #echo "`date '+%Y%m%d %H:%M'`:不需要更新代码"
else
  echo "`date '+%Y%m%d %H:%M'`: post update,start build"
  jekyll build --source /root/myblog --destination /home/wwwroot/example.com --incremental
  echo "`date '+%Y%m%d %H:%M'`: build over"
  #rm -rf /usr/share/nginx/html
fi