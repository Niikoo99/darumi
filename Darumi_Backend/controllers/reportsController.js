/**
 * Controlador para reportes de categorías top (gastos e ingresos)
 * Proporciona endpoints separados para obtener las categorías principales por tipo
 */

const connection = require('../db');

/**
 * Mapeo de categorías a iconos para el frontend
 */
const categoryIconMap = {
  'Comida/Restaurante': 'hamburger',
  'Transporte': 'car',
  'Combustibles': 'gas-pump',
  'Vestimenta/Calzado': 'tshirt',
  'Mecanica': 'wrench',
  'Electrodomestico': 'home',
  'Varios': 'ellipsis-h',
  'Ingresos': 'money-bill-wave',
  'Salud': 'heartbeat',
  'Educación': 'graduation-cap',
  'Entretenimiento': 'gamepad',
  'Servicios': 'tools',
  'Hogar': 'home',
  'Otros': 'ellipsis-h'
};

/**
 * Obtiene las categorías principales de gastos para un mes específico
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTopExpenses = async (req, res) => {
  try {
    const userId = req.query.Id_Usuario || req.query.userId;
    const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM
    const limit = parseInt(req.query.limit) || 3;

    if (!userId) {
      console.error('Error: User ID is required');
      return res.status(400).json({ 
        error: 'User ID is required',
        message: 'Debe proporcionar el ID del usuario'
      });
    }

    console.log(`🔍 API call: GET /api/reports/top-expenses, User ID: ${userId}, Month: ${month}, Limit: ${limit}`);

    // Verificar que el usuario existe
    const userCheckQuery = 'SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?';
    
    connection.query(userCheckQuery, [userId], (error, userResults) => {
      if (error) {
        console.error('Error verificando usuario:', error);
        return res.status(500).json({ error: 'Error de servidor' });
      }
      
      if (userResults.length === 0) {
        console.log(`Usuario ${userId} no encontrado en la base de datos`);
        return res.status(404).json({ 
          error: 'Usuario no encontrado',
          message: 'Usuario no encontrado. Por favor, inicia sesión nuevamente.'
        });
      }
      
      const internalUserId = userResults[0].Id_usuario;
      console.log(`✅ Usuario encontrado con ID interno: ${internalUserId}`);

      // Construir consulta para obtener gastos del mes
      const expensesQuery = `
        SELECT 
          C.Nombre_categoria as categoryName,
          SUM(ABS(G.Monto_gasto)) as totalAmount,
          COUNT(G.Id_gasto) as transactionCount
        FROM gastos G 
        JOIN usuarios U ON U.Id_usuario = G.Id_usuario 
        INNER JOIN categorias C ON C.Id_categoria = G.Categoria_gasto 
        WHERE U.Identifier_usuario = ? 
          AND G.Active = 1 
          AND G.Monto_gasto < 0
          AND DATE_FORMAT(G.Fecha_creacion_gasto, '%Y-%m') = ?
        GROUP BY C.Id_categoria, C.Nombre_categoria
        ORDER BY totalAmount DESC
        LIMIT ?
      `;

      // Consulta para obtener el total de gastos del mes
      const totalExpensesQuery = `
        SELECT SUM(ABS(G.Monto_gasto)) as totalExpenses
        FROM gastos G 
        JOIN usuarios U ON U.Id_usuario = G.Id_usuario 
        WHERE U.Identifier_usuario = ? 
          AND G.Active = 1 
          AND G.Monto_gasto < 0
          AND DATE_FORMAT(G.Fecha_creacion_gasto, '%Y-%m') = ?
      `;

      connection.query(totalExpensesQuery, [userId, month], (error, totalResults) => {
        if (error) {
          console.error('Error obteniendo total de gastos:', error);
          return res.status(500).json({ error: 'Error de servidor' });
        }

        const totalExpenses = totalResults[0]?.totalExpenses || 0;

        connection.query(expensesQuery, [userId, month, limit], (error, results) => {
          if (error) {
            console.error('Error obteniendo categorías de gastos:', error);
            return res.status(500).json({ error: 'Error de servidor' });
          }

          const topCategories = results.map(category => {
            const percentage = totalExpenses > 0 ? (category.totalAmount / totalExpenses) * 100 : 0;
            return {
              categoryName: category.categoryName,
              iconId: categoryIconMap[category.categoryName] || 'ellipsis-h',
              totalAmount: parseFloat(category.totalAmount),
              percentage: Math.round(percentage * 100) / 100, // Redondear a 2 decimales
              transactionCount: parseInt(category.transactionCount)
            };
          });

          const response = {
            success: true,
            totalExpenses: parseFloat(totalExpenses),
            topCategories: topCategories,
            month: month,
            limit: limit
          };

          console.log(`✅ ${results.length} categorías de gastos obtenidas para ${month}`);
          res.json(response);
        });
      });
    });

  } catch (error) {
    console.error('Error en getTopExpenses:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtiene las categorías principales de ingresos para un mes específico
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTopIncomes = async (req, res) => {
  try {
    const userId = req.query.Id_Usuario || req.query.userId;
    const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM
    const limit = parseInt(req.query.limit) || 3;

    if (!userId) {
      console.error('Error: User ID is required');
      return res.status(400).json({ 
        error: 'User ID is required',
        message: 'Debe proporcionar el ID del usuario'
      });
    }

    console.log(`🔍 API call: GET /api/reports/top-incomes, User ID: ${userId}, Month: ${month}, Limit: ${limit}`);

    // Verificar que el usuario existe
    const userCheckQuery = 'SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?';
    
    connection.query(userCheckQuery, [userId], (error, userResults) => {
      if (error) {
        console.error('Error verificando usuario:', error);
        return res.status(500).json({ error: 'Error de servidor' });
      }
      
      if (userResults.length === 0) {
        console.log(`Usuario ${userId} no encontrado en la base de datos`);
        return res.status(404).json({ 
          error: 'Usuario no encontrado',
          message: 'Usuario no encontrado. Por favor, inicia sesión nuevamente.'
        });
      }
      
      const internalUserId = userResults[0].Id_usuario;
      console.log(`✅ Usuario encontrado con ID interno: ${internalUserId}`);

      // Construir consulta para obtener ingresos del mes
      const incomesQuery = `
        SELECT 
          C.Nombre_categoria as categoryName,
          SUM(G.Monto_gasto) as totalAmount,
          COUNT(G.Id_gasto) as transactionCount
        FROM gastos G 
        JOIN usuarios U ON U.Id_usuario = G.Id_usuario 
        INNER JOIN categorias C ON C.Id_categoria = G.Categoria_gasto 
        WHERE U.Identifier_usuario = ? 
          AND G.Active = 1 
          AND G.Monto_gasto > 0
          AND DATE_FORMAT(G.Fecha_creacion_gasto, '%Y-%m') = ?
        GROUP BY C.Id_categoria, C.Nombre_categoria
        ORDER BY totalAmount DESC
        LIMIT ?
      `;

      // Consulta para obtener el total de ingresos del mes
      const totalIncomesQuery = `
        SELECT SUM(G.Monto_gasto) as totalIncomes
        FROM gastos G 
        JOIN usuarios U ON U.Id_usuario = G.Id_usuario 
        WHERE U.Identifier_usuario = ? 
          AND G.Active = 1 
          AND G.Monto_gasto > 0
          AND DATE_FORMAT(G.Fecha_creacion_gasto, '%Y-%m') = ?
      `;

      connection.query(totalIncomesQuery, [userId, month], (error, totalResults) => {
        if (error) {
          console.error('Error obteniendo total de ingresos:', error);
          return res.status(500).json({ error: 'Error de servidor' });
        }

        const totalIncomes = totalResults[0]?.totalIncomes || 0;

        connection.query(incomesQuery, [userId, month, limit], (error, results) => {
          if (error) {
            console.error('Error obteniendo categorías de ingresos:', error);
            return res.status(500).json({ error: 'Error de servidor' });
          }

          const topCategories = results.map(category => {
            const percentage = totalIncomes > 0 ? (category.totalAmount / totalIncomes) * 100 : 0;
            return {
              categoryName: category.categoryName,
              iconId: categoryIconMap[category.categoryName] || 'money-bill-wave',
              totalAmount: parseFloat(category.totalAmount),
              percentage: Math.round(percentage * 100) / 100, // Redondear a 2 decimales
              transactionCount: parseInt(category.transactionCount)
            };
          });

          const response = {
            success: true,
            totalIncomes: parseFloat(totalIncomes),
            topCategories: topCategories,
            month: month,
            limit: limit
          };

          console.log(`✅ ${results.length} categorías de ingresos obtenidas para ${month}`);
          res.json(response);
        });
      });
    });

  } catch (error) {
    console.error('Error en getTopIncomes:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

module.exports = {
  getTopExpenses,
  getTopIncomes
};
