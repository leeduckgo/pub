import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { Button, Menu, MenuItem, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

import CreateIcon from '@material-ui/icons/Create';
import ExpandLess from '@material-ui/icons/ExpandLess';

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
    Api.getFiles().then(files => setFiles(files)).catch(console.error);
    console.log(files);
  }, [files.length]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleClickTable(fileId: number | string) {
    props.history.push(`/editor?id=${fileId}`);
  }

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
              <ExpandLess className="p-dashboard-nav-info-icon" />
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
            <Button className="p-dashboard-main-button">创建文章</Button>
          </Link>
        </section>

        <section className="p-dashboard-main-table">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>TITLE</TableCell>
                <TableCell>content</TableCell>
                <TableCell>LAST UPDATE</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {
                files.map((file: any) => (
                  <TableRow key={file.id} onClick={() => { handleClickTable(file.id) }}>
                    <TableCell>{file.title}</TableCell>
                    <TableCell>{file.content}</TableCell>
                    <TableCell>{file.updatedAt}</TableCell>
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
