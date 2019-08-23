import React from 'react';
import { observer } from 'mobx-react-lite';

import { Input } from '@material-ui/core';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import SimpleMDE from "react-simplemde-editor";

import { useStore } from '../../store';

import Api from '../../api';

import config from './config';

import { getQueryObject } from '../../utils'

import "easymde/dist/easymde.min.css";

import './index.scss'

export default observer((props: any) => {
  const store = useStore();

  if (store.user.isFetched && !store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const [file, setFile] = React.useState({ title: '', content: '' });

  const id = getQueryObject().id;

  React.useEffect(() => {
    id && Api.getFile(id).then(file => setFile(file)).catch(console.error);
  }, [id]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>)  => {
    file.title = event.target.value;
    setFile({...file});
  }

  const handleContentChange = (value: string)  => {
    file.content = value;
    setFile({...file});
  }

  const handleBack = async () => {
    try {
      if (file.title && file.content) {
        id ? await Api.updateFile(file) : await Api.createFile(file);
        store.snackbar.open('文章发布成功，等待上链，上链成功之后，您就可以在聚合站上查看这篇文章');
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
          placeholder="请输入标题"
          value={file.title}
          onChange={handleTitleChange}
        />
        
        <SimpleMDE
          className="p-editor-markdown"
          value={file.content}
          onChange={handleContentChange}
          options={config}
        />
      </main>
    </div>
  );
});
