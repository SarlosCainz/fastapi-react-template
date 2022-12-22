from typing import List

from fastapi import Depends
from fastapi_utils.inferring_router import InferringRouter
from fastapi_utils.cbv import cbv

import models
import util
import auth

router = InferringRouter()
logger = util.get_logger()


@cbv(router)
class JwtAuthCDV:
    token: str = Depends(auth.get_valid_token)

    @router.get("/user/me", response_model=models.User)
    async def c_user_me(self):
        return auth.get_user(self.token)

    @router.get("/hello")
    async def api_hello(self):
        return {"message": "Hello World"}


