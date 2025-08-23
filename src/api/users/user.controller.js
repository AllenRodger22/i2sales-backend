const userService = require('./user.service');

const getCorretores = async (req, res) => {
    try {
        const corretores = await userService.findAllCorretores();
        res.status(200).json(corretores);
    } catch (error) {
        console.error('Erro ao buscar corretores:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};

module.exports = {
    getCorretores,
};
