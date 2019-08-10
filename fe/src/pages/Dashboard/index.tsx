import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@material-ui/core';
import { useStore } from '../../store';

export default observer(() => {
  const store = useStore();

  const logout = () => {
    window.location.href = `http://localhost:8090/logout?from=http://localhost:4200/login`;
  };

  return (
    <div>
      <h2>dashboard</h2>
      <img className="push-top" src={store.user.avatar} width="100" alt="头像" />
      <div className="push-top">{store.user.name}</div>
      <Button className="push-top" variant="contained" color="primary" onClick={logout}>
        登出
      </Button>
    </div>
  );
});
