import { BASE_API_URL } from '../../config/Config';
import * as actionTypes from './ChatActionType';
import { AUTHORIZATION_PREFIX } from '../Constants';

const CHAT_PATH = 'api/chats';

export const createChat = (userId, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/single`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      },
      body: JSON.stringify(userId)
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.CREATE_CHAT, payload: resData });
  } catch (error) {
    console.error('Creating single chat failed:', error);
  }
};

export const createGroupChat = (data, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      },
      body: JSON.stringify(data)
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.CREATE_GROUP, payload: resData });
  } catch (error) {
    console.error('Creating group chat failed:', error);
  }
};

export const getUserChats = token => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      }
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.GET_ALL_CHATS, payload: resData });
  } catch (error) {
    console.error('Getting user chats failed:', error);
  }
};

export const deleteChat = (id, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      }
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.DELETE_CHAT, payload: resData });
  } catch (error) {
    console.error('Deleting chat failed:', error);
  }
};

export const addUserToGroupChat = (chatId, userId, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/${chatId}/add/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      }
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.ADD_MEMBER_TO_GROUP, payload: resData });
  } catch (error) {
    console.error('Adding user to group chat failed:', error);
  }
};

export const removeUserFromGroupChat = (chatId, userId, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/${chatId}/remove/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      }
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.REMOVE_MEMBER_FROM_GROUP, payload: resData });
  } catch (error) {
    console.error('Removing user from group chat failed:', error);
  }
};

export const markChatAsRead = (chatId, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${CHAT_PATH}/${chatId}/markAsRead`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      }
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.MARK_CHAT_AS_READ, payload: resData });
  } catch (error) {
    console.error('Marking chat as read failed:', error);
  }
};
