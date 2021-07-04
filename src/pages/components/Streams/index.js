function Streams(){

  function fecharMidia(){
    localscreenRef.current.srcObject = null;
    localvideoRef.current.srcObject = null;
    remotescreenRef.current.srcObject = null;
    remotevideoRef.current.srcObject = null;
    remoteAudioRef.current.srcObject = null;
  }

  const remotevideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const remotescreenRef = useRef(null);
  const localscreenRef = useRef(null);
  const localvideoRef = useRef(null);


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

export default Streams;
