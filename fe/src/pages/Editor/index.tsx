import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';

export default observer((props: any) => {
  const store = useStore();

  if (store.user.isFetched && !store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  return (
    <div>
      <div>编辑器</div>
      <Link to="/dashboard">
        <Button className="push-top" variant="contained" color="primary">
          返回 Dashboard
        </Button>
      </Link>
    </div>
  );
});
