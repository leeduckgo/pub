import React from 'react';
import { observer } from 'mobx-react-lite';

import clsx from 'clsx';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import Slide from '@material-ui/core/Slide';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, Theme } from '@material-ui/core/styles';

import { useStore } from '../../store';

const useStyles = makeStyles((theme: Theme) => ({
  success: {
    backgroundColor: '#8fb925',
  },
  icon: {
    fontSize: '20px!important',
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

export default observer((props: any) => {
  const { snackbar } = useStore();
  const classes = useStyles();
  const TransitionUp = (props: any) => {
    return <Slide {...props} direction="up" />;
  }
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={TransitionUp}
      open={snackbar.isOpenning}
      autoHideDuration={2000}
      onClose={() => snackbar.close()}
    >
      <SnackbarContent
        className={clsx(classes['success'], classes.margin)}
        message={
          <span id="client-snackbar" className={classes.message}>
            <CheckCircleIcon className={clsx(classes.icon, classes.iconVariant)} />
            {snackbar.msg}
          </span>
        }
        action={[
          snackbar.type === 'socket' ? <span key="redirect" onClick={() => { console.log('去聚合站！') }}>去看看</span> : null,
          <IconButton key="close" aria-label="close" color="inherit" onClick={() => { snackbar.close() }}>
            <CloseIcon className={classes.icon} />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
});