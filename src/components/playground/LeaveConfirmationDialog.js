import React from 'react'
import {Modal, Button} from 'react-bootstrap'

const LeaveConfirmationDialog = (props) => {
    return (
        <Modal show={props.show} onHide={props.onClickNo}>
            <Modal.Header>
                <Modal.Title>Do you want to leave the game?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Important! Is the game already started, then you will not be able to rejoin until the game ends</p>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
                <Button variant="secondary" onClick={props.onClickNo}>No</Button>
                <Button variant="danger" onClick={props.onClickYes}>Yes</Button>
            </Modal.Footer>
        </Modal>
    )
};

export default LeaveConfirmationDialog