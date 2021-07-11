
import React,{ useState,useRef, useEffect } from "react";
import {
  joinMeeting,
  loginJWT,
  mediaMeeting,
  registrar,
  mute,
  unMute,
  startScreenSharemeeting,
  startStopVideo,
  joinSettingsParticipante,
  mediaSettingsParticipante,
  criarMeeting,
  addMediaMeeting} from '../../../services/functions'

import {init as initWebex} from 'webex'
import { useLocation } from "react-router";
import './style.css'

function ParticipanteSala(props){
  const [webex,setWebex] = useState({})
  const [dados,setDados] = useState({"email":"","sipemail":""})
  const [meeting,setMeeting] = useState({})
  const remotevideoRef   = useRef(null)
  const remoteAudioRef = useRef(null)
  const localvideoRef  = useRef(null)
  const remotescreenRef = useRef(null)

  const location = useLocation();

  function conectaSala(webexObj){
    registrar(webexObj).then((ehRegistrado) => {
      if(ehRegistrado){
        criarMeeting(webexObj,location.state.detail.sala).then((meetingTemp) => {
          setMeeting(meetingTemp)
          joinMeeting(meetingTemp,joinSettingsParticipante).then(() => {

            meetingTemp.on('meeting:self:lobbyWaiting', () => console.log('Aguardando OK'))
            meetingTemp.on('meeting:self:guestAdmitted', () => {

              mediaMeeting(meetingTemp,mediaSettingsParticipante).then((mediaStreams) => {

                if (mediaStreams.localStream ) {
                  localvideoRef.current.srcObject = mediaStreams.localStream ;
                }
                addMediaMeeting(meetingTemp,mediaStreams.currentMediaStreams,mediaSettingsParticipante).then(() =>{
                  meetingTemp.on('media:ready', (media) => (mediaStart(media)))
                  meetingTemp.on('media:stopped', (media) => (mediaStop(media)))
                })
            })
          })
        })
      })
    }
  })
  }

useEffect(() =>{

  // http://localhost:3000/participante?userid=teste_bury&user_name=TESTE_BURY&espaco=820db940-dcde-11eb-b2e2-81cdccaa141a
  // espaco = 820db940-dcde-11eb-b2e2-81cdccaa141a
  let webexObj = {}
  let guestToken = localStorage.getItem('authToken')
  if(!guestToken){

    guestToken = loginJWT(location.state.detail.email,location.state.detail.email)
  }

  webexObj = initWebex()
  console.log('teste')


  webexObj.once('ready', function() {
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
          conectaSala(webexObj)

        }
      })
  })

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
    }
  }


  function mediaStop(media){
    console.log('fim')
    switch (media.type) {
      case 'remoteVideo':
        remotevideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        remotevideoRef.current.srcObject = null;
        break;
      case 'remoteAudio':
        remoteAudioRef.current.srcObject.getTracks().forEach((track) => track.stop());
        remoteAudioRef.current.srcObject = null;
        break;
      case 'remoteShare':
        remotescreenRef.current.srcObject.getTracks().forEach((track) => track.stop());
        remotescreenRef.current.srcObject = null;
        break;
      case 'local':
        localvideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
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
            <button onClick={() => (meeting.isAudioMuted() ? unNute(meeting) : mute(meeting))}>Mute/UnMute</button>
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
      <div>{dados.email} </div>
      <div>{dados.sipemail} </div>
      <button onClick={() => (meeting.leave())}>Deixar Sala</button>
      <FormaMedia/>
    </>
  )
}
export default ParticipanteSala
