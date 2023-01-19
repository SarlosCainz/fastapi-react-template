from typing import Optional, List, Dict, Union

from pydantic import BaseModel, Field


class Result(BaseModel):
    rc: int = 0
    msg: str = "success"

    def has_error(self) -> bool:
        return self.rc != 0


class User(BaseModel):
    username: str
    email: Union[str, None] = None
    full_name: Union[str, None] = None
    picture: str = None
    groups: List[str] = None


class Token(BaseModel):
    user: User
    id_token: str = None
    access_token: str = None
    refresh_token: str = None
    token_type: str = None
    challenge_name: Optional[str]
    session: Optional[str]


JWK = Dict[str, str]


class JWKS(BaseModel):
    keys: List[JWK]


class JWTAuthorizationCredentials(BaseModel):
    jwt_token: str
    header: Dict[str, str]
    claims: Dict[str, str]
    signature: str
    message: str


if __name__ == "__main__":
    def to_js(file, model_name, model):
        js = model.json().replace('null', '""')
        file.write(f"export const {model_name} = {js};\n")

    def main():
        import argparse, sys, util, datetime

        parser = argparse.ArgumentParser()
        parser.add_argument("-o", "--output", help="output file", default=sys.stdout)
        args = parser.parse_args()

        file = open(args.output, "w") if type(args.output) == str else args.output
        to_js(file, "Result", Result())
        to_js(file, "User", User(username=""))

    main()
