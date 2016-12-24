unset http_proxy;
unset https_proxy;
git add .;
git commit -m "update-post";
git remote rm origin;
git remote add origin https://github.com/elmagnificogi/http://elmagnificogi.github.io;
git push -u origin master