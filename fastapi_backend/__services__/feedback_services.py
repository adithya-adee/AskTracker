from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .db_services import FeedBack


class FeedbackCreate(BaseModel):
    user_id: int
    title: str
    message: str


class FeedbackUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None


class Feedback(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    created_at: str
    last_modified: str

    class Config:
        from_attributes = True


class FeedbackService:
    @staticmethod
    def create_feedback(feedback_data: FeedbackCreate, db: Session) -> Feedback:
        """Create new feedback"""
        now = datetime.now().isoformat()
        
        db_feedback = FeedBack(
            user_id=feedback_data.user_id,
            title=feedback_data.title,
            message=feedback_data.message,
            created_at=now,
            last_modified=now
        )
        
        db.add(db_feedback)
        db.commit()
        db.refresh(db_feedback)
        
        return Feedback.from_orm(db_feedback)

    @staticmethod
    def get_feedback_by_id(feedback_id: int, db: Session) -> Optional[Feedback]:
        """Get feedback by ID"""
        db_feedback = db.get(FeedBack, feedback_id)
        if not db_feedback:
            return None
        return Feedback.from_orm(db_feedback)

    @staticmethod
    def list_feedback(db: Session) -> list[Feedback]:
        """List all feedback"""
        statement = select(FeedBack)
        db_feedback = db.exec(statement).all()
        return [Feedback.from_orm(feedback) for feedback in db_feedback]

    @staticmethod
    def update_feedback(feedback_id: int, feedback_update: FeedbackUpdate, db: Session) -> Optional[Feedback]:
        """Update feedback by ID"""
        db_feedback = db.get(FeedBack, feedback_id)
        if not db_feedback:
            return None
        
        update_data = feedback_update.dict(exclude_unset=True)
        if update_data:
            for key, value in update_data.items():
                setattr(db_feedback, key, value)
            db_feedback.last_modified = datetime.now().isoformat()
            
            db.commit()
            db.refresh(db_feedback)
        
        return Feedback.from_orm(db_feedback)

    @staticmethod
    def delete_feedback(feedback_id: int, db: Session) -> bool:
        """Delete feedback by ID"""
        db_feedback = db.get(FeedBack, feedback_id)
        if not db_feedback:
            return False
        
        db.delete(db_feedback)
        db.commit()
        return True