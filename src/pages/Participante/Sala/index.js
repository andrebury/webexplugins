
import React,{ useState,useRef, useEffect } from "react";
import { joinMeeting , loginJWT,mediaMeeting,registrar,mute,unMute,startScreenSharemeeting,startStopVideo,screenShareChange,videoChange} from '../../../services/functions'

import {init as initWebex} from 'webex'
import { useLocation } from "react-router";
import './style.css'

function ParticipanteSala(props){
  const [webex,setWebex] = useState({})
  const [dados,setDados] = useState({"email":"","sipemail":""})
  const [sala,setSala] = useState('')
  const [meeting,setMeeting] = useState({})
  const [salaAtiva,setSalaAtiva] = useState(false)

  const remotevideoRef   = useRef(null)
  const remoteAudioRef = useRef(null)
  const localvideoRef  = useRef(null)
  const remotescreenRef = useRef(null)

  const location = useLocation();

useEffect(() =>{

  // http://localhost:3000/participante?userid=teste_bury&user_name=TESTE_BURY&espaco=820db940-dcde-11eb-b2e2-81cdccaa141a
  // espaco = 820db940-dcde-11eb-b2e2-81cdccaa141a
  let webexObj = {}
  let guestToken = localStorage.getItem('authToken')
  if(!guestToken){
    console.log(location.state.detail)
    guestToken = loginJWT(location.state.detail.nome,location.state.detail.email)
  }
  setSala(location.state.detail.sala)

  webexObj = initWebex()
  console.log('teste')


  webexObj.once(`ready`, function() {
    console.log(guestToken)
    webexObj.authorization.requestAccessTokenFromJwt({jwt: guestToken})
      .then((r) => {
        if (webexObj.canAuthorize) {
          console.log('Autenticado')
          setWebex(webexObj)
          webexObj.people.get('me').then((me) => {
            console.log(me)
            const sipemail = me.emails[0]
            const email = me.displayName
            setDados({"sipemail":sipemail,"email":email})
          })
          registrar(webexObj).then((resultado) =>{
            console.log(resultado ? 'Registrado' : 'Erro no registro')
          })

          console.log({'meetings': webexObj.meetings.getAllMeetings()})
          webexObj.meetings.on('meeting:added', (m) => {
            const {type} = m;
            console.log('Tipo: ' + type)

            if ((type === 'INCOMING' || type === 'JOIN') & salaAtiva === false) {
              const newMeeting = m.meeting;

              // alert('incomingsection');
              console.log(newMeeting)
              setSalaAtiva(true)
              joinMeeting(newMeeting,webexObj)
              setMeeting(newMeeting)
              newMeeting.on('media:ready', (media) => (mediaStart(media)))
              newMeeting.on('media:stopped', (media) => (mediaStop(media)))


              mediaMeeting(newMeeting)

            }
          });

          webexObj.meetings.on('meeting:leave', (media) => {
            console.log(media)
            setSalaAtiva(false)
            mediaStop(media)
          })


        }
      })
  });

},[])


  function mediaStart(media){
    console.log(media)
    switch (media.type) {
      case 'remoteVideo':
        remotevideoRef.current.srcObject = media.stream;
        break;
      case 'remoteAudio':
        remoteAudioRef.current.srcObject = media.stream;
        break;
      case 'remoteShare':
        remotescreenRef.current.srcObject = media.stream;
        break;
      case 'local':
        localvideoRef.current.srcObject = media.stream;
        break;
    }
  }


  function mediaStop(media){
    switch (media.type) {
      case 'remoteVideo':
        remotevideoRef.current.srcObject = null;
        break;
      case 'remoteAudio':
        remoteAudioRef.current.srcObject = null;
        break;
      case 'remoteShare':
        remotescreenRef.current.srcObject = null;
        break;
      case 'local':
        localvideoRef.current.srcObject = null;
        break;
    }

  }


  function FormaMedia(){
    return (
      <div className="videos">
      <div className="remote-video">
          <legend>Remote Video</legend>
          <video ref={remotevideoRef} id="remote-video" autoPlay playsInline />
          <audio ref={remoteAudioRef} id="remote-audio" autoPlay />
          <div className="controles-media">
            {/* <button onClick={() => ((videoChange(meeting)))}>Habilita/Desabilita Vídeo</button>
            <button onClick={() => ((screenShareChange(meeting)))}>Habilita/Desabilita Screen</button> */}
            <button onClick={() => (mute(meeting))}>Mute</button>
            <button onClick={() => (unMute(meeting))}>UnMute</button>
            <button onClick={() => (startStopVideo(meeting))}>Mostrar/Esconder Vídeo</button>
            <button onClick={() => (startScreenSharemeeting(meeting))}>Compartilhar Tela</button>
        </div>
      </div>
      <div className="outros-videos">
          <div className="local-video">
            <legend>Local Video</legend>
            <video ref={localvideoRef} id="local-video" autoPlay playsInline />
          </div>
          <div className="remotescreen-video">
            <legend>Remote Screenshare</legend>
            <video ref={remotescreenRef} id="removescreen-video" autoPlay playsInline />
          </div>
        </div>
      </div>

    )

  }



  return (
    <>
      <div>Sala {sala} </div>
      <div>{dados.email} </div>
      <div>{dados.sipemail} </div>
      <button onClick={() => (meeting.leave())}>Deixar Sala</button>
      <FormaMedia/>
    </>
  )
}
export default ParticipanteSala
