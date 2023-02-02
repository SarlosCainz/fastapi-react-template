from typing import Optional, List, Dict

from pydantic import BaseModel, HttpUrl, constr, EmailStr, conlist


class Result(BaseModel):
    rc: int = 0
    msg: str = "success"

    def has_error(self) -> bool:
        return self.rc != 0


class User(BaseModel):
    username: constr(max_length=30, regex=r"^[a-zA-Z0-9_]+$")
    email: Optional[EmailStr] = None
    full_name: Optional[constr(max_length=30)] = None
    picture: Optional[HttpUrl] = None
    groups: Optional[conlist(constr(to_lower=True), max_items=10)] = None


class Token(BaseModel):
    user: User = None
    id_token: str = None
    nonce: str = None
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
        import argparse, sys

        parser = argparse.ArgumentParser()
        parser.add_argument("-o", "--output", help="output file", default=sys.stdout)
        args = parser.parse_args()

        file = open(args.output, "w") if type(args.output) == str else args.output
        to_js(file, "Result", Result())
        to_js(file, "User", User(username=""))

    main()
