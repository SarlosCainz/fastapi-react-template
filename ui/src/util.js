import axios from "axios";
import * as models from "./models";

export const request = async (config, userContext, auth=true) => {
    const refreshToken = getRefreshTokeh();
    if (auth && refreshToken === null) {
        userContext.logout();
        return;
    }

    let result = null;
    config.url = import.meta.env.VITE_API_URL + config.url;
    if (auth) {
        if (!config.headers) {
            config.headers = {};
        }
        config.headers.Authorization = "Bearer " + userContext.accessToken;
    }
    for (let i = 0; i < 2; i++) {
        try {
            result = await axios(config);
            break;
        } catch (err) {
            console.log(err);
            if (auth === true && err.response.status === 401) {
                const data = new URLSearchParams();
                data.append("username", userContext.info.username);
                data.append("refresh_token", getRefreshTokeh());
                const refreshConfig = {
                    method: 'post',
                    url: import.meta.env.VITE_API_URL + "auth/refresh",
                    data: data
                }
                try {
                    const res = await axios(refreshConfig);
                    userContext.setAccessToken(res.data.access_token);
                    config.headers.Authorization = "Bearer " + res.data.access_token;
                } catch(err) {
                    if (err.response.status === 401) {
                        userContext.logout();
                        break;
                    } else {
                        throw err;
                    }
                }
            } else {
                throw err;
            }
        }
    }

    return result;
}

export const getUser = () => {
    let user = localStorage.getItem("user");
    if (user) {
        user = JSON.parse(user);
    } else {
        user = models.User;
    }

    return user;
}
export const setUser = (user) => {
    if (user === null) {
        localStorage.removeItem("user");
    } else {
        localStorage.setItem("user", JSON.stringify(user));
    }
}

export const getAccessTokeh = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    return accessToken;
}
export const setAccessToken = (accessToken) => {
    if (accessToken === null) {
        sessionStorage.removeItem("accessToken");
    } else {
        sessionStorage.setItem("accessToken", accessToken);
    }
}

export const getRefreshTokeh = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    return refreshToken;
}
export const setRefreshToken = (refreshToken) => {
    if (refreshToken === null) {
        localStorage.removeItem("refreshToken");
    } else {
        localStorage.setItem("refreshToken", refreshToken);
    }
}

export const value2label = (value, list) => {
    return list.reduce((p, c) => (c.value == value ? c.label : p), "");
};

export const initial = (fullName) => {
    if (fullName) {
        const item = fullName.split(" ")
        if (item.length === 1) {
            return item[0][0] + item[0][1];
        } else {
            return item[0][0] + item[1][0];
        }
    } else {
        return "";
    }
}

export const check_password_policy = (password) => {
    const number = /[0-9]+/;
    const lower_alphabet = /[a-z]+/;
    const upper_alphabet = /[A-Z]+/;
    const symbol = /\W+/;

    return password.length >= 15
        && number.test(password)
        && lower_alphabet.test(password)
        && upper_alphabet.test(password)
        && symbol.test(password);
};
