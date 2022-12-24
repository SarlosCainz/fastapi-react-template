import time
from fastapi import FastAPI, WebSocket, Depends
from fastapi.middleware.cors import CORSMiddleware

from config import settings
import util
from auth import router as auth_router, get_valid_token_by_query
from api_common import router as common_router


app = FastAPI()
if settings.allow_origin is not None:
    app.add_middleware(CORSMiddleware, allow_origins=settings.allow_origin, allow_methods=["*"],
                       allow_credentials=True, allow_headers=["*"])

logger = util.get_logger()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket,
                             token:str = Depends(get_valid_token_by_query)):
    await websocket.accept()
    for x in range(20):
        msg = f"Message text was: {x}"
        await websocket.send_text(msg)
        logger.debug(msg)
        time.sleep(1)


app.include_router(auth_router, tags=["auth"], prefix="/auth")
app.include_router(common_router, tags=["common"])
