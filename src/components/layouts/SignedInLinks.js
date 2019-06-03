import React from 'react';
import {NavLink} from 'react-router-dom'
import {connect} from 'react-redux'
import {signOut} from "../../store/actions/authActions";

const SignedInLinks = (props) => {
    return (
        <div>
            <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                    <NavLink to="/" className="nav-link">Game</NavLink>
                </li>
                <li className="nav-item">
                    <a href="/" onClick={(e) => {
                        e.preventDefault();
                        props.signOut()
                    }} className="nav-link">Log out</a>
                </li>
                <li className="nav-item">
                    <NavLink to="/" className="nav-link rounded">{props.profile.nickname}</NavLink>
                </li>
            </ul>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        profile: state.firebase.profile,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        signOut: () => dispatch(signOut())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SignedInLinks);