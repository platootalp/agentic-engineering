"""Delete JD use case."""

from dataclasses import dataclass
from typing import Optional
from uuid import UUID

from app.domain.repositories.jd_repository import JDRepository


@dataclass
class DeleteJDInput:
    """Input data for deleting a JD."""

    jd_id: UUID


@dataclass
class DeleteJDOutput:
    """Output data for deleting a JD."""

    success: bool
    message: str = ""
    error: Optional[str] = None


class DeleteJDUseCase:
    """Use case for deleting a JD."""

    def __init__(self, jd_repository: JDRepository):
        """Initialize use case with repository.

        Args:
            jd_repository: Repository for JD operations.
        """
        self._jd_repository = jd_repository

    async def execute(self, input_data: DeleteJDInput) -> DeleteJDOutput:
        """Execute JD deletion.

        Args:
            input_data: Deletion input data.

        Returns:
            Deletion result.
        """
        try:
            # Check if JD exists
            exists = await self._jd_repository.exists_by_id(input_data.jd_id)
            if not exists:
                return DeleteJDOutput(
                    success=False,
                    error="NOT_FOUND",
                    message=f"JD with id {input_data.jd_id} not found",
                )

            # Delete JD
            deleted = await self._jd_repository.delete(input_data.jd_id)

            if deleted:
                return DeleteJDOutput(
                    success=True,
                    message="JD deleted successfully",
                )
            else:
                return DeleteJDOutput(
                    success=False,
                    error="DELETE_FAILED",
                    message="Failed to delete JD",
                )

        except Exception as e:
            return DeleteJDOutput(
                success=False,
                error="INTERNAL_ERROR",
                message=f"Failed to delete JD: {str(e)}",
            )
