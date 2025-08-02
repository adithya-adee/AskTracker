from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request, Response, HTTPException
from auth_handler import decodeJWT

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials | None = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.schema == "Bearer" :
                raise HTTPException(
                    status_code=403, detail="Invalid Authentication Schema"
                )
            if not self.verify_jwt( credentials.credentials):
                raise HTTPException(
                    status_code=403, detail="Invalid Token or Expired Token"
                )
        else :
             raise HTTPException(status_code=403, detail="Invalid authorization code.")

    def verify_jwt(self, jwtToken: str) -> bool :
        isValidToken = False
        try :
            payload = decodeJWT(jwtToken)
        except :
            payload = None

        if payload:
            isValidToken = True

        return isValidToken      
    