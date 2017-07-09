import Roo from '../../../../react-oo';
import React, { PropTypes } from "react"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class NotificationPanel extends React.Component {
  
	static propTypes = {
		manager: PropTypes.object,
    numNotifications: PropTypes.number,
    defaultTimeout: PropTypes.number
	}

  static defaultProps = {
    defaultTimeout: 6000
  }

	constructor(props) {
		super(props);
		this.state = {
      isActive: false,
			current: []
		}

    this.lastTimeout = null;
	}

  componentWillReceiveProps(nextProps) {

    let { defaultTimeout, numNotifications } = nextProps;

    if (nextProps.numNotifications !== this.props.numNotifications) {
      let numNew = nextProps.numNotifications - this.props.numNotifications;
      if (numNew > 0) {
        let current = this.props.manager.getLastN(numNew);
        this.setState({
          current: current,
          isActive: true
        })

        clearTimeout(this.lastTimeout);
        this.lastTimeout = setTimeout(()=> {
          this.setState({
            isActive: false
          })
        }, defaultTimeout)
      }
    }
  }

  render() {
  	const nm = this.props.manager;
    const { isActive, current } = this.state;

    return (
      <div className="notification-panel">
        <ReactCSSTransitionGroup 
            transitionName="notification-item" 
            transitionEnterTimeout={500} 
            transitionLeaveTimeout={500}
        >
      	{
      		isActive ? current.map((notification) => {
      			return <div className="notification-item" key={notification.id}>{notification.msg}</div>
      		})
          :
          null
      	}
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}


class NotificationPanelItem extends React.Component {




}

function mapToProps(objs) {
  return {
    numNotifications: objs.manager.notifications.length
  }
}


export default Roo.connect(mapToProps)(NotificationPanel);