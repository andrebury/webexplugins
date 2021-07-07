import React,{useState} from 'react'
import { useHistory } from 'react-router-dom'
import { onLoadGetId } from '../../../services/functions'

function ParticipanteInicio(){

  const [email,setEmail] = useState('')
  const [nome,setNome] = useState('')

  const sala = onLoadGetId(window.location.search.slice(1)).sala
  const history = useHistory()



  function handleEntrar(){
    history.push({
      pathname: '/participantesala',
      state: { detail: {"nome":nome,"email":email,"sala":sala} }
    })
  }

  return (
    <div>
      <div>Entrar na Sala</div>
      <div>Nome: <input placeholder="Escreva o nome" value={nome} onChange={(event) => (setNome(event.target.value))}></input></div>
      <div>Email: <input placeholder="Escreva o email" value={email} onChange={(event) => (setEmail(event.target.value))}></input></div>
      <div><button onClick={() => (handleEntrar())}>Entrar</button></div>
    </div>
  )
}

export default ParticipanteInicio;
