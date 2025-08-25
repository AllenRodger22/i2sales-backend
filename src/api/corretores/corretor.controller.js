const userService = require('../users/user.service');

const listCorretores = async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Acesso negado' });
  }
  try {
    const corretores = await userService.findAll();
    const nomes = corretores.map(c => c.name);
    res.status(200).json(nomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { listCorretores };
