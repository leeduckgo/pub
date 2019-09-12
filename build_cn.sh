image_name="dh-cn.press.one/pressone/pub"

sudo docker login --username pressone --password 57e348ab37aa5b55f68b7642ac584a41 dh-cn.press.one
sudo docker build -f Dockerfile -t "$image_name" .
sudo docker push "$image_name"