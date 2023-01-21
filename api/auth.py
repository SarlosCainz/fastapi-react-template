from datetime import datetime
import base64
import hmac
import hashlib
import json
from typing import List

from fastapi import APIRouter, Depends, status, HTTPException, Form, Query
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt, jwk
from jose.utils import base64url_decode
import boto3

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


# ユーザー名とパスワードで認証後、アクセストークンを生成するAPI
@router.post("/token", response_model=models.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    return authenticate_user(form_data.username, form_data.password)


# 初回パスワード変更
@router.post("/new_user", response_model=models.Token)
async def new_password(username: str = Form(),
                       password: str = Form(),
                       family_name: str = Form(),
                       given_name: str = Form(),
                       session: str = Form()):
    try:
        secret_hash = get_secret_hash(username)
        res = cognito.admin_respond_to_auth_challenge(
            UserPoolId=settings.auth_pool_id,
            ClientId=settings.auth_client_id,
            ChallengeName="NEW_PASSWORD_REQUIRED",
            Session=session,
            ChallengeResponses={
                'USERNAME': username,
                'NEW_PASSWORD': password,
                "SECRET_HASH": secret_hash,
                "userAttributes.given_name": given_name,
                "userAttributes.family_name": family_name,
            })

        result = res["AuthenticationResult"]
        token = models.Token(access_token=result["AccessToken"],
                             refresh_token=result["RefreshToken"],
                             token_type=result["TokenType"])
    except cognito.exceptions.NotAuthorizedException:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="パスワード変更に失敗しました")

    return token


@router.post("/refresh", response_model=models.Token)
async def refresh(username: str = Form(), refresh_token: str = Form()):
    try:
        secret_hash = get_secret_hash(username)
        res = cognito.admin_initiate_auth(UserPoolId=settings.auth_pool_id,
                                          ClientId=settings.auth_client_id,
                                          AuthFlow='REFRESH_TOKEN_AUTH',
                                          AuthParameters={
                                              "REFRESH_TOKEN": refresh_token,
                                              "SECRET_HASH": secret_hash,
                                          })
        result = res["AuthenticationResult"]
        token = models.Token(
            access_token=result["AccessToken"],
            token_type=result["TokenType"]
        )

    except cognito.exceptions.NotAuthorizedException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="無効なトークンです。",
                            headers={"WWW-Authenticate": "Bearer"})

    return token


def get_secret_hash(username: str) -> str:
    message = bytes(username + settings.auth_client_id, 'utf-8')
    key = bytes(settings.auth_client_secret, 'utf-8')
    return base64.b64encode(hmac.new(key, message, digestmod=hashlib.sha256).digest()).decode()


# ユーザー認証
def authenticate_user(username: str, password: str) -> models.Token:
    token = models.Token()
    secret_hash = get_secret_hash(username)

    try:
        res = cognito.admin_initiate_auth(UserPoolId=settings.auth_pool_id,
                                          ClientId=settings.auth_client_id,
                                          AuthFlow='ADMIN_USER_PASSWORD_AUTH',
                                          AuthParameters={
                                              'USERNAME': username,
                                              'PASSWORD': password,
                                              "SECRET_HASH": secret_hash,
                                          })
        if "ChallengeName" in res:
            token.challenge_name = res["ChallengeName"]
            token.session = res["Session"]
        else:
            result = res["AuthenticationResult"]
            token.access_token = result["AccessToken"]
            token.refresh_token = result["RefreshToken"]
            token.token_type = result["TokenType"]

    except cognito.exceptions.NotAuthorizedException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="ユーザー名またはパスワードが違います。",
                            headers={"WWW-Authenticate": "Bearer"})

    return token


def get_user(token) -> models.User:
    res = cognito.get_user(AccessToken=token)
    user_attr = {}
    for attr in res["UserAttributes"]:
        user_attr[attr["Name"]] = attr["Value"]

    full_name = user_attr.get("family_name", "No") + " " + user_attr.get("given_name", "Name")
    user = models.User(username=res["Username"], full_name=full_name, email=user_attr["email"])
    user.groups = get_groups(token)

    return user


def get_groups(token: str) -> List:
    claims = jwt.get_unverified_claims(token)
    return claims.get("cognito:groups", [])


async def get_valid_token(token: str = Depends(oauth2_scheme)) -> str:
    try:
        return await validate_token(token)
    except HTTPException as ex:
        ex.headers = {"WWW-Authenticate": "Bearer"}
        raise ex


async def get_valid_token_by_query(token: str = Query()) -> str:
    return await validate_token(token)


async def validate_token(token: str) -> str:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
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
                logger.debug("期限切れのToken")
                credentials_exception.detail = "expired"
                raise credentials_exception
        else:
            # 不正なトークン
            logger.debug("不正なToken")
            raise credentials_exception
    except JWTError:
        logger.debug("何か変だよ")
        raise credentials_exception

    return token
