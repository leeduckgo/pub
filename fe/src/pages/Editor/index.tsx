import React from 'react';
import { observer } from 'mobx-react-lite';
import SimpleMDE from 'react-simplemde-editor';
import ButtonProgress from '../../components/ButtonProgress';

import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
  Input,
} from '@material-ui/core';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import { useStore } from '../../store';
import { getQueryObject, IntroHints } from '../../utils';
import Api from '../../api';
import config from './config';

import 'easymde/dist/easymde.min.css';
import './index.scss';

export default observer((props: any) => {
  const store = useStore();

  if (store.user.isFetched && !store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const [file, setFile] = React.useState({ title: '', content: '' });

  let id = getQueryObject().id;

  React.useEffect(() => {
    (async () => {
      try {
        if (id) {
          let file = await Api.getFile(id);
          setFile(file);
        }
      } catch (err) {
        store.snackbar.open(err.message, 2000, 'error');
      }
    })();
  }, [id, store.snackbar]);

  React.useEffect(() => {
    const hints = [
      {
        element: '.CodeMirror-scroll',
        hint: '支持 Markdown 语法',
        hintPosition: 'top-left',
      },
      {
        element: '.preview',
        hint: '点击这里可以预览文章',
        hintPosition: 'middle-middle',
      },
    ];
    IntroHints.init(hints);

    return () => {
      IntroHints.remove();
    };
  });

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    file.title = event.target.value;
    setFile({ ...file });
  };

  const handleContentChange = (value: string) => {
    file.content = value;
    setFile({ ...file });
  };

  const handleBack = async () => {
    props.history.push('/dashboard');
  };

  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    try {
      if (file.title && file.content) {
        setIsSaving(true);
        const res = file.hasOwnProperty('id')
          ? await Api.updateFile(file)
          : await Api.createDraft(file);
        res.hasOwnProperty('updatedFile') ? setFile(res.updatedFile) : setFile(res);
        store.snackbar.open('保存草稿成功', 2000);
      }
    } catch (err) {
      store.snackbar.open(err.message, 2000, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const [isPublishing, setIsPublishing] = React.useState(false);

  const handlePublish = async () => {
    try {
      if (file.title && file.content) {
        setIsPublishing(true);
        id ? await Api.updateFile(file, true) : await Api.createFile(file);
        store.snackbar.open(
          '文章保存成功。上链需要几分钟，完成之后您将收到提醒。文章上链成功之后你可以在聚合站查看文章',
          8000,
        );
        setIsPublishing(false);
        props.history.push('/dashboard');
      }
    } catch (err) {
      setIsPublishing(false);
      store.snackbar.open(err.message, 2000, 'error');
    }
  };

  // dialog
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="p-editor flex h-center po-fade-in">
      <div onClick={handleBack}>
        <nav className="p-editor-back flex v-center link-color">
          <NavigateBefore />
          文章
        </nav>
      </div>

      <div className="p-editor-save">
        <div onClick={handleSave}>
          <nav className="p-editor-save-draft flex v-center">
            保存草稿
            <ButtonProgress isDoing={isSaving} color="blue-button-color" />
          </nav>
        </div>

        <div onClick={handleClickOpen}>
          <nav className="p-editor-save-publish flex v-center">发布上链</nav>
        </div>
      </div>

      <main className="p-editor-input-area">
        <Input
          autoFocus
          fullWidth
          required
          placeholder="文章标题"
          value={file.title}
          onChange={handleTitleChange}
        />

        <SimpleMDE
          className="p-editor-markdown push-top-sm"
          value={file.content}
          onChange={handleContentChange}
          options={config}
        />
      </main>
      <Dialog
        className="publish-dialog"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'文章即将发布...'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            点击确认确定之后，文章将发布到区块链上
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="cancel-publish" onClick={handleClose} color="primary">
            我需要再改一下
          </Button>
          <Button className="confirm-publish" onClick={handlePublish} color="primary" autoFocus>
            确认发布
            <ButtonProgress isDoing={isPublishing} color="blue-button-color" />
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
});
