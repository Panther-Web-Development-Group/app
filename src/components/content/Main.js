import React from "react";

function Main({ children, ...props }) {
    return (
        <main className="pw-main main-content" id="main-content" {...props}>
            { children }
        </main>
    );
}

export default Main;