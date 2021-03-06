import { observer } from 'mobx-react-lite';
import io from 'socket.io-client';
import { Endpoint } from '../../utils';
import { useStore } from '../../store';

const log = (event: string, data: any) => {
  if (typeof data === 'string') {
    console.log(`【Socket IO | ${event}】： ${data}`);
  } else {
    console.log(`【Socket IO | ${event}】`);
    console.log(data);
  }
};

export default observer(() => {
  const { userStore, fileStore, snackbarStore } = useStore();
  if (!userStore.isFetched || !userStore.isLogin) {
    return null;
  }
  const socket = io(String(Endpoint.getApi()));
  socket.on('connect', () => {
    log('connect', '连接成功');
    socket.emit('authenticate', userStore.user.id);
  });
  socket.on('authenticate', (data: any) => {
    log('authenticate', data);
  });
  socket.on('file_published', (data: any) => {
    log('file_published', data);
    setTimeout(() => {
      fileStore.updateFile(data);
      snackbarStore.show({
        message: `【${data.title}】已成功发布上链啦`,
        duration: 8000,
        type: 'socket',
        meta: { rId: data.rId },
      });
    }, 1000 * 20);
  });
  socket.on('connect_error', () => {
    console.error('Socket 连接失败, 请检查队列服务是否启动？');
  });
  return null;
});
