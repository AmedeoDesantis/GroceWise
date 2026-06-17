// grocewise-frontend/app/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import FridgeAPI from '../services/api';

interface Nutrients {
  calories?: number;
  carbohydrates?: number;
  proteins?: number;
  fats?: number;
}

interface Product {
  db_id?: string;
  barcode: string;
  name: string;
  brand?: string;
  price: number;
  buy_date?: string;
  finish_date?: string;
  nutrients?: Nutrients;
  ingredients?: string[];
  weight?: number;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('0');
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unconsumed'>('unconsumed');

  useEffect(() => {
    loadProducts();
  }, [filterType]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data =
        filterType === 'unconsumed'
          ? await FridgeAPI.getUnconsumedProducts()
          : await FridgeAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile caricare i prodotti');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!barcode.trim()) {
      Alert.alert('Errore', 'Inserisci un barcode');
      return;
    }

    setLoading(true);
    try {
      await FridgeAPI.addProduct(barcode, parseFloat(price) || 0);
      setBarcode('');
      setPrice('0');
      Alert.alert('Successo', 'Prodotto aggiunto');
      loadProducts();
    } catch (error: any) {
      Alert.alert('Errore', error.response?.data?.detail || 'Errore nell\'aggiunta del prodotto');
    } finally {
      setLoading(false);
    }
  };

  const handleConsumeProduct = async (productId: string) => {
    setLoading(true);
    try {
      await FridgeAPI.consumeProduct(productId);
      Alert.alert('Successo', 'Prodotto marcato come consumato');
      loadProducts();
    } catch (error) {
      Alert.alert('Errore', 'Impossibile marcare il prodotto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setLoading(true);
    try {
      await FridgeAPI.deleteProduct(productId);
      Alert.alert('Successo', 'Prodotto eliminato');
      loadProducts();
    } catch (error) {
      Alert.alert('Errore', 'Impossibile eliminare il prodotto');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    Alert.alert('Conferma', 'Eliminare tutti i prodotti?', [
      { text: 'Annulla', onPress: () => { } },
      {
        text: 'Elimina',
        onPress: async () => {
          setLoading(true);
          try {
            await FridgeAPI.deleteAllProducts();
            Alert.alert('Successo', 'Tutti i prodotti eliminati');
            loadProducts();
          } catch (error) {
            Alert.alert('Errore', 'Impossibile eliminare i prodotti');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>GroceWise Fridge</Text>

      {/* Input sezione */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Aggiungi Prodotto</Text>
        <TextInput
          style={styles.input}
          placeholder="Barcode (8-13 caratteri)"
          value={barcode}
          onChangeText={setBarcode}
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Prezzo (opzionale)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.button, styles.addButton, loading && styles.disabled]}
          onPress={handleAddProduct}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Aggiungi</Text>
        </TouchableOpacity>
      </View>

      {/* Filtri */}
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === 'unconsumed' && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType('unconsumed')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === 'unconsumed' && styles.filterButtonTextActive,
            ]}
          >
            Non Consumati
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === 'all' && styles.filterButtonTextActive,
            ]}
          >
            Tutti
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista prodotti */}
      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}

      {!loading && products.length === 0 && (
        <Text style={styles.emptyText}>Nessun prodotto trovato</Text>
      )}

      {!loading &&
        products.map((product) => (
          <View key={product.db_id} style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              {product.brand && (
                <Text style={styles.productDetail}>Marca: {product.brand}</Text>
              )}
              <Text style={styles.productDetail}>Barcode: {product.barcode}</Text>
              <Text style={styles.productDetail}>Prezzo: €{product.price.toFixed(2)}</Text>
              {product.weight && (
                <Text style={styles.productDetail}>Peso: {product.weight}g</Text>
              )}
              {product.buy_date && (
                <Text style={styles.productDetail}>
                  Data acquisto: {new Date(product.buy_date).toLocaleDateString('it-IT')}
                </Text>
              )}
              {product.finish_date && (
                <Text style={styles.productDetail}>
                  Consumato: {new Date(product.finish_date).toLocaleDateString('it-IT')}
                </Text>
              )}
              {product.nutrients && (
                <>
                  {product.nutrients.calories && (
                    <Text style={styles.productDetail}>Calorie: {product.nutrients.calories} kcal</Text>
                  )}
                  {product.nutrients.proteins && (
                    <Text style={styles.productDetail}>Proteine: {product.nutrients.proteins}g</Text>
                  )}
                  {product.nutrients.carbohydrates && (
                    <Text style={styles.productDetail}>Carboidrati: {product.nutrients.carbohydrates}g</Text>
                  )}
                  {product.nutrients.fats && (
                    <Text style={styles.productDetail}>Grassi: {product.nutrients.fats}g</Text>
                  )}
                </>
              )}
              {product.ingredients && product.ingredients.length > 0 && (
                <Text style={styles.productDetail}>Ingredienti: {product.ingredients.slice(0, 3).join(', ')}{product.ingredients.length > 3 ? '...' : ''}</Text>
              )}
            </View>
            <View style={styles.productActions}>
              {!product.finish_date && (
                <TouchableOpacity
                  style={[styles.button, styles.consumeButton]}
                  onPress={() => handleConsumeProduct(product.db_id!)}
                >
                  <Text style={styles.buttonText}>Consuma</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => handleDeleteProduct(product.db_id!)}
              >
                <Text style={styles.buttonText}>Elimina</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

      {/* Delete All button */}
      {!loading && products.length > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.deleteAllButton]}
          onPress={handleDeleteAll}
        >
          <Text style={styles.buttonText}>Elimina Tutti</Text>
        </TouchableOpacity>
      )}

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 16,
    color: '#333',
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  filterSection: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#34C759',
  },
  consumeButton: {
    backgroundColor: '#FF9500',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flex: 1,
  },
  deleteAllButton: {
    backgroundColor: '#FF3B30',
    marginTop: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  loader: {
    marginVertical: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginVertical: 24,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  productDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  spacer: {
    height: 32,
  },
});