import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Done from '@material-ui/icons/Done';

import './index.scss';

interface IProps {
  size?: number;
  color?: string;
  isDoing: boolean;
  isDone?: boolean;
  noMargin?: boolean;
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
    const { isDoing, color = 'white-color', size = 12 } = this.props;
    const { isShowDone } = this.state;
    if (isDoing) {
      return (
        <span className="button-circular-progress flex justify-center items-center -mr-1">
          <CircularProgress size={size} className={`${color}`} />
        </span>
      );
    }
    if (isShowDone) {
      return (
        <div className="ml-1 -mr-1">
          <Done className={`${color}"`} />
        </div>
      );
    }
    return null;
  }
}
