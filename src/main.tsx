import React from 'react';import{createRoot}from'react-dom/client';import{App}from'./ui/App';import'./ui/style.css';import'./ui/styles/tokens.css';import'./ui/styles/base.css';import'./ui/styles/os.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
