import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DashboardScreen {
  const features = [
    { id, title: 'Library', icon: 'library', color: '#3B82F6' },
    { id, title: 'Fees', icon: 'card', color: '#10B981' },
    { id, title: 'Hostel', icon: 'home', color: '#8B5CF6' },
    { id, title: 'Exams', icon: 'document-text', color: '#EF4444' },
    { id, title: 'Placements', icon: 'briefcase', color: '#F59E0B' },
    { id, title: 'QR Scanner', icon: 'qr-code', color: '#6366F1' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.name}>Student Name</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Books Borrowed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>₹2,500</Text>
          <Text style={styles.statLabel}>Fees Pending</Text>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity key={feature.id} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <Ionicons name={feature.icon } size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding,
    paddingTop,
  },
  greeting: {
    fontSize,
    color: '#6B7280',
  },
  name: {
    fontSize,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal,
    gap,
  },
  statCard: {
    flex,
    backgroundColor: '#FFFFFF',
    padding,
    borderRadius,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius,
    elevation,
  },
  statNumber: {
    fontSize,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize,
    color: '#6B7280',
    marginTop,
  },
  featuresContainer: {
    padding,
  },
  sectionTitle: {
    fontSize,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap,
  },
  featureCard: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    padding,
    borderRadius,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius,
    elevation,
  },
  featureIcon: {
    width,
    height,
    borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom,
  },
  featureTitle: {
    fontSize,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
});

export default DashboardScreen;
