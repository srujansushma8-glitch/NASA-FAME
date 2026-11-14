"""Centralized exception classes and global HTTP exception handlers."""

from datetime import datetime, timezone
import logging
from typing import Any, Optional
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def utc_now_iso() -> str:
    """Returns current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


class NASAFlameException(Exception):
    """Base application exception for NASA-FLAME."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Any] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class EntityNotFoundException(NASAFlameException):
    """Raised when a requested resource is not found."""

    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            message=f"{entity_name} with ID '{entity_id}' was not found.",
            code="RESOURCE_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
        )


class ValidationException(NASAFlameException):
    """Raised when custom business domain validation fails."""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details,
        )


class DuplicateEntityException(NASAFlameException):
    """Raised when creating an entity with a duplicate unique key."""

    def __init__(self, message: str):
        super().__init__(
            message=message,
            code="DUPLICATE_ENTITY",
            status_code=status.HTTP_409_CONFLICT,
        )


class ServiceIntegrationException(NASAFlameException):
    """Raised when an external module integration (simulation/AI) fails."""

    def __init__(self, service_name: str, message: str, details: Optional[Any] = None):
        super().__init__(
            message=f"Integration failure in '{service_name}': {message}",
            code="INTEGRATION_ERROR",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details,
        )


# Global Exception Handlers for FastAPI app registration
async def nasa_flame_exception_handler(request: Request, exc: NASAFlameException) -> JSONResponse:
    logger.warning(f"NASA-FLAME application error [{exc.code}]: {exc.message} (Path: {request.url.path})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
            "status": exc.status_code,
            "timestamp": utc_now_iso(),
            "path": request.url.path,
        },
    )


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    logger.warning(f"HTTP exception {exc.status_code}: {exc.detail} (Path: {request.url.path})")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": str(exc.detail),
                "details": None,
            },
            "status": exc.status_code,
            "timestamp": utc_now_iso(),
            "path": request.url.path,
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = exc.errors()
    logger.info(f"Request validation failure on {request.url.path}: {errors}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "REQUEST_VALIDATION_ERROR",
                "message": "The incoming payload failed schema validation.",
                "details": errors,
            },
            "status": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "timestamp": utc_now_iso(),
            "path": request.url.path,
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred while processing your request.",
                "details": str(exc) if logger.isEnabledFor(logging.DEBUG) else None,
            },
            "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "timestamp": utc_now_iso(),
            "path": request.url.path,
        },
    )

