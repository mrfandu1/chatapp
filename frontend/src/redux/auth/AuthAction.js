import * as actionTypes from './AuthActionType';
import { BASE_API_URL, TOKEN } from '../../config/Config';
import { AUTHORIZATION_PREFIX } from '../Constants';

const AUTH_PATH = 'auth';
const USER_PATH = 'api/users';

export const register = data => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${AUTH_PATH}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const resData = await res.json();
    if (resData.token) {
      localStorage.setItem(TOKEN, resData.token);
    }
    dispatch({ type: actionTypes.REGISTER, payload: resData });
  } catch (error) {
    console.error('Register failed:', error);
  }
};

export const loginUser = data => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${AUTH_PATH}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const resData = await res.json();
    if (resData.token) {
      localStorage.setItem(TOKEN, resData.token);
    }
    dispatch({ type: actionTypes.LOGIN_USER, payload: resData });
  } catch (error) {
    console.error('Login failed:', error);
  }
};

export const currentUser = token => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${USER_PATH}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      }
    });

    const resData = await res.json();
    if (resData && typeof resData === 'object' && resData.message === 'Authentication Error') {
      localStorage.removeItem(TOKEN);
      return;
    }
    dispatch({ type: actionTypes.REQ_USER, payload: resData });
  } catch (error) {
    console.error('Fetching current user failed:', error);
  }
};

export const searchUser = (data, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${USER_PATH}/search?name=${data}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      }
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.SEARCH_USER, payload: resData });
  } catch (error) {
    console.error('Searching user failed:', error);
  }
};

export const updateUser = (data, token) => async dispatch => {
  try {
    const res = await fetch(`${BASE_API_URL}/${USER_PATH}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${AUTHORIZATION_PREFIX}${token}`
      },
      body: JSON.stringify(data)
    });

    const resData = await res.json();
    dispatch({ type: actionTypes.UPDATE_USER, payload: resData });
  } catch (error) {
    console.error('User update failed:', error);
  }
};

export const logoutUser = () => async dispatch => {
  localStorage.removeItem(TOKEN);
  dispatch({ type: actionTypes.LOGOUT_USER, payload: null });
  dispatch({ type: actionTypes.REQ_USER, payload: null });
};
