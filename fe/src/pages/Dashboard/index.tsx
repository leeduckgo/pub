import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { RouteChildrenProps } from 'react-router';
import { Link } from 'react-router-dom';
import Loading from 'components/Loading';

import { Button, Paper, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

import { pressOneLinkRegexp, wechatLinkRegexp } from '../../utils/import';
import PostImportDialog from '../../components/PostImportDialog';

import Api from '../../api';
import { useStore } from '../../store';

import { IntroHints, sleep } from '../../utils';

import PostEntry from './postEntry';

import './index.scss';

const useImportDialog = (props: any) => {
  const store = useStore();
  const { snackbarStore, fileStore } = store;
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importDialogLoading, setImportDialogLoading] = useState(false);
  const handleOpenImportDialog = () => setImportDialogVisible(true);
  const handleImportDialogClose = () => {
    if (!importDialogLoading) {
      setImportDialogVisible(false);
    }
  };
  const handleImportDialogConfirm = (url: string) => {
    const validUrl = [pressOneLinkRegexp.test(url), wechatLinkRegexp.test(url)].some(Boolean);
    if (!validUrl) {
      snackbarStore.show({
        message: '请输入正确的文章地址',
        type: 'error',
      });
      return;
    }

    setImportDialogLoading(true);
    Api.importArticle(url)
      .then(
        file => {
          fileStore.addFile(file);
          setTimeout(() => {
            props.history.push(`/editor?id=${file.id}`);
          });
        },
        err => {
          let message = '导入失败';
          if (err.message === 'url is invalid') {
            message = '请输入有效的文章地址';
          }
          snackbarStore.show({
            message,
            type: 'error',
          });
        },
      )
      .finally(() => {
        setImportDialogLoading(false);
      });
  };

  return {
    importDialogVisible,
    importDialogLoading,
    handleOpenImportDialog,
    handleImportDialogClose,
    handleImportDialogConfirm,
  };
};

export default observer((props: RouteChildrenProps) => {
  const { fileStore, settingsStore } = useStore();

  const {
    importDialogVisible,
    importDialogLoading,
    handleOpenImportDialog,
    handleImportDialogClose,
    handleImportDialogConfirm,
  } = useImportDialog(props);

  React.useEffect(() => {
    (async () => {
      try {
        if (!fileStore.isFetched) {
          const files = await Api.getFiles();
          await sleep(1000);
          fileStore.setFiles(files);
        }
        const hints: any = [
          {
            element: '.import-btn',
            hint: '一键导入微信、PRESSone文章',
            hintPosition: 'top-left',
          },
          {
            element: '.p-manage-layout-nav-button',
            hint:
              '读者对你文章的打赏，会收集在钱包中。打开菜单，点击钱包，就可以查看你的写作收入哦',
            hintPosition: 'top-middle',
          },
        ];
        if (fileStore.files.length === 0) {
          hints.push({
            element: '.create-btn',
            hint: '点击创建你的第一篇文章，发布到区块链上吧～',
            hintPosition: 'top-left',
          });
        }
        IntroHints.init(hints);
      } catch (err) {}
    })();

    return () => {
      IntroHints.remove();
    };
  }, [fileStore]);

  const renderPosts = (files: any) => {
    return (
      <section className="p-dashboard-main-table ex-mw-1200">
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>标题</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>更新时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {files.map((file: any, idx: number) => (
                <PostEntry file={file} history={props.history} key={idx} idx={idx} />
              ))}
            </TableBody>
          </Table>
        </Paper>
      </section>
    );
  };

  const renderNoPosts = () => {
    return <div className="mt-56 text-center gray-color text-base">暂无文章</div>;
  };

  const { isFetched, files } = fileStore;
  const { settings } = settingsStore;

  return (
    <div className="p-dashboard-main ex-mw-1200">
      <section className="p-dashboard-main-head flex items-center justify-between">
        <div className="p-dashboard-main-head-title">文章</div>

        <div className="p-dashboard-main-right">
          {settings['import.enabled'] && (
            <Button onClick={handleOpenImportDialog} className="import-btn" variant="contained">
              一键导入文章
            </Button>
          )}

          <Link to="/editor">
            <Button className="primary create-btn" variant="contained">
              创建文章
            </Button>
          </Link>
        </div>
      </section>

      {!isFetched && (
        <div className="mt-64">
          <Loading />
        </div>
      )}
      {isFetched && files.length === 0 && renderNoPosts()}
      {isFetched && files.length > 0 && renderPosts(files)}

      <PostImportDialog
        loading={importDialogLoading}
        open={importDialogVisible}
        cancel={handleImportDialogClose}
        ok={handleImportDialogConfirm}
      />
    </div>
  );
});
