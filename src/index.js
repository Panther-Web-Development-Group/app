import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';

import App from './App';

import { 
	Home,
	About,
	ErrorPage,
	Events,
	Contact,
	Join
} from "./routes";

const root = ReactDOM.createRoot(document.getElementById('pw-root'));
const router = createBrowserRouter( [ 
	{
		element: <App />,
		errorElement: (
			<App>
				<ErrorPage />
			</App>
		),
		children: [
			{ path: "/", element: <Home /> },
			{ path: "/about", element: <About /> },
			{ path: "/events", element: <Events /> },
			{ path: "/contact", element: <Contact /> },
			{ path: "/join", element: <Join /> }
		]
	}
] );

root.render( 
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode> 
);