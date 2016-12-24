export http_proxy="127.0.0.1:1080" 
export https_proxy="127.0.0.1:1080"
git add .;
git commit -m "update-post";
git remote rm origin;
git remote add origin https://github.com/elmagnificogi/huxblog-boilerplate1;
git push -u origin master