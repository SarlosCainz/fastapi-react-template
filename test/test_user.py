import pytest
from pydantic import ValidationError

import util
from models import User

logger = util.get_logger()

@pytest.fixture(scope="module")
def standard_data():
    return {
        "username": "foo_BAR_0123456789012345678901",
        "email": "foo@examle.com",
        "full_name": "012345678901234567890123456789",
        "picture": "https://example.com/foo",
        "groups": ["Foo", "Bar"]
    }


def test_normal(standard_data):
    user = User(**standard_data)

    assert user.username == standard_data["username"]
    assert user.email == standard_data["email"]
    assert user.full_name == standard_data["full_name"]
    assert user.picture == standard_data["picture"]
    assert len(user.groups) == 2
    assert user.groups[0] == standard_data["groups"][0].lower()
    assert user.groups[1] == standard_data["groups"][1].lower()


def test_invalid_username(standard_data):
    data = standard_data | {"username": "foo-123!"}
    with pytest.raises(ValidationError) as e:
        User(**data)
        print(e)


def test_too_long_username(standard_data):
    data = standard_data | {"username": standard_data["username"] + "a"}
    with pytest.raises(ValidationError):
        User(**data)


def test_omit_username(standard_data):
    data = standard_data | {"username": None}
    with pytest.raises(ValidationError):
        User(**data)


def test_optional(standard_data):
    user = User(username=standard_data["username"])
    assert user.email is None
    assert user.full_name is None
    assert user.picture is None
    assert user.groups is None


def test_invalid_email(standard_data):
    data = standard_data | {"email": "foo"}
    with pytest.raises(ValidationError):
        User(**data)


def test_invalid_picture(standard_data):
    data = standard_data | {"picture": "foo"}
    with pytest.raises(ValidationError):
        User(**data)


def test_too_long_fullname(standard_data):
    data = standard_data | {"full_name": standard_data["full_name"] + "a"}
    with pytest.raises(ValidationError):
        User(**data)

def test_too_long_fullname2(standard_data):
    data = standard_data | {"full_name" : "０１２３４５６７８９０１２３４５６７８９０１２３４５６７８９１"}
    with pytest.raises(ValidationError):
        User(**data)
