from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session
from __services__.db_services import get_db
from __services__.user_services import (
    LoginUser,
    CreateUser,
    UserResponse,
    LoginResponse,
    user_service,
)
from __services__.feedback_services import (
    FeedbackService,
    Feedback,
    FeedbackCreate,
    FeedbackUpdate,
)

app = FastAPI(title="AskTracker API", version="1.0.0")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to AskTracker API!"}


# User routes
@app.post("/register", response_model=UserResponse)
async def register(user: CreateUser, db: Session = Depends(get_db)):
    """Register a new user"""
    return user_service.create_user(user, db)


@app.post("/login", response_model=LoginResponse)
async def login(user: LoginUser, db: Session = Depends(get_db)):
    """Login user and get access token"""
    return user_service.user_login(user, db)


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = user_service.get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


# Feedback routes
@app.post("/feedback", response_model=Feedback)
async def create_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    """Create new feedback"""
    return FeedbackService.create_feedback(feedback, db)


@app.get("/feedback/{feedback_id}", response_model=Feedback)
async def get_feedback(feedback_id: int, db: Session = Depends(get_db)):
    """Get feedback by ID"""
    feedback = FeedbackService.get_feedback_by_id(feedback_id, db)
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    return feedback


@app.get("/feedback", response_model=list[Feedback])
async def list_feedback(db: Session = Depends(get_db)):
    """List all feedback"""
    return FeedbackService.list_feedback(db)


@app.put("/feedback/{feedback_id}", response_model=Feedback)
async def update_feedback(feedback_id: int, feedback_update: FeedbackUpdate, db: Session = Depends(get_db)):
    """Update feedback by ID"""
    feedback = FeedbackService.update_feedback(feedback_id, feedback_update, db)
    if not feedback:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    return feedback


@app.delete("/feedback/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    """Delete feedback by ID"""
    deleted = FeedbackService.delete_feedback(feedback_id, db)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    return None


@app.get("/api/data")
async def get_data(db: Session = Depends(get_db)):
    return {"data": "This is protected data from FastAPI"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
