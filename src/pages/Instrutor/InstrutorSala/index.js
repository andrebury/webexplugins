import { useEffect } from "react"
import React,{useState,useRef} from 'react'
import {criarMeeting, iniciar,registrar,criarSala, joinMeeting,mediaMeeting,mute,unMute,startScreenSharemeeting,startStopVideo,screenShareChange,videoChange} from '../../../services/functions'
import { withRouter } from "react-router-dom"
import './style.css'
const Instrutorsala = withRouter(({history}) => {

  const [sala, setSala] = useState('')
  const [webex, setWebex] = useState({})
  const [room, setRoom] = useState({})
  const [meeting, setMeeting] = useState({})
  const [membros,setMembros] = useState([])

  const addPersonRef = useRef(null)
  const remotevideoRef   = useRef(null)
  const remoteAudioRef = useRef(null)
  const localvideoRef  = useRef(null)
  const remotescreenRef = useRef(null)
  const addRoomRef = useRef(null)
  const salaTemp = localStorage.getItem('salaInstrutor')

  useEffect(() => {
    let isMounted = true

    function HandleEntry(){
      const webexObj = iniciar()
      setWebex(webexObj)
      setSala(salaTemp)
      console.log(localStorage.getItem('salaInstrutor'))
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
        setRoom(roomTemp)
        criarMeeting(webex,roomTemp.id).then((meetingTemp) => {
          setMeeting(meetingTemp)
        })
      })
    }
  }

  function addPerson(){
    const person = addPersonRef.current.value
    if(person){
      webex.memberships.create({
        personEmail: person,
        roomId: room.id
      }).then((membership) => {
        console.log(membership)
        const membrosTemp = membros
        membrosTemp.push(membership)
        setMembros(membrosTemp)
        addPersonRef.current.value = ''
      }).catch((error) => {
        console.log(error)
        alert('Participate ' + person + ' não pode ser incluído pois ele já está na sala')
      })
    }else{
      alert('Escreva o email do adicionado')
    }
  }

  function iniciarReuniao(){
    criarMeeting(webex,room.id).then((meetingTemp) => {
      setMeeting(meetingTemp)
      joinMeeting(meeting,webex)
      mediaMeeting(meetingTemp)
      meetingTemp.on('media:ready', (media) => {
        mediaStart(media)

      })

      meetingTemp.on('media:stopped', (media) => {

        mediaStop(media)
      })
    })
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
            <button onClick={() => ((screenShareChange(meeting)))}>Habilita/Desabilita Screenshare</button> */}
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
          <div className="removescreen-video">
            <legend>Remote Screenshare</legend>
            <video ref={remotescreenRef} id="removescreen-video" autoPlay playsInline />
          </div>
        </div>

      </div>

    )
  }


  return (
    <div>
      <div>
      <div><h2>Sala {room ? room.title : sala}</h2></div>
      <input ref={addRoomRef} placeholder="Digite o nome da sala" />
      <button onClick={() => (criaSala())}>criar sala</button>
      <button onClick={() => (iniciarReuniao())}>Reunir-se</button>
      <button onClick={() => (meeting.leave())}>Deixar Sala</button>


        <input ref={addPersonRef} placeholder="Adicione pessoas a sala" />
        <button onClick={() => (addPerson())}>Adicionar</button>

      <div/>
        <div className="body-container">
          <div className="membros">
            <h3>Membros</h3>
        {
            membros.map((membro) => (<div key={membro.id}>{membro.personDisplayName}</div>))
        }
        </div>
        <div className="media-container">
        <FormaMedia/>

        </div>
        </div>
      </div>
    </div>
  )

})

export default Instrutorsala
