-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 25, 2023 at 09:17 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

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
CREATE DATABASE IF NOT EXISTS `darumi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `darumi`;

-- --------------------------------------------------------

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE IF NOT EXISTS `categorias` (
  `Id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre_categoria` varchar(40) NOT NULL,
  PRIMARY KEY (`Id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `categorias`
--

TRUNCATE TABLE `categorias`;
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
(7, 'Electrodomestico');

-- --------------------------------------------------------

--
-- Table structure for table `estados`
--

DROP TABLE IF EXISTS `estados`;
CREATE TABLE IF NOT EXISTS `estados` (
  `Id_estado` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre_estado` varchar(40) NOT NULL,
  PRIMARY KEY (`Id_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `estados`
--

TRUNCATE TABLE `estados`;
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

DROP TABLE IF EXISTS `gastos`;
CREATE TABLE IF NOT EXISTS `gastos` (
  `Id_gasto` int(11) NOT NULL AUTO_INCREMENT,
  `Monto_gasto` float NOT NULL,
  `Titulo_gasto` varchar(20) NOT NULL,
  `Detalle_gasto` varchar(100) NOT NULL,
  `Fecha_creacion_gasto` datetime NOT NULL,
  `Categoria_gasto` int(11) NOT NULL,
  `Id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`Id_gasto`),
  KEY `FK_Categoria_gasto` (`Categoria_gasto`),
  KEY `FK_Id_usuario` (`Id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `gastos`
--

TRUNCATE TABLE `gastos`;
--
-- Dumping data for table `gastos`
--

INSERT INTO `gastos` (`Id_gasto`, `Monto_gasto`, `Titulo_gasto`, `Detalle_gasto`, `Fecha_creacion_gasto`, `Categoria_gasto`, `Id_usuario`) VALUES
(1, 333.33, 'Lorem ipsum dolor si', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ', '2023-09-21 01:17:36', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `objetivos`
--

DROP TABLE IF EXISTS `objetivos`;
CREATE TABLE IF NOT EXISTS `objetivos` (
  `Id_objetivo` int(11) NOT NULL AUTO_INCREMENT,
  `Titulo_objetivo` varchar(50) NOT NULL,
  `Fecha_creacion_objetivo` datetime NOT NULL,
  `Tipo_objetivo` int(11) NOT NULL,
  `Estado_objetivo` int(11) NOT NULL,
  PRIMARY KEY (`Id_objetivo`),
  KEY `FK_Estado_objetivo` (`Estado_objetivo`),
  KEY `FK_Tipo_objetivo` (`Tipo_objetivo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `objetivos`
--

TRUNCATE TABLE `objetivos`;
--
-- Dumping data for table `objetivos`
--

INSERT INTO `objetivos` (`Id_objetivo`, `Titulo_objetivo`, `Fecha_creacion_objetivo`, `Tipo_objetivo`, `Estado_objetivo`) VALUES
(1, 'Lorem ipsum dolor sit amet, consectetur adipiscing', '2023-09-21 01:13:51', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `tipos_objetivos`
--

DROP TABLE IF EXISTS `tipos_objetivos`;
CREATE TABLE IF NOT EXISTS `tipos_objetivos` (
  `Id_tipo_objetivo` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre_tipo_objetivo` varchar(40) NOT NULL,
  PRIMARY KEY (`Id_tipo_objetivo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `tipos_objetivos`
--

TRUNCATE TABLE `tipos_objetivos`;
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

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `Id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `Apellido_usuario` varchar(50) NOT NULL,
  `Nombre_usuario` varchar(50) NOT NULL,
  `Email_usuario` varchar(50) NOT NULL,
  PRIMARY KEY (`Id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `usuarios`
--

TRUNCATE TABLE `usuarios`;
--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`Id_usuario`, `Apellido_usuario`, `Nombre_usuario`, `Email_usuario`) VALUES
(1, 'Diaz', 'Ramon', 'ramondiaz@mail.com'),
(2, 'Labruna', 'Angel', 'labruna@angel.com');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios_y_objetivos`
--

DROP TABLE IF EXISTS `usuarios_y_objetivos`;
CREATE TABLE IF NOT EXISTS `usuarios_y_objetivos` (
  `Id_relacion_usuario_objetivo` int(11) NOT NULL AUTO_INCREMENT,
  `Usuario` int(11) NOT NULL,
  `Objetivo` int(11) NOT NULL,
  PRIMARY KEY (`Id_relacion_usuario_objetivo`),
  KEY `FK_Objetivo` (`Objetivo`),
  KEY `FK_Usuario` (`Usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `usuarios_y_objetivos`
--

TRUNCATE TABLE `usuarios_y_objetivos`;
--
-- Dumping data for table `usuarios_y_objetivos`
--

INSERT INTO `usuarios_y_objetivos` (`Id_relacion_usuario_objetivo`, `Usuario`, `Objetivo`) VALUES
(1, 1, 1);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `gastos`
--
ALTER TABLE `gastos`
  ADD CONSTRAINT `FK_Categoria_gasto` FOREIGN KEY (`Categoria_gasto`) REFERENCES `categorias` (`Id_categoria`),
  ADD CONSTRAINT `FK_Id_usuario` FOREIGN KEY (`Id_usuario`) REFERENCES `usuarios` (`Id_usuario`);

--
-- Constraints for table `objetivos`
--
ALTER TABLE `objetivos`
  ADD CONSTRAINT `FK_Estado_objetivo` FOREIGN KEY (`Estado_objetivo`) REFERENCES `estados` (`Id_estado`),
  ADD CONSTRAINT `FK_Tipo_objetivo` FOREIGN KEY (`Tipo_objetivo`) REFERENCES `tipos_objetivos` (`Id_tipo_objetivo`);

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
