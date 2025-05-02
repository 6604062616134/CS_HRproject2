import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
    const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];
    console.log('Token:', token);

    return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;