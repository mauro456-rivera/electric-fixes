import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importar las screens (las crearemos después)
import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import RegisterProblemScreen from '../screens/RegisterProblemScreen';
import SearchSolutionsScreen from '../screens/SearchSolutionsScreen';
import ViewRecordsScreen from '../screens/ViewRecordsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false, // Sin header por defecto
          contentStyle: { backgroundColor: '#0A1628' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="RegisterProblem" component={RegisterProblemScreen} />
        <Stack.Screen name="ViewRecords" component={ViewRecordsScreen} />
        <Stack.Screen name="SearchSolutions" component={SearchSolutionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;