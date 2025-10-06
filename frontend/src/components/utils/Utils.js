export const getInitialsFromName = name => {
  const splitName = name.split(' ');
  return splitName.length > 1 ? `${splitName[0][0]}${splitName[1][0]}` : splitName[0][0];
};

export const transformDateToString = date => {
  const currentDate = new Date();

  if (date.getFullYear() !== currentDate.getFullYear()) {
    return date.getFullYear().toString();
  }

  if (date.getDate() !== currentDate.getDate()) {
    return getDateFormat(date);
  }

  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${hours}:${minutes}`;
};

export const getChatName = (chat, reqUser) => {
  if (chat.isGroup) {
    return chat.chatName;
  }

  if (!reqUser) {
    return chat.users[0].fullName;
  }

  return chat.users[0].id === reqUser.id ? chat.users[1].fullName : chat.users[0].fullName;
};

export const getDateFormat = date => {
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const month = date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  return `${day}.${month}.${date.getFullYear()}`;
};

export const formatFileSize = bytes => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileExtension = fileName => {
  if (!fileName) return '';
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
};
