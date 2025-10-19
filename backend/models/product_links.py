# models/product_links.py
from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class ProductLink(BaseModel):
    title: str
    url: str                    # keep flexible; some retailers use non-HTTP RFC chars
    price: Optional[float] = None
    currency: Optional[str] = None
    image_url: Optional[str] = None
    source: str = "Google Shopping"
    in_stock: Optional[bool] = None

class ItemProducts(BaseModel):
    item_name: str             # maps to OutfitItem.name
    links: List[ProductLink] = Field(default_factory=list)

class OutfitProducts(BaseModel):
    outfit_id: str             # maps to OutfitCard.id
    products: List[ItemProducts] = Field(default_factory=list)

class GenerateOutfitsWithLinksResponse(BaseModel):
    # Reuse your existing cards plus attached product links
    items: List[Dict]          # raw OutfitCard dicts (or import your OutfitCard and use List[OutfitCard])
    links: List[OutfitProducts]
    saved: bool
