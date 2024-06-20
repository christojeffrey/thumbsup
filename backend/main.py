from typing import List, Union

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware


MODULO = 257

origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import shamirs
@app.get("/")
def read_root():
    return {"Hello": "World"}




# define body of the request
# secret, quantity
class SplitBody(BaseModel):
    secret: int
    quantity: int



@app.post("/split")
async def split(splitBody: SplitBody):
    secrets = shamirs.shares(splitBody.secret, quantity=splitBody.quantity, modulus=MODULO)
    return {"secrets": secrets}


    
class CombineBody(BaseModel):
    secrets: List[int]

@app.post("/combine")
async def combine(combineBody: CombineBody):
    print(combineBody.secrets)

    # turn secrets to share
    secrets = []
    index = 0
    for value in combineBody.secrets:
        secrets.append(shamirs.share(index + 1, value, MODULO))
        index += 1

    result = shamirs.interpolate(secrets)
    return {"result": result}