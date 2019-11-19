cd /pressone/pub
git reset --hard HEAD
git pull
git checkout release
git clean -f -d
git pull

cd fe
yarn install
yarn build
cd /pressone/pub

IMAGE_NAME="dh-cn.press.one/pressone/pub"

sudo docker login --username pressone --password 57e348ab37aa5b55f68b7642ac584a41 dh-cn.press.one
sudo docker build -t $IMAGE_NAME .
sudo docker push $IMAGE_NAME
