import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import Colors from '../../../assets/shared/Colors';
import { buildApiUrl, getEndpoints } from '../../../config/api';
import app from './../../../assets/images/darumi.png';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { formatCurrency } from '../../../utils/formatting';
import { 
  scaleSize, 
  getBodyFontSize, 
  getTitleFontSize,
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth,
  getIconSize,
  getMaxWidth
} from '../../../utils/scaling';

export default function MonthInfo({ onEditItem }) {
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const currentDate = new Date();
  const currentMonth = capitalizeFirstLetter(
    currentDate.toLocaleString('default', { month: 'long' })
  ); // Obtiene el nombre del mes actual
  const currentYear = currentDate.getFullYear(); // Obtiene el año actual

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2');
  const { isLoaded, isSignedIn, user } = useUser();
  const [selectedItems, setSelectedItems] = useState([]);
  const [showExpenses, setShowExpenses] = useState(true); // State variable to control visibility  
  const [selectedItem, setSelectedItem] = useState(null); // State variable to track selected item for editing
  const [editedTitle, setEditedTitle] = useState(''); // State variable to store edited title
  const [editedDetail, setEditedDetail] = useState(''); // State variable to store edited detail
  const [editedAmount, setEditedAmount] = useState(0); // State variable to store edited amount

  useEffect(() => {
    const fetchData = async () => {
      if (isSignedIn) {
        setLoading(true);
        try {
          const response = await axios.get(buildApiUrl(getEndpoints().GASTOS + '/'), { params: { Id_Usuario: user.id } });
          setData(response.data);
          setFilteredData(response.data); // Initialize filtered data with all data
        } catch (error) {
          setError(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isSignedIn, user]);

  const handleEditItem = (item) => {
    setSelectedItem(item); // Set the selected item for editing
    setEditModalVisible(true); // Show the edit modal
    setEditedTitle(item.Titulo_gasto); // Initialize edited title with current item title
    setEditedDetail(item.Detalle_gasto); // Initialize edited detail with current item detail
    setEditedAmount(item.Monto_gasto.toString()); // Initialize edited amount with current item amount
  };

  const handleUpdateItem = async () => {
    try {
      // Send a PUT request to update the item
      await axios.put(buildApiUrl(getEndpoints().GASTOS + `/${selectedItem.id}`), {
        Titulo_gasto: editedTitle,
        Detalle_gasto: editedDetail,
        Monto_gasto: editedAmount,
      });
      // Update the local data with the edited item
      const updatedData = data.map(item => {
        if (item.id === selectedItem.id) {
          return {
            ...item,
            Titulo_gasto: editedTitle,
            Detalle_gasto: editedDetail,
            Monto_gasto: editedAmount,
          };
        }
        return item;
      });
      setData(updatedData);
      setFilteredData(updatedData);
      setEditModalVisible(false); // Hide the edit modal after successful update
    } catch (error) {
      console.error('Error updating item:', error);
      // Handle error
    }
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = data.filter(item =>
      item.Titulo_gasto.toLowerCase().includes(query.toLowerCase()) || // Adjust as needed
      item.Detalle_gasto.toLowerCase().includes(query.toLowerCase()) ||
      item.Nombre_categoria.toLowerCase().includes(query.toLowerCase())
    );
    applyMonthFilter(filtered); // Apply month filter after search filter
  };

  const applyMonthFilter = (items) => {
    if (selectedMonth) {
      const filtered = items.filter(item => {
        const itemMonth = new Date(item.Fecha_creacion_gasto).getMonth() + 1; // Month is zero-indexed, so add 1
        console.log('itemMonth Value:', itemMonth);
        console.log('selectedMonth Value:', selectedMonth);
        return itemMonth.toString() === '2'.toString(); // Compare as strings to ensure strict equality
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(items);
    }
  };

  const handleRefresh = async () => {
    setSearchQuery('');
    setSelectedMonth('');
    setLoading(true); // Set loading state to true to show the loading indicator
    try {
      const response = await axios.get(buildApiUrl(getEndpoints().GASTOS + '/'), { params: { Id_Usuario: user.id } });
      setData(response.data);
      setFilteredData(response.data);
      setError(null); // Clear any previous error
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false); // Set loading state to false after fetching data
    }
  };

  // Array of months for the picker
  const months = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.canary} />;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  const selectedTotal = selectedItems.reduce((total, itemId) => {
    const selectedItem = data.find(item => item.id === itemId); // Assuming data is your list of items
    return total + selectedItem.Monto_gasto; // Adjust this based on your data structure
  }, 0);

  const handleToggleVisibility = () => {
    setShowExpenses(!showExpenses); // Toggle the visibility state
  };

  const renderItem = ({ item }) => {
    if (!item) {
      return null; // Return null if item is undefined
    }

    const isSelected = selectedItems.includes(item.id); // Assuming each item has a unique identifier like 'id'
  
    const itemStyle = {
      // backgroundColor: isSelected ? '#e0e0e0' : 'transparent', // Change background color based on selection
      // Apply different background color for items from different months
      // Check if the month of the item's creation date matches the current month
      backgroundColor: new Date(item.Fecha_creacion_gasto).getMonth() + 1 === currentDate.getMonth() + 1 ? 'white' : 'lightgray'
    };

    const toggleSelection = (itemId) => {
      setSelectedItems(prevSelectedItems => {
        if (prevSelectedItems.includes(itemId)) {
          return prevSelectedItems.filter(id => id !== itemId);
        } else {
          return [...prevSelectedItems, itemId];
        }
      });
    };

    const amountStyle = item.Monto_gasto < 0 ? styles.negativeAmount : styles.positiveAmount;
  
    let iconComponent;
    switch (item.Nombre_categoria.toLowerCase()) {
      case 'comida/restaurante':
        iconComponent = <Icon name="hamburger" size={24} color="black" style={styles.icon} />;
        break;
      case 'transporte':
        iconComponent = <Icon name="car" size={24} color="black" style={styles.icon} />;
        break;
      case 'entretenimiento':
        iconComponent = <Icon name="gamepad" size={24} color="black" style={styles.icon} />;
        break;
      case 'combustibles':
        iconComponent = <Icon name="gas-pump" size={24} color="black" style={styles.icon} />;
        break;
      case 'mecanica':
        iconComponent = <Icon name="cog" size={24} color="black" style={styles.icon} />;
        break;
      case 'vestimenta/calzado':
        iconComponent = <Icon name="socks" size={24} color="black" style={styles.icon} />;
        break;
      case 'hogar':
        iconComponent = <Icon name="home" size={24} color="black" style={styles.icon} />;
        break;
      case 'ingresos':
          iconComponent = <Icon name="dollar-sign" size={24} color="black" style={styles.icon} />;
          break;
      case 'varios':
        iconComponent = <Icon name="cash-register" size={24} color="black" style={styles.icon} />;
        break;
      default:
        iconComponent = <Icon name="bag-shopping" size={24} color="black" style={styles.icon} />; // Default icon
        break;
    }
    
    const isEditable = new Date(item.Fecha_creacion_gasto).getMonth() + 1 === currentDate.getMonth() + 1;
  
    return (
      <TouchableOpacity onPress={() => toggleSelection(item.id)} onLongPress={() => isEditable && onEditItem(item)}>
      <View style={[styles.itemContainer, isSelected && styles.selectedItem, itemStyle]}>
        <View style={styles.iconContainer}>{iconComponent}</View>
        <View style={styles.itemDetails}>
          <View style={styles.itemRow}>
            <View style={styles.titleContainer}>
              <Text style={styles.itemTitle}>{item.Titulo_gasto}</Text>
              <Text style={styles.itemDetail}>{formatDate(item.Fecha_creacion_gasto)}</Text>
            </View>
            {showExpenses && (
            <View>  
              <Text style={[styles.itemAmount, amountStyle]}>{formatCurrency(item.Monto_gasto)}</Text> 
            </View>)}
          </View>
          <Text style={styles.itemDetail}>{item.Detalle_gasto}</Text>
        </View>
      </View>      
    </TouchableOpacity>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    return new Intl.DateTimeFormat('es-AR', options).format(date);
  };

  // Calculate total expenses
  const totalExpenses = filteredData.reduce((acc, item) => acc + parseFloat(item.Monto_gasto), 0);
  const totalPositiveExpenses = filteredData.reduce((acc, item) => {
    return item.Monto_gasto < 0 ? acc + parseFloat(item.Monto_gasto) : acc;
  }, 0);  
  const totalNegativeExpenses = filteredData.reduce((acc, item) => {
    return item.Monto_gasto > 0 ? acc + parseFloat(item.Monto_gasto) : acc;
  }, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar..."
        />
        <Picker
          selectedValue={selectedMonth}
          style={styles.monthPicker}
          onValueChange={(itemValue) => {
            setSelectedMonth(itemValue);
            applyMonthFilter(data);
          }}
        >
          {months.map(month => (
            <Picker.Item key={month.value} label={month.label} value={month.value} color="black" />
          ))}
        </Picker>
        <View style={[styles.refreshIconContainer, styles.iconContainer]}>
          <TouchableOpacity onPress={handleRefresh}>
            <Image source={require('../../../assets/refreshicon.png')} style={styles.refreshIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleToggleVisibility} style={styles.toggleButton}>
        <Icon name={showExpenses ? 'eye' : 'eye-slash'} size={24} color="black" />
      </TouchableOpacity>
      </View>
      {showExpenses && (
        <View style={styles.totalsContainer}>
        <View style={styles.totalColumn}>
          <Text style={styles.totalLabel}>Gastos</Text>
          <Text style={styles.negativeAmountTotal}>{formatCurrency(totalPositiveExpenses)}</Text>
        </View>
        <View style={styles.totalColumn}>
          <Text style={styles.totalLabel}>Ingresos</Text>
          <Text style={styles.positiveAmountTotal}>{formatCurrency(totalNegativeExpenses)}</Text>
        </View>
        <View style={styles.totalColumn}>
          <Text style={styles.totalLabel}>Balance</Text>
          <Text style={totalExpenses > 0 ? styles.positiveAmountTotal : styles.negativeAmountTotal}>{formatCurrency(totalExpenses)}</Text>
        </View></View>
      )}
      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        extraData={selectedItems}
        style={styles.flatList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: getSpacing(10),
    backgroundColor: '#f5f5f5',
    width: '95%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: getSpacing(10),
  },
  searchInput: {
    flex: 1,
    height: scaleSize(40),
    borderWidth: getBorderWidth(),
    borderColor: '#ccc',
    borderRadius: getBorderRadius(5),
    paddingHorizontal: getSpacing(10),
    marginRight: getSpacing(10),
  },
  monthPicker: {
    height: scaleSize(40),
    width: '40%',
    borderColor: '#007bff',
    borderWidth: getBorderWidth(),
    paddingHorizontal: getSpacing(10),
    color: 'black',
  },
  flatList: {    
    marginTop: getSpacing(10),
    width: '100%', // Adjusted to take up the full width
    maxHeight: '75%', // Adjusted to set maximum height
  },  
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(10),
    paddingHorizontal: getSpacing(10), // Optional: Add horizontal padding
    paddingVertical: getSpacing(5), // Optional: Add vertical padding
    borderWidth: getBorderWidth(2), // Add a thin border
    borderColor: Colors.lightGray, // Set the border color
    borderRadius: getBorderRadius(5), // Optional: Add border radius for rounded corners
  },
  appImage: {
    width: scaleSize(50),
    height: scaleSize(50),
    borderRadius: getBorderRadius(25),
    marginRight: getSpacing(10),
  },
  itemDetails: {
    flex: 1,
    marginLeft: getSpacing(10),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
  },
  itemTitle: {
    fontSize: getTitleFontSize(18),
    fontWeight: 'bold',
  },
  itemDetail: {
    fontSize: getBodyFontSize(),
  },
  itemDate: {
    fontSize: scaleSize(14),
    fontWeight: 'semibold',
    color: '#000',
  },
  itemAmount: {
    fontSize: scaleSize(14),
    fontWeight: 'bold',
    textAlign: 'right',
    flexWrap: 'wrap',
    maxWidth: getMaxWidth(80),
  },
  refreshIconContainer: {
    alignSelf: 'center', // Center the refresh icon vertically
  },
  refreshButton: {
    padding: getSpacing(10), // Add padding to make the button clickable
  },
  refreshIcon: {
    width: getIconSize(24),
    height: getIconSize(24),
    resizeMode: 'contain', // Ensure the icon fits within the TouchableOpacity
    padding: getSpacing(10),
    backgroundColor: Colors.primary, // Change the button background color
    borderRadius: getBorderRadius(5), // Optional: Add border radius for rounded corners
  },
  iconContainer: {
    width: scaleSize(50), // Adjust the width to fit the icon size
    alignItems: 'center',
    marginRight: getSpacing(15),
    padding: getSpacing(10),
    backgroundColor: Colors.primary, // Change the button background color
    borderRadius: getBorderRadius(5), // Optional: Add border radius for rounded corners
  },
  icon: {
    height: getIconSize(24), // Set the height of the icon    
  },
  positiveAmount: {
    color: 'green',
  },
  negativeAmount: {
    color: 'red',
  },
  toggleButton: {
    marginBottom: getSpacing(10),
  },
  positiveAmountTotal: {
    fontSize: scaleSize(14),
    fontWeight: 'bold',
    marginBottom: getSpacing(2),
    color: 'green',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  negativeAmountTotal: {
    fontSize: scaleSize(14),
    fontWeight: 'bold',
    marginBottom: getSpacing(2),
    color: 'red',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(10),
    width: '100%',
  },
  totalColumn: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: getBodyFontSize(),
    fontWeight: 'bold',
    marginBottom: getSpacing(2),
  },
  selectedItem: {
    backgroundColor: '#e0e0e0',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
    