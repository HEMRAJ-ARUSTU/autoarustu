// import axios from "axios";

// const url = window.location.origin;
// axios.defaults.baseURL = 'https://api.astrocall.live/api/';

// // if (url === 'https://rmsdemo.newinblue.com') {
// //     axios.defaults.baseURL = 'https://rmsdemoapi.newinblue.com/api/';
// // }

// const AxiosCom = () => {
//     axios.interceptors.request.use(async (request) => {
//         const access_token = sessionStorage.getItem('access_token');
//         request.headers['Authorization'] = `Bearer ${access_token}`
//         return request;
//     }, function (error) {
//         console.log(error);
//         return Promise.reject(error);
//     });
// }

// export default AxiosCom;

import axios from "axios";

const url = window.location.origin;
axios.defaults.baseURL = 'http://autoapi.arustu.com/api/';
// https://astrocall.live

// if (url === 'https://astrocall.live') {
//     axios.defaults.baseURL = 'https://liveapi.astrocall.live/api/';
// }
// else {
//     axios.defaults.baseURL = 'https://api.astrocall.live/api/';
// }

// if (url === 'https://astro.arustu.com/') {
//     axios.defaults.baseURL = 'https://astroapi.arustu.com/api/';
// }
// else {
//     axios.defaults.baseURL = 'https://api.astrocall.live/api/';
// }

const AxiosCom = () => {
    axios.interceptors.request.use(
        async (request) => {
            // Token localStorage ke UserData me pada hai
            const auth = JSON.parse(localStorage.getItem("UserData"));
            const access_token = auth?.access_token;

            // Sirf tab override karo jab token available ho,
            // warna existing Authorization header ko mat chhedo
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
