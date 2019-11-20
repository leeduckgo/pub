import React from 'react';
import { observer } from 'mobx-react-lite';
import SimpleMDE from 'react-simplemde-editor';
import ButtonProgress from 'components/ButtonProgress';
import Loading from 'components/Loading';
import ConfirmDialog from 'components/ConfirmDialog';
import Help from '@material-ui/icons/Help';
import { getMarkdownCheatSheet } from './MarkdownCheatSheet';

import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogActions,
  DialogTitle,
  Input,
} from '@material-ui/core';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import { useStore } from 'store';
import { getQueryObject, IntroHints, sleep } from 'utils';
import Api from 'api';
import config from './config';

import 'easymde/dist/easymde.min.css';
import './index.scss';

const MAX_CONTENT_LENGTH = 20000;

interface File {
  title: string;
  content: string;
  status?: string;
  id?: number;
}

export default observer((props: any) => {
  const { userStore, fileStore, snackbarStore } = useStore();

  if (userStore.isFetched && !userStore.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const [file, setFile] = React.useState({ title: '', content: '' } as File);
  const [isFetching, setIsFetching] = React.useState(true);
  const [showMdCheatSheet, setShowMdCheatSheet] = React.useState(false);

  let id = getQueryObject().id;

  React.useEffect(() => {
    (async () => {
      try {
        if (id) {
          let file = await Api.getFile(id);
          setFile(file);
        }
      } catch (err) {}
      await sleep(1000);
      setIsFetching(false);
    })();
  }, [id, snackbarStore]);

  React.useEffect(() => {
    const hints = [
      {
        element: '.md-ref',
        hint: '支持 Markdown 语法',
        hintPosition: 'middle-middle',
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
        if (file.content.length > MAX_CONTENT_LENGTH) {
          snackbarStore.show({
            message: '内容最多 2 万字',
            type: 'error',
          });
          return;
        }
        setIsSaving(true);
        let param: File = {
          title: file.title,
          content: file.content,
        };
        const isUpdating = file.hasOwnProperty('id');
        if (isUpdating) {
          const res = await Api.updateFile(file.id, param);
          setFile(res.updatedFile);
          fileStore.updateFile(res.updatedFile);
        } else {
          const res = await Api.createDraft(param);
          setFile(res);
          fileStore.addFile(res);
        }
      } else {
        if (file.title)
          snackbarStore.show({
            message: '内容不能为空',
            type: 'error',
          });
        else
          snackbarStore.show({
            message: '标题不能为空',
            type: 'error',
          });
      }
    } catch (err) {
      snackbarStore.show({
        message: err.message || '保存草稿失败，请稍后重试',
        type: 'error',
      });
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
        const isUpdating = file.hasOwnProperty('id');
        if (isUpdating) {
          const res = await Api.updateFile(file.id, param, file.status === 'draft');
          fileStore.updateFile(res.updatedFile);
        } else {
          const res = await Api.createFile(param);
          fileStore.addFile(res);
        }
        snackbarStore.show({
          message: '文章保存成功。上链需要几分钟，完成之后您将收到提醒',
          duration: 8000,
        });
        setIsPublishing(false);
        props.history.push('/dashboard');
      } else {
        if (file.title)
          snackbarStore.show({
            message: '内容不能为空',
            type: 'error',
          });
        else
          snackbarStore.show({
            message: '标题不能为空',
            type: 'error',
          });
      }
    } catch (err) {
      setIsPublishing(false);
      snackbarStore.show({
        message: err.message || '保存草稿失败，请稍后重试',
        type: 'error',
      });
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

  const openMdCheatSheet = () => {
    setShowMdCheatSheet(true);
  };

  const closeMdCheatSheet = () => {
    setShowMdCheatSheet(false);
  };

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
            inputProps={{
              maxLength: 30,
            }}
          />

          <SimpleMDE
            className="p-editor-markdown push-top-sm"
            value={file.content}
            onChange={handleContentChange}
            options={config}
          />

          <div className="flex sb">
            <div></div>
            <div
              className="md-ref flex v-center push-top-sm help-color po-cp"
              onClick={openMdCheatSheet}
            >
              <div className="po-text-18 flex">
                <Help className="push-right-xs" />
              </div>
              Markdown 语法参考
            </div>
          </div>

          <ConfirmDialog
            open={showMdCheatSheet}
            content={getMarkdownCheatSheet()}
            okText="关闭"
            cancel={closeMdCheatSheet}
            ok={closeMdCheatSheet}
          />
        </main>
      </div>
    );
  };

  const isPublished = file.status === 'published';

  return (
    <div className="p-editor flex h-center po-fade-in">
      <div onClick={handleBack}>
        <nav className="p-editor-back flex v-center link-color">
          <NavigateBefore />
          文章
        </nav>
      </div>

      <div className="p-editor-save">
        {!isPublished && (
          <div onClick={handleSave}>
            <nav className="p-editor-save-draft flex v-center push-right">
              保存草稿
              <ButtonProgress isDoing={isSaving} isDone={!isSaving} color="link-color" />
            </nav>
          </div>
        )}

        <div onClick={handleClickOpen}>
          <nav className="p-editor-save-publish flex v-center">发布上链</nav>
        </div>
      </div>

      {isFetching && (
        <div className="h-screen flex justify-center items-center">
          <Loading size={40} />
        </div>
      )}

      {!isFetching && renderEditor()}

      <Dialog
        className="publish-dialog"
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <div className="pt-1 text-center">发布上链</div>
        </DialogTitle>
        <DialogContent>
          <div className="px-4 text-center">
            <DialogContentText id="alert-dialog-description">
              <div className="text-sm text-gray-600">点击确认发布之后，文章将发布到区块链上</div>
              <div className="text-gray-500 mt-2 po-text-12">
                （重要：发布之前请先阅读一下
                <a
                  target="_blank"
                  className="po-bold text-blue-400"
                  href="https://xue-posts.press.one/posts/2517ef4198d224d4396e98df12c86a5af117a84275f1d69e4ab471fb8384f220"
                >
                  发布规则
                </a>
                ）
              </div>
            </DialogContentText>
          </div>
        </DialogContent>
        <DialogActions>
          <div className="cancel-publish link-color push-right po-cp" onClick={handleClose}>
            我需要再改一下
          </div>
          <div className="confirm-publish flex v-center" onClick={handlePublish}>
            确认发布
            <ButtonProgress isDoing={isPublishing} color="white-color" />
          </div>
        </DialogActions>
        <div className="pb-2"></div>
      </Dialog>
    </div>
  );
});
