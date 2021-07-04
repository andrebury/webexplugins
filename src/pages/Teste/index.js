import React, { useEffect, useRef } from "react";
import history from 'react-router-dom'

const Teste = ({history}) => {
  const myContainer = useRef(null);

  function onLoadGetId(){
    var query = window.location.search.slice(1);
    var partes = query.split('&');
    var data = {};
    partes.forEach(function (parte) {
        var chaveValor = parte.split('=');
        var chave = chaveValor[0];
        var valor = chaveValor[1];
        data[chave] = valor;
});

    return data.code

}

  useEffect(() => {
    const urlToken = onLoadGetId()
    console.log(urlToken)

    // fetch('https://webexapis.com/v1/access_token', {
    //     headers: {
    //         'Accept': 'application/json',
    //         'Content-Type': 'application/json'
    //       },
    //     method: 'POST',
    //     body: JSON.stringify({
    //         "code": urlToken,
    //         "redirect_uri":"http://localhost:3000/teste",
    //         "client_id":"C4412287bf37ef6a9fe42810094a4861b837c444536b5d63456c2d981f3a94c59",
    //         "grant_type":"authorization_code",
    //         "client_secret":"b06301a2403da3403055505496b85e7963241b85584ad20e690bbe56c90e2d7a"
    //         })
    //   }).then((resp) => {
    //     console.log({"Resposta da API": resp['access_token']})
    //     localStorage.setItem('auth',resp.access_token)
    //     localStorage.setItem('data',resp.expires_in)

    // }).catch((e) =>{
    //       console.log('error')
    //   })

    // console.log("myContainer..", myContainer.current);

    setTimeout(() => {
        history.push('/')
    }, 6000);
  });

  return (
    <>
      <h1>Webex Meeting</h1>
      <div ref={myContainer}>Estamos redirecionando para a plataforma!</div>
    </>
  );
};

export default Teste;