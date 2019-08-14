import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { Input } from '@material-ui/core';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import SimpleMDE from "react-simplemde-editor";

import { useStore } from '../../store';

import Api from '../../api';

import "easymde/dist/easymde.min.css";

import './index.scss'

export default observer((props: any) => {
  const store = useStore();

  if (store.user.isFetched && !store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const [title, setTitle] = React.useState('');
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>)  => {
    setTitle(event.target.value)
  }

  const [content, setContent] = React.useState('');
  const handleContentChange = (value: string)  => {
    setContent(value)
  }

  const handleBack = async() => {
    try {
      if (title && content) {
        await Api.createFile({title, content});
      }
      props.history.push('/dashboard');
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-editor flex h-center">
      <div onClick={handleBack}>
        <nav className="p-editor-back flex v-center">
          <NavigateBefore />
          文章
        </nav>
      </div>

      <main className="p-editor-input-area">
        <Input
          autoFocus
          fullWidth
          required
          placeholder="输入标题"
          value={title}
          onChange={handleTitleChange}
        />
        
        <SimpleMDE
          value={content}
          onChange={handleContentChange}
        />
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
