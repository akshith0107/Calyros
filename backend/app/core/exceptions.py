class ProfileNotFoundError(Exception):
    def __init__(self, message: str = "Profile not found"):
        self.message = message
        self.type = "not_found"
        super().__init__(self.message)

class DatabaseOperationError(Exception):
    def __init__(self, message: str = "Database operation failed"):
        self.message = message
        self.type = "database_error"
        super().__init__(self.message)
