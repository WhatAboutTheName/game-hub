import './Header.css';
import {ReactSVG} from "react-svg";

function Header() {
    return (
        <div id="general-header">
            <ReactSVG
                id="svg"
                src="fav.svg"
                afterInjection={(svg) => svg.setAttribute('id', 'label')}
            />
            <div id="header-content">
            </div>
        </div>
    )
}

export default Header
