import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Tooltip } from '@material-ui/core';
import Mood from '@material-ui/icons/Mood';
import ButtonProgress from '../../components/ButtonProgress';
import { useStore } from '../../store';

import './index.scss';

export default observer((props: any) => {
  const store = useStore();
  const [loading, setLoading] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);

  const login = () => {
    setLoading(true);
    const { REACT_APP_GITHUB_CALLBACK, REACT_APP_GITHUB_CLIENT_ID } = process.env;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${REACT_APP_GITHUB_CLIENT_ID}&redirect_uri=${REACT_APP_GITHUB_CALLBACK}`;
  };

  if (store.user.isFetched && store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/dashboard');
    }, 0);
  } else {
    setTimeout(() => {
      setShowTooltip(true);
    }, 2000);
  }

  return (
    <div className="login bg flex v-center h-center">
      <div className="flex column v-center h-center">
        <div className="text-center po-text-50 link-color">
          <Tooltip open={showTooltip} placement="top" title={'西乔，给我设计个 logo 吧～'}>
            <Mood />
          </Tooltip>
        </div>
        <Button className="push-top primary" variant="contained" color="primary" onClick={login}>
          使用 GitHub 账号登陆
          <ButtonProgress isDoing={loading} />
        </Button>
      </div>
    </div>
  );
});
