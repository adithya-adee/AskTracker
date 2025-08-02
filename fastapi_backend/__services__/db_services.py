from typing import Generator, Optional

from fastapi import Depends
from sqlmodel import Field, Session, SQLModel, create_engine, inspect
import uuid
from sqlmodel import Column, String
import os


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password: str


class FeedBack(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    message: str
    created_at: str = Field(default=None)  # Changed from Optional[str]
    last_modified: str = Field(default=None)  # Changed from Optional[str]


class DBService:
    def __init__(self, db_filename: str = "database.db"):
        self.db_filename = db_filename
        self.sqlite_url = f"sqlite:///{db_filename}"
        self.engine = create_engine(
            self.sqlite_url, connect_args={"check_same_thread": False}
        )
        self.create_db_and_tables()

    def create_db_and_tables(self) -> None:
        # Drop and recreate database if needed for development
        if os.path.exists(self.db_filename):
            print("Removing existing database and recreating...")
            os.remove(self.db_filename)

        SQLModel.metadata.create_all(self.engine)
        print("Database tables created successfully!")

    def get_session(self) -> Generator[Session, None, None]:
        with Session(self.engine) as session:
            yield session


# Global instance
db_service = DBService()


def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    yield from db_service.get_session()
