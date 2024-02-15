import React from 'react';
import { Outlet } from 'react-router-dom';
import './App.css';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Main from './components/content/Main';

function App({ children = null }) {
	return (
		<>
		<Header />
		<Main>
			{ children ?? <Outlet /> }
		</Main>
		<Footer />
		</>
	);
}

export default App;