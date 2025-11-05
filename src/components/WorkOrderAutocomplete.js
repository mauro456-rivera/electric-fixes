import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useWorkOrders } from '../context/WorkOrderContext';
import { colors } from '../styles/colors';

const WorkOrderAutocomplete = ({ value, onSelect, placeholder = "Buscar Work Order" }) => {
  const { searchWorkOrders, loading: globalLoading, workOrders, refreshWorkOrders } = useWorkOrders();
  const [searchText, setSearchText] = useState(value || 'WO-TA-');
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Los work orders se cargan automáticamente en WorkOrderContext
  // No necesitamos cargarlos aquí

  // Filtrar work orders cuando cambia el texto
  useEffect(() => {
    // Solo buscar si hay algo después de "WO-TA-"
    if (searchText.length > 7) {
      // Solo buscar si los work orders ya están cargados
      if (!globalLoading && workOrders.length > 0) {
        const results = searchWorkOrders(searchText, 5);
        setFilteredWorkOrders(results);
        setShowDropdown(true);
      } else if (globalLoading) {
        // Mostrar que está cargando
        setShowDropdown(true);
        setFilteredWorkOrders([]);
      }
    } else {
      setFilteredWorkOrders([]);
      setShowDropdown(false);
    }
  }, [searchText, globalLoading, workOrders]);

  const handleSelect = (workOrder) => {
    const displayText = workOrder.code || workOrder.id?.toString() || '';
    setSearchText(displayText);
    setShowDropdown(false);
    onSelect(displayText, workOrder);
  };

  const handleChangeText = (text) => {
    // Asegurar que siempre comience con "WO-TA-"
    if (!text.startsWith('WO-TA-')) {
      setSearchText('WO-TA-');
      return;
    }
    setSearchText(text);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.dropdownItemCode}>
        {item.code || item.id}
      </Text>
      {item.description && (
        <Text style={styles.dropdownItemDescription} numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={searchText}
          onChangeText={handleChangeText}
          onFocus={() => searchText.length > 0 && setShowDropdown(true)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {globalLoading && (
          <ActivityIndicator 
            size="small" 
            color={colors.primary} 
            style={styles.loader}
          />
        )}
        {searchText.length > 7 && !globalLoading && (
          <TouchableOpacity
            onPress={() => {
              setSearchText('WO-TA-');
              setShowDropdown(false);
              onSelect('WO-TA-', null);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dropdown con FlatList */}
      {showDropdown && filteredWorkOrders.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={filteredWorkOrders}
            keyExtractor={(item, index) => item.id?.toString() || `wo-${index}`}
            renderItem={renderItem}
            style={styles.list}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            maxToRenderPerBatch={5}
            windowSize={3}
          />
        </View>
      )}

      {/* Mensaje cuando no hay resultados */}
      {showDropdown && filteredWorkOrders.length === 0 && searchText.length > 7 && !globalLoading && (
        <View style={styles.dropdown}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron Work Orders</Text>
          </View>
        </View>
      )}
      
      {/* Mensaje de carga inicial */}
      {globalLoading && searchText.length > 7 && (
        <View style={styles.dropdown}>
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando work orders...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  list: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dropdownItemDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
});

export default WorkOrderAutocomplete;