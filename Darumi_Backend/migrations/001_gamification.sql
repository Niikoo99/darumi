-- Gamification schema updates
-- 1) Usuarios: total de puntos acumulados
ALTER TABLE `usuarios`
  ADD COLUMN `Points_total` INT NOT NULL DEFAULT 0;

-- 2) Metas (usuarios_y_objetivos): estado, valor final, fecha completado y puntos otorgados
ALTER TABLE `usuarios_y_objetivos`
  ADD COLUMN `Status` VARCHAR(20) NOT NULL DEFAULT 'En progreso',
  ADD COLUMN `Final_value` FLOAT NULL,
  ADD COLUMN `Fecha_completado` DATETIME NULL,
  ADD COLUMN `Puntos_otorgados` INT NULL;

-- 3) Objetivos: valor objetivo y categoría opcional para objetivos por categoría
ALTER TABLE `objetivos`
  ADD COLUMN `Valor_objetivo` FLOAT NOT NULL DEFAULT 0,
  ADD COLUMN `Categoria_objetivo` INT NULL,
  ADD KEY `FK_Categoria_objetivo` (`Categoria_objetivo`);

ALTER TABLE `objetivos`
  ADD CONSTRAINT `FK_Categoria_objetivo` FOREIGN KEY (`Categoria_objetivo`) REFERENCES `categorias` (`Id_categoria`);

-- 4) Notificaciones para informar resultados de objetivos
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `Id_notificacion` INT NOT NULL AUTO_INCREMENT,
  `Id_usuario` INT NOT NULL,
  `Titulo` VARCHAR(100) NOT NULL,
  `Mensaje` VARCHAR(255) NOT NULL,
  `Fecha_creacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id_notificacion`),
  KEY `FK_Notif_Usuario` (`Id_usuario`),
  CONSTRAINT `FK_Notif_Usuario` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`Id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


