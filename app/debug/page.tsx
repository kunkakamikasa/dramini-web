'use client'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">
        <div>API Base URL: {process.env.NEXT_PUBLIC_API_BASE || 'undefined'}</div>
        <div>Environment: {process.env.NODE_ENV || 'undefined'}</div>
        <div>Timestamp: {new Date().toISOString()}</div>
      </div>
    </div>
  )
}
