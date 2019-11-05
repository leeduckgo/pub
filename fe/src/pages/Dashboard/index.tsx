import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import AccountBalanceWallet from '@material-ui/icons/AccountBalanceWallet';
import ExitToApp from '@material-ui/icons/ExitToApp';

import {
  Button,
  MenuItem,
  Paper,
  Popover,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuList,
} from '@material-ui/core';

import CreateIcon from '@material-ui/icons/Create';
import ExpandLess from '@material-ui/icons/ExpandLess';

import Api from '../../api';

import { useStore } from '../../store';

import { Endpoint, IntroHints } from '../../utils';

import PostEntry from './postEntry';

import './index.scss';

export default observer((props: any) => {
  const store = useStore();
  const { user } = store;

  const logout = () => {
    window.location.href = `${Endpoint.getApi()}/api/logout?from=${window.location.origin}/login`;
  };

  if (user.isFetched && !user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderPosts = (files: any) => {
    return (
      <section className="p-dashboard-main-table po-mw-1200 po-center">
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
    <div className="p-dashboard flex po-fade-in">
      <nav className="p-dashboard-nav flex normal column sb po-b-br po-b-black-10">
        <section>
          <ul className="p-dashboard-nav-ul">
            <li className="p-dashboard-nav-ul-title p-dashboard-nav-li">管理</li>
            <li className="p-dashboard-nav-li">
              <div className="p-dashboard-nav-link flex v-center po-bold po-radius-5">
                <CreateIcon className="p-dashboard-nav-li-icon" />
                文章
              </div>
            </li>
          </ul>
        </section>

        {user.isLogin && (
          <Button
            className="p-dashboard-nav-button flex"
            aria-controls="dashboard-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <img className="p-dashboard-nav-img" src={user.avatar} width="34" alt="头像" />
            <div className="p-dashboard-nav-info flex v-center po-text-14">
              <span className="p-dashboard-nav-info-name dark-color">{user.name}</span>
            </div>
            <div className="flex v-center">
              <ExpandLess className="p-dashboard-nav-info-icon dark-color" />
            </div>
          </Button>
        )}

        {user.isLogin && (
          <Popover
            id="dashboard-menu"
            className="p-dashboard-popover"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
          >
            <MenuList>
              <MenuItem onClick={logout}>
                <div className="py-2 flex items-center text-lg text-gray-700">
                  <AccountBalanceWallet />
                  <span className="text-sm ml-1">钱包</span>
                </div>
              </MenuItem>
              <MenuItem onClick={logout}>
                <div className="py-2 flex items-center text-lg text-gray-700">
                  <ExitToApp />
                  <span className="text-sm ml-1">登出</span>
                </div>
              </MenuItem>
            </MenuList>
          </Popover>
        )}
      </nav>

      <main className="p-dashboard-main">
        <section className="p-dashboard-main-head flex v-center sb po-mw-1200 po-center">
          <div className="p-dashboard-main-head-title">文章</div>

          <Link to="/editor">
            <Button className="primary create-btn" variant="contained">
              创建文章
            </Button>
          </Link>
        </section>

        {!isFetched && <Loading isPage={true} />}
        {isFetched && files.length === 0 && renderNoPosts()}
        {isFetched && files.length > 0 && renderPosts(files)}
      </main>
    </div>
  );
});
