import React from 'react';
import {NavLink} from 'react-router-dom'

const SignedOutLinks = () => {
    return (
        <div>
            <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                    <NavLink to="/sign-up" className="nav-link">Sign up</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/sign-in" className="nav-link">Sign in</NavLink>
                </li>
            </ul>
        </div>
    );
}

export default SignedOutLinks;