import jwtDecode from "jwt-decode";
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
        let idToken = getIdTokeh();
        // Check token expiration
        const claims = jwtDecode(idToken);
        const now = Math.floor(new Date().getTime() / 1000);
        if (claims.exp <= now) {
            // Expired
            idToken = await refresh(refreshToken);
        }

        if (!config.headers) {
            config.headers = {};
        }
        config.headers.Authorization = "Bearer " + idToken;
    }
    for (let i = 0; i < 2; i++) {
        try {
            result = await axios(config);
            break;
        } catch (err) {
            console.log(err);
            if (auth === true && err.response.status === 401) {
                try {
                    await refresh(refreshToken);
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

const refresh = async (refreshToken) => {
    const data = new URLSearchParams();
    data.append("refresh_token", refreshToken);
    const refreshConfig = {
        method: 'post',
        url: import.meta.env.VITE_API_URL + "auth/refresh",
        data: data
    }
    const res = await axios(refreshConfig);
    setIdToken(res.data.id_token);
    setAccessToken(res.data.access_token);

    return res.data.id_token;
}

export const getUser = () => {
    let user = localStorage.getItem("user");
    if (user) {
        try {
            user = JSON.parse(user);
        } catch (err) {
            user = models.User;
        }
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

export const createRandomCode = () => {
    const code = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    return code.replaceAll("+", "-").replaceAll("/", "_").slice(0, -1);
}
export const getState = () => {
    return sessionStorage.getItem("state");
}
export const setState = (state) => {
    if (state === null) {
        sessionStorage.removeItem("state");
    } else {
        sessionStorage.setItem("state", state);
    }
}
export const getNonce = () => {
    return sessionStorage.getItem("nonce");
}
export const setNonce = (nonce) => {
    if (nonce === null) {
        sessionStorage.removeItem("nonce");
    } else {
        sessionStorage.setItem("nonce", nonce);
    }
}

export const getIdTokeh = () => {
    return sessionStorage.getItem("idToken");
}
export const setIdToken = (idToken) => {
    if (idToken === null) {
        sessionStorage.removeItem("idToken");
    } else {
        const claims = jwtDecode(idToken);
        if (claims.token_use === "id" && claims.aud === import.meta.env.VITE_AUTH_CLIENT_ID) {
            sessionStorage.setItem("idToken", idToken);
        } else {
            throw "Could not validate credentials";
        }
    }
}

export const getAccessTokeh = () => {
    return sessionStorage.getItem("accessToken");
}
export const setAccessToken = (accessToken) => {
    if (accessToken === null) {
        sessionStorage.removeItem("accessToken");
    } else {
        const claims = jwtDecode(accessToken);
        if (claims.token_use === "access" && claims.client_id === import.meta.env.VITE_AUTH_CLIENT_ID) {
            sessionStorage.setItem("accessToken", accessToken);
        } else {
            throw "Could not validate credentials";
        }
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
