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
  const [selectedTab, setSelectedTab] = useState('objetivos');
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [objetivos, setObjetivos] = useState([]);
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingObjectives, setGeneratingObjectives] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  
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
      
      // Fetch current progress and achievements history in parallel
      const [currentProgress, achievementsHistory] = await Promise.all([
        objectivesService.getCurrentProgress(user.id),
        objectivesService.getAchievementsHistory(user.id),
      ]);

      console.log('📊 Current progress:', currentProgress);
      console.log('🏆 Achievements history:', achievementsHistory);

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
        icono: obj.categoriaId ? "folder" : "chart-line",
        color: Colors.warning,
        categoriaId: obj.categoriaId,
      }));

      // Transform achievements history data
      const transformedLogros = achievementsHistory.map(obj => ({
        id: obj.idRelacion,
        titulo: obj.titulo,
        descripcion: obj.status === 'Cumplido' 
          ? `¡Objetivo completado! Ganaste ${obj.puntos} puntos.`
          : `Meta no cumplida. Objetivo: ${obj.targetValue ? formatCurrency(obj.targetValue) : 'N/A'}, Gastado: ${obj.finalValue ? formatCurrency(obj.finalValue) : 'N/A'}`,
        fechaObtenido: obj.fechaCompletado,
        puntos: obj.puntos,
        icono: obj.status === 'Cumplido' ? "trophy" : "times-circle",
        color: obj.status === 'Cumplido' ? Colors.success : Colors.danger,
        raro: obj.puntos > 100,
        status: obj.status,
        finalValue: obj.finalValue,
        targetValue: obj.targetValue,
      }));

      setObjetivos(transformedObjetivos);
      setLogros(transformedLogros);
      
    } catch (error) {
      console.error('❌ Error fetching objectives data:', error);
      Alert.alert('Error', 'No se pudieron cargar los objetivos. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const triggerCelebration = (message = '¡FELICIDADES!') => {
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Show alert for celebration
    Alert.alert('🎉 ¡Objetivo Completado!', message, [
      { text: '¡Genial!', style: 'default' }
    ]);
  };

  // Socket.IO event handlers
  useEffect(() => {
    if (!user?.id) return;

    // Connect to Socket.IO
    socketService.connect(user.id);

    // Handle objective completion
    const handleObjectiveCompleted = (data) => {
      console.log('🎉 Objective completed:', data);
      triggerCelebration(`¡${data.title} completado! Ganaste ${data.points} puntos.`);
      
      // Refresh data to show updated status
      setTimeout(() => {
        fetchData();
      }, 1000);
    };

    // Handle objective failure
    const handleObjectiveFailed = (data) => {
      console.log('😞 Objective failed:', data);
      Alert.alert(
        'Objetivo no cumplido', 
        `${data.title}: Tu meta era ${data.targetValue ? formatCurrency(data.targetValue) : 'N/A'}, pero gastaste ${data.finalValue ? formatCurrency(data.finalValue) : 'N/A'}.`,
        [{ text: 'Entendido', style: 'default' }]
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

    // Check for completed objectives
    checkCompletedObjectives();

    // Cleanup on unmount
    return () => {
      socketService.removeEventListener('objective_completed', handleObjectiveCompleted);
      socketService.removeEventListener('objective_failed', handleObjectiveFailed);
      socketService.disconnect();
    };
  }, [user?.id]);

  const renderProgressBar = (progreso, color) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: `${progreso}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{progreso}%</Text>
    </View>
  );

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
            <FontAwesome5 name={objetivo.icono} size={24} color={objetivo.color} />
          </View>
          <View style={styles.objectiveInfo}>
            <Text style={styles.objectiveTitle}>{objetivo.titulo}</Text>
            <Text style={styles.objectiveDescription}>{objetivo.descripcion}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: objetivo.color }]}>
            <Text style={styles.statusText}>{objetivo.estado}</Text>
          </View>
        </View>

        {objetivo.estado === "En progreso" && (
          <View style={styles.progressSection}>
            {renderProgressBar(objetivo.progreso, objetivo.color)}
            <View style={styles.progressDetails}>
              <Text style={styles.progressAmount}>
                {formatCurrency(objetivo.actual)} / {formatCurrency(objetivo.meta)}
              </Text>
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
            <FontAwesome5 name="times-circle" size={20} color={Colors.danger} />
            <Text style={styles.failedText}>Objetivo no cumplido</Text>
            <Text style={styles.failedReason}>
              No se alcanzó la meta en el tiempo establecido
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
            Obtenido: {new Date(logro.fechaObtenido).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsNumber}>+{logro.puntos}</Text>
          <Text style={styles.pointsLabel}>puntos</Text>
        </View>
      </View>
    </Animated.View>
  );

  const renderStats = () => {
    const totalPuntos = logros.reduce((total, logro) => total + logro.puntos, 0);
    const objetivosCompletados = logros.filter(logro => logro.status === 'Cumplido').length;
    
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{objetivos.length}</Text>
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
        Alert.alert(
          '🎉 ¡Objetivos Creados!',
          `Se han generado ${resultado.objetivos.length} objetivos personalizados basados en tu dinero disponible de ${formatCurrency(resultado.dineroDisponible)}.`,
          [
            { 
              text: '¡Genial!', 
              onPress: () => {
                // Refrescar datos para mostrar los nuevos objetivos
                fetchData();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', resultado.message);
      }
    } catch (error) {
      console.error('❌ Error generando objetivos:', error);
      Alert.alert('Error', 'No se pudieron generar los objetivos. Intenta nuevamente.');
    } finally {
      setGeneratingObjectives(false);
    }
  };

  const checkCompletedObjectives = async () => {
    if (!user?.id) return;
    
    try {
      console.log('🔍 Verificando objetivos completados para usuario:', user.id);
      
      const resultado = await objectivesService.checkCompletedObjectives(user.id);
      
      if (resultado.completados > 0 || resultado.fallidos > 0) {
        console.log(`📊 Objetivos actualizados: ${resultado.completados} completados, ${resultado.fallidos} fallidos`);
        
        // Refrescar datos para mostrar los cambios
        fetchData();
        
        // Mostrar notificación si hay objetivos completados
        if (resultado.completados > 0) {
          const objetivosCompletados = resultado.actualizados.filter(obj => obj.cumplido);
          if (objetivosCompletados.length > 0) {
            const totalPuntos = objetivosCompletados.reduce((sum, obj) => sum + obj.puntos, 0);
            triggerCelebration(`¡${objetivosCompletados.length} objetivo(s) completado(s)! Ganaste ${totalPuntos} puntos.`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error verificando objetivos completados:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Gamificado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Logros y Objetivos</Text>
        <Text style={styles.headerSubtitle}>Tu progreso financiero gamificado</Text>
      </View>

      {/* Stats Bar */}
      {renderStats()}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'objetivos' && styles.activeTab]}
          onPress={() => setSelectedTab('objetivos')}
        >
          <FontAwesome5 name="bullseye" size={16} color={selectedTab === 'objetivos' ? Colors.textDark : Colors.textSecondary} />
          <Text style={[styles.tabText, selectedTab === 'objetivos' && styles.activeTabText]}>
            Objetivos
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

          {!loading && selectedTab === 'objetivos' && (
            <View>
              <Text style={styles.sectionTitle}>🎯 Mis Objetivos</Text>
              {objetivos.length === 0 ? (
                <View style={styles.emptyState}>
                  <FontAwesome5 name="bullseye" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyStateText}>No tienes objetivos en progreso</Text>
                  <Text style={styles.emptyStateSubtext}>¡Genera objetivos personalizados basados en tus ingresos!</Text>
                  
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.generateButton, generatingObjectives && styles.generateButtonDisabled]}
                    onPress={handleGenerateDefaultObjectives}
                    disabled={generatingObjectives}
                  >
                    {generatingObjectives ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <FontAwesome5 name="magic" size={16} color={Colors.white} />
                    )}
                    <Text style={styles.generateButtonText}>
                      {generatingObjectives ? 'Generando...' : 'Generar Objetivos'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.customButton}
                    onPress={() => {
                      console.log('🎯 Botón Crear Personalizado presionado');
                      setShowCustomForm(true);
                    }}
                  >
                    <FontAwesome5 name="plus" size={16} color={Colors.primary} />
                    <Text style={styles.customButtonText}>Crear Personalizado</Text>
                  </TouchableOpacity>
                </View>
                </View>
              ) : (
                <View>
                  {objetivos.map(renderObjectiveCard)}
                  
                  {/* Botón para crear objetivo adicional */}
                  <TouchableOpacity
                    style={[styles.customButton, { marginTop: 20, marginBottom: 20 }]}
                    onPress={() => {
                      console.log('🎯 Botón Crear Objetivo Adicional presionado');
                      setShowCustomForm(true);
                    }}
                  >
                    <FontAwesome5 name="plus" size={16} color={Colors.primary} />
                    <Text style={styles.customButtonText}>Crear Objetivo Personalizado</Text>
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
                  <Text style={styles.emptyStateText}>No tienes logros aún</Text>
                  <Text style={styles.emptyStateSubtext}>¡Completa objetivos para ganar puntos!</Text>
                </View>
              ) : (
                logros.map(renderAchievementCard)
              )}
            </View>
          )}

          {/* Botón de Celebración (para demo) */}
          <TouchableOpacity style={styles.celebrationButton} onPress={() => triggerCelebration('¡Demo de celebración!')}>
            <FontAwesome5 name="gift" size={20} color={Colors.white} />
            <Text style={styles.celebrationButtonText}>¡Celebrar Logro!</Text>
          </TouchableOpacity>
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
    ...getHeaderSize(),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getTitleFontSize(),
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: getSpacing(8),
  },
  headerSubtitle: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...getStatsBarSize(),
    backgroundColor: Colors.backgroundSecondary,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: getTitleFontSize(18),
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: getSpacing(4),
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  statLabel: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
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
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(),
    borderRadius: getBorderRadius(),
    padding: getSpacing(20),
    marginBottom: getSpacing(16),
  },
  objectiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  iconContainer: {
    ...getIconContainerSize(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(16),
  },
  objectiveInfo: {
    flex: 1,
  },
  objectiveTitle: {
    fontSize: getTitleFontSize(18),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(4),
  },
  objectiveDescription: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
  },
  statusBadge: {
    ...getBadgeSize(),
  },
  statusText: {
    fontSize: getSmallFontSize(),
    fontWeight: '600',
    color: Colors.textDark,
  },
  progressSection: {
    marginTop: getSpacing(16),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(8),
  },
  progressBar: {
    flex: 1,
    ...getProgressBarSize(),
    backgroundColor: Colors.borderLight,
    marginRight: getSpacing(12),
  },
  progressFill: {
    height: '100%',
    borderRadius: getBorderRadius(4),
  },
  progressText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
  },
  progressDetails: {
    alignItems: 'center',
  },
  progressAmount: {
    fontSize: getSmallFontSize(),
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.completed,
    padding: getSpacing(12),
    borderRadius: getBorderRadius(12),
    marginTop: getSpacing(16),
  },
  completedText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.success,
    marginLeft: getSpacing(8),
    flex: 1,
  },
  pointsText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.success,
  },
  failedSection: {
    backgroundColor: Colors.failed,
    padding: getSpacing(12),
    borderRadius: getBorderRadius(12),
    marginTop: getSpacing(16),
  },
  failedText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.danger,
    marginLeft: getSpacing(8),
  },
  failedReason: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginTop: getSpacing(4),
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
  generateButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(20),
    borderRadius: getBorderRadius(12),
    marginTop: getSpacing(20),
    gap: getGap(8),
  },
  generateButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  generateButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: getGap(12),
    marginTop: getSpacing(20),
  },
  customButton: {
    backgroundColor: Colors.white,
    borderWidth: getBorderWidth(),
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(20),
    borderRadius: getBorderRadius(12),
    flex: 1,
    gap: getGap(8),
  },
  customButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.primary,
  },
});