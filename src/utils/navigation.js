export function getDashboardRoute(user) {
  if (!user) return '/';
  
  switch (user.role) {
    case 'STUDENT':
      return '/student';
    case 'UNIVERSITY':
      return '/university';
    case 'PARENT':
      return '/guardian';
    case 'ADMIN':
      return '/admin-dashboard';
    default:
      return '/';
  }
}
