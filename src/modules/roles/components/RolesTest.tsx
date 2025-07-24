'use client'

import { useState, useEffect } from 'react'

export function RolesTest() {
  const [message, setMessage] = useState<string>('Inicializando...')

  useEffect(() => {
    setMessage('Component mounted! Token: ' + (localStorage.getItem('access_token') ? 'EXISTS' : 'NOT FOUND'))
  }, [])

  return (
    <div className="container-fluid">
      <div className="alert alert-info">
        <h3>Test Status</h3>
        <p>{message}</p>
      </div>
    </div>
  )
}
