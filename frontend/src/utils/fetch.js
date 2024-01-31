const PROXY = 'http://localhost:8000';

async function get(url) {
  const res = await fetch(PROXY + url, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  })

  const body = await res.json();

  return {
    ok: res.ok,
    body: body,
    code: res.status,
    status: res.statusText
  }
}

async function post(url, data, multipart = false) {

  const res = await fetch(PROXY + url, {
    method: 'POST',
    credentials: 'include',
    headers: multipart ? { 'Accept': 'application/json' } : { 'Content-Type': 'application/json' },
    body: multipart ? data : JSON.stringify(data)
  })

  const body = await res.json();

  return {
    ok: res.ok,
    body: body,
    code: res.status,
    status: res.statusText
  }
}

async function put(url, data) {
  const res = await fetch(PROXY + url, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  const body = await res.json();

  return {
    ok: res.ok,
    body: body,
    code: res.status,
    status: res.statusText
  }
}

async function patch(url, data) {
  const res = await fetch(PROXY + url, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })

  const body = await res.json();

  return {
    ok: res.ok,
    body: body,
    code: res.status,
    status: res.statusText
  }
}

async function del(url) {
  const res = await fetch(PROXY + url, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
  })

  const body = await res.json();

  return {
    ok: res.ok,
    body: body,
    code: res.status,
    status: res.statusText
  }
}

export { get, post, put, patch, del }