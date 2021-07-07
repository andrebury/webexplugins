import { useEffect } from "react"
import React,{useState,useRef} from 'react'
import {criarMeeting, iniciar,registrar,criarSala, joinMeeting,mediaMeeting} from '../../../services/functions'
import { withRouter } from "react-router-dom"

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


  useEffect(() => {
    let isMounted = true

    function HandleEntry(){
      const webexObj = iniciar()
      setWebex(webexObj)
      const salaTemp = localStorage.getItem('salaInstrutor')
      setSala(salaTemp)
      console.log(localStorage.getItem('salaInstrutor'))
      registrar(webexObj).then((resultado) =>{
        console.log(resultado ? 'Registrado' : 'Erro no registro')
        webexObj.rooms.get(salaTemp).then((roomsTemp) =>{
          console.log(roomsTemp)
          setRoom(roomsTemp)
          webexObj.memberships.list({'roomId' : roomsTemp.id}).then((membrosTemp) =>{
            console.log(membrosTemp.items)
            setMembros(membrosTemp.items)
          })
        })

      })
    }
    if(isMounted){
      HandleEntry()

    }

  },[])

  function criaSala(){
    if(sala){
      criarSala(webex,sala).then((roomTemp) => {
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
        if (!media) {
          return;
        }
        mediaStart(media)

      })

      meetingTemp.on('media:stopped', (media) => {
        mediaStop(media)
      })
    })

  }

  function mediaStart(media){
    console.log(media)
    if (media.type === 'local') {
      localvideoRef.current.srcObject = media.stream;
    }
    if (media.type === 'remoteVideo') {
      remotevideoRef.current.srcObject = media.stream;
    }
    if (media.type === 'remoteAudio') {
      remoteAudioRef.current.srcObject = media.stream;
    }
    if (media.type === 'remoteShare') {
      remotescreenRef.current.srcObject = media.stream;
    }
  }


  function mediaStop(media){
    if (media.type === 'local') {
      localvideoRef.current.srcObject = null
    }
    if (media.type === 'remoteVideo') {
      remotevideoRef.current.srcObject = null
    }
    if (media.type === 'remoteAudio') {
      remoteAudioRef.current.srcObject = null
    }
    if (media.type === 'remoteShare') {
      remotescreenRef.current.srcObject = null
    }

  }

  function FormaMedia(){
    return (
      <div className="videos">
      <div className="remote-video">
          <legend>Remote Video</legend>

          <video ref={remotevideoRef} id="remote-video" autoPlay playsInline />
          <audio ref={remoteAudioRef} id="remote-audio" autoPlay />
      </div>
      <div className="outros-videos">

            <legend>Local Video</legend>
            <video ref={localvideoRef} id="local-video" autoPlay playsInline />

            <legend>Remote Screenshare</legend>
            <video ref={remotescreenRef} id="removescreen-video" autoPlay playsInline />
        </div>

      </div>

    )
  }

  function Membros(props){
    return props.membros.map((membro) => (<div key={membro.id}>{membro.personDisplayName}</div>))
  }

  return (
    <div>
      <div>
      <div><h2>Sala {room ? room.title : sala}</h2></div>
      <button onClick={() => (criaSala())}>criar sala</button>
      <button onClick={() => (iniciarReuniao())}>Reunir-se</button>
      <button onClick={() => (meeting.leave())}>Deixar Sala</button>


      </div>
      <div>
        <input ref={addPersonRef} placeholder="Adicione pessoas a sala" />
        <button onClick={() => (addPerson())}>Adicionar</button>
        <Membros membros={membros}/>
        <FormaMedia/>
      </div>
    </div>
  )

})

export default Instrutorsala
