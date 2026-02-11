import { useAuth } from 'localauth-sdk/react'

export function Dashboard() {
  const { user, signOut, updateMe, clearError, error } = useAuth()

  const handleUpdateName = async () => {
    if (!user) return
    const newName = prompt('Enter new name:', user.fullName)
    if (newName && newName !== user.fullName) {
      try {
        await updateMe({ fullName: newName })
        alert('Name updated!')
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      {error && (
        <div className="error">
          <p>{error.message}</p>
          <button onClick={clearError} className="btn-secondary">Dismiss</button>
        </div>
      )}
      
      <div className="card">
        <h2>Welcome, {user?.fullName || user?.email}!</h2>
        <div className="user-info">
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Username:</strong> {user?.username || 'Not set'}</p>
          <p><strong>Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
          {user?.metadata && Object.keys(user.metadata).length > 0 && (
            <p><strong>Metadata:</strong> {JSON.stringify(user.metadata)}</p>
          )}
        </div>
        <div>
          <button onClick={handleUpdateName} className="btn-primary">Update Name</button>
          <button onClick={() => signOut()} className="btn-danger">Sign Out</button>
        </div>
      </div>
    </div>
  )
}
