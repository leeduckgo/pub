import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { Input } from '@material-ui/core';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import SimpleMDE from "react-simplemde-editor";

import { useStore } from '../../store';

import Api from '../../api';

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

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>)  => {
    file.title = event.target.value;
    setFile({...file});
  }

  const handleContentChange = (value: string)  => {
    file.content = value;
    setFile({...file});
  }

  React.useEffect(() => {
    Api.getFile(id).then(file => setFile(file)).catch(console.error);
  }, [id]);

  const handleBack = async() => {
    try {
      if (file.title && file.content) {
        await Api.createFile(file);
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
          value={file.title}
          onChange={handleTitleChange}
        />
        
        <SimpleMDE
          value={file.content}
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
