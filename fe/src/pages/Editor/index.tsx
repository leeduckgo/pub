import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { Input } from '@material-ui/core';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import SimpleMDE from "react-simplemde-editor";

import { useStore } from '../../store';

import "easymde/dist/easymde.min.css";

import './index.scss'

export default observer((props: any) => {
  const store = useStore();

  if (store.user.isFetched && !store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  return (
    <div className="p-editor flex h-center">
      <Link to="/dashboard">
        <nav className="p-editor-back flex v-center">
          <NavigateBefore />
          文章
        </nav>
      </Link>

      <main className="p-editor-input-area">
        <Input
          autoFocus
          fullWidth
          required
          disableUnderline
          placeholder="输入标题" />
        
        <SimpleMDE></SimpleMDE>
      </main>
    </div>
  );

  // return (
  //   <div>
  //     <div>编辑器</div>
  //     <Link to="/dashboard">
  //       <Button className="push-top" variant="contained" color="primary">
  //         返回 Dashboard
  //       </Button>
  //     </Link>
  //   </div>
  // );
});
