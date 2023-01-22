from datetime import datetime
import json
import urllib.parse
from typing import List

from fastapi import APIRouter, Depends, status, HTTPException, Form
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt, jwk
from jose.utils import base64url_decode
import boto3
import requests

from config import settings
import models
import util


logger = util.get_logger()
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
cognito = boto3.client("cognito-idp", region_name=settings.auth_region)


def get_kids():
    with open(settings.auth_jwks_file, "r") as file:
        jwks = json.load(file)
        kid_to_jwk = {jwk["kid"]: jwk for jwk in jwks["keys"]}

    return kid_to_jwk


kids = get_kids()


# Cognitoから受領した認可コードよりトークンを取得するコールバック
@router.post("/token", response_model=models.Token)
async def callback(code: str = Form()):
    params = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.auth_redirect_uri,
    }
    result = token_endpoint(params)

    access_token = result.get("access_token")
    user = get_user(access_token)

    id_token = result.get("id_token")
    nonce = None
    if id_token:
        claims = jwt.get_unverified_claims(id_token)
        nonce = claims.get("nonce")

    token = models.Token(
        user = user,
        id_token=id_token,
        nonce=nonce,
        access_token=access_token,
        refresh_token=result.get("refresh_token"),
        token_type=result.get("token_type")
    )

    return token


@router.post("/refresh", response_model=models.Token)
async def refresh(refresh_token: str = Form()):
    params = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }
    result = token_endpoint(params)
    token = models.Token(
        id_token=result.get("id_token"),
        access_token=result.get("access_token"),
        token_type=result.get("token_type"),
    )

    return token


def token_endpoint(params):
    url = f"{settings.auth_hosted_ui}/oauth2/token"
    data = urllib.parse.urlencode(params)
    headers = {
        "content-type": "application/x-www-form-urlencoded"
    }

    res = requests.post(url=url, headers=headers, data=data, auth=settings.cognito_auth())
    if res.status_code != 200:
        logger.error(res.text)
        raise HTTPException(status_code=res.status_code, detail=res.text)

    result = json.loads(res.text)
    # logger.debug(result)

    return result


def get_user(token) -> models.User:
    url = f"{settings.auth_hosted_ui}/oauth2/userInfo"
    headers = {
        f"Authorization": f"Bearer {token}"
    }

    res = requests.get(url=url, headers=headers)
    if res.status_code != 200:
        logger.error(res.text)
        raise HTTPException(status_code=res.status_code, detail=res.text)

    result = json.loads(res.text)
    user = models.User(username=result.get("username"),
                       email=result.get("email"),
                       full_name=result.get("family_name") + " " + result.get("given_name"),
                       picture=result.get("picture"),
                       groups=get_groups(token))
    return user


def get_groups(token: str) -> List:
    claims = jwt.get_unverified_claims(token)
    return claims.get("cognito:groups", [])


async def get_valid_token(token: str = Depends(oauth2_scheme)) -> str:
    return await parse_token(token)


async def parse_token(token: str) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        claims = jwt.get_unverified_claims(token)
        # トークンヘッダーより署名に使われた鍵のIDを取得
        header = jwt.get_unverified_header(token)
        kid = header["kid"]

        # 鍵を用いてトークンの正当性を検証
        message, encoded_signature = token.rsplit(".", 1)
        decoded_signature = base64url_decode(encoded_signature.encode())
        hmac_key = jwk.construct(kids[kid])
        verify = hmac_key.verify(message.encode(), decoded_signature)

        if verify:
            # 正当なトークンの場合、有効期限を検証
            now = int(datetime.now().timestamp())
            if now > claims["exp"]:
                # 期限切れ
                credentials_exception.detail = "expired"
                raise credentials_exception
        else:
            # 不正なトークン
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    return token
