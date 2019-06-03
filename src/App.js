import React, {Component} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layouts/Navbar'
import Lobby from './components/playground/Lobby'
import PlayTable from './components/playground/PlayTable'
import ScoreCard from './components/stats/Scoreboard'
import SignIn from './components/auth/SignIn'
import SignUp from './components/auth/SignUp'
import PageNotFound from './components/static/PageNotFound'


class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Navbar/>
                    <Switch>
                        <Route exact path='/' component={Lobby} />
                        <Route path='/scoreboard/:id' component={ScoreCard} />
                        <Route path='/table' component={PlayTable} />
                        <Route path='/sign-up' component={SignUp} />
                        <Route path='/sign-in' component={SignIn} />
                        <Route component={PageNotFound}/>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
