import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Done from '@material-ui/icons/Done';

import './index.scss';

interface IProps {
  isDoing: boolean;
  isDone?: boolean;
}

interface IState {
  isShowDone: boolean;
}

export default class ButtonProgress extends React.Component<IProps, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isShowDone: false,
    };
  }

  componentWillReceiveProps(nextProps: any) {
    const isDoneChangedFromFalseToTrue = !this.props.isDone && nextProps.isDone;
    if (isDoneChangedFromFalseToTrue) {
      this.setState({ isShowDone: true });
      setTimeout(() => {
        this.setState({ isShowDone: false });
      }, 1000);
    }
  }

  render() {
    const { isDoing } = this.props;
    const { isShowDone } = this.state;
    if (isDoing) {
      return <CircularProgress size={12} className="button-circular-progress white-color" />;
    }
    if (isShowDone) {
      return <Done className="white-color push-left-xs po-text-16" />;
    }
    return null;
  }
}
