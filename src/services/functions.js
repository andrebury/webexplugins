import { init as initWebex } from 'webex';
import api from '../services/api'
import { strict as assert } from 'assert';
import Jwt from "jsonwebtoken"


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
  if(!webex.meetings.registered){
    return webex.meetings.register().then(() => {
      console.log('successfully registered');
      return true
    }).catch((error) => {
      console.warn('error registering', error);
      return false
    })
  }else{
    return true
  }

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


export function createMeeting(room,webex) {

}

export function AuthWToken(token){

}


export function joinMeeting(meeting,webex) {

  const resourceId = webex.devicemanager._pairedDevice ?
    webex.devicemanager._pairedDevice.identity.id :
    undefined;
    console.log('resourceId')

    console.log(resourceId)
    console.log(meeting)

  meeting.join({
    pin: false,
    moderator: false,
    moveToResource: false,
    resourceId
  })
    .then(() => {
      console.log(meeting.destination ||
        meeting.sipUri ||
        meeting.id)
    });

}


export function mediaMeeting(meeting){
  return meeting.join().then(() => {
    const mediaSettings = {
      receiveVideo: true,
      receiveAudio: true,
      receiveShare: true,
      sendVideo: true,
      sendAudio: true,
      sendShare: false
    };

    // Get our local media stream and add it to the meeting
    return meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
      const [localStream, localShare] = mediaStreams;

      meeting.addMedia({
        localShare,
        localStream,
        mediaSettings
      });
    });
  });
}





export function loginJWT(nome,email){
  var guestToken = ''

  const expiration = Math.floor(new Date() / 1000) + 36000 // 1 hour from now
  console.log(nome + email)

  const payload = {
    "sub": nome,
    "name": email,
    "iss": process.env.REACT_APP_GUEST_ISSUER_ID,
    "exp": expiration
  };

  const decoded = Buffer.from(process.env.REACT_APP_GUEST_SHARED_SECRET, 'base64');

  guestToken = Jwt.sign(payload, decoded, { algorithm: 'HS256', noTimestamp: true });

  console.log(guestToken)
  localStorage.setItem('authToken',guestToken)
  return guestToken
}


export function criarMeeting(webex,room){
  return webex.meetings.create(room)
    .then((meeting) => {
      return meeting
    });
}
