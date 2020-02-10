import React from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import ButtonProgress from '../../components/ButtonProgress';

import { Menu, MenuItem, TableRow, TableCell, Tooltip } from '@material-ui/core';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Settings from '@material-ui/icons/Settings';
import CreateIcon from '@material-ui/icons/Create';

import Api from '../../api';

import { useStore } from '../../store';

import { ago, FileStatus, FileStatusTip } from '../../utils';

export default observer((props: any) => {
  const { fileStore, settingsStore, snackbarStore } = useStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const editFile = (fileId: number) => {
    props.history.push(`/editor?id=${fileId}`);
  };

  const deleteFile = (file: any, idx: number) => {
    (async () => {
      try {
        setDeleting(true);
        await Api.deleteFile(file.id);
        fileStore.files.splice(idx, 1);
        fileStore.setFiles([...fileStore.files]);
        handleMenuClose();
      } catch (err) {
        fileStore.updateFileByIdx({ ...file, delete: false }, idx);
        snackbarStore.show({
          message: '删除内容失败',
          type: 'error',
        });
      }
      setDeleting(false);
    })();
  };

  const openPrsIdentity = (rId: any) => {
    window.open(`https://press.one/public/file/v?rId=${rId}`);
  };

  const { file, idx } = props;
  const readerUrl = settingsStore.settings['reader.url'];
  const isPublished = file.status === 'published';
  const isPending = file.status === 'pending';
  const canDelete = false;

  return (
    <TableRow key={idx}>
      <TableCell component="th" scope="row">
        <div className="font-bold title">{file.title}</div>
      </TableCell>
      <TableCell>
        <Tooltip title={FileStatusTip[file.status]} placement="top">
          <span
            className={classNames(
              {
                'cursor-pointer': isPublished,
              },
              `font-medium ${file.status}`,
            )}
            onClick={() => isPublished && openPrsIdentity(file.rId)}
          >
            {FileStatus[file.status]}
          </span>
        </Tooltip>
      </TableCell>
      <TableCell>
        <span className="gray-color">{ago(file.updatedAt)}</span>
      </TableCell>
      <TableCell>
        <div className="flex">
          <Tooltip title={isPending ? '文章上链成功之后，才能编辑' : '编辑'} placement="top">
            <span>
              <IconButton
                disabled={isPending}
                className="mr-1"
                onClick={e => {
                  e.stopPropagation();
                  editFile(+file.id);
                }}
              >
                <CreateIcon />
              </IconButton>
            </span>
          </Tooltip>
          {canDelete && (
            <div>
              <IconButton
                className="text-base"
                aria-label="more"
                aria-controls="dashboard-post-menu"
                aria-haspopup="true"
                onClick={handleMenuClick}
              >
                <Settings className="text-base" />
              </IconButton>
              <Menu
                id="dashboard-post-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                PaperProps={{
                  style: {
                    width: 100,
                  },
                }}
              >
                <MenuItem>
                  <Tooltip
                    title="删除的文章大概 5 分钟之后会从阅读站消失"
                    placement="left"
                    disableHoverListener={!isPublished}
                  >
                    <div
                      className="flex items-center text-gray-500"
                      onClick={e => {
                        deleteFile(file, idx);
                      }}
                    >
                      <span className="flex items-center text-base mr-1">
                        <DeleteIcon />
                      </span>
                      <span className="font-bold">删除</span>
                      <ButtonProgress color={'primary-color'} size={12} isDoing={deleting} />
                    </div>
                  </Tooltip>
                </MenuItem>
              </Menu>
            </div>
          )}
          {isPublished ? (
            <Tooltip
              title="查看显示在阅读站上的文章（阅读站抓取文章需要时间，如果文章还没有被抓取到，请耐心等待几分钟）"
              placement="top"
            >
              <a href={`${readerUrl}/posts/${file.rId}`} target="_blank" rel="noopener noreferrer">
                <IconButton className="mr-1">
                  <OpenInNewIcon />
                </IconButton>
              </a>
            </Tooltip>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
});
