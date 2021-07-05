import { init as initWebex } from 'webex';
import api from '../services/api'
import { strict as assert } from 'assert';


export const conversorData = (date) => {
  if (date === undefined || date === '') {
      return date
  } else {
      return date.substring(14,16) + ':' + date.substring(11,13)

  }
}

export async function token(urlToken){

  const data = JSON.stringify({
    "code": urlToken,
    "redirect_uri":process.env.REACT_APP_REDIRECT_URI,
    "client_id":process.env.REACT_APP_CLIENT_ID,
    "grant_type":process.env.REACT_APP_GRANT_CODE,
    "client_secret":process.env.REACT_APP_CLIENT_SECRET
    })

  return await api.post("/access_token", data, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
  })
  .then((response) => {
    localStorage.setItem('auth',response.data.access_token)
    localStorage.setItem('expires_in',response.data.expires_in)
    return true
}).catch((e) =>{
      console.log('error')
      return false
  })

}

export function onLoadGetId(query){
  var partes = query.split('&');
  var data = {};
  partes.forEach(function (parte) {
      var chaveValor = parte.split('=');
      var chave = chaveValor[0];
      var valor = chaveValor[1];
      data[chave] = valor;
});

  return data

}

export function iniciar() {

  return initWebex({
    credentials: {
      access_token: localStorage.getItem('auth'),
    },
  });

}

export function registrar(webex){
  return webex.meetings.register().then(() => {
    console.log('successfully registered');
    return true
  }).catch((error) => {
    console.warn('error registering', error);
    return false
  })
}


export function criarSala(webex,titulo){
  return webex.rooms.create({title: titulo})
  .then((room) => {
    assert(typeof room.created === 'string');
    assert(typeof room.id === 'string');
    assert(room.title === titulo);
    console.log(room.title);
    return room;
  });

}


export function listasSalas(webex){
  return webex.rooms.list()
    .then((rooms) => {
      return rooms;
    });
}

export function enviarMensagem(mensagemRef,room,webex){
  const mensagem = mensagemRef.current.value
  webex.messages.create({
    text: mensagem,
    roomId: room
  }).then((mensagemReturn) => {
    console.log('mensagem criada: ' + mensagemReturn)
  })
  mensagemRef.current.value = ''
}
