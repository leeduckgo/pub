import React from 'react';
import { observer } from 'mobx-react-lite';
import { RouteChildrenProps, Route } from 'react-router';

import { Button, MenuItem, Popover, MenuList } from '@material-ui/core';

import AssignmentIcon from '@material-ui/icons/Assignment';
import CreateIcon from '@material-ui/icons/Create';
import ExpandLess from '@material-ui/icons/ExpandLess';
import classNames from 'classnames';
import AccountBalanceWallet from '@material-ui/icons/AccountBalanceWallet';
import ExitToApp from '@material-ui/icons/ExitToApp';

import { useStore } from '../../store';

import { Endpoint, getQuery, removeQuery, sleep } from '../../utils';

import './index.scss';
import Dashboard from '../Dashboard';
import Topic from '../Topic';
import WalletModal from 'components/WalletModal';

export default observer((props: RouteChildrenProps) => {
  const { userStore, snackbarStore } = useStore();
  const { user } = userStore;
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [walletTab, setWalletTab] = React.useState('assets');
  const action = getQuery('action');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  React.useEffect(() => {
    (async () => {
      if (action === 'OPEN_WALLET_BINDING') {
        await sleep(1500);
        setWalletTab('mixinAccount');
        setWalletOpen(true);
        if (userStore.user.mixinAccount) {
          await sleep(800);
          snackbarStore.show({
            message: 'Mixin 账号绑定成功啦！',
          });
        }
        removeQuery('action');
      }
    })();
  }, [action, snackbarStore, userStore]);

  if (userStore.isFetched && !userStore.isLogin) {
    setTimeout(() => {
      props.history.push('/login');
    }, 0);
  }

  const logout = () => {
    window.location.href = `${Endpoint.getApi()}/api/logout?from=${window.location.origin}/login`;
  };

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
  ];

  return (
    <div className="p-manage-layout flex po-fade-in">
      <nav className="p-manage-layout-nav flex normal column sb po-b-br po-b-black-10">
        <section>
          <ul className="p-manage-layout-nav-ul">
            <li className="p-manage-layout-nav-ul-title p-manage-layout-nav-li">管理</li>
            {navList
              .filter(v => v.show)
              .map(item => (
                <li key={item.text} className="p-manage-layout-nav-li">
                  <div
                    onClick={() => props.history.push(item.path)}
                    className={classNames({
                      'p-manage-layout-nav-link flex v-center po-bold po-radius-5': true,
                      active: props.location.pathname === item.path,
                    })}
                  >
                    <item.icon className="p-manage-layout-nav-li-icon" />
                    {item.text}
                  </div>
                </li>
              ))}
          </ul>
        </section>

        {userStore.isLogin && (
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

        {userStore.isLogin && (
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
              <MenuItem onClick={() => setWalletOpen(true)}>
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

      <main className="p-manage-layout-main flex column">
        <Route path="/dashboard" exact component={Dashboard} />
        <Route path="/topic" exact component={Topic} />
      </main>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} tab={walletTab} />
    </div>
  );
});
