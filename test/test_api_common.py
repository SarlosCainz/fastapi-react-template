from unittest import mock
from fastapi.testclient import TestClient

from auth import get_valid_token
from app import app
import models

TOKEN = "some-token"
client = TestClient(app)

async def mock_get_valid_token():
    return TOKEN

app.dependency_overrides[get_valid_token] = mock_get_valid_token


def test_hello():
    response = client.get(url="/api/hello", headers={
        "Authorization": "Bearer " + TOKEN
    })

    assert response.status_code == 200
    assert response.json().get("message") == "Hello World"

def test_user_me():
    with mock.patch("auth.get_user", return_value=models.User(username="foo")):
        response = client.get(url="/api/user/me", headers={
            "Authorization": "Bearer " + TOKEN
        })

        assert response.status_code == 200
        assert response.json().get("username") == "foo"
