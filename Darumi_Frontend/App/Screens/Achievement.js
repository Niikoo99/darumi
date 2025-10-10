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
        descripcion: `Meta: $${obj.valorObjetivo.toLocaleString()}`,
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
          : `Meta no cumplida. Objetivo: $${obj.targetValue?.toLocaleString() || 'N/A'}, Gastado: $${obj.finalValue?.toLocaleString() || 'N/A'}`,
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
        `${data.title}: Tu meta era $${data.targetValue?.toLocaleString()}, pero gastaste $${data.finalValue?.toLocaleString()}.`,
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
                ${objetivo.actual.toLocaleString()} / ${objetivo.meta.toLocaleString()}
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
          `Se han generado ${resultado.objetivos.length} objetivos personalizados basados en tu dinero disponible de $${resultado.dineroDisponible.toLocaleString()}.`,
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
                </View>
              ) : (
                objetivos.map(renderObjectiveCard)
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
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textDark,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
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
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  objectiveCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  objectiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  objectiveInfo: {
    flex: 1,
  },
  objectiveTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  objectiveDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  progressSection: {
    marginTop: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  progressDetails: {
    alignItems: 'center',
  },
  progressAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.completed,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 8,
    flex: 1,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  failedSection: {
    backgroundColor: Colors.failed,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  failedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.danger,
    marginLeft: 8,
  },
  failedReason: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  achievementCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  rareBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  pointsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  celebrationButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    marginTop: 20,
  },
  celebrationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -50 }],
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtext: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});