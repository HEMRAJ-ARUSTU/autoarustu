
import axios from "axios";

export const fetchData = async (URL) => {
    try {
        const res = await axios.get(URL)
    } catch (error) {
        console.error(error)
    }
};

export const getPostData = async (url, postData) => {
    try {
        const res = await axios.post(url, postData);
        const { data } = res
        const parseData = JSON.parse(data?.data)
        return parseData?.Table
    } catch (error) {
        console.error(error)
    }
}

export const AddDeleteUpadate = async (url, postData) => {
    try {
        const res = await axios.post(url, postData);
        if (res.code == "ERR_BAD_REQUEST") {
            return res
        } else {
            return res.data;
        }
    } catch (error) {
        console.error(error)
    }
}

export const getData = async (url, postData) => {
    try {
        const res = await axios.get(url, postData);
        const { data } = res
        const parseData = JSON.parse(data?.data)
        return parseData?.Table
    } catch (error) {
        console.error(error)
    }
}

export const Comman_changeArrayFormat = (data, Id, Code, type, col3, col4) => {
    if (type === 'PretendToBeID') {
        const result = data?.map((sponsor) =>
            ({ value: sponsor[Id], label: sponsor[col4] + '-' + sponsor[Code], id: sponsor[col3] })
        )
        return result
    } else {
        const result = data?.map((sponsor) =>
            ({ value: sponsor[Id], label: sponsor[Code] })
        )
        return result
    }
}

const refreshLogin = async () => {
    try {
        const auth = JSON.parse(localStorage.getItem("UserData"));

        if (!auth?.refresh_token) return false;

        const refreshVal = {
            refresh_token: auth.refresh_token,
            grant_type: "refresh_token",
        };

        const res = await axios.post(
            "http://autoapi.arustu.com/api/User/Login",
            refreshVal
        );

        if (res?.data?.error_description == "Successfully Login" && res?.data?.error == 200) {
            // console.log(res, 'res')
            localStorage.setItem("UserData", JSON.stringify(res.data));
            return true;
        }

        return false;
    } catch (err) {
        console.error("❌ Login refresh failed", err);
        return false;
    }
};



export const GetWithToken = async (url, retry = true) => {
    const auth = JSON.parse(localStorage.getItem("UserData"));

    try {
        const res = await apiClient.get(url, {
            headers: {
                Authorization: `Bearer ${auth?.access_token}`,
            },
        });
        const data = res.data;
        const parsed = data?.data ? JSON.parse(data.data) : data;
        return parsed?.Table ?? parsed ?? data;

    }
    catch (error) {
        if (error?.response?.status === 401 && error?.response?.data?.Message === "Authorization has been denied for this request." && retry) {
            const isLoginDone = await refreshLogin();
            if (isLoginDone) {
                return await PostWithToken(url, payload, false);
            }
        }
        console.error("POST error", error);
        return null;
    }
};


export const PostWithToken = async (url, payload, retry = true) => {
    try {
        const auth = JSON.parse(localStorage.getItem("UserData"));

        const res = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${auth?.access_token}`,
            },
        });
        const data = res.data;
        const parsed = data?.data ? JSON.parse(data.data) : data;

        if (parsed?.Table && parsed?.Table1) {
            return { Table: parsed.Table, Table1: parsed.Table1 };
        }
        if (parsed?.Table) return parsed.Table;
        if (parsed?.Table1) return parsed.Table1;

        return parsed;

    } catch (error) {
        if (error?.response?.status === 401 && error?.response?.data?.Message === "Authorization has been denied for this request." && retry) {
            const isLoginDone = await refreshLogin();
            if (isLoginDone) {
                return await PostWithToken(url, payload, false);
            }
        }
        console.error("POST error", error);
        return null;
    }
};



