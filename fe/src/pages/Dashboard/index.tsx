import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { RouteChildrenProps } from 'react-router';
import { Link } from 'react-router-dom';
import {
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@material-ui/core';

import { pressOneLinkRegexp, wechatLinkRegexp } from '../../utils/import';
import Loading from '../../components/Loading';
import PostImportDialog from '../../components/PostImportDialog';

import Api from '../../api';
import { useStore } from '../../store';
import { IntroHints } from '../../utils';

import PostEntry from './postEntry';

import './index.scss';

const useImportDialog = (props: RouteChildrenProps) => {
  const store = useStore();
  const [importDialogVisible, setImportDialogVisible] = useState(false);
  const [importDialogLoading, setImportDialogLoading] = useState(false);
  const handleOpenImportDialog = () => setImportDialogVisible(true);
  const handleImportDialogClose = () => {
    if (!importDialogLoading) {
      setImportDialogVisible(false)
    }
  }
  const handleImportDialogConfirm = (url: string) => {
    const validUrl = [
      pressOneLinkRegexp.test(url),
      wechatLinkRegexp.test(url),
    ].some(Boolean)
    if (!validUrl) {
      store.snackbar.open('请输入正确的文章地址', 2000, 'error');
      return
    }

    setImportDialogLoading(true)
    Api.importArticle(url).then((file) => {
      store.files.addFile(file)
      setTimeout(() => {
        props.history.push(`/editor?id=${file.id}`);
      })
    }, (err) => {
      let message = '导入失败'
      if (err.message === 'url is invalid') {
        message = '请输入有效的文章地址'
      }
      store.snackbar.open(message, 2000, 'error');
    }).finally(() => {
      setImportDialogLoading(false)
    })
  }

  return {
    importDialogVisible,
    importDialogLoading,
    handleOpenImportDialog,
    handleImportDialogClose,
    handleImportDialogConfirm,
  }
}

export default observer((props: RouteChildrenProps) => {
  const store = useStore();

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
        if (!store.files.isFetched) {
          const files = await Api.getFiles();
          store.files.setFiles(files);
        }
        const hints: any = [
          {
            element: '.intercom-launcher-frame',
            hint:
              '如果遇到了问题，随时可以发送消息给我们，我们将尽快协助您解决问题。我们非常也欢迎你反馈一些改进产品的意见（吐槽也可以😜）',
            hintPosition: 'top-left',
          },
        ];
        if (store.files.files.length === 0) {
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
  }, [store]);

  const renderPosts = (files: any) => {
    return (
      <section className="p-dashboard-main-table po-mw-1200">
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
    return <div className="po-push-page-middle text-center gray-color po-text-16">暂无文章</div>;
  };

  const { isFetched, files } = store.files;

  return (
    <div className="p-dashboard-main po-mw-1200">
      <section className="p-dashboard-main-head flex v-center sb">
        <div className="p-dashboard-main-head-title">文章</div>

        <div className="p-dashboard-main-right">
          <Button
            onClick={handleOpenImportDialog}
            className="primary import-btn"
            variant="contained">
            一键导入文章
          </Button>

          <Link to="/editor">
            <Button className="primary create-btn" variant="contained">
              创建文章
            </Button>
          </Link>
        </div>
      </section>

      {!isFetched && <Loading isPage={true} />}
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
