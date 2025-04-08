chrome.runtime.onMessage.addListener((request) => {
  const { type, data } = request;

  if (type === 'ON_LOGIN') {
    chrome.storage.local.set(data);
  }
})