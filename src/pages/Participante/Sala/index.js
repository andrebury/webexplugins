
import React,{ useState,useRef, useEffect } from "react";
import { joinMeeting , loginJWT,mediaMeeting,registrar,mute,unMute,startScreenSharemeeting,startStopVideo,screenShareChange,videoChange} from '../../../services/functions'

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
          webexObj.meetings.register().then(() => {
            console.log('successfully registered');
            return true
          }).catch((error) => {
            console.warn('error registering', error);
            return false
          }).then((result) => {
            if(result){
              // // webexObj.meetings.on('meetings:ready', (m) =>  (trataNewMeeting(m)));
              // // webexObj.meetings.on('meetings:registered', (m) =>  (trataNewMeeting(m)));
              // console.log('adicionando eventos')
              // webexObj.meetings.on('meeting:added', (m) =>  {
              //   const {type} = m;
              //   console.log('Tipo: ' + type)

              //   if ((type === 'INCOMING' || type === 'JOIN')) {
              //     const newMeeting = m.meeting;

              //     // alert('incomingsection');
              //     console.log(newMeeting)
              //     joinMeeting(newMeeting,webexObj)
              //     setMeeting(newMeeting)
              //     mediaMeeting(newMeeting)
              //     newMeeting.on('media:ready', (media) => (mediaStart(media)))
              //     newMeeting.on('media:stopped', (media) => (mediaStop(media)))
              //   }
              // });
              // webexObj.meetings.on('meeting:removed', (m) => (mediaStop(m)));
              // webexObj.meetings.on('meeting:added', (m) =>  {
              //   const {type} = m;
              //   console.log('Tipo: ' + type)
              //   if ((type === 'INCOMING' || type === 'JOIN')) {
              //     const newMeeting = m.meeting;
              //     // alert('incomingsection');
              //     console.log(newMeeting)
              //     joinMeeting(newMeeting,webexObj)
              //     setMeeting(newMeeting)
              //     mediaMeeting(newMeeting)
              //     newMeeting.on('media:ready', (media) => (mediaStart(media)))
              //     newMeeting.on('media:stopped', (media) => (mediaStop(media)))
              //   }
              // });

              webexObj.meetings.create(location.state.detail.sala).then((meeting) => {

                meeting.join()
                  .then(() => {
                    console.log(meeting.destination ||
                      meeting.sipUri ||
                      meeting.id)
                      meeting.on('media:ready', (media) => {
                        mediaStart(media)})
                    })
                      meeting.on('media:stopped', (media) => (mediaStop(media)))

                      meeting.on('meeting:self:lobbyWaiting', () => {
                        console.log('Aguardando OK')
                      })

                      meeting.on('meeting:self:guestAdmitted', () => {
                        console.log('guestAdmitted OK')
                        if(meeting){
                          setMeeting(meeting)
                          mediaMeeting(meeting)
                        }
                  });
                })
                .catch((err) => {
                  if (err.joinIntentRequired) {
                    console.log('Error')

                    meeting.on('meeting:self:lobbyWaiting', () => {
                      console.log('Aguardando error')
                    })

                    // join as guest simply makes the call again with moderator parameter
                    meeting.join(({moderator: false})).then(() => {
                      console.log('Aceito')
                      // if host hasn't started the meeting, now you are in the lobby, else if host has started the meeting, you are in the meeting
                    });
                  }
                });

            }

          })



        }
      })
  });

},[])

  function trataNewMeeting(m){
    const {type} = m;
    console.log('Tipo: ' + type)

    if ((type === 'INCOMING' || type === 'JOIN') & !meeting) {
      const newMeeting = m.meeting;

      // alert('incomingsection');
      console.log(newMeeting)
      joinMeeting(newMeeting,webexObj)
      setMeeting(newMeeting)
      mediaMeeting(newMeeting)
      newMeeting.on('media:ready', (media) => (mediaStart(media)))
      newMeeting.on('media:stopped', (media) => (mediaStop(media)))
    }
  }

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
      <div>{dados.email} </div>
      <div>{dados.sipemail} </div>
      <button onClick={() => (meeting.leave())}>Deixar Sala</button>
      <FormaMedia/>
    </>
  )
}
export default ParticipanteSala
