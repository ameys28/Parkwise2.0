import { asyncHandler } from '../utils/asyncHandler.js';
import { listLogs, recordParkingEvent } from '../services/parkingSession.service.js';

export const getLogs = asyncHandler(async (_req, res) => {
  const logs = await listLogs();
  res.status(200).json(
    logs.map((log) => ({
      id: log.id,
      numberPlate: log.vehicle.numberPlate,
      action: log.action === 'ENTRY' ? 'Entry' : 'Exit',
      timestamp: log.timestamp,
      notes: log.notes,
      sessionId: log.sessionId,
    }))
  );
});

export const postLog = asyncHandler(async (req, res) => {
  const log = await recordParkingEvent(req.body, req.user?.id);
  res.status(201).json({
    id: log.id,
    numberPlate: log.vehicle.numberPlate,
    action: log.action === 'ENTRY' ? 'Entry' : 'Exit',
    timestamp: log.timestamp,
    notes: log.notes,
    sessionId: log.sessionId,
  });
});