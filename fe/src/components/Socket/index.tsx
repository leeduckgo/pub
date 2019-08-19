import { observer } from 'mobx-react-lite';
import io from 'socket.io-client';
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
  const { user } = useStore();
  if (!user.isFetched || !user.isLogin) {
    return null;
  }
  const { REACT_APP_SOCKET_ENDPOINT } = process.env;
  const socket = io(String(REACT_APP_SOCKET_ENDPOINT));
  socket.on('connect', () => {
    log('connect', '连接成功');
    socket.emit('authenticate', user.id);
  });
  socket.on('authenticate', (data: any) => {
    log('authenticate', data);
  });
  socket.on('file_published', (data: any) => {
    log('file_published', data);
  });
  socket.on('connect_error', () => {
    console.error('Socket 连接失败, 请检查队列服务是否启动？');
  });
  return null;
});