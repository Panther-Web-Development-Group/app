import React from 'react';
import { FaSearch } from 'react-icons/fa';

function Search({ ...props }) {
    return (
        <form className="pw-search search" id="search" name="search" action="/search" {...props}>
            <div className="search-bar" id="search-bar">
                <input type="search" id="search-input" className="search-input" name="search-input" />
                <button type="submit" id="search-submit" className="button search-submit">
                    <FaSearch className="search-icon button-icon" />
                </button>
            </div>
            <nav className="search-autocomplete" id="search-autocomplete"></nav>
        </form>
    );
}

export default Search;