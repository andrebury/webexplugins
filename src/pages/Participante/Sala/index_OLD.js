/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable no-multi-assign */
/* eslint-disable react/button-has-type */
import React, {
  useEffect, useState, useRef,
} from 'react';
import { init as initWebex } from 'webex';
import './style.css';
// import {init, rooms, memberships, messages} from 'webex'

function Participante() {
  const [auth, setAuth] = useState('MjI2Zjk1ZDItZDI2YS00NmM2LTk2OWQtOWM5Zjc4YWVlNmQ3Y2YxYzBiMDAtYzFl_PF84_7458d5d6-c9ff-4f81-968b-b4ae8e35e028');
  const [msg, setMsg] = useState(false);
  const [room, setRoom] = useState('Y2lzY29zcGFyazovL3VzL1JPT00vZmFiN2Q1MjEtZDg1YS0xMWViLWIyNTgtNTk0YTRhMGJjMTA4');
  const [registrado, setRegistrado] = useState(false);
  const [msgRegistrado, setMsgRegistrado] = useState('Não Registrado');
  const [joined, setJoined] = useState(false);
  const [salvo, setSalvo] = useState('Não Salvo!');
  const [webexObj, setWebexObj] = useState(Object);
  const [meetingList, setMeetingList] = useState([]);
  const [statusMeeting, setStatusMeeting] = useState('');
  const [receivedAudio, setReceivedAudio] = useState(true);
  const [receiveVideo, setReceiveVideo] = useState(true);
  const [receiveShare, setReceiveShare] = useState(true);
  const [sendAudio, setSendAudio] = useState(true);
  const [sendVideo, setSendVideo] = useState(true);
  const [sendShare, setSendShare] = useState(false);
  const [sourceDevicesAudioInput, SetSourceDevicesAudioInput] = useState([]);
  const [sourceDevicesVideoInput, SetSourceDevicesVideoInput] = useState([]);
  const [sourceDevicesAudioOutput, SetSourceDevicesAudioOutput] = useState([]);
  const [sourceDevicesAudioInputSelected, SetSourceDevicesAudioInputSelected] = useState('');
  const [sourceDevicesVideoInputSelected, SetSourceDevicesVideoInputSelected] = useState('');
  const [sourceDevicesAudioOutputSelected, SetSourceDevicesAudioOutputSelected] = useState('');
  const [currentMediaStreams, SetCurrentMediaStreams] = useState([]);
  const [sala,SetSala] = useState({})
  const [msgChat,setMsgChat] = useState([{"id":"","text":"Seja Bem Vindo ao Chat da Sala!","from":"Sistema","time":"00:00"}])
  const isSafari = /Version\/[\d.]+.*Safari/.test(navigator.userAgent);
  const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const remotevideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const remotescreenRef = useRef(null);
  const localscreenRef = useRef(null);
  const localvideoRef = useRef(null);
  const nomeSalaCreateRef = useRef(null);
  const mensagemRef = useRef(null);
  const chatcontainerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    // const token = localStorage.getItem('auth')
    const token = 'YmI5NGFkOTUtNWYyZi00ZWZiLTg0MTUtNmU1NTRmODZjZmQ1OGVlODQ3MzctYTEy_PF84_7458d5d6-c9ff-4f81-968b-b4ae8e35e028';
    if (isMounted) setAuth(token);
    if (token === undefined || !token) {
      if (isMounted) setMsg(false);
    } else {
      if (isMounted) setMsg(true);
    }

    if (isMounted) iniciar()


  }, []);

  useEffect(() =>{
    setInterval(() => {
      chatcontainerRef.current.scrollTop = chatcontainerRef.current.scrollHeight
    }, 3000);
  },[])

  function iniciar() {
    const webex = (window.webex = initWebex({
      credentials: {
        access_token: auth,
      },
    }));
    setWebexObj(webex);
    webex.once('ready', () => {
      console.log('Webex Ready');
      setSalvo('Salvo!');
      setRegistrado(true)
      setMsgRegistrado('Registrando...')
      webex.meetings.register().then(() => {
        console.log('successfully registered');
        setMsgRegistrado('Registrado')
        setRegistrado(true)

        listenRoom(webex)
      }).catch((error) => {
        console.warn('error registering', error);
        setRegistrado(false)
        return false
      })
    })
  }


  function registrar(webex) {

    webex.meetings.register()
      .then(() => {
        console.log('Authentication#register() :: successfully registered');
        setMsgRegistrado('Registrado')
        setRegistrado(true)
        return true
      })
      .catch((error) => {
        console.warn('Authentication#register() :: error registering', error);
        setRegistrado(false)
        return false
      })
  }

  function unregister() {
    if(!webexObj.meetings.registered){
      alert('Você não está registrado!')
    }else{
      console.log('Authentication#unregister()');
      setMsgRegistrado('Unregistering...');

      webexObj.meetings.unregister()
        .then(() => {
          console.log('Authentication#register() :: successfully unregistered');
        })
        .catch((error) => {
          console.warn('Authentication#register() :: error unregistering', error);
        })
        .finally(() => {
          setRegistrado(webexObj.meetings.registered
            ? true
            : false);
        });
    }

  }

  function listenRoom(webex){
    webex.messages.listen()
  .then(() => {
    console.log('listening to message events');
    webex.messages.on('created', (event) => putChat(event));
    webex.messages.on('deleted', (event) => console.log({'delecao': event}));
  })
  .catch((e) => console.error(`Unable to register for message events: ${e}`));

  }

  function enviarMensagem(){
    const mensagem = mensagemRef.current.value
    webexObj.messages.create({
      text: mensagem,
      roomId: room
    }).then((mensagemReturn) => {
      console.log('mensagem criada: ' + mensagemReturn)
      mensagemRef.current.value = '';
    })
  }

  function unListenRoom(){
    webexObj.messages.stopListening();
    webexObj.messages.off('created');
    webexObj.messages.off('deleted');
  }

  function fecharMidia(){
    localscreenRef.current.srcObject = null;
    localvideoRef.current.srcObject = null;
    remotescreenRef.current.srcObject = null;
    remotevideoRef.current.srcObject = null;
    remoteAudioRef.current.srcObject = null;
  }

  function prepararVideo(meeting){

      return meeting.join().then(() => {
        const mediaSettings = {
          receiveVideo: true,
          receiveAudio: true,
          receiveShare: true,
          sendVideo: false,
          sendAudio: false,
          sendShare: false
        };

        // Get our local media stream and add it to the meeting
        return meeting.getMediaStreams(mediaSettings).then((mediaStreams) => {
          const [localStream, localShare] = mediaStreams;

          meeting.addMedia({
            localShare,
            localStream,
            mediaSettings
          });
        });
      });
    }



  function getCurrentMeeting() {
    const meetings = webexObj.meetings.getAllMeetings();
    console.log('getCurrentMeeting');

    return meetings[Object.keys(meetings)[0]];
  }

  function getMediaSettings(modo = '') {
    const settings = {};
    let toggleSourcesMediaDirection
    if(modo === 'video'){
      toggleSourcesMediaDirection = [
        { value: 'receivedAudio', checked: true },
        { value: 'receiveVideo', checked: true },
        { value: 'receiveShare', checked: false },
        { value: 'sendAudio', checked: true },
        { value: 'sendVideo', checked: true },
        { value: 'sendShare', checked: false },
      ];
    }else if(modo === 'onlyAudio'){
      toggleSourcesMediaDirection = [
        { value: 'receivedAudio', checked: true },
        { value: 'receiveVideo', checked: true },
        { value: 'receiveShare', checked: true },
        { value: 'sendAudio', checked: true },
        { value: 'sendVideo', checked: false },
        { value: 'sendShare', checked: false },
      ];
    }else{
      toggleSourcesMediaDirection = [
        { value: 'receivedAudio', checked: receivedAudio },
        { value: 'receiveVideo', checked: receiveVideo },
        { value: 'receiveShare', checked: receiveShare },
        { value: 'sendAudio', checked: sendAudio },
        { value: 'sendVideo', checked: sendVideo },
        { value: 'sendShare', checked: sendShare },
      ];
    }

    toggleSourcesMediaDirection.forEach((options) => {
      settings[options.value] = options.checked;

      if (options.sendShare && (isSafari || isiOS)) {
        // It's been observed that trying to setup a Screenshare at join along with the regular A/V streams
        // causes Safari to loose track of it's user gesture event due to getUserMedia & getDisplayMedia being called at the same time (through our internal setup)
        // It is recommended to join a meeting with A/V streams first and then call `meeting.shareScreen()` after joining the meeting successfully (on all browsers)
        settings[options.value] = false;
        console.warn('MeetingControsl#getMediaSettings() :: Please call `meeting.shareScreen()` after joining the meeting');
      }
    });

    return settings;
  }

  function getMediaStreams(mediaSettings = getMediaSettings(), audioVideoInputDevices = {}) {
    const meeting = getCurrentMeeting();

    console.log('MeetingControls#getMediaStreams()');

    if (!meeting) {
      console.log('MeetingControls#getMediaStreams() :: no valid meeting object!');

      return Promise.reject(new Error('No valid meeting object.'));
    }

    // Get local media streams
    return meeting.getMediaStreams(mediaSettings, audioVideoInputDevices)
      .then(([localStream, localShare]) => {
        console.log('MeetingControls#getMediaStreams() :: Successfully got following streams', localStream, localShare);
        // Keep track of current stream in order to addMedia later.
        const [currLocalStream, currLocalShare] = currentMediaStreams;

        /*
       * In the event of updating only a particular stream, other streams return as undefined.
       * We default back to previous stream in this case.
       */
        SetCurrentMediaStreams([localStream || currLocalStream, localShare || currLocalShare]);

        return [localStream || currLocalStream, localShare || currLocalShare];
      })
      .then(([localStream]) => {
        if (localStream && mediaSettings.sendVideo) {
          console.log('ok');
          localvideoRef.current.srcObject = localStream;
        }

        return { localStream };
      })
      .catch((error) => {
        console.log('MeetingControls#getMediaStreams() :: Error getting streams!');
        console.error();

        return Promise.reject(error);
      });
  }

  function coolectRooms(){
    let roomsList = []

    webexObj.rooms.listWithReadStatus().then((room) =>{
      console.log(room)

      Object.keys(room).forEach(
        (key) => {
          roomsList.push(room[key]);
        },
      );
    }).then(() => {
      console.log('Rooms de André: ' + roomsList)
      console.log(webexObj.rooms.get(roomsList[0].id))
    })



  }


  function createRoom(){

    const nomeSala = nomeSalaCreateRef.current.value
    if(nomeSala.length > 0){
      webexObj.rooms.create({ title: nomeSala })
      .then((r) => {
        SetSala(r)
        return webexObj.rooms.get(r.id)
      }).then(roomInfo => {
        console.log(roomInfo)
      });
    }
  }

  const conversorData = (date) => {
    if (date === undefined || date === '') {
        return date
    } else {
        return date.substring(14,16) + ':' + date.substring(11,13)

    }
}

function putChat(event){
  const repetido = msgChat.find( msg => msg.id === event.data.id );
  if(event.data.roomId === room & repetido === undefined){
    const from = event.data.personEmail
    const text = event.data.text
    const time = conversorData(event.data.created)
    const id = event.data.id

    let msgChatTemp = []
    msgChatTemp = msgChat

    setMsgChat([])

    msgChatTemp.push({'id':id,'from':from,'text': text,"created":time})

    setMsgChat(msgChatTemp)

  }
}

  function sendMessage(){
    webex.rooms.create({title: 'Create Message Example'})
      .then(function(room) {
        return webex.messages.create({
          text: 'Howdy!',
          roomId: room.id
        });
      })
      .then(function(message) {
        var assert = require('assert');
        assert(message.id);
        assert(message.personId);
        assert(message.personEmail);
        assert(message.roomId);
        assert(message.created);
        return 'success';
      });
  }


  function collectMeetings() {
    const meetingListLocal = [];

    console.log('MeetingsManagement#collectMeetings()');

    webexObj.meetings.syncMeetings()
      .then(() => new Promise((resolve) => {
        setTimeout(() => resolve(), 200);
      }))
      .then(() => {
        console.log('MeetingsManagement#collectMeetings() :: successfully collected meetings');
        const meetings = webexObj.meetings.getAllMeetings();
        if (Object.keys(meetings).length === 0) {
          setMeetingList([]);
        }

        Object.keys(meetings).forEach(
          (key) => {
            meetingListLocal.push(meetings[key]);
          },
        );
        setMeetingList(meetingListLocal);
        console.log('meetinglist');
      });
  }


  function populateSourceDevices(mediaDevice) {
    console.log('populateSourceDevices');
    let arrayDevice = [];

    // eslint-disable-next-line default-case
    switch (mediaDevice.kind) {
      case 'audioinput':
        arrayDevice = sourceDevicesAudioInput;
        arrayDevice.push({ value: mediaDevice.deviceId, text: mediaDevice.label });
        SetSourceDevicesAudioInput(arrayDevice);

        break;
      case 'audiooutput':
        arrayDevice = sourceDevicesAudioOutput;
        arrayDevice.push({ value: mediaDevice.deviceId, text: mediaDevice.label });
        SetSourceDevicesAudioOutput(arrayDevice);

        break;
      case 'videoinput':
        arrayDevice = sourceDevicesVideoInput;
        arrayDevice.push({ value: mediaDevice.deviceId, text: mediaDevice.label });
        SetSourceDevicesVideoInput(arrayDevice);

        break;
    }
  }

  function stopMediaTrack(type) {
    const meeting = getCurrentMeeting();

    if (!meeting) return;
    const { audioTrack, videoTrack, shareTrack } = meeting.mediaProperties;

    // eslint-disable-next-line default-case
    switch (type) {
      case 'audio':
        audioTrack.stop();
        break;
      case 'video':
        videoTrack.stop();
        break;
      case 'share':
        shareTrack.stop();
        break;
    }
  }

  function getAudioVideoInput() {
    const deviceId = (id) => ({ deviceId: { exact: id } });
    const audioInput = sourceDevicesAudioInputSelected || 'default';
    const videoInput = sourceDevicesVideoInputSelected || 'default';

    return { audio: deviceId(audioInput), video: deviceId(videoInput) };
  }

  function setVideoInputDevice() {
    const meeting = getCurrentMeeting();
    const { sendVideo, receiveVideo } = getMediaSettings();
    const { video } = getAudioVideoInput();

    if (meeting) {
      stopMediaTrack('video');
      getMediaStreams({ sendVideo, receiveVideo }, { video })
        .then(({ localStream }) => {
          meeting.updateVideo({
            sendVideo,
            receiveVideo,
            stream: localStream,
          });
        })
        .catch((error) => {
          console.log('MeetingControls#setVideoInputDevice :: Unable to set video input device');
          console.error(error);
        });
    } else {
      console.log('MeetingControls#getMediaDevices() :: no valid meeting object!');
    }
  }

  function setAudioInputDevice() {
    const meeting = getCurrentMeeting();
    const { sendAudio, receiveAudio } = getMediaSettings();
    const { audio } = getAudioVideoInput();

    if (meeting) {
      stopMediaTrack('audio');
      getMediaStreams({ sendAudio, receiveAudio }, { audio })
        .then(({ localStream }) => {
          meeting.updateAudio({
            sendAudio,
            receiveAudio,
            stream: localStream,
          });
        })
        .catch((error) => {
          console.log('MeetingControls#setAudioInputDevice :: Unable to set audio input device');
          console.error(error);
        });
    } else {
      console.log('MeetingControls#getMediaDevices() :: no valid meeting object!');
    }
  }

  function setAudioOutputDevice() {
    const audioOutputDevice = sourceDevicesAudioOutputSelected || 'default';

    remoteAudioRef.current.setSinkId(audioOutputDevice)
      .then(() => {
        console.log(`MeetingControls#setAudioOutput() :: successfully set audio output to: ${audioOutputDevice}`);
      })
      .catch((error) => {
        console.log('MeetingControls#setAudioOutput() :: Error setting audio output!');
        console.error(error);
      });
  }

  function getMediaDevices() {
    console.log('getMediaDevices');
    SetSourceDevicesAudioInput([]);
    SetSourceDevicesAudioOutput([]);
    SetSourceDevicesVideoInput([]);

    const meeting = getCurrentMeeting();

    console.log(meeting);

    if (meeting) {
      console.log('MeetingControls#getMediaDevices()');
      meeting.getDevices()
        .then((devices) => {
          devices.forEach((device) => {
            populateSourceDevices(device);
            console.log('getMediaDevices');
          });
        });
    } else {
      console.log('MeetingControls#getMediaDevices() :: no valid meeting object!');
    }
  }

  function addMedia() {
    const meeting = getCurrentMeeting();
    const [localStream, localShare] = currentMediaStreams;

    console.log('MeetingStreams#addMedia()');

    if (!meeting) {
      console.log('MeetingStreams#addMedia() :: no valid meeting object!');
    }

    meeting.addMedia({
      localShare,
      localStream,
      mediaSettings: getMediaSettings(),
    }).then(() => {
      console.log('MeetingStreams#addMedia() :: successfully added media!');
    }).catch((error) => {
      console.log('MeetingStreams#addMedia() :: Error adding media!');
      console.error(error);
    });

    // Wait for media in order to show video/share
    meeting.on('media:ready', (media) => {
      // eslint-disable-next-line default-case
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
        case 'localShare':
          localscreenRef.current.srcObject = media.stream;
          break;
      }
    });
  }

  function joinMeeting(meetingId) {
    console.log(`ID da Sala: ${meetingId}`);
    const meeting = webexObj.meetings.getAllMeetings()[meetingId];
    console.log('meetings: ' + meeting)
    if (!meeting) {
      alert('A sala é invalida ou não está mais disponível')
      console.log(`meeting ${meetingId} is invalid or no longer exists`);
    }else{
      const resourceId = webexObj.devicemanager._pairedDevice
      ? webexObj.devicemanager._pairedDevice.identity.id
      : undefined;

      meeting.join({
        pin: false,
        moderator: false,
        moveToResource: false,
        resourceId,
      })
        .then(() => {
          setStatusMeeting(meeting.destination
                || meeting.sipUri
                || meeting.id);
          setJoined(true)
        }).catch((e) => {
          console.warn(e);
          alert('Sala não Existe!');
        });
      }

  }

  function leaveMeeting(meetingId) {
    fecharMidia()

    if (!meetingId) {
      return;
    }

    const meeting = webexObj.meetings.getAllMeetings()[meetingId];

    if (!meeting) {
      alert('Você não está mais em nenhuma sala!')
      console.log(`meeting ${meetingId} is invalid or no longer exists`);
      fecharMidia()
      setJoined(false)
    }else{
      meeting.leave()
      .then(() => {
        setStatusMeeting('Not currently in a meeting');
        // eslint-disable-next-line no-use-before-define
        // cleanUpMedia(htmlMediaElements);
      });
    }


    setMeetingList([]);
  }

  function MakeOptionsDevices(props) {
    // eslint-disable-next-line
    const options = props.arrayDevice.map((deviceSelect) => <option value={deviceSelect.value} key={deviceSelect.value}>{deviceSelect.text}</option>);
    return options;
  }

  //
  function MostraMeetings(props) {
    // eslint-disable-next-line react/destructuring-assignment

    if (props.meetings.length > 0) {
      console.log('meetings: ' + props.meetings)
      return (
        <>
          <h1>Meetings</h1>
          {/* <div><button className="styledButton"  onClick={collectMeetings}>Coletar Meetings</button></div> */}
          {/* <div><button className="styledButton" onClick={() => (coolectRooms())}>Coletar Meetings</button></div> */}
          <div className="meeting-card-container">
          {props.meetings.map((meeting) => (
            <div id={`meeting-list-item-${meeting.id}`} key={meeting.id} className="meeting-card">
              <h3>{meeting.attrs ? meeting.attrs.locus.info.webExMeetingName : meeting.id }</h3>

              <button className="styledButton" id={meeting.id} onClick={(e) => joinMeeting(e.target.id)} value={meeting.id}>Unir-se</button>


              <button className="styledButton" onClick={() => leaveMeeting(meeting.id)}>Sair</button>
              <button className="styledButton" onClick={() => addMedia()}>Adicionar Media</button>
            </div>
          ))}
          </div>

        </>
      );
    }
    return (
      <>
        {/* <h3>Sem nenhuma reunião</h3>
        <div><span>Inicie uma reunião agora ou crie uma sala!</span></div>
        <div><button className="styledButton" onClick={() => (coolectRooms())}>Coletar Meetings</button></div> */}
      </>
    );
  }

  function MensagemLogin() {
    if (msg) {
      return <div><h3 style={{textAlign:'left',margin:"2px"}}>Você está Autenticado e {msgRegistrado}</h3></div>;
    }
    return (
      <>
        <div><h3 style={{textAlign:'left',margin:"2px"}}>Você não está Autenticado</h3></div>
        <div>
          <a href="https://webexapis.com/v1/authorize?client_id=C4412287bf37ef6a9fe42810094a4861b837c444536b5d63456c2d981f3a94c59&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fteste&scope=spark-admin%3Abroadworks_subscribers_write%20meeting%3Aadmin_preferences_write%20spark%3Aall%20meeting%3Aadmin_preferences_read%20analytics%3Aread_all%20meeting%3Aadmin_participants_read%20spark-admin%3Apeople_write%20spark-admin%3Aworkspace_metrics_read%20spark-admin%3Aplaces_read%20spark-compliance%3Ateam_memberships_write%20spark-compliance%3Amessages_read%20spark-admin%3Adevices_write%20spark-admin%3Aworkspaces_write%20spark-compliance%3Ameetings_write%20meeting%3Aadmin_schedule_write%20identity%3Aplaceonetimepassword_create%20spark-admin%3Aorganizations_write%20spark-admin%3Aworkspace_locations_read%20spark-admin%3Acall_qualities_read%20spark-compliance%3Amessages_write%20spark%3Akms%20meeting%3Aparticipants_write%20spark-admin%3Apeople_read%20spark-compliance%3Amemberships_read%20spark-admin%3Aresource_groups_read%20meeting%3Arecordings_read%20meeting%3Aparticipants_read%20meeting%3Apreferences_write%20meeting%3Aadmin_recordings_read%20spark-admin%3Aorganizations_read%20meeting%3Aschedules_write%20spark-compliance%3Ateam_memberships_read%20spark-admin%3Adevices_read%20meeting%3Acontrols_read%20spark-admin%3Ahybrid_clusters_read%20spark-admin%3Aworkspace_locations_write%20spark-admin%3Abroadworks_enterprises_write%20meeting%3Aadmin_schedule_read%20spark-admin%3Abroadworks_enterprises_read%20meeting%3Aschedules_read%20spark-compliance%3Amemberships_write%20spark-admin%3Aroles_read%20meeting%3Arecordings_write%20meeting%3Apreferences_read%20spark-admin%3Aworkspaces_read%20spark-admin%3Aresource_group_memberships_read%20spark-compliance%3Aevents_read%20spark-admin%3Aresource_group_memberships_write%20spark-compliance%3Arooms_read%20spark-admin%3Abroadworks_subscribers_read%20meeting%3Acontrols_write%20meeting%3Aadmin_recordings_write%20spark-admin%3Ahybrid_connectors_read%20audit%3Aevents_read%20spark-compliance%3Ateams_read%20spark-admin%3Aplaces_write%20spark-admin%3Alicenses_read%20spark-compliance%3Arooms_write&state=set_state_here">
            Clique aqui para autorizar!
          </a>
        </div>
      </>
    );
  }

  function MostraRegistro(props){
    if(salvo !== 'Não Salvo!'){
      return (
        <>
          {/* <div><button className="styledButton" hidden={props.registradoStatus} onClick={() => (registrar())}>Registrar</button></div>
          <div><button className="styledButton" hidden={!props.registradoStatus} onClick={() => (unregister())}>Desregistrar</button></div> */}
          <h3>{props.registradoStatus ? props.msgTexto : ''}</h3>
        </>
      )
    }else{
      return <h3>Salve primeiro e depois se registre!</h3>
    }

  }

  function FerramentasReuniao(props){
    if(registrado === true & msgRegistrado === 'Registrado'){
      return (
        <div className="ferramentas-reuniao">
          <h2>Ferramentas de reunião</h2>
            <legend>Crie uma Sala</legend>
            <div>
              <input ref={nomeSalaCreateRef} placeholder="Nome da Sala" type="text" />
              <button className="styledButton" type="button" onClick={() => (createRoom())}>Criar Sala</button>
            </div>
            <div>
              {/* <input ref={destinoJoinRef} placeholder="Destino" type="text" /> */}
                <button className="styledButton" type="button" onClick={() => (listenRoom())}>Ligar atualizações</button>
                <button className="styledButton" type="button" onClick={() => (unListenRoom())}>Desligar atualizações</button>
            </div>
          <div><MostraMeetings meetings={props.meetingListProps} /></div>
        </div>
    )
    }else{
      return <div className="ferramentas-reuniao"></div>
    }

  }

  function Streams(){
    if(joined){

      return (
        <div className="container-meeting">

        <div className="quadros-stream">
          <section>
            <h2>Meeting Streams</h2>
            <form id="streams">
              <div className="flexvideo">

                <div id="remote-video-div">
                  <legend>Remote Video</legend>

                  <video ref={remotevideoRef} id="remote-video" autoPlay playsInline />
                  <audio ref={remoteAudioRef} id="remote-audio" autoPlay />

                </div>
                <div id="div-videos-secundarios">
                  <div id="local-video-div">
                    <legend>Local Video</legend>
                    <video ref={localvideoRef} id="video" autoPlay playsInline />
                  </div>

                  <div id="local-screen-div">
                    <legend>Local Screenshare</legend>
                    <video ref={localscreenRef} id="video" autoPlay playsInline />
                  </div>

                  <div id="remote-screen-div">
                    <legend>Remote Screenshare</legend>
                    <video ref={remotescreenRef} id="video" autoPlay playsInline />

                  </div>
                </div>
              </div>
            </form>
          </section>

          <div>
            <button className="styledButton" name="getMediaStreams" onClick={() => (getMediaStreams())}>getMediaStreams</button>
            <button className="styledButton"  name="getMediaDevices" onClick={() => (getMediaDevices())}>getMediaDevices</button>
            {' '}

          </div>

          receiveAudio
          <input type="checkbox" name="ts-media-direction" value="receiveAudio" checked={receivedAudio} onClick={() => { receivedAudio ? setReceivedAudio(false) : setReceivedAudio(true); }} />
          receiveVideo
          <input type="checkbox" name="ts-media-direction" value="receiveVideo" checked={receiveVideo} onClick={() => { receiveVideo ? setReceiveVideo(false) : setReceiveVideo(true); }} />
          receiveShare
          <input type="checkbox" name="ts-media-direction" value="receiveShare" checked={receiveShare} onClick={() => { receiveShare ? setReceiveShare(false) : setReceiveShare(true); }} />
          sendAudio
          <input type="checkbox" name="ts-media-direction" value="sendAudio" checked={sendAudio} onClick={() => { sendAudio ? setSendAudio(false) : setSendAudio(true); }} />
          sendVideo
          <input type="checkbox" name="ts-media-direction" value="sendVideo" checked={sendVideo} onClick={() => { sendVideo ? setSendVideo(false) : setSendVideo(true); }} />
          sendShare
          <input type="checkbox" name="ts-media-direction" value="sendShare" checked={sendShare} onClick={() => { sendShare ? setSendShare(false) : setSendShare(true); }} />
          <fieldset>
            <legend>Source Devices</legend>
            <div>
              <label className="context-info">Set Audio Input Device</label>
              <select id="sd-audio-input-devices" onChange={(e) => SetSourceDevicesAudioInputSelected(e.target.value)}>

                <MakeOptionsDevices arrayDevice={sourceDevicesAudioInput} />

              </select>
              <button className="styledButton"  type="button" name="setAudioInputDevice" onClick={() => (setAudioInputDevice())}>setAudioInputDevice</button>
              <label id="sd-audio-input-device-status" />
            </div>
            <div>
              <label className="context-info">Set Audio Output Device</label>
              <select id="sd-audio-output-devices" onChange={(e) => SetSourceDevicesAudioOutputSelected(e.target.value)}>

                <MakeOptionsDevices arrayDevice={sourceDevicesAudioOutput} />

              </select>
              <button className="styledButton"  type="button" name="setAudioOutputDevice" onClick={() => (setAudioOutputDevice())}>setAudioOutputDevice</button>
              <label id="sd-audio-output-device-status" />
            </div>
            <div>
              <label className="context-info">Set Video Input Device</label>
              <select id="sd-video-input-devices" onChange={(e) => SetSourceDevicesVideoInputSelected(e.target.value)}>

                <MakeOptionsDevices arrayDevice={sourceDevicesVideoInput} />

              </select>
              <button className="styledButton"  type="button" name="setVideoInputDevice" onClick={() => (setVideoInputDevice())}>setVideoInputDevice</button>
              <label id="sd-video-input-device-status" />
            </div>
          </fieldset>
        </div>
      </div>
    )
  }else{
    return null
  }

  }



  function ChatContainer(props){


    const chatObject = props.msgs.map((msg) => <div className="container-card darker" key={msg.id}> <span style={{fontSize:"12px"}}>{msg.from}</span> <p>{msg.text}</p> <span className="time-left">{msg.time}</span> </div>)

    return chatObject
  }


  return (
    <div>
      <h1 style={{textAlign:"left",margin:"2px"}}>
        Webex Plugin App - Bem Vindo Participante
      </h1>
      <div>
        <MensagemLogin />

        <div className="controle-meetings">

        <div className="ferramentas-login">
        {/* <h2>Ferramentas de login</h2>
        <div><button className="styledButton" onClick={() => (iniciar())}>Iniciar</button><h3>{salvo}</h3></div>
        <MostraRegistro registradoStatus={registrado} msgTexto={msgRegistrado}/> */}
        </div>

        {/* <FerramentasReuniao meetingListProps={meetingList}/> */}
        <div className="chat-container">
            <div className="chat-body" ref={chatcontainerRef}>
            <ChatContainer msgs={msgChat}/>
            </div>
          <div className="chat-tools">
            <textarea ref={mensagemRef}/><button className="styledButton" onClick={() => (enviarMensagem())}>Enviar</button>
            <button className="styledButton" onClick={() => (prepararVideo())}>Vídeo</button>
        </div>
      </div>

          <div>{statusMeeting}</div>
          </div>
          <Streams/>
      </div>

    </div>
  );
}

export default Participante;
