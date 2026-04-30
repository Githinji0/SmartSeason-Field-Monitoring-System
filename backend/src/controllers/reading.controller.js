import { createReading, listReadings } from "../services/reading.service.js";

function parseLimit(value) {
  if (value === undefined) {
    return 100;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? 100 : parsed;
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function getReadings(req, res, next) {
  try {
    const deviceId = req.query.deviceId ? Number.parseInt(String(req.query.deviceId), 10) : null;
    const metric = typeof req.query.metric === "string" && req.query.metric.trim() ? req.query.metric.trim() : null;
    const since = parseDate(req.query.since);
    const until = parseDate(req.query.until);
    const limit = parseLimit(req.query.limit);
    const isFarmer = req.user.role === "farmer";

    if (isFarmer && !req.user.farmId) {
      return res.status(200).json({ data: [] });
    }

    const readings = await listReadings({
      deviceId: Number.isNaN(deviceId) ? null : deviceId,
      farmId: isFarmer ? req.user.farmId : null,
      metric,
      since,
      until,
      limit
    });

    res.status(200).json({ data: readings });
  } catch (error) {
    next(error);
  }
}

export async function getDeviceReadings(req, res, next) {
  try {
    const deviceId = Number.parseInt(String(req.params.deviceId), 10);

    if (Number.isNaN(deviceId)) {
      return res.status(400).json({
        message: "deviceId must be a valid number"
      });
    }

    const metric = typeof req.query.metric === "string" && req.query.metric.trim() ? req.query.metric.trim() : null;
    const since = parseDate(req.query.since);
    const until = parseDate(req.query.until);
    const limit = parseLimit(req.query.limit);
    const isFarmer = req.user.role === "farmer";

    if (isFarmer && !req.user.farmId) {
      return res.status(200).json({ data: [] });
    }

    const readings = await listReadings({
      deviceId,
      farmId: isFarmer ? req.user.farmId : null,
      metric,
      since,
      until,
      limit
    });

    res.status(200).json({ data: readings });
  } catch (error) {
    next(error);
  }
}

export async function postReading(req, res, next) {
  try {
    const { deviceId, metric, value, unit, recordedAt } = req.body;

    const parsedDeviceId = Number.parseInt(String(deviceId), 10);
    const parsedValue = Number(value);
    const parsedRecordedAt = recordedAt ? new Date(recordedAt) : new Date();

    if (!deviceId || !metric || value === undefined) {
      return res.status(400).json({
        message: "deviceId, metric, and value are required"
      });
    }

    if (Number.isNaN(parsedDeviceId)) {
      return res.status(400).json({
        message: "deviceId must be a valid number"
      });
    }

    if (!Number.isFinite(parsedValue)) {
      return res.status(400).json({
        message: "value must be a valid number"
      });
    }

    if (Number.isNaN(parsedRecordedAt.getTime())) {
      return res.status(400).json({
        message: "recordedAt must be a valid date when provided"
      });
    }

    const reading = await createReading({
      deviceId: parsedDeviceId,
      metric: metric.trim(),
      value: parsedValue,
      unit: typeof unit === "string" && unit.trim() ? unit.trim() : null,
      recordedAt: parsedRecordedAt
    });

    res.status(201).json({ data: reading });
  } catch (error) {
    next(error);
  }
}