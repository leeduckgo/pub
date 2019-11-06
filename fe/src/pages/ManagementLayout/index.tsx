import React from 'react';
import { observer } from 'mobx-react-lite';
import { RouteChildrenProps, Route } from 'react-router';

import {
  Button,
  MenuItem,
  Popover,
  MenuList,
} from '@material-ui/core';

import AssignmentIcon from '@material-ui/icons/Assignment';
import CreateIcon from '@material-ui/icons/Create';
import ExpandLess from '@material-ui/icons/ExpandLess';
import classNames from 'classnames';

import Api from '../../api';

import { useStore } from '../../store';

import { Endpoint, IntroHints } from '../../utils';

import './index.scss';
import Dashboard from '../Dashboard';
import Topic from '../Topic';

export default observer((props: RouteChildrenProps) => {
  const store = useStore();
  const { user } = store;

  if (user.isFetched && !user.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const logout = () => {
    window.location.href = `${Endpoint.getApi()}/api/logout?from=${window.location.origin}/login`;
  };

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

  const navList = [
    {
      text: '文章',
      icon: CreateIcon,
      path: '/dashboard',
      show: true,
    },
    {
      text: '权限管理',
      icon: AssignmentIcon,
      path: '/topic',
      show: user.isTopicOwner,
    },
  ]

  return (
    <div className="p-manage-layout flex po-fade-in">
      <nav className="p-manage-layout-nav flex normal column sb po-b-br po-b-black-10">
        <section>
          <ul className="p-manage-layout-nav-ul">
            <li className="p-manage-layout-nav-ul-title p-manage-layout-nav-li">管理</li>
            {navList.filter(v => v.show).map((item) => (
              <li key={item.text} className="p-manage-layout-nav-li">
                <div
                  onClick={() => props.history.push(item.path)}
                  className={classNames({
                    'p-manage-layout-nav-link flex v-center po-bold po-radius-5': true,
                    active: props.location.pathname === item.path
                  })}>
                  <item.icon className="p-manage-layout-nav-li-icon" />
                  {item.text}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {user.isLogin && (
          <Button
            className="p-manage-layout-nav-button flex"
            aria-controls="dashboard-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <img className="p-manage-layout-nav-img" src={user.avatar} width="34" alt="头像" />
            <div className="p-manage-layout-nav-info flex v-center po-text-14">
              <span className="p-manage-layout-nav-info-name dark-color">{user.name}</span>
            </div>
            <div className="flex v-center">
              <ExpandLess className="p-manage-layout-nav-info-icon dark-color" />
            </div>
          </Button>
        )}

        {user.isLogin && (
          <Popover
            id="dashboard-menu"
            className="p-manage-layout-popover"
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

      <main className="p-manage-layout-main flex column">
        <Route path="/dashboard" exact component={Dashboard} />
        <Route path="/topic" exact component={Topic} />
      </main>
    </div>
  );
});
