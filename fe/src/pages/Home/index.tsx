import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../store';

export default observer((props: any) => {
  const { userStore } = useStore();

  if (userStore.isFetched) {
    setTimeout(() => {
      props.history.push(userStore.isLogin ? '/dashboard' : '/login');
    }, 0);
  }

  return <div />;
});
