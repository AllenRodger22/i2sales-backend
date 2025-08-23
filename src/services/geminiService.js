const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateInsights = async (biData, analysisMode) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
Você é um especialista em gestão de vendas. Analise os dados de BI abaixo e forneça insights acionáveis.

Modo de Análise: ${analysisMode}
Dados: ${JSON.stringify(biData, null, 2)}

Metas de Conversão Ideais:
- Ligação para Atendimento: 30%
- Atendimento para Tratativa: 60%
- Tratativa para Documentação: 40%
- Documentação para Venda: 70%

Forneça um relatório estruturado em Markdown com as seguintes seções:

## Resumo
Resumo geral da performance

## Destaques Positivos
O que está indo bem

## Pontos de Atenção
Onde há problemas ou oportunidades de melhoria

## Ações Sugeridas
Recomendações práticas e diretas

Seja específico, use números dos dados fornecidos, e foque em insights acionáveis.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Erro ao gerar insights com Gemini:', error);
    throw new Error('Falha ao gerar insights de IA');
  }
};

module.exports = { generateInsights };
