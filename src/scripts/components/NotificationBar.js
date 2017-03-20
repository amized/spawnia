
import { Modal as BaseModal }from "react-overlays";
import React from "react"

export default class NotificationBar extends React.Component {
  render() {
    return (
      <div>
        {
          this.props.show ?
            <div className="notification-bar">
              { this.props.children }
            </div>
          : 
            null
        }
      </div>
    )
  }
}



