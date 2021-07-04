import React, { useEffect, useState,useRef } from "react";
import {withRouter} from 'react-router-dom'
import {criarSala,registrar,listasSalas, iniciar} from '../../../services/functions'
import './style.css'
const InstrutorCriarSala = withRouter(({history}) => {

  const nomeSalaRef = useRef(null)
  const [room, setRoom] = useState({})
  const [rooms, setRooms] = useState([{"title":"","id":""}])
  const mensagemInicialRef = useRef(null)
  const [webex,setWebex] = useState({})

  useEffect(() => {
    function HandleEntry(){

      let isMounted = false
      if(!isMounted){
        // mensagemInicialRef.current.innerHTML = (<h3>Registrando...</h3>)
        const webexObj = (window.webex = iniciar())
        setWebex(webexObj)
        registrar(webexObj).then((retorno) =>{
          alert('Registrado com sucesso!')
          return true
        }).then(() => {
            listasSalas(webexObj).then((salas) =>{
              console.log(salas)
              const roomsTemp = salas.items
              console.log(roomsTemp)

              setRooms(roomsTemp)
          })
   })
        isMounted = true
      }
    }
    HandleEntry()

  },[])

  function handleCriarSala(webex){
    const nomeSala = nomeSalaRef.current.value
    criarSala(webex,nomeSala).then((roomTemp) => {
      setRoom(roomTemp)
      console.log(roomTemp.title)
      alert('Sala ' + roomTemp.title + ' criada com sucesso!')
      setRooms([roomTemp,...rooms])
    })

  }


  function ControleCriacao(){

      return (
        <div>
          <div><h3>{room ? `Estamos na sala ${room.title}` : ''}</h3></div>
        <div className="cria-sala">
          <h3>Vamos criar uma sala</h3>
          <input ref={nomeSalaRef} placeholder="Nome da sala"></input>
          <a onClick={() => (handleCriarSala(webex))}>Criar</a>
        </div>
        <div className="sala-container">
          <h3>Lista de salas disponíveis</h3>
          { rooms.map((room) => <div className="sala-info" key={room.id} ><h2 >{room.title}</h2><a onClick={() => (setRoom(room))}>Entrar</a></div>)}

        </div>
      </div>
      )

  }

  return (
    <>
    <div>
      <h1 style={{textAlign:"left",margin:"2px"}}>
        Webex Plugin App - Bem Vindo Instrutor
      </h1>
    </div>
    <ControleCriacao salas={rooms}/>
    </>
  )
})


export default InstrutorCriarSala;
