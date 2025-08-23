const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const allowedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasPermission = allowedRoles.includes(req.user.role) || 
                         (allowedRoles.includes('manager') && req.user.role === 'admin') ||
                         (allowedRoles.includes('admin') && req.user.role === 'manager');

    if (!hasPermission) {
      return res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
    }

    next();
  };
};

module.exports = { requireRole };
