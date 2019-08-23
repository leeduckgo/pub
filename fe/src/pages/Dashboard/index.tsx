import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

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

import introJs from 'intro.js';
import 'intro.js/introjs.css';

import Api from '../../api';

import { useStore } from '../../store';

import { ago, Endpoint } from '../../utils';

import './index.scss';

export default observer((props: any) => {
  const store = useStore();

  const logout = () => {
    window.location.href = `${Endpoint.getApi()}/api/logout?from=${window.location.origin}/login`;
  };

  if (store.user.isFetched && !store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  React.useEffect(() => {
    (async () => {
      const files = await Api.getFiles();
      store.files.setFiles(files);
      if (files.length === 0) {
        tryShowIntro();
      }
    })();
  }, [store]);

  const tryShowIntro = () => {
    const consumed = localStorage.getItem('INTRO_CONSUMED');
    if (consumed) {
      return;
    }
    introJs()
      .setOption('hintButtonLabel', '我知道了')
      .addHints()
      .onhintclose(() => {
        localStorage.setItem('INTRO_CONSUMED', 'true');
      });
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickTable = (fileId: number) => {
    props.history.push(`/editor?id=${fileId}`);
  };

  const handleDelete = (id: number) => {
    Api.deleteFile(id)
      .then(() => store.files.setFiles(store.files.files.filter((item: any) => +item.id !== id)))
      .catch(console.error);
  };

  return (
    <div className="p-dashboard flex">
      <nav className="p-dashboard-nav flex normal column sb">
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

        {store.user.isLogin && (
          <Button
            className="p-dashboard-nav-button flex"
            aria-controls="dashboard-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <img className="p-dashboard-nav-img" src={store.user.avatar} width="34" alt="头像" />
            <div className="p-dashboard-nav-info flex v-center po-text-14">
              <span className="p-dashboard-nav-info-name">{store.user.name}</span>
            </div>
            <div className="flex v-center">
              <ExpandLess className="p-dashboard-nav-info-icon" />
            </div>
          </Button>
        )}

        {store.user.isLogin && (
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
              <MenuItem dense onClick={logout}>
                登出
              </MenuItem>
            </MenuList>
          </Popover>
        )}
      </nav>

      <main className="p-dashboard-main">
        <section className="p-dashboard-main-head flex v-center sb">
          <div className="p-dashboard-main-head-title">文章</div>

          <Link to="/editor">
            <Button
              className="primary"
              variant="contained"
              color="primary"
              data-hint="点击创建你的第一篇文章，发布到区块链上吧～"
              data-position="bottom-left-aligned"
            >
              创建文章
            </Button>
          </Link>
        </section>

        <section className="p-dashboard-main-table">
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>标题</TableCell>
                  <TableCell>更新时间</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {store.files.files.map((file: any) => (
                  <TableRow
                    hover
                    key={file.id}
                    onClick={() => {
                      handleClickTable(+file.id);
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {file.title}
                    </TableCell>
                    <TableCell>{ago(file.updatedAt)}</TableCell>
                    <TableCell>{file.status}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(+file.id);
                        }}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </section>
      </main>
    </div>
  );
});
