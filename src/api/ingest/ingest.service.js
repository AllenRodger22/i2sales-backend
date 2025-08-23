const { getDb } = require('../../config/database');
const { Status, TimelineEventType } = require('../../shared/constants');

const collection = 'clientes';

const createExternalLead = async (leadData) => {
  const lead = {
    ...leadData,
    ownerId: null,
    isArchived: true,
    id_cliente: `ext-${new Date().toISOString()}-${Math.random().toString(36).substr(2, 9)}`,
    status: Status?.PrimeiroAtendimento || 'PrimeiroAtendimento',
    data_cadastro: new Date(),
    data_followup: null,
    isPending: false,
    timeline: [{
      type: TimelineEventType?.Observacao || 'Observacao',
      content: `Lead recebido de fonte externa: ${leadData.source}`,
      date: new Date(),
    }],
    customFields: [],
    automatedFollowUps: [],
  };

  const result = await getDb().collection(collection).insertOne(lead);
  return result.insertedId;
};

module.exports = {
  createExternalLead,
};
