import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';

import { Button, Menu, MenuItem, Table, TableHead, TableBody, TableRow, TableCell } from '@material-ui/core';

import CreateIcon from '@material-ui/icons/Create';
import KeyboardCapslock from '@material-ui/icons/KeyboardCapslock';

import { useStore } from '../../store';
// import { fontSize } from '@material-ui/system';

export default observer((props: any) => {
  const store = useStore();

  const logout = () => {
    window.location.href = `http://localhost:8090/api/logout?from=http://localhost:4200/login`;
  };

  if (store.user.isFetched && !store.user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  let linkStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 32px',
    color: '#343f44',
    transition: 'none',
    margin: '2px 5px',
    fontWeight: 700,
    borderRadius: '5px',
    background: '#e7ecf3'
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
    <div className="flex">
      <nav className="flex normal column sb" style={{ width: '267px', minHeight: '100vh' }}>
        <section>
          <ul style={{ padding: 0 }}>
            <li style={{ listStyle: 'none', padding: '10px 20px', fontSize: '12px' }}>MANAGE</li>
            <li style={{ listStyle: 'none' }}>
              <Link to='/editor' style={linkStyle}>
                <CreateIcon style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                文章
              </Link>
            </li>
          </ul>
        </section>

        { store.user.isLogin && (
          <Button
            className="flex"
            style={{ boxSizing: 'content-box', height: '36px', padding: '10px 15px 10px 20px', margin: '12px 5px 24px', textTransform: 'none' }}
            aria-controls="dashboard-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <img style={{ borderRadius: '100%', marginRight: '8px', border: '1px solid #d9dfe7' }} src={store.user.avatar} width="34" alt="头像" />
            <div className="flex v-center" style={{ width: '160px', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.user.name}</span>
            </div>
            <div className="flex v-center">
              <KeyboardCapslock style={{ width: '20px', height: '20px' }} />
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

      <main style={{ backgroundColor: '#f2f4f7', width: '150px', height: '100vh', flexGrow: 1 }}>
        <section className="flex v-center sb" style={{ padding: '0 24px', height: '84px' }}>
          <div style={{ fontSize: '28px', fontWeight: 600 }}>文章</div>

          <Link to="/editor">
            <Button variant="outlined" color="primary">创建文章</Button>
          </Link>
        </section>

        <section style={{ padding: '0 24px' }}>
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

  // return (
  //   <div>
  //     <h2>dashboard</h2>
  //     {store.user.isLogin && (
  //       <div>
  //         <img className="push-top" src={store.user.avatar} width="100" alt="头像" />
  //         <div className="push-top">{store.user.name}</div>
  //       </div>
  //     )}
  //     <Link to="/editor">
  //       <Button className="push-top" variant="contained" color="primary">
  //         编辑器
  //       </Button>
  //     </Link>
  //     <br />
  //     <Button className="push-top" variant="contained" color="primary" onClick={logout}>
  //       登出
  //     </Button>
  //   </div>
  // );
});
