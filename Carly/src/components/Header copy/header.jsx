import "./header.css";
import { Link } from "react-router-dom";  // Ensure to import Link from react-router-dom
import "../../assets/style.css";

function Header1({ onDIYClick }) {
    return (
        <div className="header1">
            <img className="logo1" src="logo.png" alt="Logo" />
            <div className="navbar1">
                <div className="navcontainer1">
                    <ul>
                        <li>
                            <i className="icon-engineering">  </i>
                            <Link className="active" to="/"> Maintenance Guide</Link>
                        </li>
                        <li>
                            <i className="icon-information-solid"> </i>
                            <Link to="#mission">Pricing</Link>
                        </li>
                        <li>
                            <i className="icon-contacts"> </i>
                            {/* Updated the Link to navigate to /consultation */}
                            <Link  className="con">Consultations</Link> 
                        </li>
                        <li>
                            <i className="icon-question-circle"> </i>
                            <i className="icon-home" id="icon-home1"></i>  
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Header1;
