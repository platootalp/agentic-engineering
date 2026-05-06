"""Pytest configuration for use case unit tests.

This conftest overrides the database fixtures from the parent conftest.py
to prevent database connections during unit tests. All use case tests
should use mocked repositories.
"""

import asyncio
from typing import Generator
from unittest.mock import MagicMock

import pytest
import pytest_asyncio


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_db_session():
    """Create a mock database session for unit tests."""
    return MagicMock()


# Override the setup_database fixture to do nothing
@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    """Override parent setup_database to skip database setup for unit tests."""
    yield


# Override the db_session fixture to return a mock
@pytest_asyncio.fixture
async def db_session():
    """Override parent db_session to return a mock for unit tests."""
    return MagicMock()
