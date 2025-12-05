const assert = require('assert');

const BASE = 'http://localhost:4000';
const adminEmail = 'Hany@gmial.com';
const adminPassword = 'HanY1234###';

async function req(method, path, { token, body, json = true } = {}) {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: json && body ? JSON.stringify(body) : body
  });
  let data = null;
  try { data = await res.json(); } catch {}
  return { status: res.status, ok: res.ok, data };
}

(async () => {
  // login admin
  const login = await req('POST', '/api/auth/login', { body: { email: adminEmail, password: adminPassword } });
  assert(login.ok, 'admin login failed');
  const token = login.data.token;

  // create product
  const fd = new FormData();
  fd.append('item_code', `code-${Date.now()}`);
  fd.append('name', 'Spec Product');
  fd.append('purchase_price', '12.5');
  fd.append('selling_price', '20.0');
  fd.append('quantity', '5');
  const createRes = await fetch(`${BASE}/api/products`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
  const createData = await createRes.json();
  assert(createRes.ok, 'create failed');
  assert(createData.id, 'create did not return id');
  const id = createData.id;

  // update valid
  const up1 = await req('PUT', `/api/products/${id}`, { token, body: { name: 'Updated Product', purchase_price: 15, selling_price: 25, quantity: 7 } });
  assert(up1.ok && up1.data.name === 'Updated Product', 'update failed');

  // update invalid id
  const up404 = await req('PUT', `/api/products/invalid-id`, { token, body: { name: 'x' } });
  assert(up404.status === 404, 'expected 404 for invalid id');

  // update malformed payload
  const up400 = await req('PUT', `/api/products/${id}`, { token, body: { purchase_price: -1 } });
  assert(up400.status === 400, 'expected 400 for invalid price');

  // auth required
  const up401 = await req('PUT', `/api/products/${id}`, { body: { name: 'NoAuth' } });
  assert(up401.status === 401, 'expected 401 without token');

  // delete ok
  const del = await fetch(`${BASE}/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  assert(del.status === 204, 'expected 204 on delete');

  // delete again 404
  const del404 = await fetch(`${BASE}/api/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  assert(del404.status === 404, 'expected 404 deleting non-existent product');

  // delete without token 401
  const del401 = await fetch(`${BASE}/api/products/${id}`, { method: 'DELETE' });
  assert(del401.status === 401, 'expected 401 without token');

  console.log('Products API tests passed');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});