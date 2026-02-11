import { LocalAuthProvider, useAuth } from 'localauth-sdk/react'
import { Dashboard } from './components/Dashboard'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <h1>LocalAuth SDK Example</h1>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Sign in or register to continue. The SDK handles all the authentication logic for you!
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <LoginForm />
          <RegisterForm />
        </div>
      </div>
    )
  }

  return <Dashboard />
}

export default function App() {
  const apiKey = import.meta.env.VITE_APP_API_KEY || 'la_demo_key'

  return (
    <LocalAuthProvider
      config={{
        apiKey,
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001'
      }}
    >
      <AppContent />
    </LocalAuthProvider>
  )
}
