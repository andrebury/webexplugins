import { useEffect } from "react"
import React,{useState,useRef} from 'react'
import {
  criarMeeting,
  iniciar,
  registrar,
  criarSala,
  joinMeeting,
  mediaMeeting,
  muteUnMute,
  startScreenSharemeeting,
  startStopVideo,
  joinSettingsInstrutor,
  mediaSettingsInstrutor,
  addMediaMeeting,
  resgataMembros } from '../../../services/functions'

import { withRouter } from "react-router-dom"
import './style.css'

const Instrutorsala = withRouter(({history}) => {

  const [sala, setSala] = useState('')
  const [webex, setWebex] = useState({})
  const [room, setRoom] = useState({})
  const [meeting, setMeeting] = useState({})
  const [membros,setMembros] = useState([])
  const [currentMediaStreams,setCurrentMediaStreams] = useState([])

  const remotevideoRef   = useRef(null)
  const remoteAudioRef = useRef(null)
  const localvideoRef  = useRef(null)
  const remotescreenRef = useRef(null)
  const addRoomRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    console.log(meeting)

    function HandleEntry(){
      const salaTemp = localStorage.getItem('salaInstrutor')
      const webexObj = iniciar()
      setWebex(webexObj)
      setSala(salaTemp)
      console.log(salaTemp)
      registrar(webexObj).then((resultado) =>{
        console.log(resultado ? 'Registrado' : 'Erro no registro')
        if(salaTemp){
          webexObj.rooms.get(salaTemp).then((roomsTemp) =>{
            console.log(roomsTemp)
            setRoom(roomsTemp)
            webexObj.memberships.list({'roomId' : roomsTemp.id}).then((membrosTemp) =>{
              console.log(membrosTemp.items)
              setMembros(membrosTemp.items)
            })
          })
        }
      })
    }
    if(isMounted){
      HandleEntry()
    }
  },[])




  function criaSala(){
    setMembros([])
    const salatemp = addRoomRef.current.value
    if(salatemp){
      criarSala(webex,salatemp).then((roomTemp) => {
        //retorna o objeto da sala
        setRoom(roomTemp)
        //a partir do id da sala, cria uma meeting, mas ainda não se junta a ela
        // criarMeeting(webex,roomTemp.id).then((meetingTemp) => {
        //   setMeeting(meetingTemp)
        //   //define intervalo de 15 segundos para executar a função de mostrar os membros da meeting
        //   //os participantes que se juntarem a meeting, ficarão no lobby, até o instrutor admiti-los

        // })
      })
    }
  }


  function iniciarReuniao(){
    if(!room || !webex){
      console.log(!room ? 'sem reunião' : 'Erro para se conectar na sala')
      alert(!room ? 'Crie a sala primeiro' : 'Erro para se conectar na sala')
      return
    }
    criarMeeting(webex,room.id).then((meetingTemp) => {
      //define estado para meeting
      setMeeting(meetingTemp)
      //unir ao meeting
      console.log(meetingTemp)

      joinMeeting(meetingTemp,joinSettingsInstrutor).then(() => {
        console.log('joined')
        setInterval(() => {
          const membrosTemp = resgataMembros(meetingTemp)
          setMembros(membrosTemp)
        }, 15000);
        //getmediaStreams informando a meeting e as configurações para instrutor
        meetingTemp.on('media:ready', (media) => (mediaStart(media)))
        meetingTemp.on('media:stopped', (media) => (mediaStop(media)))
        mediaMeeting(meetingTemp,mediaSettingsInstrutor,currentMediaStreams).then((currentMediaStreamsTemp) => {
          setCurrentMediaStreams(currentMediaStreamsTemp)

          const [localStream] = currentMediaStreamsTemp
          if (localStream) {
            localvideoRef.current.srcObject = localStream;
            setTimeout(function (){
              localvideoRef.current.muted = true;
            }, 1000)
          }
          addMediaMeeting(meetingTemp,currentMediaStreamsTemp,mediaSettingsInstrutor).then(() =>{
            console.log('Media added')
          }).catch((error) => {
            console.log('MeetingStreams#addMedia() :: Error adding media!');
            console.error(error);
          });
        })
      })
    })
  }


  function mediaStart(media){
    console.log('media inicio')
    console.log(media)
    switch (media.type) {
      case 'remoteVideo':
        console.log(media)
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



  function admitir(membroId){
    if(meeting){
      meeting.admit(membroId)
    }
  }

  function Membros(props){
    return(
      props.mem.map((membro) => (<div key={membro.id}><div>{membro.name}</div><div>{membro.isAudioMuted ? 'Mudo':''}</div><div><button style={membro.isInLobby ? {"visibility":"visible"} : {"visibility":"hidden"}} hidden={!membro.isInLobby} onClick={() => (admitir(membro.id))}>Admitir</button></div></div>))
    )
  }

  function deixarSala(){
    meeting.leave()
    webex.meetings.unregister();

  }

  return (
    <div>
    <div>
       <div>
          <h2>Sala {room ? room.title : sala}</h2>
          <h5>{room ? room.id : sala}</h5>
       </div>
       <input ref={addRoomRef} placeholder="Digite o nome da sala" />
       <button onClick={() => (criaSala())}>criar sala</button>
       <button onClick={() => (iniciarReuniao())}>Reunir-se</button>
       <button onClick={() => (deixarSala())}>Deixar Sala</button>
       <div/>
          <div className="body-container">
             <div className="membros">
                <h3>Membros</h3>
                <Membros mem={membros}/>
             </div>
             <div className="media-container">
                <div className="videos">
                   <div className="remote-video">
                      <legend>Remote Video</legend>
                      <video ref={remotevideoRef} id="remote-video" autoPlay playsInline />
                      <audio ref={remoteAudioRef} id="remote-audio" autoPlay />
                      <div className="controles-media">

                        <button onClick={() => ( muteUnMute(meeting))}>Mute/UnMute</button>
                        {meeting === {} ? meeting.isAudioMuted() ? 'Mudo Ligado' : 'Mudo Desligado' : ''}

                        <button onClick={() => (startStopVideo(meeting))}>Mostrar/Esconder Vídeo</button>
                        {meeting === {} ? meeting.isVideoMuted() ? 'Vídeo Ligado' : 'Vídeo Desligado' : ''}

                        <button onClick={() => (startScreenSharemeeting(meeting))}>Compartilhar Tela</button>

                      </div>
                   </div>
                   <div className="outros-videos">
                      <div className="local-video">
                         <legend>Local Video</legend>
                         <video ref={localvideoRef} id="local-video" autoPlay playsInline />
                      </div>
                      <div className="removescreen-video">
                         <legend>Remote Screenshare</legend>
                         <video ref={remotescreenRef} id="removescreen-video" autoPlay playsInline />
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  )

})

export default Instrutorsala
