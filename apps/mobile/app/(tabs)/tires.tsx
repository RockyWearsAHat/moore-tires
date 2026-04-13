import { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useMobileAuth } from '../../src/context/AuthContext';
import { colors, spacing, typography } from '../../src/theme';

interface TireProduct {
  id: string;
  brand: string;
  tireModel: string;
  formattedSize: string;
  type: string;
  baseRetailPrice: number;
  loadIndex?: number;
  speedRating?: string;
  plyRating?: number;
}

const SIZES = ['All', '11R24.5', '11R22.5', 'LP 24.5', 'LP 22.5', '445/50R22.5', '10.00-20', '255/70R22.5'];

export default function TiresScreen() {
  const { apiFetch, user } = useMobileAuth();
  const [products, setProducts] = useState<TireProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSize, setActiveSize] = useState('All');

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      if (activeSize !== 'All') params.set('size', activeSize);

      const res = await apiFetch(`/api/v1/products?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { data: TireProduct[] };
        setProducts(json.data ?? []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFetch, search, activeSize]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    void fetchProducts();
  };

  const renderProduct = ({ item }: { item: TireProduct }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.model}>{item.tireModel}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>${item.baseRetailPrice.toFixed(2)}</Text>
        </View>
      </View>
      <View style={styles.specRow}>
        <View style={styles.specChip}>
          <Text style={styles.specText}>{item.formattedSize}</Text>
        </View>
        <View style={styles.specChip}>
          <Text style={styles.specText}>{item.type.replace(/_/g, ' ')}</Text>
        </View>
        {item.plyRating ? (
          <View style={styles.specChip}>
            <Text style={styles.specText}>{item.plyRating}PR</Text>
          </View>
        ) : null}
      </View>
      {user && (
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>Add to Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search tires…"
          placeholderTextColor={colors.platinum[600]}
          returnKeyType="search"
          onSubmitEditing={() => void fetchProducts()}
        />
      </View>

      {/* Size filter chips */}
      <FlatList
        horizontal
        data={SIZES}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={styles.chipList}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item: size }) => (
          <TouchableOpacity
            style={[styles.chip, activeSize === size && styles.chipActive]}
            onPress={() => setActiveSize(size)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, activeSize === size && styles.chipTextActive]}>
              {size}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Products */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.flame[500]} size="large" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          renderItem={renderProduct}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.flame[500]}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No tires found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },
  searchBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.onyx[700],
  },
  searchInput: {
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[600],
    color: colors.platinum[50],
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipList: { maxHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.onyx[700] },
  chip: {
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[600],
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: spacing.xs,
    marginVertical: spacing.xs,
  },
  chipActive: { backgroundColor: colors.flame[500], borderColor: colors.flame[500] },
  chipText: { fontSize: 11, fontWeight: '700', color: colors.platinum[400], textTransform: 'uppercase', letterSpacing: 1 },
  chipTextActive: { color: '#FFFFFF' },
  card: {
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[700],
    padding: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  brand: { ...typography.label, color: colors.flame[500], fontSize: 10 },
  model: { ...typography.displayMd, color: colors.platinum[50], fontSize: 18, marginTop: 2 },
  priceBadge: { backgroundColor: colors.flame[500], paddingHorizontal: 10, paddingVertical: 4 },
  priceText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  specRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', marginBottom: spacing.sm },
  specChip: {
    backgroundColor: colors.onyx[700],
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  specText: { fontSize: 10, fontWeight: '600', color: colors.platinum[400], textTransform: 'uppercase', letterSpacing: 0.5 },
  addBtn: {
    backgroundColor: colors.flame[500],
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  addBtnText: { ...typography.label, color: '#FFFFFF', fontSize: 11 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyText: { ...typography.body, color: colors.platinum[600] },
});
