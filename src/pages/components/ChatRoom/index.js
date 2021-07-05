import React,{useRef} from "react";
import './style.css'
export function ChatRoom(props){
  const mensagemRef = useRef(null);


  function ChatContainer(props){


    const chatObject = props.msgs.map((msg) => <div className="container-card darker" key={msg.id}> <span style={{fontSize:"12px"}}>{msg.from}</span> <p>{msg.text}</p> <span className="time-left">{msg.time}</span> </div>)

    return chatObject
  }

  return (

    <div className="chat-container">
      <div className="chat-body">
        <ChatContainer msgs={props.msgChat}/>
      </div>
        <div className="chat-tools">
          <textarea ref={mensagemRef}/><button className="styledButton" onClick={() => (props.enviarMensagem(mensagemRef.current.value))}>Enviar</button>
          <button className="styledButton" onClick={() => (props.prepararVideo())}>Vídeo</button>
      </div>
    </div>
  )
}
