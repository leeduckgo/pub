import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { Button, Menu, MenuItem, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

import CreateIcon from '@material-ui/icons/Create';
import KeyboardCapslock from '@material-ui/icons/KeyboardCapslock';

import Api from '../../api';

import { useStore } from '../../store';

import Endpoint from '../../utils/endpoint';

import './index.scss'

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
  
  const [files, setFiles] = React.useState([]);

  React.useEffect(() => {
    Api.getFiles().then(files => setFiles(files));
  }, [files.length]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  const rows = [
    { title: '为什么他们都那么聪明却总是做出错误决策', content: '普通人错过这本书的“踏空成本”无限大……\n没开始在交易市场投资之前，每个人都觉得自己正常得要命……\n开始做投资之后，用不了多久，绝大多数人都会变得垂头丧气，...', update: '8 days ago', author: '李笑来' },
    { title: '为什么他们都那么聪明却总是做出错误决策', content: '普通人错过这本书的“踏空成本”无限大……\n没开始在交易市场投资之前，每个人都觉得自己正常得要命……\n开始做投资之后，用不了多久，绝大多数人都会变得垂头丧气，...', update: '8 days ago', author: '李笑来' },
    { title: '为什么他们都那么聪明却总是做出错误决策', content: '普通人错过这本书的“踏空成本”无限大……\n没开始在交易市场投资之前，每个人都觉得自己正常得要命……\n开始做投资之后，用不了多久，绝大多数人都会变得垂头丧气，...', update: '8 days ago', author: '李笑来' },
    { title: '为什么他们都那么聪明却总是做出错误决策', content: '普通人错过这本书的“踏空成本”无限大……\n没开始在交易市场投资之前，每个人都觉得自己正常得要命……\n开始做投资之后，用不了多久，绝大多数人都会变得垂头丧气，...', update: '8 days ago', author: '李笑来' },
  ];

  return (
    <div className="p-dashboard flex">
      <nav className="p-dashboard-nav flex normal column sb">
        <section>
          <ul className="p-dashboard-nav-ul">
            <li className="p-dashboard-nav-ul-title p-dashboard-nav-li">MANAGE</li>
            <li className="p-dashboard-nav-li">
              {/* <Link className="p-dashboard-link flex v-center po-bold po-radius-5" to='/dashboard'>
                <CreateIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                文章
              </Link> */}
              <div className="p-dashboard-nav-link flex v-center po-bold po-radius-5">
                <CreateIcon className="p-dashboard-nav-li-icon"/>
                文章
              </div>
            </li>
          </ul>
        </section>

        { store.user.isLogin && (
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
              <KeyboardCapslock className="p-dashboard-nav-info-icon" />
            </div>
          </Button>
        )}

        { store.user.isLogin && (
          <Menu
            id="dashboard-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={logout}>Logout</MenuItem>
          </Menu>
        )}
      </nav>

      <main className="p-dashboard-main">
        <section className="p-dashboard-main-head flex v-center sb">
          <div className="p-dashboard-main-head-title">文章</div>

          <Link to="/editor">
            <Button variant="outlined" color="primary">创建文章</Button>
          </Link>
        </section>

        <section className="p-dashboard-main-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>TITLE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>LAST UPDATE</TableCell>
                <TableCell>AUTHORS</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.content}</TableCell>
                    <TableCell>{row.update}</TableCell>
                    <TableCell>{row.author}</TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </section>
      </main>
    </div>
  );
});
