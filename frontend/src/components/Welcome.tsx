import welcomePic from "../assets/logo-word-link.jpg"
import {useNavigate} from "react-router-dom";
import "./styles/Welcome.css"


export default function Welcome(){

    const navigate = useNavigate();

    return (

        <div>
            <h2>Word Link Hub</h2>
            <p>Click on the Picture or the Play button to start playing!</p>
            <div className="image-wrapper">
                <img
                    src={welcomePic}
                    alt="Welcome to Word Link Hub"
                    className="logo-welcome"
                    onClick={()=> navigate("/play")}
                />

            </div>
        </div>

    )
}