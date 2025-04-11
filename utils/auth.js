export const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return !!token;
}

export const getToken = () => localStorage.getItem('token');