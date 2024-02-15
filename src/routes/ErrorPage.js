import React from "react";
import { useRouteError } from "react-router-dom";

function ErrorPage() {
    const { error } = useRouteError();
    console.log(error);

    return (
        <div className="error-page" id="error-page">
            <h1 className="error-page-title" id="error-page-title">
                Error!
            </h1>
            <p className="error-page-description" id="error-page-description">
                {error.message}
            </p>
            <a href="/" className="error-home-link" id="error-home-link">Go back home!</a>
        </div>
    )
}

export default ErrorPage;