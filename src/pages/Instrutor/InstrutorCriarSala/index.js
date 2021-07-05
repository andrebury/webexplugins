import React, { useEffect, useState,useRef } from "react";
import {withRouter} from 'react-router-dom'
import {criarSala,listasSalas, iniciar,enviarMensagem,conversorData, registrar} from '../../../services/functions'
import './style.css'


const InstrutorCriarSala = withRouter(({history}) => {

  const nomeSalaRef = useRef(null)
  const [room, setRoom] = useState({})
  const [rooms, setRooms] = useState([{"title":"","id":""}])
  const mensagemRef = useRef(null)
  const [webex,setWebex] = useState({})
  const [salaAtiva,setSalaAtiva] = useState(false)
  const [msgRoom,setMsgRoom] = useState([{"id":"","text":"Seja Bem Vindo ao Chat da Sala!","from":"Sistema","time":"00:00"}])
const [classes, setClasses] = useState({
  "lista-salas":"lista-salas",
  "video-body":"video-body hidden",
  "styledButton":"styledButton"
})
  useEffect(() => {
    function HandleEntry(){

      let isMounted = false
      if(!isMounted){
        // mensagemInicialRef.current.innerHTML = (<h3>Registrando...</h3>)
        const webexObj = (window.webex = iniciar())
        setWebex(webexObj)

        listasSalas(webexObj).then((salas) =>{
          const roomsTemp = salas.items
          setRooms(roomsTemp)
          if(roomsTemp.length > 0){
            setRoom(roomsTemp[0])
            listenRoom(webexObj)

          }
        })


        isMounted = true
      }
    }
    HandleEntry()

  },[])


  function putChat(event){
    const repetido = msgRoom.find( msg => msg.id === event.data.id );

    if(repetido === undefined){
      console.log('entrar chat')
      const from = event.data.personEmail
      const text = event.data.text
      const time = conversorData(event.data.created)
      const id = event.data.id
      const roomId = event.data.roomId

      let msgChatTemp = []
      msgChatTemp = msgRoom

      setMsgRoom([])

      msgChatTemp.push({'roomId':roomId,'id':id,'from':from,'text': text,"created":time})

      setMsgRoom(msgChatTemp)

    }
  }

    function listenRoom(webexObj){
      webexObj.messages.listen()
    .then(() => {
      console.log('listening to message events');
      webexObj.messages.on('created', (event) => putChat(event));
      webexObj.messages.on('deleted', (event) => console.log({'delecao': event}));
    })
    .catch((e) => console.error(`Unable to register for message events: ${e}`));

    }


    function unListenRoom(){
      webex.messages.stopListening();
      webex.messages.off('created');
      webex.messages.off('deleted');
    }


  function handleCriarSala(webex){
    const nomeSala = nomeSalaRef.current.value
    criarSala(webex,nomeSala).then((roomTemp) => {
      setRoom(roomTemp)
      alert('Sala ' + roomTemp.title + ' criada com sucesso!')
      setRooms([roomTemp,...rooms])
    })

  }
  function HandleRoomEntry(roomParam){

    setRoom(roomParam)
    setSalaAtiva(true)
  }

  function ChatContainer(props){
    if(!props.msgs){
      return <div className="container-card darker"> <span style={{fontSize:"12px"}}>Sistema</span> <p>Bem Vindo ao Chat. Escreva a mensagem e clique em enviar</p></div>
    }

    const msgifRoom = props.msgs.filter((msg) => (msg.roomId === props.roomsetted.id))
    const chatObject = msgifRoom.map((msg) => <div className="container-card darker" key={msg.id}> <span style={{fontSize:"12px"}}>{msg.from}</span> <p>{msg.text}</p> <span className="time-left">{msg.time}</span> </div>)

    return chatObject
  }

  function prepararVideo(room){
    setClasses({
      "lista-salas":"lista-salas hidden",
      "video-body":"video-body visible",
      "styledButton": "styledButton hidden"
  })

  }
  function esconderVideo(){
    setClasses({
      "lista-salas":"lista-salas",
      "video-body":"video-body hidden",
      "styledButton":"styledButton"
    })
  }

  return (
    <>
    <div>
      <h1 style={{textAlign:"left",margin:"2px"}}>
        Webex Plugin App - Bem Vindo Instrutor
      </h1>
    </div>
    {/* <ControleCriacao salas={rooms}/> */}

    <div>
      <div><h3>{room ? `${room.title}` : ''}</h3></div>
      {/* <div className="cria-sala">
        <h3>Vamos criar uma sala</h3>
        <input ref={nomeSalaRef} placeholder="Nome da sala"></input>
        <button onClick={() => (handleCriarSala(webex))}>Criar</button>
      </div> */}
      <div className="sala-container">
        <div className={classes['lista-salas']}>
          <h2>Lista de salas disponíveis</h2>
          { rooms.map((room) => <div className="sala-info" key={room.id} ><h3 className="h3-entrasala" onClick={() => (HandleRoomEntry(room))}>{room.title}</h3></div>)}
        </div>
        <div className="chat-container">
        <div className="chat-body">
          <ChatContainer msgs={msgRoom} roomsetted={room}/>

        </div>
        <div className="chat-tools">
          <textarea ref={mensagemRef}/><button className="styledButton" onClick={() => (enviarMensagem(mensagemRef,room.id,webex))}>Enviar</button>
          <button className={classes['styledButton']} onClick={() => (prepararVideo(room))}>Vídeo</button>
        </div>
      </div>
      <div className={classes['video-body']}>
        <h3>Vídeo</h3>
        <button className="styledButton" onClick={() => (esconderVideo())}>Voltar</button>
      </div>

      </div>
    </div>

    </>
  )
})


export default InstrutorCriarSala;
