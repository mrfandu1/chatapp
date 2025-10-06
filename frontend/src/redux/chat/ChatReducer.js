import * as actionTypes from './ChatActionType';

const initialState = {
  chats: [],
  createdGroup: null,
  createdChat: null,
  deletedChat: null,
  editedGroup: null,
  markedAsReadChat: null
};

const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.CREATE_CHAT:
      return { ...state, createdChat: action.payload };
    case actionTypes.CREATE_GROUP:
      return { ...state, createdGroup: action.payload };
    case actionTypes.GET_ALL_CHATS:
      return { ...state, chats: Array.from(action.payload || []) };
    case actionTypes.DELETE_CHAT:
      return { ...state, deletedChat: action.payload };
    case actionTypes.ADD_MEMBER_TO_GROUP:
      return { ...state, editedGroup: action.payload };
    case actionTypes.REMOVE_MEMBER_FROM_GROUP:
      return { ...state, editedGroup: action.payload };
    case actionTypes.MARK_CHAT_AS_READ:
      return { ...state, markedAsReadChat: action.payload };
    default:
      return state;
  }
};

export default chatReducer;
