import React from "react";
import { Link } from "react-router-dom";

function Logo() {
    return (
        <h1 className="logo" id="logo">
            <Link to="/" className="logo-link" id="logo-link">
                PantherWeb
            </Link>
        </h1>
    );
}

export default Logo;