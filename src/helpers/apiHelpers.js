async function apiClient(url, headers, body) {
  const resp = await fetch(url, {
    method: 'POST',
    headers,
    body
  });

  const result = await resp.blob();

  return result.text();
}

export {apiClient};
