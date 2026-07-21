# Stub — 完整实现在 Task 2.1
import asyncio
import sqlite3

_db_lock = asyncio.Lock()
_conn: sqlite3.Connection | None = None


async def cleanup_old():
    pass
