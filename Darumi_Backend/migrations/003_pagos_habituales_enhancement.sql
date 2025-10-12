-- Migración para mejorar la tabla pagos_habituales
-- Agrega campos para tipo de transacción y recurrencia

-- Agregar campos Tipo y Recurrencia a la tabla pagos_habituales
ALTER TABLE `pagos_habituales` 
ADD COLUMN `Tipo` VARCHAR(20) NOT NULL DEFAULT 'Pago' AFTER `Monto`,
ADD COLUMN `Recurrencia` VARCHAR(20) NOT NULL DEFAULT 'mensual' AFTER `Tipo`;

-- Crear índices para mejorar el rendimiento
ALTER TABLE `pagos_habituales` 
ADD INDEX `idx_pagos_tipo` (`Tipo`),
ADD INDEX `idx_pagos_recurrencia` (`Recurrencia`),
ADD INDEX `idx_pagos_usuario_tipo` (`Id_Usuario`, `Tipo`),
ADD INDEX `idx_pagos_usuario_recurrencia` (`Id_Usuario`, `Recurrencia`);

-- Actualizar registros existentes para que tengan valores por defecto
UPDATE `pagos_habituales` 
SET `Tipo` = 'Pago', `Recurrencia` = 'mensual' 
WHERE `Tipo` IS NULL OR `Recurrencia` IS NULL;

-- Comentarios para documentar los nuevos campos
ALTER TABLE `pagos_habituales` 
MODIFY COLUMN `Tipo` VARCHAR(20) NOT NULL DEFAULT 'Pago' COMMENT 'Tipo de transacción: Pago o Ingreso',
MODIFY COLUMN `Recurrencia` VARCHAR(20) NOT NULL DEFAULT 'mensual' COMMENT 'Frecuencia de recurrencia: semanal, mensual, anual';
