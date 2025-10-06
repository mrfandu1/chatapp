import * as actionTypes from './MessageActionType';

const initialState = {
  messages: [],
  newMessage: null
};

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.CREATE_NEW_MESSAGE:
      return { ...state, newMessage: action.payload };
    case actionTypes.GET_ALL_MESSAGES:
      return { ...state, messages: action.payload };
    default:
      return state;
  }
};

export default messageReducer;
