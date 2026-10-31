export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User does not exist with the provided identifier.',
  USER_ALREADY_EXISTS: 'A user with this email address is already registered.',
  INVALID_CREDENTIALS: 'The email or password provided is incorrect.',
  WORKSPACE_NOT_FOUND: 'Workspace not found or you lack permission to view it.',
  WORKSPACE_SLUG_EXISTS: 'A workspace with this unique slug already exists.',
  PROJECT_NOT_FOUND: 'Project not found in the selected workspace.',
  PROJECT_KEY_EXISTS: 'A project with this key already exists in the workspace.',
  TASK_NOT_FOUND: 'Task not found in the specified project.',
  UNAUTHORIZED_ACCESS: 'You are not authorized to perform this operation.',
  INSUFFICIENT_PERMISSIONS: 'You do not have the required role or permission for this resource.',
  INVALID_TOKEN: 'Supplied authentication token is invalid or expired.',
} as const;

