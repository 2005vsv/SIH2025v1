import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ProfileScreen {
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
    label;
    value;
    field;
    keyboardType?;
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
    flex,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding,
    paddingTop,
    alignItems: 'center',
  },
  avatarContainer: {
    width,
    height,
    borderRadius,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom,
  },
  name: {
    fontSize,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  studentId: {
    fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal,
    paddingVertical,
    borderRadius,
    marginTop,
  },
  editButtonText: {
    color: '#FFFFFF',
    marginLeft,
    fontWeight: '600',
  },
  content: {
    padding,
  },
  sectionTitle: {
    fontSize,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom,
  },
  fieldContainer: {
    marginBottom,
  },
  fieldLabel: {
    fontSize,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom,
  },
  fieldValue: {
    fontSize,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    padding,
    borderRadius,
    borderWidth,
    borderColor: '#E5E7EB',
  },
  fieldInput: {
    fontSize,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    padding,
    borderRadius,
    borderWidth,
    borderColor: '#3B82F6',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding,
    borderRadius,
    marginTop,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize,
    fontWeight: '600',
    marginLeft,
  },
  achievementsSection: {
    marginTop,
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    padding,
    borderRadius,
    shadowColor: '#000',
    shadowOffset: { width, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius,
    elevation,
  },
  achievementHeader: {
    alignItems: 'center',
    marginBottom,
  },
  achievementTitle: {
    fontSize,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  achievementLevel: {
    fontSize,
    color: '#6B7280',
    marginTop,
  },
  badgesContainer: {
    alignItems: 'center',
  },
  badgesTitle: {
    fontSize,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom,
  },
  badges: {
    flexDirection: 'row',
    gap,
  },
  badge: {
    fontSize,
  },
});

export default ProfileScreen;
