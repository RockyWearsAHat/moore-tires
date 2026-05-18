import { type ComponentProps, useEffect, useState, useCallback } from 'react';
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMobileAuth } from '../../src/context/AuthContext';
import { colors, radii, shadow, spacing, typography } from '../../src/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

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

const SIZE_ICONS: Record<string, IoniconName> = {
  All: 'apps-outline',
};
const SIZES = ['All', '11R24.5', '11R22.5', 'LP 24.5', 'LP 22.5', '445/50R22.5', '10.00-20', '255/70R22.5'];

const TIRE_TYPE_COLORS: Record<string, string> = {
  DRIVE: '#8B5CF6',
  STEER: '#3B82F6',
  TRAILER: '#10B981',
  ALL_POSITION: '#F59E0B',
};

export default function TiresScreen() {
  const { apiFetch, user } = useMobileAuth();
  const [products, setProducts] = useState<TireProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSize, setActiveSize] = useState('All');
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setError('');
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      if (activeSize !== 'All') params.set('size', activeSize);

      const res = await apiFetch(`/api/v1/products?${params.toString()}`);
      if (res.ok) {
        const json = (await res.json()) as { data: TireProduct[] };
        setProducts(json.data ?? []);
      } else {
        setError('Failed to load products.');
      }
    } catch {
      setError('Network error — could not load products.');
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

  const typeColor = (t: string) => TIRE_TYPE_COLORS[t] ?? colors.platinum[400];

  const renderProduct = ({ item }: { item: TireProduct }) => (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.model} numberOfLines={1}>{item.tireModel}</Text>
        </View>
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>${item.baseRetailPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.specRow}>
        <View style={[styles.typePill, { backgroundColor: typeColor(item.type) + '22', borderColor: typeColor(item.type) + '55' }]}>
          <Text style={[styles.typeText, { color: typeColor(item.type) }]}>{item.type.replace(/_/g, ' ')}</Text>
        </View>
        <View style={styles.specChip}>
          <Ionicons name="resize-outline" size={10} color={colors.platinum[600]} />
          <Text style={styles.specText}>{item.formattedSize}</Text>
        </View>
        {item.plyRating != null && (
          <View style={styles.specChip}>
            <Text style={styles.specText}>{item.plyRating}PR</Text>
          </View>
        )}
      </View>

      {user && (
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.85}
          onPress={() => router.push({
            pathname: '/(tabs)/book',
            params: { productId: item.id, productName: `${item.brand} ${item.tireModel}`, size: item.formattedSize },
          })}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.brand} ${item.tireModel} to order`}
        >
          <Ionicons name="add" size={14} color="#FFF" />
          <Text style={styles.addBtnText}>Add to Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.platinum[600]} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Brand, model or size…"
            placeholderTextColor={colors.platinum[600]}
            returnKeyType="search"
            onSubmitEditing={() => void fetchProducts()}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={12}>
              <Ionicons name="close-circle" size={16} color={colors.platinum[600]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Size filter pills */}
      <FlatList
        horizontal
        data={SIZES}
        keyExtractor={(s) => s}
        showsHorizontalScrollIndicator={false}
        style={styles.pillStrip}
        contentContainerStyle={styles.pillContent}
        renderItem={({ item: size }) => (
          <TouchableOpacity
            style={[styles.pill, activeSize === size && styles.pillActive]}
            onPress={() => setActiveSize(size)}
            activeOpacity={0.75}
          >
            {SIZE_ICONS[size] && (
              <Ionicons
                name={SIZE_ICONS[size]}
                size={11}
                color={activeSize === size ? '#FFF' : colors.platinum[600]}
              />
            )}
            <Text style={[styles.pillText, activeSize === size && styles.pillTextActive]}>
              {size}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Content */}
      {error ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.platinum[700]} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => void fetchProducts()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.flame[500]} size="large" />
          <Text style={styles.loadingText}>Loading tires…</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          renderItem={renderProduct}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.flame[500]} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={40} color={colors.platinum[700]} />
              <Text style={styles.emptyText}>No tires found</Text>
              <Text style={styles.emptyHint}>Try a different search or size filter</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.onyx[900] },

  searchWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.onyx[700],
  },
  searchBar: {
    backgroundColor: colors.onyx[800],
    borderWidth: 1,
    borderColor: colors.onyx[600],
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    height: 42,
  },
  searchInput: {
    flex: 1,
    color: colors.platinum[50],
    fontSize: 14,
    paddingVertical: 0,
  },

  pillStrip: { maxHeight: 50, borderBottomWidth: 1, borderBottomColor: colors.onyx[700] },
  pillContent: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.onyx[700],
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillActive: { backgroundColor: colors.flame[500] },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.platinum[600], letterSpacing: 0.3 },
  pillTextActive: { color: '#FFFFFF' },

  list: { padding: spacing.md, gap: spacing.sm },

  card: {
    backgroundColor: colors.onyx[800],
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.onyx[700],
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm, gap: spacing.sm },
  brand: { ...typography.label, color: colors.flame[500], fontSize: 9 },
  model: { ...typography.displaySm, color: colors.platinum[50], marginTop: 2 },
  pricePill: {
    backgroundColor: colors.flame[500] + '1A',
    borderWidth: 1,
    borderColor: colors.flame[500] + '55',
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceText: { fontSize: 14, fontWeight: '800', color: colors.flame[400] },

  specRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap', marginBottom: spacing.sm, alignItems: 'center' },
  typePill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  specChip: {
    backgroundColor: colors.onyx[700],
    borderRadius: radii.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  specText: { fontSize: 10, fontWeight: '600', color: colors.platinum[400], letterSpacing: 0.3 },

  addBtn: {
    backgroundColor: colors.flame[500],
    borderRadius: radii.sm,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  addBtnText: { ...typography.label, color: '#FFFFFF', fontSize: 11 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  loadingText: { ...typography.small, color: colors.platinum[600], marginTop: spacing.sm },
  errorText: { ...typography.body, color: '#EF4444', textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.onyx[700],
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  retryText: { ...typography.label, color: colors.platinum[100], fontSize: 11 },
  emptyText: { ...typography.displaySm, color: colors.platinum[400], textAlign: 'center' },
  emptyHint: { ...typography.small, color: colors.platinum[700], textAlign: 'center' },
});
