from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_methods=["*"])


@app.get("/api/hello")
async def api_hello():
    return {"message": "Hello World"}
