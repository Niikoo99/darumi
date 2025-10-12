-- Migración para optimizar consultas de transacciones
-- Ejecutar después de implementar los endpoints

-- Índices para mejorar el rendimiento de las consultas de transacciones

-- Índice compuesto para consultas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_fecha 
ON gastos (Id_usuario, Fecha_creacion_gasto DESC);

-- Índice para consultas por usuario y categoría
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_categoria 
ON gastos (Id_usuario, Categoria_gasto);

-- Índice para consultas por usuario y monto
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_monto 
ON gastos (Id_usuario, Monto_gasto);

-- Índice para consultas por usuario y estado activo
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_active 
ON gastos (Id_usuario, Active);

-- Índice para búsquedas de texto en título
CREATE INDEX IF NOT EXISTS idx_gastos_titulo 
ON gastos (Titulo_gasto);

-- Índice para búsquedas de texto en detalle
CREATE INDEX IF NOT EXISTS idx_gastos_detalle 
ON gastos (Detalle_gasto);

-- Índice en la tabla de usuarios para consultas por identifier
CREATE INDEX IF NOT EXISTS idx_usuarios_identifier 
ON usuarios (Identifier_usuario);

-- Índice en la tabla de categorías para consultas por nombre
CREATE INDEX IF NOT EXISTS idx_categorias_nombre 
ON categorias (Nombre_categoria);

-- Vista materializada para estadísticas rápidas (opcional)
-- CREATE VIEW v_transaction_stats AS
-- SELECT 
--   u.Identifier_usuario,
--   COUNT(g.Id_gasto) as total_transactions,
--   COUNT(CASE WHEN g.Monto_gasto < 0 THEN 1 END) as total_expenses,
--   COUNT(CASE WHEN g.Monto_gasto > 0 THEN 1 END) as total_income,
--   COALESCE(SUM(CASE WHEN g.Monto_gasto < 0 THEN ABS(g.Monto_gasto) ELSE 0 END), 0) as total_expense_amount,
--   COALESCE(SUM(CASE WHEN g.Monto_gasto > 0 THEN g.Monto_gasto ELSE 0 END), 0) as total_income_amount,
--   MIN(g.Fecha_creacion_gasto) as first_transaction_date,
--   MAX(g.Fecha_creacion_gasto) as last_transaction_date
-- FROM usuarios u
-- LEFT JOIN gastos g ON u.Id_usuario = g.Id_usuario AND g.Active = 1
-- GROUP BY u.Identifier_usuario;

-- Comentarios sobre optimización:
-- 1. Los índices compuestos mejoran significativamente las consultas con múltiples filtros
-- 2. El índice por fecha DESC es especialmente útil para ordenamiento cronológico
-- 3. Los índices de texto mejoran las búsquedas LIKE
-- 4. La vista materializada puede ser útil para estadísticas frecuentes

-- Verificar índices creados:
-- SHOW INDEX FROM gastos;
-- SHOW INDEX FROM usuarios;
-- SHOW INDEX FROM categorias;
