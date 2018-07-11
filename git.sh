rsync -r src/ docs/
rsync build/contracts/* /docs
git add .
git commit -m "Version 1.3 - add gasPrice"
git push -u origin master