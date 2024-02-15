import React from "react";

function Navigation() {
    return (
        <nav className="navigation" id="navigation">
            <div className="navigation-container" id="navigation-container">
                <ul className="navigation-menu" id="navigation-menu">
                    <li className="navigation-item">
                        <a href="/about" className="navigation-link">About</a>
                    </li>
                    <li className="navigation-item">
                        <a href="/events" className="navigation-link">Events</a>
                    </li>
                    <li className="navigation-item">
                        <a href="/join" className="navigation-link">Join Us</a>
                    </li>
                    <li className="navigation-item">
                        <a href="/contact" className="navigation-link">Contact Us</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navigation;