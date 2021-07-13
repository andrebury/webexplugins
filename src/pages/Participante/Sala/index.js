
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
  const [currentMediaStreams,setCurrentMediaStreams] = useState([])

  const remotevideoRef   = useRef(null)
  const remoteAudioRef = useRef(null)
  const localvideoRef  = useRef(null)
  const remotescreenRef = useRef(null)

  const location = useLocation();

  function conectaSala(webexObj,sala){
    registrar(webexObj).then((ehRegistrado) => {
      if(ehRegistrado){
        criarMeeting(webexObj,sala).then((meetingTemp) => {
          setMeeting(meetingTemp)
          joinMeeting(meetingTemp,joinSettingsParticipante).then(() => {
            console.log('Joined')
            meetingTemp.on('meeting:self:lobbyWaiting', () => console.log('Aguardando OK'))

            meetingTemp.on('meeting:self:guestAdmitted', () => {
              console.log('guestAdmitted')
              meetingTemp.on('media:ready', (media) => (mediaStart(media)))
              meetingTemp.on('media:stopped', (media) => (mediaStop(media)))

              mediaMeeting(meetingTemp,mediaSettingsParticipante,currentMediaStreams).then((currentMediaStreamsTemp) => {
                setCurrentMediaStreams(currentMediaStreamsTemp)
                const [localStream] = currentMediaStreamsTemp
                if (localStream) {
                  localvideoRef.current.srcObject = localStream;
                  setTimeout(function (){
                    localvideoRef.current.muted = true;
                  }, 1000)
                }

                addMediaMeeting(meetingTemp,currentMediaStreamsTemp,mediaSettingsParticipante).then(() =>{
                  console.log('Media added')
                }).catch((error) => {
                  console.log('MeetingStreams#addMedia() :: Error adding media!');
                  console.error(error);
                });
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
  const tokenValido = localStorage.getItem('expiration') > (Math.floor(new Date() / 1000))

  if(!guestToken & tokenValido){

    guestToken = loginJWT(location.state.detail.email,location.state.detail.email)
  }

  webexObj = initWebex()
  console.log('teste')


  webexObj.once('ready', function() {
    console.log(guestToken)
    webexObj.authorization.requestAccessTokenFromJwt({jwt: guestToken})
      .then(() => {
        if (webexObj.canAuthorize) {
          console.log('Autenticado')
          setWebex(webexObj)
          webexObj.people.get('me').then((me) => {
            console.log(me)
            const sipemail = me.emails[0]
            const email = me.displayName
            setDados({"sipemail":sipemail,"email":email})
          })
          conectaSala(webexObj,location.state.detail.sala)
        }
      })
  })
},[])

  function mediaStart(media){
    console.log('media inicio')
    console.log(media)
    switch (media.type) {
      case 'remoteVideo':
        // meeting.setMeetingQuality("HIGH")
        // .then(() => {
        // })
        // .catch((error) => {
        //     console.error(error);
        // });
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
    console.log('media fim')
    console.log(media)
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

  function deixarMeeting(){
    if(remotevideoRef.current.srcObject !== null){
      remotevideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      remotevideoRef.current.srcObject = null;
    }
    if(remoteAudioRef.current.srcObject !== null){

      remoteAudioRef.current.srcObject.getTracks().forEach((track) => track.stop());
      remoteAudioRef.current.srcObject = null;
    }

    if(remotescreenRef.current.srcObject !== null){

      remotescreenRef.current.srcObject.getTracks().forEach((track) => track.stop());
      remotescreenRef.current.srcObject = null;
    }

    if(localvideoRef.current.srcObject !== null){

      localvideoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      localvideoRef.current.srcObject = null;
    }

    meeting.leave()
    webex.meetings.unregister();

  }

  function FormaMedia(){
    return (
      <div className="videos">
      <div className="remote-video">
          <legend>Remote Video</legend>
          <video ref={remotevideoRef} id="remote-video" autoPlay playsInline />
          <audio ref={remoteAudioRef} id="remote-audio" autoPlay />
          <div className="controles-media">
            <button onClick={() => (meeting.isAudioMuted() ? unMute(meeting) : mute(meeting))}>Mute/UnMute</button>
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
      <button onClick={() => (deixarMeeting())}>Deixar Sala</button>
      <FormaMedia/>
    </>
  )
}
export default ParticipanteSala
