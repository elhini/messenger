import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { combineReducers, createStore, } from 'redux';
import { user, chats, messages } from './reducers'
import './index.css';
import App from './App';

const rootReducer = combineReducers({
  user,
  chats,
  messages
});

const store = createStore(rootReducer);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
