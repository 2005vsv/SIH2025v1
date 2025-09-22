import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@student.edu',
    studentId: 'ST2023001',
    phone: '+1234567890',
    department: 'Computer Science',
    semester: '6',
  });

  const handleSave = () => {
    Alert.alert('Success', 'Profile updated successfully!');
    setIsEditing(false);
  };

  const ProfileField = ({ label, value, field, keyboardType = 'default' }: {
    label: string;
    value: string;
    field: string;
    keyboardType?: any;
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={(text) => setProfile({ ...profile, [field]: text })}
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.fieldValue}>{value}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={60} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.studentId}>ID: {profile.studentId}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons 
            name={isEditing ? "close" : "pencil"} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <ProfileField label="Full Name" value={profile.name} field="name" />
        <ProfileField label="Email" value={profile.email} field="email" keyboardType="email-address" />
        <ProfileField label="Phone" value={profile.phone} field="phone" keyboardType="phone-pad" />
        <ProfileField label="Department" value={profile.department} field="department" />
        <ProfileField label="Semester" value={profile.semester} field="semester" keyboardType="numeric" />

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Text style={styles.achievementTitle}>1,250 Points</Text>
              <Text style={styles.achievementLevel}>Level: Bronze</Text>
            </View>
            <View style={styles.badgesContainer}>
              <Text style={styles.badgesTitle}>Badges Earned</Text>
              <View style={styles.badges}>
                <Text style={styles.badge}>📚</Text>
                <Text style={styles.badge}>💰</Text>
                <Text style={styles.badge}>🏠</Text>
                <Text style={styles.badge}>📝</Text>
                <Text style={styles.badge}>🎯</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  studentId: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  editButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldInput: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  achievementsSection: {
    marginTop: 32,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  achievementLevel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  badgesContainer: {
    alignItems: 'center',
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
  },
  badge: {
    fontSize: 32,
  },
});

export default ProfileScreen;