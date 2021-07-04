import { BrowserRouter, Switch, Route,Redirect } from 'react-router-dom';
import React from 'react';
import Teste from './pages/Teste'
import Login from './pages/Login'
import InstrutorSala from './pages/Instrutor/InstrutorSala';
import InstrutorCriarSala from './pages/Instrutor/InstrutorCriarSala';
// import Participante from './pages/Participante';

export default function Routes(){

  const PrivateRoute = ({component: Component, ...rest }) => (
    <Route { ...rest } render={props => (
        localStorage.getItem('auth') ? (
            <Component {...props} />
        ) : (
            <Redirect to={{pathname: '/', state: { from: props.location } }} />
        )
    )} />
    )

    return(
        <BrowserRouter>

            <Switch>
              <Route exact path="/" component={Login} />
              <PrivateRoute exact path="/instrutorsala" component={InstrutorSala} />
              <PrivateRoute exact path="/instrutorcriarsala" component={InstrutorCriarSala} />
              {/* <Route exact path="/participante" component={Participante} /> */}
              <PrivateRoute exact path="/teste" component={Teste} />
              {/* <Route path="/home" component={Home} /> */}
            </Switch>

        </BrowserRouter>
    );
}

