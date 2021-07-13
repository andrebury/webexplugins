import React,{useEffect, useState} from 'react'
import { useHistory } from 'react-router-dom'
import { onLoadGetId } from '../../../services/functions'

function ParticipanteInicio(){

  const [email,setEmail] = useState('')
  const [room,setRoom] = useState('')

  const history = useHistory()
  useEffect(() => {
    const paginaInfo = onLoadGetId(window.location.search.slice(1))
    const roomTemp = paginaInfo.sala
    if(roomTemp){
      setRoom(roomTemp)

    }
  },[])


  function handleEntrar(){
    history.push({
      pathname: '/participantesala',
      state: { detail: {"email":email,"sala":room} }
    })
  }

  return (
    <div>
      <div>Entrar na Sala</div>
      <div>Email: <input placeholder="Escreva o email" value={email} onChange={(event) => (setEmail(event.target.value))}></input></div>
      <div>Room: <input placeholder="Escreva a sala" value={room} onChange={(event) => (setRoom(event.target.value))}></input></div>

      <div><button onClick={() => (handleEntrar())}>Entrar</button></div>
    </div>
  )
}

export default ParticipanteInicio;
