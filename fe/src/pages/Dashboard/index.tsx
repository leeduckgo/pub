import React from 'react';
import { observer } from 'mobx-react-lite';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';

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
  Tooltip,
  MenuList
} from '@material-ui/core';

import CreateIcon from '@material-ui/icons/Create';
import HomeIcon from '@material-ui/icons/Home';
import DeleteIcon from '@material-ui/icons/Delete';
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

  const editFile = (fileId: number) => {
    props.history.push(`/editor?id=${fileId}`);
  };

  const deleteFile = (id: number) => {
    Api.deleteFile(id)
      .then(() => store.files.setFiles(store.files.files.filter((item: any) => +item.id !== id)))
      .catch(console.error);
  };

  const renderPosts = (files: any) => {
    return (
      <section className="p-dashboard-main-table po-mw-1200 po-center">
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
              {files.map((file: any) => (
                <TableRow key={file.id} >
                  <TableCell component="th" scope="row">
                    {file.title}
                  </TableCell>
                  <TableCell>{ago(file.updatedAt)}</TableCell>
                  <TableCell>
                    <Tooltip title={file.status === 'published' ?
                      '文章已显示在聚合站上' : '未上链的文章不会显示在聚合站上' } 
                      placement="right">
                      <span className={ file.status === 'published' ?
                        'published' : 'pending'
                      }>
                        {file.status === 'published' ?
                        '已上链' :
                        '正在上链...' }
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {
                      file.status === 'published' ? 
                      <Button className="edit-button" size="small" variant="contained"
                          onClick={e => { e.stopPropagation();editFile(+file.id) }} 
                        ><CreateIcon/>编辑</Button> : 
                      <Tooltip title="文章上链成功之后，才能编辑" placement="right">
                        <span>
                          <Button className="edit-button" disabled size="small" variant="contained"
                            onClick={e => { e.stopPropagation();editFile(+file.id) }} 
                          ><CreateIcon />编辑</Button>  
                        </span>
                      </Tooltip>
                    }
                    {
                      file.status === 'published' ? 
                      <Tooltip title="查看显示在聚合站上的文章" placement="right">
                        <Button className="redirect-button" size="small" variant="contained"
                            onClick={e => { e.stopPropagation();console.log('去聚合站！');}} 
                        ><HomeIcon />查看文章</Button>
                      </Tooltip> : null
                    }
                      <Button className="delete-button" size="small" variant="contained"
                        onClick={e => { e.stopPropagation();deleteFile(+file.id) }} 
                      ><DeleteIcon />删除</Button>
                  </TableCell>
                </TableRow>
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
    <div className="p-dashboard flex">
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
        <section className="p-dashboard-main-head flex v-center sb po-mw-1200 po-center">
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

        {!isFetched && <Loading isPage={true} />}
        {isFetched && files.length === 0 && renderNoPosts()}
        {isFetched && files.length > 0 && renderPosts(files)}
      </main>
    </div>
  );
});
