USE smartseason;

INSERT INTO farms (name, location)
VALUES ('Demo Farm', 'Nakuru, Kenya')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO devices (name, serial_number, farm_id)
VALUES ('Soil Sensor A1', 'SSA1-001', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);
