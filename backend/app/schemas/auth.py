"""Pydantic schemas for Authentication and User Sessions."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Payload for user authentication."""

    email: str = Field(..., min_length=3, description="Researcher or mission director email")
    password: str = Field(..., min_length=4, description="Access credential password")
    remember_me: Optional[bool] = Field(False, description="Extend session duration")


class UserProfile(BaseModel):
    """Authenticated user identity and research credentials."""

    id: str = Field(..., description="Unique user ID")
    email: str = Field(..., description="User email address")
    name: str = Field(..., description="Full operational name")
    role: str = Field(..., description="Operational title, e.g. Flight Director")
    clearance_level: str = Field(..., description="Security & research clearance level")
    station: str = Field(..., description="Assigned research facility or flight station")


class AuthTokenResponse(BaseModel):
    """Authentication token response with user profile."""

    access_token: str = Field(..., description="Bearer access token")
    token_type: str = Field("bearer", description="Token type")
    expires_at: str = Field(..., description="ISO 8601 expiration timestamp")
    user: UserProfile = Field(..., description="Authenticated user profile")


class LogoutResponse(BaseModel):
    """Response returned upon session termination."""

    success: bool = True
    message: str = "Session terminated successfully."
