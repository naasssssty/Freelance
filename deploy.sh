#!/bin/bash

# Μετακίνηση στον φάκελο docker
cd ~/Desktop/hua/Freelance/docker

# Τερματισμός και αφαίρεση των containers
docker compose down

# Δημιουργία και εκκίνηση των containers
docker compose up -d --build

# Επιστροφή στον γονικό φάκελο
cd ..

# Git εντολές
git add .
git commit -m "σχολιο"
git push -u origin A