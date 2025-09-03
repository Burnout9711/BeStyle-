from fastapi import APIRouter, Depends, Response, Cookie
from services.session_service import attach_user, COOKIE_NAME

# @router.post("/login")
# def login(..., response: Response, sid: str | None = Cookie(default=None, alias=COOKIE_NAME)):
#     # ... authenticate user, set auth cookie, return user
#     if sid:
#         await attach_user(sid, str(user.id))  # link anon session to user
#     return {"user": ...}
