import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home/Home'
import Description from './pages/Description/Description'
import FormContact from './pages/FormContact/FormContact'
import AdminPanel from './pages/AdminPanel/AdminPanel'
import NotFound from './pages/NotFound/NotFound'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <NotFound />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'description',
                element: <Description />,
            },
            {
                path: 'contact',
                element: <FormContact />,
            },
            {
                path: 'admin',
                element: <AdminPanel />,
            },
        ],
    },
    {
        path: '*',
        element: <NotFound />,
    },
])