import React from 'react';
import Logo from './Logo';
import Search from './Search';
import Navigation from './Navigation';

function Header() {
    return (
        <>
        <header className="pw-header header" id="pw-header">
            <Logo />
            <Search />
            <Navigation />
        </header>
        </>
        
    );
}

export default Header;