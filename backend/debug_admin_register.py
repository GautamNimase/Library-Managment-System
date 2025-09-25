#!/usr/bin/env python3
import requests, time

BASE = 'http://127.0.0.1:5000'
email = f'admin.debug+{int(time.time())}@example.com'

payload = {
    'name': 'Admin Debug',
    'email': email,
    'password': 'password123',
    'admin_key': 'admin123'
}

print('POST', BASE + '/api/auth/admin/register', payload)
r = requests.post(BASE + '/api/auth/admin/register', json=payload, timeout=10)
print('Status:', r.status_code)
try:
    print('Body:', r.json())
except Exception:
    print('Body:', r.text)


