import { useEffect } from "react"
import { useLocation } from "react-router-dom";

function Instrutorsala(props){
  const location = useLocation();

  useEffect(() => (
    console.log(location.state.room)

  ),[])


return <div>teste</div>


}

export default Instrutorsala
