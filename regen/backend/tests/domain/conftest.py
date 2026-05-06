"""Pytest configuration for domain tests - overrides root conftest."""

import pytest


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Override database setup to do nothing for domain tests."""
    yield


@pytest.fixture
def db_session():
    """Override db_session to do nothing for domain tests."""
    yield None
