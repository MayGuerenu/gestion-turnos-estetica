export const db = {
  users: [],        // { id, email, passwordHash, createdAt }
  clients: [],      // { id, userId, name, phone, notes, createdAt }
  appointments: []  // { id, userId, clientId, service, date, time, durationMin, price, status, notes, createdAt }
};
