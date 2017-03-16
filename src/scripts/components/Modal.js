
import { Modal as BaseModal }from "react-overlays";
import React from "react"

export default class Modal extends React.Component {


  render() {

    return (
      <BaseModal
        { ...this.props }
        backdropClassName="modal-background"
        className="modal"
      >

        <div className="modal-wrapper">
          <div className="modal-dialog">
            <div className="modal-content">
              { this.props.children }
            </div>
          </div>
        </div>
      </BaseModal>

    )
  }
}



