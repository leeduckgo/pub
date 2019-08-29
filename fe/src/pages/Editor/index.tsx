import React from 'react';
import { observer } from 'mobx-react-lite';
import SimpleMDE from 'react-simplemde-editor';
import ButtonProgress from '../../components/ButtonProgress';
import Loading from '../../components/Loading';

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
import { getQueryObject, IntroHints, sleep } from '../../utils';
import Api from '../../api';
import config from './config';

import 'easymde/dist/easymde.min.css';
import './index.scss';

interface File {
  title: string;
  content: string;
  status?: string;
  id?: number;
}

export default observer((props: any) => {
  const store = useStore();

  if (store.user.isFetched && !store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const [file, setFile] = React.useState({ title: '', content: '' } as File);
  const [isFetching, setIsFetching] = React.useState(true);

  let id = getQueryObject().id;

  React.useEffect(() => {
    (async () => {
      try {
        if (id) {
          let file = await Api.getFile(id);
          setFile(file);
        }
      } catch (err) {
        store.snackbar.open('获取内容失败', 2000, 'error');
      }
      await sleep(1000);
      setIsFetching(false);
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
        let param: File = {
          title: file.title,
          content: file.content,
        };
        const res = file.hasOwnProperty('id')
          ? await Api.updateFile(file.id, param)
          : await Api.createDraft(param);
        res.hasOwnProperty('updatedFile') ? setFile(res.updatedFile) : setFile(res);
      }
    } catch (err) {
      store.snackbar.open(
        err.status === 409
          ? '已经存在相同内容的草稿，请再修改一下内容'
          : '保存草稿失败，请稍后重试',
        2000,
        'error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const [isPublishing, setIsPublishing] = React.useState(false);

  const handlePublish = async () => {
    try {
      if (file.title && file.content) {
        setIsPublishing(true);
        let param: File = {
          title: file.title,
          content: file.content,
        };
        file.id
          ? await Api.updateFile(file.id, param, file.status === 'draft')
          : await Api.createFile(param);
        store.snackbar.open(
          '文章保存成功。上链需要几分钟，完成之后您将收到提醒。文章上链成功之后你可以在聚合站查看文章',
          8000,
        );
        setIsPublishing(false);
        props.history.push('/dashboard');
      }
    } catch (err) {
      setIsPublishing(false);
      store.snackbar.open(
        err.status === 409
          ? '已经存在相同内容的文章，请再修改一下内容'
          : '文章发布失败，请稍后重试',
        2000,
        'error',
      );
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

  // previewIcon
  React.useEffect(() => {
    let button = document.getElementsByClassName('preview');
    if (button[0]) button[0].setAttribute('title', '预览 (Cmd-P)');
  });

  const renderEditor = () => {
    return (
      <div>
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
      </div>
    );
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
            <ButtonProgress isDoing={isSaving} isDone={!isSaving} color="blue-color" />
          </nav>
        </div>

        <div onClick={handleClickOpen}>
          <nav className="p-editor-save-publish flex v-center">发布上链</nav>
        </div>
      </div>

      {isFetching && <Loading isPage={true} />}

      {!isFetching && renderEditor()}

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
            <div className="po-text-16">点击确认发布之后，文章将发布到区块链上</div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button className="cancel-publish" onClick={handleClose} color="primary">
            我需要再改一下
          </Button>
          <Button className="confirm-publish" onClick={handlePublish} color="primary" autoFocus>
            确认发布
            <ButtonProgress isDoing={isPublishing} color="blue-color" />
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
});
