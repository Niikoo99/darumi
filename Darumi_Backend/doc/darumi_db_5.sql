-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 10, 2025 at 04:28 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `darumi`
--

-- --------------------------------------------------------

--
-- Table structure for table `categorias`
--

CREATE TABLE `categorias` (
  `Id_categoria` int(11) NOT NULL,
  `Nombre_categoria` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categorias`
--

INSERT INTO `categorias` (`Id_categoria`, `Nombre_categoria`) VALUES
(1, 'Varios'),
(2, 'Comida/Restaurante'),
(3, 'Transporte'),
(4, 'Mecanica'),
(5, 'Combustibles'),
(6, 'Vestimenta/Calzado'),
(7, 'Electrodomestico'),
(8, 'Ingresos');

-- --------------------------------------------------------

--
-- Table structure for table `estados`
--

CREATE TABLE `estados` (
  `Id_estado` int(11) NOT NULL,
  `Nombre_estado` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estados`
--

INSERT INTO `estados` (`Id_estado`, `Nombre_estado`) VALUES
(1, 'En progreso'),
(2, 'Fallido'),
(3, 'Cumplido');

-- --------------------------------------------------------

--
-- Table structure for table `gastos`
--

CREATE TABLE `gastos` (
  `Id_gasto` int(11) NOT NULL,
  `Monto_gasto` float NOT NULL,
  `Titulo_gasto` varchar(20) NOT NULL,
  `Detalle_gasto` varchar(100) NOT NULL,
  `Fecha_creacion_gasto` datetime NOT NULL DEFAULT current_timestamp(),
  `Categoria_gasto` int(11) NOT NULL,
  `Id_usuario` int(11) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT 1,
  `InsDateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdDateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `es_pago_habitual` tinyint(1) DEFAULT 0,
  `id_pago_habitual_origen` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gastos`
--

INSERT INTO `gastos` (`Id_gasto`, `Monto_gasto`, `Titulo_gasto`, `Detalle_gasto`, `Fecha_creacion_gasto`, `Categoria_gasto`, `Id_usuario`, `Active`, `InsDateTime`, `UpdDateTime`, `es_pago_habitual`, `id_pago_habitual_origen`) VALUES
(2, 150000, 'sueldo', 'Extras', '2025-10-09 21:43:59', 8, 3, 1, '2025-10-09 21:43:59', '2025-10-09 21:43:59', 0, NULL),
(3, -15000, 'Uber', 'Viaje a la pampa', '2025-10-09 22:04:11', 3, 3, 1, '2025-10-09 22:04:11', '2025-10-09 22:04:11', 0, NULL),
(4, -50000, 'super', 'Compras del mes', '2025-10-09 22:29:32', 2, 3, 1, '2025-10-09 22:29:32', '2025-10-09 22:29:32', 0, NULL),
(5, -5000, 'Kiosco', 'Chocolate ', '2025-10-10 09:31:55', 2, 3, 1, '2025-10-10 09:31:55', '2025-10-10 09:31:55', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `logs_procesamiento_pagos`
--

CREATE TABLE `logs_procesamiento_pagos` (
  `id_log` int(11) NOT NULL,
  `fecha_procesamiento` datetime NOT NULL,
  `tipo_procesamiento` varchar(50) NOT NULL,
  `resultado` text DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `objetivos`
--

CREATE TABLE `objetivos` (
  `Id_objetivo` int(11) NOT NULL,
  `Titulo_objetivo` varchar(50) NOT NULL,
  `Fecha_creacion_objetivo` datetime NOT NULL,
  `Multiplicador` float NOT NULL DEFAULT 1,
  `Tipo_objetivo` int(11) NOT NULL,
  `Estado_objetivo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `objetivos`
--

INSERT INTO `objetivos` (`Id_objetivo`, `Titulo_objetivo`, `Fecha_creacion_objetivo`, `Multiplicador`, `Tipo_objetivo`, `Estado_objetivo`) VALUES
(1, 'Lorem ipsum dolor sit amet, consectetur adipiscing', '2023-09-21 01:13:51', 1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `pagos_habituales`
--

CREATE TABLE `pagos_habituales` (
  `Id_PagoHabitual` int(11) NOT NULL,
  `Id_Usuario` int(11) NOT NULL,
  `Titulo` varchar(50) NOT NULL,
  `Monto` float NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT 1,
  `InsDateTime` datetime NOT NULL DEFAULT current_timestamp(),
  `UpdDateTime` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `periodos`
--

CREATE TABLE `periodos` (
  `IdPeriodo` int(11) NOT NULL,
  `Desde` date NOT NULL,
  `Hasta` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `periodos`
--

INSERT INTO `periodos` (`IdPeriodo`, `Desde`, `Hasta`) VALUES
(1, '2025-10-08', '2026-10-08');

-- --------------------------------------------------------

--
-- Table structure for table `tipos_objetivos`
--

CREATE TABLE `tipos_objetivos` (
  `Id_tipo_objetivo` int(11) NOT NULL,
  `Nombre_tipo_objetivo` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tipos_objetivos`
--

INSERT INTO `tipos_objetivos` (`Id_tipo_objetivo`, `Nombre_tipo_objetivo`) VALUES
(1, 'Gastos generales'),
(2, 'Gastos por categoria');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `Id_usuario` int(11) NOT NULL,
  `Identifier_usuario` varchar(50) NOT NULL,
  `IdPeriodo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`Id_usuario`, `Identifier_usuario`, `IdPeriodo`) VALUES
(3, 'user_2WYDGoIeCLh6Lb1XmVlUlMqQUaM', 1);

-- --------------------------------------------------------

--
-- Table structure for table `usuarios_y_objetivos`
--

CREATE TABLE `usuarios_y_objetivos` (
  `Id_relacion_usuario_objetivo` int(11) NOT NULL,
  `Usuario` int(11) NOT NULL,
  `Objetivo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`Id_categoria`);

--
-- Indexes for table `estados`
--
ALTER TABLE `estados`
  ADD PRIMARY KEY (`Id_estado`);

--
-- Indexes for table `gastos`
--
ALTER TABLE `gastos`
  ADD PRIMARY KEY (`Id_gasto`),
  ADD KEY `FK_Categoria_gasto` (`Categoria_gasto`),
  ADD KEY `FK_Id_usuario` (`Id_usuario`),
  ADD KEY `idx_es_pago_habitual` (`es_pago_habitual`),
  ADD KEY `idx_id_pago_habitual_origen` (`id_pago_habitual_origen`);

--
-- Indexes for table `logs_procesamiento_pagos`
--
ALTER TABLE `logs_procesamiento_pagos`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `idx_fecha_procesamiento` (`fecha_procesamiento`),
  ADD KEY `idx_tipo_procesamiento` (`tipo_procesamiento`);

--
-- Indexes for table `objetivos`
--
ALTER TABLE `objetivos`
  ADD PRIMARY KEY (`Id_objetivo`),
  ADD KEY `FK_Estado_objetivo` (`Estado_objetivo`),
  ADD KEY `FK_Tipo_objetivo` (`Tipo_objetivo`);

--
-- Indexes for table `pagos_habituales`
--
ALTER TABLE `pagos_habituales`
  ADD PRIMARY KEY (`Id_PagoHabitual`),
  ADD KEY `FK_IdUsuario_PagoHabitual` (`Id_Usuario`);

--
-- Indexes for table `periodos`
--
ALTER TABLE `periodos`
  ADD PRIMARY KEY (`IdPeriodo`);

--
-- Indexes for table `tipos_objetivos`
--
ALTER TABLE `tipos_objetivos`
  ADD PRIMARY KEY (`Id_tipo_objetivo`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`Id_usuario`),
  ADD KEY `FK_IdPeriodo` (`IdPeriodo`);

--
-- Indexes for table `usuarios_y_objetivos`
--
ALTER TABLE `usuarios_y_objetivos`
  ADD PRIMARY KEY (`Id_relacion_usuario_objetivo`),
  ADD KEY `FK_Objetivo` (`Objetivo`),
  ADD KEY `FK_Usuario` (`Usuario`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categorias`
--
ALTER TABLE `categorias`
  MODIFY `Id_categoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `estados`
--
ALTER TABLE `estados`
  MODIFY `Id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `gastos`
--
ALTER TABLE `gastos`
  MODIFY `Id_gasto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `logs_procesamiento_pagos`
--
ALTER TABLE `logs_procesamiento_pagos`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `objetivos`
--
ALTER TABLE `objetivos`
  MODIFY `Id_objetivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pagos_habituales`
--
ALTER TABLE `pagos_habituales`
  MODIFY `Id_PagoHabitual` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `periodos`
--
ALTER TABLE `periodos`
  MODIFY `IdPeriodo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tipos_objetivos`
--
ALTER TABLE `tipos_objetivos`
  MODIFY `Id_tipo_objetivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `Id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `usuarios_y_objetivos`
--
ALTER TABLE `usuarios_y_objetivos`
  MODIFY `Id_relacion_usuario_objetivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gastos`
--
ALTER TABLE `gastos`
  ADD CONSTRAINT `FK_Categoria_gasto` FOREIGN KEY (`Categoria_gasto`) REFERENCES `categorias` (`Id_categoria`),
  ADD CONSTRAINT `FK_Id_usuario` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`Id_usuario`),
  ADD CONSTRAINT `FK_gastos_pago_habitual` FOREIGN KEY (`id_pago_habitual_origen`) REFERENCES `pagos_habituales` (`Id_PagoHabitual`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `objetivos`
--
ALTER TABLE `objetivos`
  ADD CONSTRAINT `FK_Estado_objetivo` FOREIGN KEY (`Estado_objetivo`) REFERENCES `estados` (`Id_estado`),
  ADD CONSTRAINT `FK_Tipo_objetivo` FOREIGN KEY (`Tipo_objetivo`) REFERENCES `tipos_objetivos` (`Id_tipo_objetivo`);

--
-- Constraints for table `pagos_habituales`
--
ALTER TABLE `pagos_habituales`
  ADD CONSTRAINT `FK_IdUsuario_PagoHabitual` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuarios` (`Id_usuario`);

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `FK_IdPeriodo` FOREIGN KEY (`IdPeriodo`) REFERENCES `periodos` (`IdPeriodo`);

--
-- Constraints for table `usuarios_y_objetivos`
--
ALTER TABLE `usuarios_y_objetivos`
  ADD CONSTRAINT `FK_Objetivo` FOREIGN KEY (`Objetivo`) REFERENCES `objetivos` (`Id_objetivo`),
  ADD CONSTRAINT `FK_Usuario` FOREIGN KEY (`Usuario`) REFERENCES `usuarios` (`Id_usuario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
