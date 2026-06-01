import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import Home from './pages/Home/Home'
import Description from './pages/Description/Description'
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
        ],
    },
    {
        path: '*',
        element: <NotFound />,
    },
])