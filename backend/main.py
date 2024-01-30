import hashlib
import os, random, string
from bson import ObjectId
from pydantic import BaseModel
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, status, Request, Response
from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from fastapi import Depends

class Email(BaseModel):
  email: str

class Nonce(BaseModel):
  nonce: str

class Credentials(BaseModel):
  email: str
  password: str

class UserData(BaseModel):
  id: str
  email: str

class UserResponse(BaseModel):
  id: str
  email: str
  name: str | None = None
  surname: str | None = None

class UserRequest(BaseModel):
  email: str
  name: str | None = None
  surname: str | None = None

class UserRegister(BaseModel):
  email: str
  password: str
  name: str | None = None
  surname: str | None = None

SECRET_KEY = "[64 chars]"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

class TokenService:
  @staticmethod
  def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
      expire = datetime.utcnow() + expires_delta
    else:
      expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

  @staticmethod
  def get_user_data(request: Request) -> UserData:
    token = request.cookies.get("token")

    credentials_exception = HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Unauthorized",
    )

    if not token:
      raise credentials_exception

    try:
      payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
      id = payload.get("id")
      email = payload.get("sub")
      if id is None or email is None:
        raise credentials_exception
    except JWTError:
      raise credentials_exception

    return UserData(id=id, email=email)

app = FastAPI()

# define CORS domain white list
origins = ["http://localhost:7777"]

# Add CORS rules
app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

mongodb_uri = os.environ.get('MONGODB_URI')
mongodb_name = os.environ.get('MONGODB_NAME')
client = MongoClient(mongodb_uri)
database = client.get_database(mongodb_name)
users = database['users']

@app.patch('/nonce', tags=['Authorization'], response_model=Nonce)
def nonce(body: Email):
  user = users.find_one({ 'email': body.email })
  if not user:
    raise HTTPException(status.HTTP_404_NOT_FOUND, detail='User with passed email not found.')
  else:
    random_string = ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(25));
    users.update_one(
      {'_id': user['_id']},
      {'$set': {'nonce': random_string}}
    )
    return {'nonce': random_string}
  
@app.post("/login", tags=["Authorization"], response_model=UserResponse)
async def login(body: Credentials, response: Response):
  user = users.find_one({ 'email': body.email })
  if not user:
    raise HTTPException(status.HTTP_404_NOT_FOUND, detail='User with passed email not found.')
  else:
    if not user['nonce']:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail='Nonce is missing or invalid.')
    else:
      if len(body.password) != 64:
        raise HTTPException(status.HTTP_406_NOT_ACCEPTABLE, detail='Password in not acceptable form.')
      else:
        hash_nonce = user['hash'] + user['nonce']
        hash_value = hashlib.sha256(hash_nonce.encode('utf-8')).hexdigest()
        if hash_value != body.password:
          raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail='Bad credentials.')
        else:
          access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
          access_token = TokenService.create_access_token(
            data={"id": str(user['_id']), "sub": user['email']}, expires_delta=access_token_expires
          )

          response.set_cookie(
            key="token",
            value=access_token,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=True,
            samesite="none",
          )

          users.update_one(
            {'_id': user['_id']},
            {'$set': {'nonce': ''}}
          )

          user['id'] = str(user['_id'])
          del user['nonce']
          del user['hash']
          return user

@app.get('/user/{id}', tags=['User'], response_model=UserResponse)
def get_user_by_id(id: str):
  if len(id) != 24:
    raise HTTPException(status.HTTP_406_NOT_ACCEPTABLE, detail='Id in not acceptable form.')
  else:
    result = users.find_one(ObjectId(id))
    if result and '_id' in result:
      result['id'] = str(result['_id'])
      del result['nonce']
      del result['hash']
      return result
    else:
      raise HTTPException(status.HTTP_404_NOT_FOUND, detail='Unable to retrieve user.')
  
@app.get('/user', tags=['User'], response_model=UserResponse)
def get_user(user_data: Annotated[UserData, Depends(TokenService.get_user_data)]):
  result = users.find_one(ObjectId(user_data.id))
  if result and '_id' in result:
    result['id'] = str(result['_id'])
    del result['nonce']
    del result['hash']
    return result
  else:
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail='Unable to retrieve user.')
  
@app.put('/user', tags=['User'], response_model=UserResponse)
def put_user(body: UserRequest, user_data: Annotated[UserData, Depends(TokenService.get_user_data)]):
  users.update_one(
    {'_id': ObjectId(user_data.id)},
    {'$set': {
      'name': body.name,
      'surname': body.surname,
      'email': body.email
    }}
  )
  result = users.find_one(ObjectId(user_data.id))
  if result and '_id' in result:
    result['id'] = str(result['_id'])
    del result['nonce']
    del result['hash']
    return result
  else:
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail='Unable to retrieve user.')
  
@app.post('/user', tags=['User'], response_model=UserResponse)
def post_user(body: UserRegister):
  user = users.find_one({ 'email': body.email })
  if user:
    raise HTTPException(status.HTTP_409_CONFLICT, detail='There is already user assigned to this email.')
  else:
    new_user = {
      'name': body.name,
      'surname': body.surname,
      'email': body.email,
      'nonce': '',
      'hash': hashlib.sha256(body.password.encode('utf-8')).hexdigest()
    }
    record = users.insert_one(new_user)
    result = users.find_one(record.inserted_id)
    if result and '_id' in result:
      result['id'] = str(result['_id'])
      del result['nonce']
      del result['hash']
      return result
    else:
      raise HTTPException(status.HTTP_400_BAD_REQUEST, detail='Unable to insert user.')