import React, { useEffect, useState,useContext } from "react";
import { withRouter } from "react-router";
import { onLoadGetId, token } from "../../services/functions";
import {iniciar} from '../../services/functions'

const Login = withRouter(({history}) => {


  // const token = 'YmI5NGFkOTUtNWYyZi00ZWZiLTg0MTUtNmU1NTRmODZjZmQ1OGVlODQ3MzctYTEy_PF84_7458d5d6-c9ff-4f81-968b-b4ae8e35e028';
  const [login, setLogin] = useState(1)

  useEffect( () => {

    const  HandleEntry = async () => {


      //token da url
      const tokenInfoURL = onLoadGetId(window.location.search.slice(1))

      //token do storage
      const tokenStorage = localStorage.getItem('auth')

      //tem token na url?
      if(tokenInfoURL){
        setLogin(2)

        //pega token da api utilizando o token da url
        const posTokenLocal = await token(tokenInfoURL.code)


        if(posTokenLocal){
          console.log('enviar')
          setLogin(3)
          setTimeout(() => {
            history.push('/instrutorcriarsala')
          }, 2000);
      }
    }
      //sem token no localstorage e sem token na url params
      if ((tokenStorage === null ||tokenStorage === undefined)){
        setTimeout(() => {
          window.location.href = process.env.REACT_APP_LINK_LOGIN
        }, 3000);
      }else{
        setTimeout(() => {
          history.push('/instrutorcriarsala')
        }, 2000);
      }

  }
    HandleEntry()
  },[])

  if(login === 3){
    return <div>Estamos redirecionando para a página principal...</div>
  }else if(login === 1){
    return (
        <div>
          <div>Vamos direcionar para o login na plataforma de vídeo...</div>
          <div>Caso não seja redirecionado, cliqueno link abaixo:</div>
          <a href={process.env.REACT_APP_LINK_LOGIN}>Clique para logar</a>

        </div>
      )
    }else{
      return <div>Estamos validando o login. Por favor aguarde...</div>

    }
})
export default Login;
