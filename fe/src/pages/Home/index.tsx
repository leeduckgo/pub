import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../store';

export default observer((props: any) => {
  const store = useStore();

  if (store.user.isFetched) {
    setTimeout(() => {
      props.history.push(store.user.isLogin ? '/dashboard' : '/login');
    }, 0);
  }

  return <div>首页（不需要用到）</div>;
});
