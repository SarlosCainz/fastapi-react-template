from fastapi.testclient import TestClient

from auth import get_valid_token
from app import app

TOKEN = "some-token"
client = TestClient(app)

async def mock_get_valid_token():
    return TOKEN

app.dependency_overrides[get_valid_token] = mock_get_valid_token

