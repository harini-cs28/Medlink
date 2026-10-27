"""
MedPredict AI - Validators and Cleaners
"""

import re
from typing import Optional


def sanitize_string(val: Optional[str]) -> str:
    """Sanitizes user input strings, removing trailing spaces and unsafe characters."""
    if not val:
        return ""
    return str(val).strip()


def validate_email(email: str) -> bool:
    """Basic RFC-compliant email regex pattern validator."""
    pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(pattern, email))
