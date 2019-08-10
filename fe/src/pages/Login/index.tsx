import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@material-ui/core';
import { useStore } from '../../store';

export default observer((props: any) => {
  const store = useStore();

  const login = () => {
    window.location.href =
      'https://github.com/login/oauth/authorize?client_id=a269deced07c748a3526&redirect_uri=http://localhost:8090/github/oauth/callback';
  };

  if (store.user.isFetched && store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/dashboard');
    }, 0);
  }

  return (
    <Button variant="contained" color="primary" onClick={login}>
      使用 Github 账号登陆
    </Button>
  );
});
