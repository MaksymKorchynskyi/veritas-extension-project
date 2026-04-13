"""
VERITAS Test Configuration
Shared fixtures for all test modules.
"""

import sys
import os
import pytest

# Ensure the backend app is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
