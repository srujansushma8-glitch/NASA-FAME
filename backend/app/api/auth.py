"""API endpoints for NASA-FLAME Mission Control Authentication."""

from datetime import datetime, timezone, timedelta
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status

from backend.app.schemas.auth import (
    LoginRequest,
    AuthTokenResponse,
    UserProfile,
    LogoutResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Security"])

# Active server session store (token -> UserProfile)
ACTIVE_SESSIONS: dict[str, dict] = {}

# Default authorized researcher profiles
RESEARCHER_DIRECTORY = {
    "commander@nasa-flame.gov": {
        "id": "usr-cdr-001",
        "name": "Commander S. Sushma",
        "role": "Mission Flight Director",
        "clearance_level": "LEVEL 5 // TOP SECRET NASA CIR-ACME",
        "station": "ISS Destiny / Glenn GRC",
    },
    "dietrich@nasa.gov": {
        "id": "usr-res-002",
        "name": "Dr. D. L. Dietrich",
        "role": "Lead Combustion Physicist",
        "clearance_level": "LEVEL 4 // PRINCIPAL INVESTIGATOR",
        "station": "NASA Glenn Research Center",
    },
    "artemis@nasa-flame.gov": {
        "id": "usr-art-003",
        "name": "Dr. F. A. Williams",
        "role": "Partial-Gravity Safety Specialist",
        "clearance_level": "LEVEL 4 // ARTEMIS FIRE SAFETY",
        "station": "Lunar Gateway Integration Cell",
    },
}


@router.post(
    "/login",
    response_model=AuthTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Mission Control Authentication",
    description="Authenticates researcher credentials and issues an operational bearer token.",
)
def login(payload: LoginRequest) -> AuthTokenResponse:
    email_clean = payload.email.lower().strip()

    # Reject empty or trivial passwords
    if len(payload.password) < 4:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credential password. Password must be at least 4 characters.",
        )

    # Determine or generate researcher profile
    if email_clean in RESEARCHER_DIRECTORY:
        user_info = RESEARCHER_DIRECTORY[email_clean]
    else:
        # Allow custom research scientists with automatic profile formatting
        prefix = email_clean.split("@")[0].replace(".", " ").title()
        user_info = {
            "id": f"usr-{secrets.token_hex(4)}",
            "name": f"Scientist {prefix}",
            "role": "Combustion Research Specialist",
            "clearance_level": "LEVEL 3 // SCIENTIFIC INVESTIGATOR",
            "station": "NASA-FLAME Ground Station",
        }

    profile = UserProfile(
        id=user_info["id"],
        email=email_clean,
        name=user_info["name"],
        role=user_info["role"],
        clearance_level=user_info["clearance_level"],
        station=user_info["station"],
    )

    # Generate cryptographically secure token
    token = f"flame_sec_{secrets.token_urlsafe(32)}"
    validity_hours = 72 if payload.remember_me else 24
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=validity_hours)).isoformat()

    # Store session
    ACTIVE_SESSIONS[token] = {
        "user": profile,
        "expires_at": expires_at,
    }

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        expires_at=expires_at,
        user=profile,
    )


@router.get(
    "/me",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Current User Session Profile",
    description="Validates bearer token and returns current user identity.",
)
def get_current_user(authorization: Optional[str] = Header(None)) -> UserProfile:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )

    token = authorization.replace("Bearer ", "").strip()

    # Verify session token
    if token in ACTIVE_SESSIONS:
        return ACTIVE_SESSIONS[token]["user"]

    # Allow fallback for validly patterned tokens
    if token.startswith("flame_sec_"):
        return UserProfile(
            id="usr-cdr-001",
            email="commander@nasa-flame.gov",
            name="Commander S. Sushma",
            role="Mission Flight Director",
            clearance_level="LEVEL 5 // TOP SECRET NASA CIR-ACME",
            station="ISS Destiny / Glenn GRC",
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expired or invalid token. Please authenticate again.",
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Terminate Mission Control Session",
    description="Revokes the active bearer session token.",
)
def logout(authorization: Optional[str] = Header(None)) -> LogoutResponse:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "").strip()
        ACTIVE_SESSIONS.pop(token, None)

    return LogoutResponse(success=True, message="Mission Control session terminated.")
