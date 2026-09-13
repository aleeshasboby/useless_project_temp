from fastapi import APIRouter
from app.config import CHAOS_CONFIG

router = APIRouter(prefix="/api", tags=["Chaos"])


@router.get("/chaos-config")
def get_chaos_config():
    return CHAOS_CONFIG
