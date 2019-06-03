import React from 'react'
import moment from 'moment'

const Notifications = (props) => {
    const {notifications} = props;
    console.log(props)
    return (
        <ul className="list-group">
            {notifications && notifications.map((notification) => {
                return (
                    <li key={notification.id} className="list-group-item">
                        <div>{notification.content}</div>
                        <div className="small text-secondary">{moment(notification.time.toDate()).fromNow()}</div>
                    </li>
                );
            })}
        </ul>
    )
};


export default Notifications