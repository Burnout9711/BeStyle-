from database import get_collection
from models.outfit import Outfit
from bson import ObjectId

async def create_outfit(outfit_data: dict):
    """
    Asynchronously creates a new outfit document in the 'outfits' collection.

    Args:
        outfit_data (dict): A dictionary containing the outfit details to be inserted.

    Returns:
        Outfit: An instance of the Outfit model representing the newly created outfit.

    Raises:
        Exception: If there is an error during database operations.
    """
    coll = await get_collection("outfits")
    result = await coll.insert_one(outfit_data)
    if not result.inserted_id:
        raise Exception("Insertion failed: No ID returned.")
    outfit = await coll.find_one({"_id": result.inserted_id})
    if not outfit:
        raise Exception("Insertion failed: Document not found after insert.")
    return Outfit(**outfit)

async def get_outfit(outfit_id: str):
    """
    Retrieve an outfit document from the database by its ID.

    Args:
        outfit_id (str): The unique identifier of the outfit to retrieve.

    Returns:
        Outfit or None: An instance of the Outfit model if found, otherwise None.
    """
    coll = await get_collection("outfits")
    outfit = await coll.find_one({"_id": ObjectId(outfit_id)})
    if outfit:
        return Outfit(**outfit)
    return None

async def get_all_outfits():
    coll = await get_collection("outfits")
    cursor = coll.find({})
    outfits = []
    async for outfit in cursor:
        outfits.append(Outfit(**outfit))
    return outfits

async def update_outfit(outfit_id: str, outfit_data: dict):
    coll = await get_collection("outfits")
    result = await coll.update_one({"_id": ObjectId(outfit_id)}, {"$set": outfit_data})
    if result.modified_count:
        outfit = await coll.find_one({"_id": ObjectId(outfit_id)})
        return Outfit(**outfit)
    return None

async def delete_outfit(outfit_id: str):
    coll = await get_collection("outfits")
    result = await coll.delete_one({"_id": ObjectId(outfit_id)})
    return result.deleted_count > 0