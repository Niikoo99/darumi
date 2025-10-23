import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-react';
import Colors from '../../assets/shared/Colors';
import objectivesService from '../../services/graphql';
import socketService from '../../services/socketService';
import { formatCurrency } from '../../utils/formatting';
import CustomObjectiveForm from '../Components/CustomObjectiveForm';
import ToastNotification, { useToastNotification } from '../Components/ToastNotification';
import { 
  scaleSize, 
  scaleFont, 
  getHorizontalPadding, 
  getVerticalPadding, 
  getTitleFontSize, 
  getBodyFontSize, 
  getSmallFontSize, 
  getBorderRadius, 
  getIconSize, 
  getSpacing, 
  getButtonSize, 
  getCardSize, 
  getHeaderSize, 
  getStatsBarSize, 
  getIconContainerSize, 
  getProgressBarSize, 
  getBadgeSize, 
  getShadowSize, 
  getBorderWidth, 
  getGap, 
  getMinWidth, 
  getMaxWidth 
} from '../../utils/scaling';

const { width } = Dimensions.get('window');

export default function Achievement() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState('enProgreso');
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [objetivosEnProgreso, setObjetivosEnProgreso] = useState([]);
  const [logros, setLogros] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingObjectives, setGeneratingObjectives] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  
  // Hook para notificaciones Toast
  const { toast, showSuccess, showError, showWarning, showInfo } = useToastNotification();
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Fetch data from GraphQL
  const fetchData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      console.log('🔍 Fetching objectives data for user:', user.id);
      
      // Fetch current progress, achievements history, and user stats in parallel
      const [currentProgress, achievementsHistory, userStats] = await Promise.all([
        objectivesService.getCurrentProgress(user.id),
        objectivesService.getAchievementsHistory(user.id),
        objectivesService.getUserStats(user.id),
      ]);

      console.log('📊 Current progress:', currentProgress);
      console.log('🏆 Achievements history:', achievementsHistory);
      console.log('📈 User stats:', userStats);

  // Función para obtener icono dinámico basado en categoría
  // Mapeo de categorías a iconos (igual que en CategoryGrid.js)
  const getCategoryIcon = (categoryName) => {
    const categoryIcons = {
      'Varios': 'ellipsis-h',
      'Comida/Restaurante': 'utensils',
      'Transporte': 'car',
      'Mecanica': 'wrench',
      'Combustibles': 'gas-pump',
      'Vestimenta/Calzado': 'tshirt',
      'Electrodomestico': 'home',
      'Ingresos': 'money-bill-wave',
      'Alimentación': 'utensils',
      'Entretenimiento': 'gamepad',
      'Salud': 'heartbeat',
      'Educación': 'graduation-cap',
      'Ropa': 'tshirt',
      'Hogar': 'home',
      'Servicios': 'tools',
      'Otros': 'ellipsis-h',
    };
    return categoryIcons[categoryName] || 'bullseye';
  };

      // Transform current progress data
      const transformedObjetivos = currentProgress.map(obj => ({
        id: obj.idRelacion,
        titulo: obj.titulo,
        descripcion: `Meta: ${formatCurrency(obj.valorObjetivo)}`,
        estado: "En progreso",
        progreso: Math.min(100, Math.round((obj.valorActual / obj.valorObjetivo) * 100)),
        meta: obj.valorObjetivo,
        actual: obj.valorActual,
        fechaCreacion: new Date().toISOString(),
        puntos: 0,
        icono: getCategoryIcon(obj.nombreCategoria) || 'bullseye', // Usar icono de categoría o mapeo estático
        color: Colors.warning,
        categoriaId: obj.categoriaId,
      }));

      // Transform achievements history data - FILTER: Only show CUMPLIDO (completed) objectives
      const transformedLogros = achievementsHistory
        .filter(obj => obj.status === 'CUMPLIDO') // Filter only completed objectives
        .map(obj => ({
          id: obj.idRelacion,
          titulo: obj.titulo,
          descripcion: `Meta: ${formatCurrency(obj.valorObjetivo)}, Gastado: ${formatCurrency(obj.finalValue)}\n¡Ganaste ${obj.puntos} puntos!`,
          fechaObtenido: obj.fechaCompletado,
          puntos: obj.puntos,
          icono: getCategoryIcon(obj.nombreCategoria) || 'bullseye', // Usar icono de categoría o mapeo estático
          color: Colors.success,
          raro: obj.puntos > 100,
          status: obj.status,
          finalValue: obj.finalValue,
          valorObjetivo: obj.valorObjetivo,
          categoriaId: obj.categoriaId,
        }));

      setObjetivosEnProgreso(transformedObjetivos);
      setLogros(transformedLogros);
      setUserStats(userStats);
      
    } catch (error) {
      console.error('❌ Error fetching objectives data:', error);
      showError('Error', 'No se pudieron cargar los objetivos. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para mostrar notificación de información general
  const showGeneralNotification = (title, message, actionText = 'Ver Detalles') => {
    showInfo(title, message, {
      duration: 4000,
      actionText,
      onPress: () => {
        // Navegar a la sección correspondiente
        if (actionText.includes('Logros')) {
          setSelectedTab('logros');
        } else {
          setSelectedTab('enProgreso');
        }
      }
    });
  };


  // Socket.IO event handlers
  useEffect(() => {
    if (!user?.id) return;

    // Connect to Socket.IO
    socketService.connect(user.id);

    // Handle objective completion
    const handleObjectiveCompleted = (data) => {
      console.log('🎉 Objective completed:', data);
      
      // Mostrar notificación Toast de éxito
      showSuccess(
        '¡Objetivo Completado!',
        `¡${data.title} completado! Ganaste ${data.points} puntos.`,
        {
          duration: 5000,
          actionText: 'Ver Logros',
          onPress: () => {
            setSelectedTab('logros');
          }
        }
      );
      
      // Refresh data to show updated status
      setTimeout(() => {
        fetchData();
      }, 1000);
    };

    // Handle objective failure
    const handleObjectiveFailed = (data) => {
      console.log('😞 Objective failed:', data);
      
      // Mostrar notificación Toast de error (no intrusiva)
      showError(
        'Objetivo Actualizado',
        'Se actualizaron tus objetivos. Revisa tu progreso para ver los detalles.',
        {
          duration: 4000,
          actionText: 'Ver Progreso',
          onPress: () => {
            setSelectedTab('objetivos');
          }
        }
      );
      
      // Refresh data to show updated status
      setTimeout(() => {
        fetchData();
      }, 1000);
    };

    // Add event listeners
    socketService.addEventListener('objective_completed', handleObjectiveCompleted);
    socketService.addEventListener('objective_failed', handleObjectiveFailed);

    // Initial data fetch
    fetchData();

    // Cleanup on unmount
    return () => {
      socketService.removeEventListener('objective_completed', handleObjectiveCompleted);
      socketService.removeEventListener('objective_failed', handleObjectiveFailed);
      socketService.disconnect();
    };
  }, [user?.id]);

  // Función para determinar el color del medidor de consumo basado en el porcentaje
  const getConsumptionColor = (percentage) => {
    if (percentage <= 75) {
      // Estado "Seguro" (0% - 75% consumido)
      return '#4CAF50'; // Verde
    } else if (percentage <= 90) {
      // Estado "Advertencia" (76% - 90% consumido)
      return '#FFA500'; // Naranja
    } else if (percentage <= 100) {
      // Estado "Peligro" (91% - 100% consumido)
      return '#F44336'; // Rojo
    } else {
      // Estado "Fallido" (> 100% consumido)
      return '#D32F2F'; // Rojo oscuro
    }
  };

  // Función para determinar el estado del consumo
  const getConsumptionState = (percentage) => {
    if (percentage <= 75) return 'safe';
    if (percentage <= 90) return 'warning';
    if (percentage <= 100) return 'danger';
    return 'failed';
  };

  const renderProgressBar = (objetivo) => {
    // Calcular el porcentaje real basado en valor_actual / valor_objetivo
    const porcentajeReal = (objetivo.actual / objetivo.meta) * 100;
    const porcentajeRedondeado = Math.round(porcentajeReal);
    
    // Para objetivos fallidos, usar color rojo de peligro
    const isFailed = objetivo.estado === 'Fallido';
    const consumptionColor = isFailed ? Colors.danger : getConsumptionColor(porcentajeReal);
    const consumptionState = isFailed ? 'failed' : getConsumptionState(porcentajeReal);
    
    // Estilo dinámico para el texto según el estado
    const getTextStyle = () => {
      const baseStyle = styles.progressText;
      if (consumptionState === 'failed' || isFailed) {
        return [baseStyle, { color: Colors.danger, fontWeight: '700' }];
      } else if (consumptionState === 'danger') {
        return [baseStyle, { color: '#F44336', fontWeight: '600' }];
      } else if (consumptionState === 'warning') {
        return [baseStyle, { color: '#FFA500', fontWeight: '600' }];
      }
      return baseStyle;
    };
    
    return (
      <View style={styles.progressContainer}>
        {/* Indicador de estado visual */}
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: consumptionColor }]} />
          <Text style={styles.statusText}>
            {porcentajeReal <= 100 ? 'En meta' : 'Excedido'}
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          {/* Barra de progreso con límite visual claro */}
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(porcentajeReal, 100)}%`,
                backgroundColor: consumptionColor,
              },
            ]}
          />
          {/* Línea vertical que marca el 100% */}
          <View style={styles.goalMarker} />
        </View>
        
        <View style={styles.progressInfo}>
          <Text style={getTextStyle()}>{porcentajeRedondeado}% consumido</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.consumedAmount}>
              {objetivo.actual?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}
            </Text>
            <Text style={styles.separator}>/</Text>
            <Text style={styles.goalAmount}>
              {objetivo.meta?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) || '$0'}
            </Text>
          </View>
          {porcentajeReal > 100 && (
            <Text style={styles.excessAmount}>
              Exceso: +{((porcentajeReal - 100) / 100 * (objetivo.meta || 0)).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderObjectiveCard = (objetivo) => (
    <Animated.View
      key={objetivo.id}
      style={[
        styles.objectiveCard,
        {
          borderColor: objetivo.color,
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => setSelectedObjective(objetivo)}
        activeOpacity={0.8}
      >
        <View style={styles.objectiveHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${objetivo.color}20` }]}>
            <FontAwesome5 name={objetivo.icono} size={18} color={objetivo.color} />
          </View>
          <View style={styles.objectiveInfo}>
            <Text style={styles.objectiveTitle}>{objetivo.titulo}</Text>
            <Text style={styles.objectiveDescription}>{objetivo.descripcion}</Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: objetivo.estado === 'Fallido' ? Colors.danger : objetivo.color }
          ]}>
            <Text style={styles.statusText}>{objetivo.estado}</Text>
          </View>
        </View>

        {(objetivo.estado === "En progreso" || objetivo.estado === "Fallido") && (
          <View style={styles.progressSection}>
            {renderProgressBar(objetivo)}
            <View style={styles.progressDetails}>
              {/* Los montos ahora se muestran en amountContainer */}
            </View>
          </View>
        )}

        {objetivo.estado === "Cumplido" && (
          <View style={styles.completedSection}>
            <FontAwesome5 name="check-circle" size={20} color={Colors.success} />
            <Text style={styles.completedText}>¡Objetivo completado!</Text>
            <Text style={styles.pointsText}>+{objetivo.puntos} puntos</Text>
          </View>
        )}

        {objetivo.estado === "Fallido" && (
          <View style={styles.failedSection}>
            <View style={styles.failedHeader}>
              <FontAwesome5 name="times-circle" size={20} color={Colors.danger} />
              <Text style={styles.failedText}>Objetivo excedido</Text>
            </View>
            <Text style={styles.failedReason}>
              Has gastado {Math.round((objetivo.actual / objetivo.meta) * 100)}% de tu límite de {formatCurrency(objetivo.meta)}
            </Text>
            <Text style={styles.failedExcess}>
              Exceso: {formatCurrency(objetivo.actual - objetivo.meta)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAchievementCard = (logro) => (
    <Animated.View
      key={logro.id}
      style={[
        styles.achievementCard,
        {
          borderColor: logro.color,
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.achievementHeader}>
        <View style={[styles.achievementIconContainer, { backgroundColor: `${logro.color}20` }]}>
          <FontAwesome5 name={logro.icono} size={28} color={logro.color} />
          {logro.raro && (
            <View style={styles.rareBadge}>
              <FontAwesome5 name="gem" size={12} color={Colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.achievementInfo}>
          <Text style={styles.achievementTitle}>{logro.titulo}</Text>
          <Text style={styles.achievementDescription}>{logro.descripcion}</Text>
          <Text style={styles.achievementDate}>
            Finalizado: {new Date(logro.fechaObtenido).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsNumber}>+{logro.puntos}</Text>
          <Text style={styles.pointsLabel}>puntos</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderHistoryCard = (item) => {
    const isSuccess = item.status === 'Cumplido';
    const cardStyle = isSuccess ? styles.successCard : styles.failureCard;
    const iconColor = isSuccess ? Colors.success : Colors.textSecondary;
    const iconName = isSuccess ? 'check-circle' : 'times-circle';
    
    return (
      <Animated.View
        key={item.idRelacion}
        style={[
          cardStyle,
          {
            transform: [
              {
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.02],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.historyHeader}>
          <View style={[styles.historyIconContainer, { backgroundColor: `${iconColor}20` }]}>
            <FontAwesome5 name={iconName} size={24} color={iconColor} />
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyTitle}>{item.titulo}</Text>
            <Text style={styles.historyDate}>
              {new Date(item.fechaCompletado).toLocaleDateString()}
            </Text>
            {isSuccess ? (
              <Text style={styles.successDescription}>
                Meta: {formatCurrency(item.valorObjetivo)} / Gasto: {formatCurrency(item.finalValue)}
              </Text>
            ) : (
              <Text style={styles.failureDescription}>
                Meta: {formatCurrency(item.valorObjetivo)} / Gasto: {formatCurrency(item.finalValue)}
              </Text>
            )}
          </View>
          <View style={styles.historyPointsContainer}>
            {isSuccess ? (
              <>
                <Text style={styles.successPointsNumber}>+{item.puntos}</Text>
                <Text style={styles.successPointsLabel}>puntos</Text>
                {item.puntos > 100 && (
                  <Text style={styles.bonusText}>
                    (Bono de Racha: +{item.puntos - 100})
                  </Text>
                )}
              </>
            ) : (
              <>
                <Text style={styles.failurePointsNumber}>+0</Text>
                <Text style={styles.failurePointsLabel}>puntos</Text>
              </>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderStats = () => {
    const totalPuntos = userStats?.puntosTotal || 0;
    const objetivosCompletados = userStats?.objetivosCompletados || 0;
    const objetivosEnProgreso = userStats?.objetivosEnProgreso || 0;
    const rachaActual = userStats?.rachaActual || 0;
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{objetivosEnProgreso}</Text>
          <Text style={styles.statLabel}>En Progreso</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{objetivosCompletados}</Text>
          <Text style={styles.statLabel}>Completados</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalPuntos}</Text>
          <Text style={styles.statLabel}>Puntos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{rachaActual}</Text>
          <Text style={styles.statLabel}>Racha 🔥</Text>
        </View>
      </View>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleGenerateDefaultObjectives = async () => {
    if (!user?.id) return;
    
    setGeneratingObjectives(true);
    try {
      console.log('🎯 Generando objetivos por defecto para usuario:', user.id);
      
      const resultado = await objectivesService.generateDefaultObjectives(user.id);
      
      if (resultado.success) {
        showSuccess(
          '🎉 ¡Objetivos Creados!',
          `Se han generado ${resultado.objetivos.length} objetivos personalizados basados en tu dinero disponible de ${formatCurrency(resultado.dineroDisponible)}.`,
          {
            duration: 5000,
            actionText: 'Ver Objetivos',
            onPress: () => {
              setSelectedTab('objetivos');
              fetchData();
            }
          }
        );
      } else {
        showError('Error', resultado.message);
      }
    } catch (error) {
      console.error('❌ Error generando objetivos:', error);
      showError('Error', 'No se pudieron generar los objetivos. Intenta nuevamente.');
    } finally {
      setGeneratingObjectives(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Gamificado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎯 Mis Metas</Text>
        <Text style={styles.headerSubtitle}>Tu progreso financiero gamificado</Text>
      </View>

      {/* Stats Bar */}
      {renderStats()}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'enProgreso' && styles.activeTab]}
          onPress={() => setSelectedTab('enProgreso')}
        >
          <FontAwesome5 name="play-circle" size={16} color={selectedTab === 'enProgreso' ? Colors.textDark : Colors.textSecondary} />
          <Text style={[styles.tabText, selectedTab === 'enProgreso' && styles.activeTabText]}>
            En Progreso
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'logros' && styles.activeTab]}
          onPress={() => setSelectedTab('logros')}
        >
          <FontAwesome5 name="trophy" size={16} color={selectedTab === 'logros' ? Colors.textDark : Colors.textSecondary} />
          <Text style={[styles.tabText, selectedTab === 'logros' && styles.activeTabText]}>
            Logros
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Cargando objetivos...</Text>
            </View>
          )}

          {!loading && selectedTab === 'enProgreso' && (
            <View>
              <Text style={styles.sectionTitle}>🎯 Mis Objetivos</Text>
              {objetivosEnProgreso.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="play-circle" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateText}>Aún no tienes objetivos</Text>
                  <Text style={styles.emptyStateSubtext}>¡Genera tus metas por defecto o crea una personalizada!</Text>
                  
                <View style={styles.buttonContainer}>
                  {/* Botón Primario - Generar Objetivos */}
                  <TouchableOpacity
                    style={[styles.primaryButton, generatingObjectives && styles.primaryButtonDisabled]}
                    onPress={handleGenerateDefaultObjectives}
                    disabled={generatingObjectives}
                  >
                    {generatingObjectives ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <FontAwesome5 name="magic" size={18} color={Colors.white} />
                    )}
                    <Text style={styles.primaryButtonText}>
                      {generatingObjectives ? 'Generando...' : 'Generar Objetivos'}
                    </Text>
                  </TouchableOpacity>

                  {/* Botón Secundario - Crear Personalizado */}
                  <TouchableOpacity
                    style={styles.ghostButton}
                    onPress={() => {
                      console.log('🎯 Botón Crear Personalizado presionado');
                      setShowCustomForm(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5 name="plus" size={getIconSize(16)} color={Colors.primary} />
                    <Text style={styles.ghostButtonText}>Crear Objetivo Personalizado</Text>
                  </TouchableOpacity>
                </View>
                </View>
              ) : (
                <View>
                  {objetivosEnProgreso.map(renderObjectiveCard)}
                  
                  {/* Botón para crear objetivo adicional */}
                  <TouchableOpacity
                    style={[styles.ghostButton, { marginTop: getSpacing(20), marginBottom: getSpacing(20) }]}
                    onPress={() => {
                      console.log('🎯 Botón Crear Objetivo Adicional presionado');
                      setShowCustomForm(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5 name="plus" size={getIconSize(16)} color={Colors.primary} />
                    <Text style={styles.ghostButtonText}>Crear Objetivo Personalizado</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {!loading && selectedTab === 'logros' && (
            <View>
              <Text style={styles.sectionTitle}>🏆 Mis Logros</Text>
              {logros.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="trophy" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateText}>Aún no has completado ningún objetivo</Text>
                </View>
              ) : (
                logros.map(renderHistoryCard)
              )}
            </View>
          )}

          {/* Botón de Celebración (para demo) */}
          {/* TODO: Se uso de demo pero se puede hacer algo luego */}
          {/* <TouchableOpacity style={styles.celebrationButton} onPress={() => triggerCelebration('¡Demo de celebración!')}>
            <FontAwesome5 name="gift" size={20} color={Colors.white} />
            <Text style={styles.celebrationButtonText}>¡Celebrar Logro!</Text>
          </TouchableOpacity> */}
        </View>
      </ScrollView>

      {/* Animación de Celebración */}
      <Animated.View
        style={[
          styles.celebrationOverlay,
          {
            opacity: celebrationAnim,
            transform: [
              {
                scale: celebrationAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.2],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.celebrationText}>🎉 ¡FELICIDADES! 🎉</Text>
        <Text style={styles.celebrationSubtext}>¡Has completado un objetivo!</Text>
      </Animated.View>

      {/* Custom Objective Form Modal */}
      <CustomObjectiveForm
        visible={showCustomForm}
        onClose={() => setShowCustomForm(false)}
        onSuccess={(objetivo) => {
          console.log('Objetivo personalizado creado:', objetivo);
          fetchData(); // Refresh data
        }}
        userIdentifier={user?.id}
      />

      {/* Toast Notification */}
      <ToastNotification
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={toast.duration}
        onPress={toast.onPress}
        actionText={toast.actionText}
        showAction={toast.showAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: getSpacing(12), // Reducido significativamente
    paddingHorizontal: getSpacing(16),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getTitleFontSize(20), // Reducido de tamaño por defecto
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: getSpacing(4), // Reducido de 8
  },
  headerSubtitle: {
    fontSize: getBodyFontSize(12), // Reducido significativamente
    color: Colors.textDark,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: getSpacing(8), // Reducido significativamente de 20
    paddingHorizontal: getSpacing(12), // Reducido de 16
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: getSpacing(4), // Reducido de 8
  },
  statNumber: {
    fontSize: getTitleFontSize(18), // Reducido de 24
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: getSpacing(2), // Reducido de 6
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: getSpacing(28),
  },
  statLabel: {
    fontSize: getSmallFontSize(9), // Reducido de 11
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3, // Reducido de 0.5
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: getHorizontalPadding(),
    borderRadius: getBorderRadius(),
    padding: getSpacing(4),
    marginBottom: getSpacing(20),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(16),
    borderRadius: getBorderRadius(12),
    gap: getGap(8),
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.textDark,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: getHorizontalPadding(),
  },
  sectionTitle: {
    fontSize: getTitleFontSize(20),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: getSpacing(16),
  },
  objectiveCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: getBorderRadius(12),
    padding: getSpacing(12), // Reducido de 16
    marginBottom: getSpacing(8), // Reducido de 12
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  objectiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(8), // Reducido de 10
  },
  iconContainer: {
    width: 40, // Reducido de 48
    height: 40, // Reducido de 48
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(10), // Reducido de 12
    backgroundColor: Colors.active,
    borderRadius: getBorderRadius(10), // Reducido de 12
    borderWidth: 1,
    borderColor: Colors.border,
  },
  objectiveInfo: {
    flex: 1,
  },
  objectiveTitle: {
    fontSize: getTitleFontSize(16), // Reducido de 18
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(2), // Reducido de 4
  },
  objectiveDescription: {
    fontSize: getBodyFontSize(12), // Reducido de tamaño por defecto
    color: Colors.textSecondary,
    lineHeight: getSpacing(16), // Agregado para controlar altura
  },
  statusBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
    borderRadius: getBorderRadius(16),
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  statusText: {
    fontSize: getSmallFontSize(),
    fontWeight: '600',
    color: Colors.textDark,
  },
  progressSection: {
    marginTop: getSpacing(8), // Reducido de 10
  },
  progressContainer: {
    marginBottom: getSpacing(4), // Reducido de 6
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(4), // Reducido de 6
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: getSpacing(10), // Reducido de 12
    paddingVertical: getSpacing(4), // Reducido de 6
    borderRadius: getBorderRadius(16),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: getSpacing(8),
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: getSmallFontSize(11),
    fontWeight: '700',
    color: Colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: getBorderRadius(6),
    marginRight: getSpacing(10),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    borderRadius: getBorderRadius(4),
  },
  goalMarker: {
    position: 'absolute',
    right: 0,
    top: -1,
    width: 3,
    height: 'calc(100% + 2px)',
    backgroundColor: Colors.primary,
    borderRadius: 1.5,
    opacity: 0.9,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  excessIndicator: {
    position: 'absolute',
    right: -25,
    top: '50%',
    transform: [{ translateY: -10 }],
    backgroundColor: Colors.danger,
    paddingHorizontal: getSpacing(6),
    paddingVertical: getSpacing(2),
    borderRadius: getBorderRadius(8),
    minWidth: 40,
    alignItems: 'center',
  },
  excessPercentage: {
    fontSize: getSmallFontSize(9),
    color: Colors.textLight,
    fontWeight: '700',
  },
  progressInfo: {
    alignItems: 'center',
    marginTop: getSpacing(3), // Reducido de 4
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getSpacing(2), // Reducido de 3
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: getSpacing(6), // Reducido de 8
    paddingVertical: getSpacing(3), // Reducido de 4
    borderRadius: getBorderRadius(8),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  consumedAmount: {
    fontSize: getSmallFontSize(11),
    color: Colors.danger,
    fontWeight: '700',
  },
  separator: {
    fontSize: getSmallFontSize(11),
    color: Colors.textSecondary,
    fontWeight: '500',
    marginHorizontal: getSpacing(4),
  },
  goalAmount: {
    fontSize: getSmallFontSize(11),
    color: Colors.success,
    fontWeight: '700',
  },
  excessAmount: {
    fontSize: getSmallFontSize(10),
    color: Colors.danger,
    fontWeight: '700',
    marginTop: getSpacing(4),
    textAlign: 'center',
    backgroundColor: Colors.failed,
    paddingHorizontal: getSpacing(8),
    paddingVertical: getSpacing(4),
    borderRadius: getBorderRadius(8),
    borderWidth: 1,
    borderColor: Colors.borderDanger,
  },
  progressText: {
    fontSize: getBodyFontSize(12), // Reducido
    fontWeight: '600',
    color: Colors.text,
  },
  progressDetails: {
    alignItems: 'center',
  },
  progressAmount: {
    fontSize: getSmallFontSize(10), // Reducido
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.completed,
    padding: getSpacing(8), // Reducido de 12
    borderRadius: getBorderRadius(8), // Reducido de 12
    marginTop: getSpacing(10), // Reducido de 16
  },
  completedText: {
    fontSize: getBodyFontSize(12), // Reducido
    fontWeight: '600',
    color: Colors.success,
    marginLeft: getSpacing(6), // Reducido de 8
    flex: 1,
  },
  pointsText: {
    fontSize: getBodyFontSize(12), // Reducido
    fontWeight: '600',
    color: Colors.success,
  },
  failedSection: {
    backgroundColor: Colors.failed,
    padding: getSpacing(8), // Reducido de 12
    borderRadius: getBorderRadius(8), // Reducido de 12
    marginTop: getSpacing(10), // Reducido de 16
  },
  failedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(6), // Reducido de 8
  },
  failedText: {
    fontSize: getBodyFontSize(12), // Reducido
    fontWeight: '600',
    color: Colors.danger,
    marginLeft: getSpacing(6), // Reducido de 8
  },
  failedReason: {
    fontSize: getBodyFontSize(11), // Reducido
    color: Colors.textSecondary,
    marginBottom: getSpacing(2), // Reducido de 4
  },
  failedExcess: {
    fontSize: getBodyFontSize(11), // Reducido
    fontWeight: '600',
    color: Colors.danger,
  },
  achievementCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(),
    borderRadius: getBorderRadius(),
    padding: getSpacing(20),
    marginBottom: getSpacing(16),
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconContainer: {
    ...getIconContainerSize(60),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(16),
    position: 'relative',
  },
  rareBadge: {
    position: 'absolute',
    top: scaleSize(-5),
    right: scaleSize(-5),
    backgroundColor: Colors.primary,
    borderRadius: scaleSize(10),
    width: scaleSize(20),
    height: scaleSize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: getTitleFontSize(18),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(4),
  },
  achievementDescription: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginBottom: getSpacing(4),
  },
  achievementDate: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsNumber: {
    fontSize: getTitleFontSize(20),
    fontWeight: '700',
    color: Colors.primary,
  },
  pointsLabel: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
  },
  celebrationButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...getButtonSize(),
    borderRadius: getBorderRadius(),
    gap: getGap(8),
    marginTop: getSpacing(20),
  },
  celebrationButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.textDark,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: scaleSize(-100) }, { translateY: scaleSize(-50) }],
    backgroundColor: Colors.primary,
    paddingHorizontal: getSpacing(30),
    paddingVertical: getSpacing(20),
    borderRadius: getBorderRadius(20),
    alignItems: 'center',
    ...getShadowSize(10, 20, 0.3),
  },
  celebrationText: {
    fontSize: getTitleFontSize(24),
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: getSpacing(8),
  },
  celebrationSubtext: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: getSpacing(40),
  },
  loadingText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginTop: getSpacing(16),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: getSpacing(60),
    paddingHorizontal: getHorizontalPadding(),
  },
  emptyStateText: {
    fontSize: getTitleFontSize(18),
    fontWeight: '600',
    color: Colors.text,
    marginTop: getSpacing(16),
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginTop: getSpacing(8),
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: getGap(12),
    marginTop: getSpacing(20),
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(32),
    borderRadius: getBorderRadius(16),
    gap: getGap(10),
    minWidth: scaleSize(200),
    ...getShadowSize(4, 8, 0.15),
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  primaryButtonText: {
    fontSize: getBodyFontSize(16),
    fontWeight: '700',
    color: Colors.white,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(20),
    borderRadius: getBorderRadius(12),
    gap: getGap(6),
    borderWidth: 0,
  },
  secondaryButtonText: {
    fontSize: getBodyFontSize(14),
    fontWeight: '500',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(24),
    borderRadius: getBorderRadius(16),
    gap: getGap(8),
    borderWidth: getBorderWidth(2),
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    minHeight: scaleSize(56), // Altura mínima para objetivo táctil
    ...getShadowSize(0, 2, 0.1),
  },
  ghostButtonText: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  
  // Estilos para tarjetas de historial
  successCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(2),
    borderColor: Colors.success,
    borderRadius: getBorderRadius(),
    padding: getSpacing(16),
    marginBottom: getSpacing(12),
    ...getShadowSize(2, 4, 0.1),
  },
  failureCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(1),
    borderColor: Colors.textSecondary,
    borderRadius: getBorderRadius(),
    padding: getSpacing(16),
    marginBottom: getSpacing(12),
    ...getShadowSize(1, 2, 0.05),
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconContainer: {
    ...getIconContainerSize(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(12),
    borderRadius: getBorderRadius(24),
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: getTitleFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(4),
  },
  historyDate: {
    fontSize: getSmallFontSize(12),
    color: Colors.textSecondary,
    marginBottom: getSpacing(4),
  },
  successDescription: {
    fontSize: getBodyFontSize(14),
    color: Colors.success,
    fontWeight: '500',
  },
  failureDescription: {
    fontSize: getBodyFontSize(14),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  historyPointsContainer: {
    alignItems: 'center',
    minWidth: scaleSize(80),
  },
  successPointsNumber: {
    fontSize: getTitleFontSize(18),
    fontWeight: '800',
    color: Colors.success,
    marginBottom: getSpacing(2),
  },
  successPointsLabel: {
    fontSize: getSmallFontSize(11),
    color: Colors.success,
    fontWeight: '500',
  },
  failurePointsNumber: {
    fontSize: getTitleFontSize(18),
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: getSpacing(2),
  },
  failurePointsLabel: {
    fontSize: getSmallFontSize(11),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bonusText: {
    fontSize: getSmallFontSize(10),
    color: Colors.primary,
    fontWeight: '600',
    marginTop: getSpacing(2),
    textAlign: 'center',
  },
});