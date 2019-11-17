import React from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';

interface ConfirmDialogProps {
  open: boolean
  onClose: () => unknown
  onOk: () => unknown
  type: 'allow' | 'deny'
  userName: string
}

export const renderConfirmDialog = (props: ConfirmDialogProps) => (
  <Dialog
    open={props.open}
    onClose={props.onClose}>
    <DialogTitle id="responsive-dialog-title">修改权限</DialogTitle>
    <DialogContent>
      <DialogContentText>
        确定要更改 {props.userName} 的权限为
        {{ allow: '允许', deny: '禁止' }[props.type]} 吗？
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button style={{ background: '#aaa' }} onClick={props.onClose} variant="contained">
        取消
      </Button>
      <Button onClick={props.onOk} color="primary" variant="contained">
        确定
      </Button>
    </DialogActions>
  </Dialog>
)
