"""Pytest configuration for infrastructure tests.

This conftest overrides the database fixtures from the parent conftest
to avoid requiring a real database for infrastructure tests.
"""

import pytest


@pytest.fixture(scope="session")
def setup_database():
    """Override database setup to do nothing for infrastructure tests."""
    yield


@pytest.fixture
async def db_session():
    """Override db_session to return None for infrastructure tests."""
    yield None
