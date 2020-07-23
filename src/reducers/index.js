const ALERTS_STATE = {
    list: []
};

export function alerts(state = ALERTS_STATE, action) {
    switch (action.type) {
        case 'APPEND_ALERT':
            action.alert.id = state.list.length;
            return {...state, list: [...state.list, action.alert]};
        case 'REMOVE_ALERT':
            return {...state, list: state.list.filter(a => a.id !== action.id)};
        default:
            return state;
    }
}

const USERS_INITIAL_STATE = {
    list: []
};

export function users(state = USERS_INITIAL_STATE, action) {
    switch (action.type) {
        case 'SET_USERS':
            return {...state, list: action.users};
        default:
            return state;
    }
}

const USER_INITIAL_STATE = {};

export function user(state = USER_INITIAL_STATE, action) {
    switch (action.type) {
        case 'SET_USER':
            return {...action.user};
        default:
            return state;
    }
}

const CHATS_INITIAL_STATE = {
    list: [], 
    activeID: -1
};

export function chats(state = CHATS_INITIAL_STATE, action) {
    switch (action.type) {
        case 'SET_CHATS':
            return {...state, list: action.chats};
        case 'SET_ACTIVE_CHAT':
            return {...state, activeID: action.activeChatID};
        case 'UPDATE_CHAT':
            return {...state, list: state.list.map(chat => 
                chat._id === action.chat._id ? action.chat : chat
            )};
        default:
            return state;
    }
}

const MESSAGES_INITIAL_STATE = {
    list: []
};

export function messages(state = MESSAGES_INITIAL_STATE, action) {
    switch (action.type) {
        case 'SET_MESSAGES':
            return {...state, list: action.messages};
        default:
            return state;
    }
}