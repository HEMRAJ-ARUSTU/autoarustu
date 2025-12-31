import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const toastifySuccess = (message) => {
  const isMobile = window.innerWidth <= 640;
  toast.success(`${message}`, {
    position: isMobile ? "top-center" : "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    style: {
      fontSize: isMobile ? '14px' : '16px',
      padding: isMobile ? '12px 16px' : '16px 20px',
      width: isMobile ? '90vw' : 'auto',
      maxWidth: isMobile ? '90vw' : '400px',
      margin: isMobile ? '10px auto' : '10px',
    },
  });
}

export const toastifyError = (message) => {
  const isMobile = window.innerWidth <= 640;
  toast.error(`${message}`, {
    position: isMobile ? "top-center" : "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    style: {
      fontSize: isMobile ? '14px' : '16px',
      padding: isMobile ? '12px 16px' : '16px 20px',
      width: isMobile ? '90vw' : 'auto',
      maxWidth: isMobile ? '90vw' : '400px',
      margin: isMobile ? '10px auto' : '10px',
    },
  });
}

export const toastifyInfo = (message) => {
  const isMobile = window.innerWidth <= 640;
  toast.info(`${message}`, {
    position: isMobile ? "top-center" : "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    style: {
      fontSize: isMobile ? '14px' : '16px',
      padding: isMobile ? '12px 16px' : '16px 20px',
      width: isMobile ? '90vw' : 'auto',
      maxWidth: isMobile ? '90vw' : '400px',
      margin: isMobile ? '10px auto' : '10px',
    },
  });
}

