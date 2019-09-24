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
  const { user, files, snackbar } = useStore();
  if (!user.isFetched || !user.isLogin) {
    return null;
  }
  const socket = io(String(Endpoint.getApi()));
  socket.on('connect', () => {
    log('connect', '连接成功');
    socket.emit('authenticate', user.id);
  });
  socket.on('authenticate', (data: any) => {
    log('authenticate', data);
  });
  socket.on('file_published', (data: any) => {
    log('file_published', data);
    setTimeout(() => {
      files.updateFile(data);
      snackbar.open(
        `【${data.title}】已成功发布上链啦，您现在可以在聚合站查看这篇文章`,
        8000,
        'socket',
        { rId: data.rId },
      );
    }, 1000 * 90);
  });
  socket.on('connect_error', () => {
    console.error('Socket 连接失败, 请检查队列服务是否启动？');
  });
  return null;
});
