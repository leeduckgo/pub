import React from 'react';
import { observer } from 'mobx-react-lite';

import clsx from 'clsx';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
// import Slide from '@material-ui/core/Slide';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, Theme } from '@material-ui/core/styles';

import { useStore } from '../../store';

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon,
};

const useStyles = makeStyles((theme: Theme) => ({
  success: {
    backgroundColor: '#8fb925',
  },
  error: {
    backgroundColor: '#d32f2f!important',
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
  const { snackbar, settings } = useStore();
  const classes = useStyles();
  // const TransitionUp = (props: any) => {
  //   return <Slide {...props} direction="up" />;
  // };
  const Icon = variantIcon[snackbar.type === 'error' ? 'error' : 'success'];
  const { postsEndpoint } = settings.settings;
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      // TransitionComponent={TransitionUp}
      open={snackbar.isOpenning}
      autoHideDuration={snackbar.autoHideDuration}
      onClose={() => snackbar.close()}
    >
      <SnackbarContent
        className={clsx(classes[snackbar.type === 'error' ? 'error' : 'success'], classes.margin)}
        message={
          <span id="client-snackbar" className={classes.message}>
            <Icon className={clsx(classes.icon, classes.iconVariant)} />
            {snackbar.msg}
          </span>
        }
        action={[
          snackbar.type === 'socket' ? (
            <span
              className="po-cp"
              key="redirect"
              onClick={() => {
                window.open(`${postsEndpoint}/${snackbar.meta.rId}`);
              }}
            >
              去看看
            </span>
          ) : null,
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            onClick={() => {
              snackbar.close();
            }}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>,
        ]}
      />
    </Snackbar>
  );
});
