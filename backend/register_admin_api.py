#!/usr/bin/env python3
import requests
import sys

BASE_URL = 'http://127.0.0.1:5001'

def main():
    email = f'admin.fix+api@example.com'
    payload = {
        'name': 'Admin Fix API',
        'email': email,
        'password': 'password123',
        'admin_key': 'admin123'
    }
    r = requests.post(f'{BASE_URL}/api/auth/admin/register', json=payload, timeout=10)
    print(r.status_code)
    try:
        print(r.json())
    except Exception:
        print(r.text)

if __name__ == '__main__':
    main()


