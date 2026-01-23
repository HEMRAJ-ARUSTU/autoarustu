import axios from "axios";

const getApiBaseURL = () => {
    const currentOrigin = window.location.origin;

    if (currentOrigin === 'https://automation.arustu.com') {
        return 'https://automationapi.arustu.com/api/';
    } else {
        return 'http://autoapi.arustu.com/api/';
    }
};

axios.defaults.baseURL = getApiBaseURL();

const AxiosCom = () => {
    axios.interceptors.request.use(
        async (request) => {
            const auth = JSON.parse(sessionStorage.getItem("UserData"));
            const access_token = auth?.access_token;
            if (access_token) {
                request.headers["Authorization"] = `Bearer ${access_token}`;
            }

            return request;
        },
        function (error) {
            console.log(error);
            return Promise.reject(error);
        }
    );
};

export default AxiosCom;
