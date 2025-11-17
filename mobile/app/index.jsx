import { Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

export default function Index() {
  return (
    <Redirect href = "/signup"/>
  )
};

