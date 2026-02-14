'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function Home() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })
      setBookmarks(data || [])
    }
    fetchBookmarks()

    const channel = supabase.channel('realtime_bookmarks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookmarks' }, () => {
        fetchBookmarks()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const handleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    const { error } = await supabase.from('bookmarks').insert([{ url, user_id: user.id }])
    if (error) console.error(error)
    setUrl('')
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  )

  // --- LOGIN VIEW ---
  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">SmartMark</h1>
          <p className="text-slate-500 mt-2 font-medium">Your links, organized in real-time.</p>
        </div>
        
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 border border-slate-200 rounded-2xl shadow-sm transition-all duration-200 active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
        
        <p className="text-center text-xs text-slate-400 mt-8 uppercase tracking-widest font-bold">Private & Secure</p>
      </div>
    </div>
  )

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white/70 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">SmartMark</span>
          </div>
          <div className="flex items-center gap-4">
            <img src={user.user_metadata?.avatar_url} className="w-8 h-8 rounded-full border border-slate-200" alt="Profile" />
            <button onClick={() => supabase.auth.signOut()} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Input Section */}
        <section className="mb-12">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Add New Bookmark</h2>
          <form onSubmit={addBookmark} className="flex gap-3">
            <input 
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-700" 
              type="url" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              placeholder="https://example.com" 
              required 
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95">
              Save
            </button>
          </form>
        </section>

        {/* List Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Collection ({bookmarks.length})</h2>
          </div>
          
          {bookmarks.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
              <p className="text-slate-400 font-medium">No bookmarks yet. Start by adding a link above!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookmarks.map(bm => (
                <div key={bm.id} className="group bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                      <img 
                        src={`https://www.google.com/s2/favicons?sz=64&domain=${new URL(bm.url).hostname}`} 
                        className="w-6 h-6 rounded" 
                        alt="favicon"
                        onError={(e) => { e.currentTarget.src = 'https://www.google.com/favicon.ico' }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <a 
                        href={bm.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="font-semibold text-slate-800 hover:text-blue-600 transition-colors truncate block"
                      >
                        {new URL(bm.url).hostname.replace('www.', '')}
                      </a>
                      <p className="text-sm text-slate-400 truncate">{bm.url}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteBookmark(bm.id)} 
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}