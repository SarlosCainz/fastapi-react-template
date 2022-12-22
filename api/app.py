from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
import util
from auth import router as auth_router
from api_common import router as common_router


app = FastAPI()
if settings.allow_origin is not None:
    app.add_middleware(CORSMiddleware, allow_origins=settings.allow_origin, allow_methods=["*"],
                       allow_credentials=True, allow_headers=["*"])

logger = util.get_logger()


app.include_router(auth_router, tags=["auth"], prefix="/auth")
app.include_router(common_router, tags=["common"])
