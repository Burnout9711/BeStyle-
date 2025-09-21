# models/objectid.py
from typing import Annotated
from bson import ObjectId
from pydantic import BeforeValidator, PlainSerializer

def _parse_objectid(v):
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")

# Use Annotated to define a reusable type:
# - BeforeValidator: accepts str/ObjectId at input time
# - PlainSerializer: outputs str in JSON responses
PyObjectId = Annotated[
    ObjectId,
    BeforeValidator(_parse_objectid),
    PlainSerializer(lambda v: str(v), return_type=str),
]
