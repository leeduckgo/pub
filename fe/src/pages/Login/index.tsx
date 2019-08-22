import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@material-ui/core';
import { useStore } from '../../store';

export default observer((props: any) => {
  const store = useStore();

  const login = () => {
    const { REACT_APP_GITHUB_CALLBACK, REACT_APP_GITHUB_CLIENT_ID } = process.env;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${REACT_APP_GITHUB_CLIENT_ID}&redirect_uri=${REACT_APP_GITHUB_CALLBACK}`;
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
