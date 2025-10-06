import { BASE_API_URL } from '../../config/Config';
import { AUTHORIZATION_PREFIX } from '../Constants';
import * as actionTypes from './MessageActionType';

const MESSAGE_PATH = 'api/messages';

export const createMessage = (formData, token) => async dispatch => {
  try {
    console.log('Sending message with FormData:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    const res = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/create`, {
      method: 'POST',
      headers: {
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error response:', errorText);
      throw new Error(errorText || 'Failed to send message');
    }

    const resData = await res.json();
    console.log('Message sent successfully:', resData);
    dispatch({ type: actionTypes.CREATE_NEW_MESSAGE, payload: resData });
  } catch (error) {
    console.error('Sending message failed:', error);
  }
};

export const getAllMessages = (chatId, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${MESSAGE_PATH}/chat/${chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to fetch messages');
    }

    const resData = await res.json();
    dispatch({ type: actionTypes.GET_ALL_MESSAGES, payload: resData });
  } catch (error) {
    console.error('Getting messages failed:', error);
  }
};
