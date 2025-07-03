cd ..
git add .
git commit -m "temporary commit"
git push origin main
cd docker
docker compose up -d --build jenkins