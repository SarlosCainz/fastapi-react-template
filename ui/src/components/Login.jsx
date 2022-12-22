import React, {useContext, useState} from "react";
import {
    Box, Stack, TextField, Typography, Avatar,
    Container, CssBaseline
} from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import LockIcon from '@mui/icons-material/Lock';

import {UserContext} from "../app";
import * as util from "../util";

function Login() {
    const userContext = useContext(UserContext);

    const [msg, setMsg] = useState("");
    const [username, setUsername] = useState("");
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (event) => {
        setMsg("");
        setLoading(true);

        try {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const username = data.get("username");
            const password = data.get("password");

            if (username === "" || password === "") {
                setMsg("UsernameとPasswordは必須です。")
            } else {
                const data = new URLSearchParams();
                data.append("username", username);
                data.append("password", password);
                const config = {
                    method: "post",
                    url: "auth/token",
                    data: data
                };
                let res = await util.request(config, userContext, false);
                const access_token = res.data.access_token;
                const refresh_token = res.data.refresh_token;
                if (access_token) {
                    const config = {
                        method: "get",
                        url: "user/me",
                        headers: {
                            Authorization: "Bearer " + access_token,
                        }
                    }
                    res = await util.request(config, userContext, false);
                    userContext.login(res.data, access_token, refresh_token);
                } else {
                    setSession(res.data.session);
                    setUsername(username);
                }
            }
        } catch (err) {
            console.log(err);
            if (err.response.status === 401) {
                setMsg(err.response.data.detail);
            } else {
                alert(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleNewProfileChange = async (event) => {
        setMsg("");
        setLoading(true);

        try {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const family_name = data.get("family_name");
            const given_name = data.get("given_name");
            const password1 = data.get("new_password");
            const password2 = data.get("verify_password");

            if (password1 !== password2) {
                setMsg("パスワードが不一致です。")
            } else if (!util.check_password_policy(password1)) {
                setMsg("パスワードは15文字以上で、大文字、小文字、数字、記号をそれぞれ1文字以上含む必要があります。")
            } else if (family_name === "" || given_name === "") {
                setMsg("姓と名は必須です。");
            } else {
                const params = new URLSearchParams();
                params.append("username", username);
                params.append("password", password1);
                params.append("family_name", family_name);
                params.append("given_name", given_name);
                params.append("session", session);
                const config = {
                    method: "post",
                    url: "new_user",
                    data: params
                };
                let res = await util.request(config, userContext, false);
                const access_token = res.data.access_token;
                const refresh_token = res.data.refresh_token;
                if (access_token) {
                    const config = {
                        method: "get",
                        url: "user/me"
                    };
                    res = await util.request(config, userContext);
                    userContext.login(res.data, access_token, refresh_token);
                }
            }
        } catch (err) {
            console.log(err)
            alert(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline/>
            <Box sx={{marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                {session === null ? (
                    <>
                        <Avatar sx={{m: 1, bgcolor: 'primary.main'}}>
                            <LockIcon/>
                        </Avatar>
                        <Typography>認証</Typography>
                        <Box sx={{mt: 3}}>
                            <Typography sx={{color: 'red'}}>{msg}</Typography>
                        </Box>
                        <Box component="form" onSubmit={handleSignIn} noValidate sx={{mt: 1}}>
                            <TextField id="username" name="username" label="ユーザーID"
                                       variant="standard"
                                       required fullWidth autoFocus/>
                            <TextField id="password" name="password" label="パスワード" type="password"
                                       margin="normal" variant="standard" required fullWidth/>
                            <LoadingButton type="submit" fullWidth variant="contained" loading={loading} sx={{mt: 3}}>
                                ログイン
                            </LoadingButton>
                        </Box>
                    </>
                ) : (
                    <>
                        <Avatar sx={{m: 1, bgcolor: 'primary.main'}}/>
                        <Typography>User profile registration and initial password change.</Typography>
                        <Box sx={{mt: 3}}>
                            <Typography sx={{color: 'red'}}>{msg}</Typography>
                        </Box>
                        <Box component="form" onSubmit={handleNewProfileChange} noValidate sx={{mt: 1}}>
                            <TextField id="username" name="username" label="ユーザーID"
                                       margin="normal" variant="standard" fullWidth
                                       value={username} disabled/>
                            <Stack direction="row" spacing={2} sx={{mb: 2}}>
                                <TextField id="family_name" name="family_name" label="姓"
                                           variant="standard" required fullWidth
                                autocomplete="off"/>
                                <TextField id="given_name" name="given_name" label="名"
                                           variant="standard" required fullWidth/>
                            </Stack>
                            <TextField id="new_password" name="new_password" label="新しいパスワード"
                                       type="password"
                                       margin="normal" variant="standard" required fullWidth
                                       autocomplete="new-password" />
                            <TextField id="verify_password" name="verify_password" label="念の為もう一度"
                                       type="password"
                                       variant="standard" required fullWidth
                                       autocomplete="new-password" />
                            <LoadingButton type="submit" fullWidth variant="contained" loading={loading} sx={{mt: 3}}>
                                登録
                            </LoadingButton>
                        </Box>
                    </>
                )}
            </Box>
        </Container>
    );
}

export default Login;
