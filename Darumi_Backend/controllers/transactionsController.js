/**
 * Controlador para manejar transacciones unificadas (gastos e ingresos)
 * Soporta filtros, ordenamiento y paginación
 */

const connection = require('../db');

/**
 * Obtiene todas las transacciones de un usuario con filtros aplicados
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getAllTransactions = async (req, res) => {
  try {
    const userId = req.query.Id_Usuario || req.query.userId;
    
    if (!userId) {
      console.error('Error: User ID is required');
      return res.status(400).json({ 
        error: 'User ID is required',
        message: 'Debe proporcionar el ID del usuario'
      });
    }

    console.log(`🔍 API call: GET /api/transactions, User ID: ${userId}`);

    // Extraer parámetros de filtro
    const {
      category,
      from,
      to,
      min,
      max,
      search,
      type, // 'gasto', 'ingreso', o 'all'
      order = 'date_desc',
      page = 1,
      limit = 20
    } = req.query;

    // Validar parámetros de paginación
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const offset = (pageNum - 1) * limitNum;

    console.log(`📊 Paginación: página ${pageNum}, límite ${limitNum}, offset ${offset}`);

    // Verificar que el usuario existe
    const userCheckQuery = 'SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?';
    
    connection.query(userCheckQuery, [userId], async (error, userResults) => {
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

      try {
        // Construir consulta base
        let baseQuery = `
          SELECT 
            G.Id_gasto as id,
            CASE 
              WHEN G.Monto_gasto < 0 THEN 'gasto'
              ELSE 'ingreso'
            END as type,
            G.Titulo_gasto as title,
            C.Nombre_categoria as category,
            G.Monto_gasto as amount,
            G.Fecha_creacion_gasto as date,
            G.Detalle_gasto as description,
            G.Active as active
          FROM gastos G 
          JOIN usuarios U ON U.Id_usuario = G.Id_usuario 
          INNER JOIN categorias C ON C.Id_categoria = G.Categoria_gasto 
          WHERE U.Identifier_usuario = ? AND G.Active = 1
        `;

        // Construir consulta de conteo
        let countQuery = `
          SELECT COUNT(*) as total
          FROM gastos G 
          JOIN usuarios U ON U.Id_usuario = G.Id_usuario 
          INNER JOIN categorias C ON C.Id_categoria = G.Categoria_gasto 
          WHERE U.Identifier_usuario = ? AND G.Active = 1
        `;

        const params = [userId];
        const countParams = [userId];

        // Aplicar filtros
        if (category) {
          const categoryFilter = ` AND C.Nombre_categoria LIKE ?`;
          baseQuery += categoryFilter;
          countQuery += categoryFilter;
          params.push(`%${category}%`);
          countParams.push(`%${category}%`);
          console.log(`🏷️ Filtro categoría: ${category}`);
        }

        if (from) {
          const fromFilter = ` AND G.Fecha_creacion_gasto >= ?`;
          baseQuery += fromFilter;
          countQuery += fromFilter;
          params.push(from);
          countParams.push(from);
          console.log(`📅 Filtro desde: ${from}`);
        }

        if (to) {
          const toFilter = ` AND G.Fecha_creacion_gasto <= ?`;
          baseQuery += toFilter;
          countQuery += toFilter;
          params.push(to);
          countParams.push(to);
          console.log(`📅 Filtro hasta: ${to}`);
        }

        if (min) {
          const minFilter = ` AND ABS(G.Monto_gasto) >= ?`;
          baseQuery += minFilter;
          countQuery += minFilter;
          params.push(Math.abs(parseFloat(min)));
          countParams.push(Math.abs(parseFloat(min)));
          console.log(`💰 Filtro monto mínimo: ${min}`);
        }

        if (max) {
          const maxFilter = ` AND ABS(G.Monto_gasto) <= ?`;
          baseQuery += maxFilter;
          countQuery += maxFilter;
          params.push(Math.abs(parseFloat(max)));
          countParams.push(Math.abs(parseFloat(max)));
          console.log(`💰 Filtro monto máximo: ${max}`);
        }

        if (search) {
          const searchFilter = ` AND (G.Titulo_gasto LIKE ? OR G.Detalle_gasto LIKE ?)`;
          baseQuery += searchFilter;
          countQuery += searchFilter;
          const searchTerm = `%${search}%`;
          params.push(searchTerm, searchTerm);
          countParams.push(searchTerm, searchTerm);
          console.log(`🔍 Filtro búsqueda: ${search}`);
        }

        // Filtro por tipo de transacción
        if (type && type !== 'all') {
          if (type === 'gasto') {
            const typeFilter = ` AND G.Monto_gasto < 0`;
            baseQuery += typeFilter;
            countQuery += typeFilter;
            console.log(`💸 Filtro tipo: gastos`);
          } else if (type === 'ingreso') {
            const typeFilter = ` AND G.Monto_gasto > 0`;
            baseQuery += typeFilter;
            countQuery += typeFilter;
            console.log(`💰 Filtro tipo: ingresos`);
          }
        }

        // Aplicar ordenamiento
        const orderBy = {
          'date_asc': 'G.Fecha_creacion_gasto ASC',
          'date_desc': 'G.Fecha_creacion_gasto DESC',
          'amount_asc': 'ABS(G.Monto_gasto) ASC',
          'amount_desc': 'ABS(G.Monto_gasto) DESC'
        }[order] || 'G.Fecha_creacion_gasto DESC';

        baseQuery += ` ORDER BY ${orderBy}`;
        console.log(`📊 Ordenamiento: ${orderBy}`);

        // Aplicar paginación
        baseQuery += ` LIMIT ? OFFSET ?`;
        params.push(limitNum, offset);

        console.log(`🔍 Query final:`, baseQuery);
        console.log(`📋 Parámetros:`, params);

        // Ejecutar consultas en paralelo
        const [dataResults, countResults] = await Promise.all([
          new Promise((resolve, reject) => {
            connection.query(baseQuery, params, (error, results) => {
              if (error) reject(error);
              else resolve(results);
            });
          }),
          new Promise((resolve, reject) => {
            connection.query(countQuery, countParams, (error, results) => {
              if (error) reject(error);
              else resolve(results);
            });
          })
        ]);

        const totalRecords = countResults[0].total;
        const totalPages = Math.ceil(totalRecords / limitNum);

        // Formatear respuesta
        const formattedData = dataResults.map(transaction => ({
          id: transaction.id,
          type: transaction.type,
          title: transaction.title,
          category: transaction.category,
          amount: parseFloat(transaction.amount),
          date: transaction.date,
          description: transaction.description || '',
          active: Boolean(transaction.active)
        }));

        const response = {
          success: true,
          page: pageNum,
          totalPages,
          totalRecords,
          limit: limitNum,
          data: formattedData,
          filters: {
            category: category || null,
            from: from || null,
            to: to || null,
            min: min || null,
            max: max || null,
            search: search || null,
            type: type || null,
            order
          }
        };

        console.log(`✅ Query successful: ${formattedData.length} transacciones encontradas de ${totalRecords} total`);
        res.json(response);

      } catch (queryError) {
        console.error('Error ejecutando consultas:', queryError);
        res.status(500).json({ 
          error: 'Error de servidor',
          message: 'Error al obtener las transacciones'
        });
      }
    });

  } catch (error) {
    console.error('Error en getAllTransactions:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtiene estadísticas de transacciones para un usuario
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getTransactionStats = async (req, res) => {
  try {
    const userId = req.query.Id_Usuario || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        message: 'Debe proporcionar el ID del usuario'
      });
    }

    console.log(`📊 API call: GET /api/transactions/stats, User ID: ${userId}`);

    // Verificar que el usuario existe
    const userCheckQuery = 'SELECT Id_usuario FROM usuarios WHERE Identifier_usuario = ?';
    
    connection.query(userCheckQuery, [userId], (error, userResults) => {
      if (error) {
        console.error('Error verificando usuario:', error);
        return res.status(500).json({ error: 'Error de servidor' });
      }
      
      if (userResults.length === 0) {
        return res.status(404).json({ 
          error: 'Usuario no encontrado',
          message: 'Usuario no encontrado. Por favor, inicia sesión nuevamente.'
        });
      }

      const statsQuery = `
        SELECT 
          COUNT(*) as total_transactions,
          COUNT(CASE WHEN G.Monto_gasto < 0 THEN 1 END) as total_expenses,
          COUNT(CASE WHEN G.Monto_gasto > 0 THEN 1 END) as total_income,
          COALESCE(SUM(CASE WHEN G.Monto_gasto < 0 THEN ABS(G.Monto_gasto) ELSE 0 END), 0) as total_expense_amount,
          COALESCE(SUM(CASE WHEN G.Monto_gasto > 0 THEN G.Monto_gasto ELSE 0 END), 0) as total_income_amount,
          COALESCE(AVG(CASE WHEN G.Monto_gasto < 0 THEN ABS(G.Monto_gasto) END), 0) as avg_expense_amount,
          COALESCE(AVG(CASE WHEN G.Monto_gasto > 0 THEN G.Monto_gasto END), 0) as avg_income_amount,
          MIN(G.Fecha_creacion_gasto) as first_transaction_date,
          MAX(G.Fecha_creacion_gasto) as last_transaction_date
        FROM gastos G 
        JOIN usuarios U ON U.Id_usuario = G.Id_usuario 
        WHERE U.Identifier_usuario = ? AND G.Active = 1
      `;

      connection.query(statsQuery, [userId], (error, results) => {
        if (error) {
          console.error('Error obteniendo estadísticas:', error);
          return res.status(500).json({ error: 'Error de servidor' });
        }

        const stats = results[0];
        const response = {
          success: true,
          stats: {
            totalTransactions: parseInt(stats.total_transactions),
            totalExpenses: parseInt(stats.total_expenses),
            totalIncome: parseInt(stats.total_income),
            totalExpenseAmount: parseFloat(stats.total_expense_amount),
            totalIncomeAmount: parseFloat(stats.total_income_amount),
            avgExpenseAmount: parseFloat(stats.avg_expense_amount),
            avgIncomeAmount: parseFloat(stats.avg_income_amount),
            firstTransactionDate: stats.first_transaction_date,
            lastTransactionDate: stats.last_transaction_date,
            balance: parseFloat(stats.total_income_amount) - parseFloat(stats.total_expense_amount)
          }
        };

        console.log(`✅ Estadísticas obtenidas para usuario ${userId}`);
        res.json(response);
      });
    });

  } catch (error) {
    console.error('Error en getTransactionStats:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

/**
 * Obtiene categorías disponibles para filtros
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getCategories = async (req, res) => {
  try {
    console.log(`🏷️ API call: GET /api/transactions/categories`);

    const categoriesQuery = `
      SELECT DISTINCT C.Id_categoria, C.Nombre_categoria, COUNT(G.Id_gasto) as transaction_count
      FROM categorias C
      LEFT JOIN gastos G ON C.Id_categoria = G.Categoria_gasto AND G.Active = 1
      GROUP BY C.Id_categoria, C.Nombre_categoria
      ORDER BY C.Nombre_categoria
    `;

    connection.query(categoriesQuery, (error, results) => {
      if (error) {
        console.error('Error obteniendo categorías:', error);
        return res.status(500).json({ error: 'Error de servidor' });
      }

      const response = {
        success: true,
        categories: results.map(category => ({
          id: category.Id_categoria,
          name: category.Nombre_categoria,
          transactionCount: parseInt(category.transaction_count)
        }))
      };

      console.log(`✅ ${results.length} categorías obtenidas`);
      res.json(response);
    });

  } catch (error) {
    console.error('Error en getCategories:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionStats,
  getCategories
};
