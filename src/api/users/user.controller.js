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

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userId = await userService.create({ name, email, password, role });
        res.status(201).json({ message: 'Usuário criado com sucesso', userId });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getCorretores,
    createUser,
};
