from pydantic import BaseSettings


class Settings(BaseSettings):
    debug = True
    allow_origin = ["http://127.0.0.1:5173", "http://localhost:5173"]
    # Auth
    auth_pool_id: str = None
    auth_client_id: str = None
    auth_client_secret: str = None
    auth_region = "ap-northeast-1"
    auth_jwks_file = "jwks.json"


settings = Settings()
