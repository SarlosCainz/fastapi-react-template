from unittest import mock
from test_app import client, TOKEN
import models


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
