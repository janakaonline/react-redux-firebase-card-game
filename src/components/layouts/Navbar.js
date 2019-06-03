import React from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import SignedInLinks from './SignedInLinks'
import SignedOutLinks from './SignedOutLinks'

const Navbar = (props) => {
    const {auth} = props;
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to="/" className="navbar-brand">Card Game</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse"
                    data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                    aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"/>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                {auth.uid
                    ?
                    <SignedInLinks/>
                    :
                    <SignedOutLinks/>
                }
            </div>
        </nav>
    )
};

const mapStateToProp = (state) => {
    return {
        auth: state.firebase.auth
    }
};

export default connect(mapStateToProp)(Navbar)