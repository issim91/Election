rsync -r src/ docs/
rsync build/contracts/* /docs
git add .
git commit -m "Version 1.4 - Edit loader.show() in function castVote"
git push -u origin master