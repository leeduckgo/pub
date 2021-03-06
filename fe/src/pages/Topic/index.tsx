import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { Tabs, Tab, Button } from '@material-ui/core';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

import { useStore } from '../../store';
import Api, { TopicPermissionResult } from '../../api';
import { renderConfirmDialog } from './ConfirmDialog';
import './index.scss';

interface PermissionListState {
  count: number;
  users: TopicPermissionResult['users'];
}

type UserItem = TopicPermissionResult['users'][0];

interface RenderUserListProps {
  users: PermissionListState['users'];
  buttonType: 'allow' | 'deny';
  onItemClick: (user: UserItem) => unknown;
  page: number;
  totalPage: number;
  pageLoading: boolean;
  onPageChange: (page: number) => unknown;
}

interface ConfirmDialogState {
  open: boolean;
  userId: string;
  userName: string;
  type: 'allow' | 'deny';
}

const TabPanel = (props: any) => {
  const { show, ...restProps } = props;
  return !show ? null : <div {...restProps}>{props.children}</div>;
};

const renderUserList = (renderUserListProps: RenderUserListProps) => {
  const {
    users,
    onItemClick,
    buttonType,
    page,
    onPageChange,
    pageLoading,
    totalPage,
  } = renderUserListProps;
  return !users.length ? (
    '暂无用户'
  ) : (
    <>
      {users.map(userItem => (
        <div key={userItem.id} className="user-list-item flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img className="w-10 h-10" src={userItem.avatar} alt={userItem.name} />
          </div>
          <div className="user-name" title={userItem.name}>
            {userItem.name}
          </div>
          <div className="user-operation">
            <Button
              className={classNames({
                [buttonType]: true,
              })}
              onClick={() => onItemClick(userItem)}
              variant="contained"
              color="primary"
            >
              {{ allow: '允许', deny: '禁止' }[buttonType]}
            </Button>
          </div>
        </div>
      ))}
      <div className="button-box flex items-center">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={pageLoading || page === 0}
          className="page-button"
        >
          <NavigateBefore></NavigateBefore>
          上一页
        </Button>
        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={pageLoading || page + 1 >= totalPage}
          className="page-button"
        >
          下一页
          <NavigateNext></NavigateNext>
        </Button>
        <span>
          第 {page + 1} / {totalPage} 页
        </span>
      </div>
    </>
  );
};

export default observer(() => {
  const { snackbarStore } = useStore();
  const pageLimit = 10;
  const [tab, changeTab] = useState(0);

  const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogState>({
    open: false,
    userId: '',
    userName: '',
    type: 'allow',
  });

  const [allowLoading, setAllowLoading] = useState(false);
  const [denyLoading, setDenyLoading] = useState(false);

  const [allowPage, setAllowPage] = useState(0);
  const [denyPage, setDenyPage] = useState(0);

  const [reloadState, setReloadState] = useState(0);
  const reloadData = () => setReloadState(reloadState + 1);

  const [allowData, setAllowData] = useState<PermissionListState>({
    count: 0,
    users: [],
  });

  const [denyData, setDenyData] = useState<PermissionListState>({
    count: 0,
    users: [],
  });

  useEffect(() => {
    (async () => {
      setAllowLoading(true);
      try {
        const result = await Api.fetchTopicAllowedUsers({
          offset: allowPage * pageLimit,
          limit: pageLimit,
        });
        if (allowPage !== 0 && result.count && !result.users.length) {
          setAllowPage(0);
          return;
        }
        setAllowData({
          count: result.count,
          users: result.users,
        });
      } catch (err) {
        console.log(err);
      }
      setAllowLoading(false);
    })();
  }, [allowPage, reloadState]);

  useEffect(() => {
    (async () => {
      setDenyLoading(true);
      try {
        const result = await Api.fetchTopicDeniedUsers({
          offset: denyPage * pageLimit,
          limit: pageLimit,
        });
        if (denyPage !== 0 && result.count && !result.users.length) {
          setDenyPage(0);
          return;
        }
        setDenyData({
          count: result.count,
          users: result.users,
        });
      } catch (err) {
        console.log(err);
      }
      setDenyLoading(false);
    })();
  }, [denyPage, reloadState]);

  const handleConfirmChangeUserPermission = async () => {
    const typeMap = {
      allow: '允许',
      deny: '禁止',
    };
    setConfirmDialogState({
      ...confirmDialogState,
      open: false,
    });
    const type = confirmDialogState.type;
    const userName = confirmDialogState.userName;
    try {
      if (confirmDialogState.type === 'allow') {
        await Api.allowTopicUser(confirmDialogState.userId);
      } else {
        await Api.denyTopicUser(confirmDialogState.userId);
      }
      snackbarStore.show({
        message: `已${typeMap[type]} ${userName}`,
      });
      reloadData();
    } catch (e) {
      snackbarStore.show({
        message: `${typeMap[type]} ${userName} 失败`,
      });
    }
  };

  const handleShowConfirmDialog = (user: UserItem, type: 'allow' | 'deny') => {
    setConfirmDialogState({
      open: true,
      type,
      userId: user.id,
      userName: user.name,
    });
  };

  return (
    <div className="p-topic ex-mw-1200 flex flex-col">
      <section className="p-topic-head flex items-center justify-between">
        <div className="p-topic-head-title">权限管理</div>
      </section>

      <section className="p-topic-main flex flex-col ex-mw-1200">
        <div className="p-topic-main-inner flex flex-col MuiPaper-elevation1">
          <Tabs className="flex" value={tab} onChange={(_e, v) => changeTab(v)}>
            <Tab label="允许发布文章的用户" />
            <Tab label="禁止发布文章的用户" />
          </Tabs>
          <div className="p-topic-tab-panel-box">
            <TabPanel show={tab === 0}>
              {allowLoading && 'loading'}
              {!allowLoading &&
                renderUserList({
                  onItemClick: user => handleShowConfirmDialog(user, 'deny'),
                  buttonType: 'deny',
                  users: allowData.users,
                  page: allowPage,
                  totalPage: Math.ceil(allowData.count / pageLimit),
                  onPageChange: page => setAllowPage(page),
                  pageLoading: allowLoading,
                })}
            </TabPanel>
            <TabPanel show={tab === 1}>
              {denyLoading && 'loading'}
              {!denyLoading &&
                renderUserList({
                  onItemClick: user => handleShowConfirmDialog(user, 'allow'),
                  buttonType: 'allow',
                  users: denyData.users,
                  page: denyPage,
                  totalPage: Math.ceil(denyData.count / pageLimit),
                  onPageChange: page => setDenyPage(page),
                  pageLoading: denyLoading,
                })}
            </TabPanel>
          </div>
        </div>
      </section>
      {renderConfirmDialog({
        open: confirmDialogState.open,
        type: confirmDialogState.type,
        onClose: () =>
          setConfirmDialogState({
            ...confirmDialogState,
            open: false,
          }),
        onOk: handleConfirmChangeUserPermission,
        userName: confirmDialogState.userName,
      })}
    </div>
  );
});
