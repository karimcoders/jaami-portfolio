#!/bin/bash
# Download all assets from Canva site to public folder
BASE="https://hritiksainiportfolio.my.canva.site/jaamiwork/_assets"
OUT="/home/z/my-project/public/assets"
mkdir -p "$OUT/videos" "$OUT/media"

VIDEOS=(
  "28a9550f027ae4907d50614ee1a63dd0"
  "a754d57b8d4b4f8065b5b770a2f7988d"
  "8a7f4bf28d95eb91e37d382f64f73dc7"
  "7e424dbb85d4062d2d193ccad46ce02b"
  "5e2f439b00ee413bdc706934521101e8"
  "dd7238cd0dd3af26103c057b3bf4592e"
  "251983a99cbb16722b8d8f215b0bbad3"
  "ce5ca29959652277b05e7e3e5cbfd304"
  "cc5b94bf3c74d7259afd94edd7dec6de"
  "656a48b97728184860a831b2e62a93ed"
  "50d1319a0d49143cef8f729920fa9c2a"
  "41076219abd4b2523398ea7c8423ba6b"
  "f9bada584a07175b043cceeb9a5eab73"
  "f84967516ffc7e2ed7719d7fe3984c59"
)

MEDIA=(
  "aabd43f4a629a999c77dde1681c06808.png"
  "37c8e0687c6dbdca51de982f892e0df0.png"
  "95cac10af42d51fea008a82099e325f2.png"
)

for v in "${VIDEOS[@]}"; do
  if [ ! -f "$OUT/videos/$v.mp4" ]; then
    curl -sL --retry 2 -o "$OUT/videos/$v.mp4" "$BASE/video/$v.mp4" &
  fi
done

for m in "${MEDIA[@]}"; do
  if [ ! -f "$OUT/media/$m" ]; then
    curl -sL --retry 2 -o "$OUT/media/$m" "$BASE/media/$m" &
  fi
done

wait
echo "=== Downloaded files ==="
du -sh "$OUT/videos" "$OUT/media"
ls -la "$OUT/videos" | head -20
ls -la "$OUT/media"
