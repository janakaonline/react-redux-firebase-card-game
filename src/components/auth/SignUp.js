import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Redirect} from 'react-router-dom'
import {signUp} from "../../store/actions/authActions"
import {Button} from 'react-bootstrap'

class SignUp extends Component {
    state = {
        nickname: '',
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
        this.props.signUp(this.state);
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
                            <h3>Sign up</h3>
                            {
                                authError ?
                                    <div className="alert alert-danger" role="alert">
                                        <strong>{authError}</strong>
                                    </div>
                                    : null
                            }

                            <div className="form-group">
                                <label htmlFor="nickname">Nickname</label>
                                <input type="text" className="form-control" id="nickname" onChange={this.handleChange}/>
                            </div>
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
                                {game && !game.authBusy ? 'Sign up' : 'Please wait...'}
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
        signUp: (newUser) => dispatch(signUp(newUser))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);