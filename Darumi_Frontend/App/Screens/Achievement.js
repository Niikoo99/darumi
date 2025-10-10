import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Image
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';

const { width } = Dimensions.get('window');

export default function Achievement() {
  const [selectedTab, setSelectedTab] = useState('objetivos');
  const [selectedObjective, setSelectedObjective] = useState(null);
  
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

  // Datos de ejemplo para objetivos
  const objetivos = [
    {
      id: 1,
      titulo: "Reducir gastos en Entretenimiento",
      descripcion: "Limitar gastos en entretenimiento a $5,000 este mes",
      estado: "En progreso",
      progreso: 75,
      meta: 5000,
      actual: 1250,
      fechaCreacion: "2024-01-01",
      puntos: 100,
      icono: "gamepad",
      color: Colors.warning,
    },
    {
      id: 2,
      titulo: "Ahorrar para vacaciones",
      descripcion: "Ahorrar $15,000 para las vacaciones de verano",
      estado: "Cumplido",
      progreso: 100,
      meta: 15000,
      actual: 15000,
      fechaCreacion: "2023-12-01",
      puntos: 200,
      icono: "plane",
      color: Colors.success,
    },
    {
      id: 3,
      titulo: "Pagar deudas",
      descripcion: "Reducir deudas en $8,000 este trimestre",
      estado: "Fallido",
      progreso: 45,
      meta: 8000,
      actual: 3600,
      fechaCreacion: "2023-11-01",
      puntos: 0,
      icono: "credit-card",
      color: Colors.danger,
    },
  ];

  // Datos de ejemplo para logros
  const logros = [
    {
      id: 1,
      titulo: "Primer Ahorro",
      descripcion: "Completaste tu primer objetivo de ahorro",
      fechaObtenido: "2023-12-15",
      puntos: 50,
      icono: "trophy",
      color: Colors.primary,
      raro: false,
    },
    {
      id: 2,
      titulo: "Ahorrador Experto",
      descripcion: "Ahorraste más de $10,000 en un mes",
      fechaObtenido: "2024-01-20",
      puntos: 150,
      icono: "medal",
      color: Colors.success,
      raro: true,
    },
    {
      id: 3,
      titulo: "Consistencia",
      descripcion: "Completaste 5 objetivos consecutivos",
      fechaObtenido: "2024-01-25",
      puntos: 300,
      icono: "star",
      color: Colors.warning,
      raro: false,
    },
  ];

  const triggerCelebration = () => {
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
  };

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

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{objetivos.length}</Text>
        <Text style={styles.statLabel}>Objetivos</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {objetivos.filter(o => o.estado === "Cumplido").length}
        </Text>
        <Text style={styles.statLabel}>Completados</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>
          {logros.reduce((total, logro) => total + logro.puntos, 0)}
        </Text>
        <Text style={styles.statLabel}>Puntos</Text>
      </View>
    </View>
  );

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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {selectedTab === 'objetivos' && (
            <View>
              <Text style={styles.sectionTitle}>🎯 Mis Objetivos</Text>
              {objetivos.map(renderObjectiveCard)}
            </View>
          )}

          {selectedTab === 'logros' && (
            <View>
              <Text style={styles.sectionTitle}>🏆 Mis Logros</Text>
              {logros.map(renderAchievementCard)}
          </View>
        )}

          {/* Botón de Celebración (para demo) */}
          <TouchableOpacity style={styles.celebrationButton} onPress={triggerCelebration}>
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
});