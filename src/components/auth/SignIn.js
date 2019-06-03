import React, {Component} from 'react'
import {connect} from 'react-redux'
import {signIn} from "../../store/actions/authActions"
import {Redirect} from 'react-router-dom'
import {Button} from 'react-bootstrap'

class SignIn extends Component {
    state = {
        email: '',
        password: ''
    };

    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.signIn(this.state);
    };


    render() {

        const {authError, auth, game} = this.props;

        if (auth.uid) {
            return <Redirect to="/"/>
        }

        return (
            <div className="container">
                <div className="row justify-content-md-center">
                    <div className="col-2"/>
                    <form onSubmit={this.handleSubmit} className="col">
                        <fieldset disabled={!game || game.authBusy}>
                            <h3>Sign in</h3>

                            {
                                authError ?
                                    <div className="alert alert-danger" role="alert">
                                        <strong>{authError}</strong>
                                    </div>
                                    : null
                            }


                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" className="form-control" id="email" onChange={this.handleChange}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input type="password" className="form-control" id="password"
                                       onChange={this.handleChange}/>
                            </div>
                            <Button variant="primary" type="submit">
                                {game && !game.authBusy ? 'Sign in' : 'Please wait...'}
                            </Button>
                        </fieldset>
                    </form>
                    <div className="col-3"/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        authError: state.auth.authError,
        auth: state.firebase.auth,
        game: state.game,
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        signIn: (credentials) => dispatch(signIn(credentials))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);