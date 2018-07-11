rsync -r src/ docs/
rsync build/contracts/* /docs
git add .
git commit -m "Version 1.1"
git push -u origin master