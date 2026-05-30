import { Outlet } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import './App.css'

function App() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  )
}

export default App
