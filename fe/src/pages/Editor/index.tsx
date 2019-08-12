import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

export default observer(() => {
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
