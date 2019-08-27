import React from 'react';
import { observer } from 'mobx-react-lite';
import ButtonProgress from '../../components/ButtonProgress';

import { Menu, MenuItem, TableRow, TableCell, Tooltip } from '@material-ui/core';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CreateIcon from '@material-ui/icons/Create';

import Api from '../../api';

import { useStore } from '../../store';

import { ago, FileStatus, FileStatusTip } from '../../utils';

export default observer((props: any) => {
  const store = useStore();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

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
        await Api.deleteFile(file.id);
        store.files.files.splice(idx, 1);
        store.files.setFiles([...store.files.files]);
      } catch (err) {
        store.files.updateFile({ ...file, delete: false }, idx);
        store.snackbar.open('删除内容失败', 2000, 'error');
      }
    })();
  };

  const { file, idx } = props;

  return (
    <TableRow key={idx}>
      <TableCell component="th" scope="row">
        {file.title}
      </TableCell>
      <TableCell>
        <Tooltip title={FileStatusTip[file.status]} placement="right">
          <span className={`po-semibold ${file.status}`}>{FileStatus[file.status]}</span>
        </Tooltip>
      </TableCell>
      <TableCell>{ago(file.updatedAt)}</TableCell>
      <TableCell>
        {file.status !== 'pending' ? (
          <IconButton
            className="push-right-xs"
            onClick={e => {
              e.stopPropagation();
              editFile(+file.id);
            }}
          >
            <CreateIcon />
          </IconButton>
        ) : (
          <Tooltip title="文章上链成功之后，才能编辑" placement="top">
            <span className="push-right-xs">
              <IconButton disabled>
                <CreateIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
        {file.status === 'published' ? (
          <Tooltip title="查看显示在聚合站上的文章" placement="top">
            <IconButton
              className="push-right-xs"
              onClick={e => {
                e.stopPropagation();
                console.log('去聚合站！');
              }}
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        ) : null}
        <IconButton
          className="po-text-20"
          aria-label="more"
          aria-controls="dashboard-post-menu"
          aria-haspopup="true"
          onClick={handleMenuClick}
        >
          <MoreVertIcon className="po-text-20" />
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
          <MenuItem
            className="flex v-center gray-darker-color po-text-16"
            onClick={e => {
              store.files.updateFile({ ...file, delete: true }, idx);
              deleteFile(file, idx);
            }}
          >
            <span className="flex v-center po-text-20 push-right-xs">
              <DeleteIcon />
            </span>
            <span className="po-bold">删除</span>
            <ButtonProgress color={'primary-color'} size={12} isDoing={file.delete} />
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
});
