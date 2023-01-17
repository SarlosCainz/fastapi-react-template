from pydantic import BaseSettings
from requests.auth import HTTPBasicAuth


class Settings(BaseSettings):
    debug = True
    allow_origin = ["http://127.0.0.1:5173", "http://localhost:5173"]
    # Auth
    auth_pool_id: str = None
    auth_client_id: str = None
    auth_client_secret: str = None
    auth_region = "ap-northeast-1"
    auth_jwks_file = "jwks.json"
    auth_hosted_ui: str
    auth_redirect_uri: str
    auth_logout_uri: str

    def cognito_auth(self):
        return HTTPBasicAuth(self.auth_client_id, self.auth_client_secret)


settings = Settings()
