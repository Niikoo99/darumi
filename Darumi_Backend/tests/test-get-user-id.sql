-- Script para obtener un ID de usuario real para las pruebas
-- Ejecutar en MySQL para obtener un Identifier_usuario válido

-- Mostrar todos los usuarios disponibles
SELECT 
    Id_usuario,
    Identifier_usuario,
    Nombre_usuario,
    Email_usuario,
    Fecha_creacion_usuario
FROM usuarios 
ORDER BY Fecha_creacion_usuario DESC
LIMIT 10;

-- Mostrar conteo de transacciones por usuario
SELECT 
    u.Identifier_usuario,
    COUNT(g.Id_gasto) as total_transactions,
    COUNT(CASE WHEN g.Monto_gasto < 0 THEN 1 END) as gastos,
    COUNT(CASE WHEN g.Monto_gasto > 0 THEN 1 END) as ingresos
FROM usuarios u
LEFT JOIN gastos g ON u.Id_usuario = g.Id_usuario AND g.Active = 1
GROUP BY u.Identifier_usuario
ORDER BY total_transactions DESC
LIMIT 10;

-- Obtener un usuario con transacciones para testing
SELECT 
    u.Identifier_usuario as 'USER_ID_FOR_TESTING',
    COUNT(g.Id_gasto) as transactions_count
FROM usuarios u
LEFT JOIN gastos g ON u.Id_usuario = g.Id_usuario AND g.Active = 1
GROUP BY u.Identifier_usuario
HAVING transactions_count > 0
ORDER BY transactions_count DESC
LIMIT 1;
