import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ImageResult {
  link: string;
  title: string;
  thumbnailLink: string;
}

interface ImageSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelected: (imageUrl: string) => void;
  initialQuery?: string;
  itemType?: string;
}

export const ImageSearchModal: React.FC<ImageSearchModalProps> = ({
  visible,
  onClose,
  onImageSelected,
  initialQuery = '',
  itemType = 'item',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [startIndex, setStartIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Import SerpApi configuration
  // Note: In a real app, you'd import this from a config file
  // For demo purposes, keeping it simple here
  const SERPAPI_KEY = 'ec01683685b82e0e8f0846e42bf32786b91f8f5fed82677af6a20d7873e34a99'; // Replace with your actual key

  const searchImages = async (query: string, start: number = 1, append: boolean = false) => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const results = await searchGoogleImages(query, start);
      
      if (append) {
        setImages(prev => [...prev, ...results]);
      } else {
        setImages(results);
      }
      
      setStartIndex(start);
      setHasMore(results.length === 6); // Check if we got a full page
    } catch (error) {
      console.error('Image search error:', error);
      Alert.alert('Error', 'Failed to search for images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SerpApi Google Image Search
  const searchGoogleImages = async (query: string, start: number): Promise<ImageResult[]> => {
    try {
      // If no API key is set, use fallback
      if (!SERPAPI_KEY || SERPAPI_KEY === 'YOUR_SERPAPI_KEY') {
        console.log('No SerpApi key found, using fallback images...');
        return mockImageSearch(query, Math.ceil(start / 6));
      }

      const params = new URLSearchParams({
        engine: 'google',
        q: query,
        tbm: 'isch', // Image search
        api_key: SERPAPI_KEY,
        start: start.toString(),
        num: '6', // Number of results
        safe: 'active',
        tbs: 'iar:t' // Tall images (portrait orientation)
      });

      const response = await fetch(`https://serpapi.com/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.images_results || data.images_results.length === 0) {
        console.log('No image results found, using fallback...');
        return mockImageSearch(query, Math.ceil(start / 6));
      }

      return data.images_results.slice(0, 6).map((image: any) => ({
        link: image.original || image.link,
        title: image.title || `${query} image`,
        thumbnailLink: image.thumbnail || image.link,
      }));
    } catch (error) {
      console.error('SerpApi search error:', error);
      console.log('Falling back to demo images...');
      return mockImageSearch(query, Math.ceil(start / 6));
    }
  };

  // Fallback mock function for demo purposes (when no API key provided)
  const mockImageSearch = async (query: string, page: number): Promise<ImageResult[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create themed categories based on query
    let category = 'nature';
    if (query.toLowerCase().includes('game')) category = 'technology';
    else if (query.toLowerCase().includes('book')) category = 'abstract';
    else if (query.toLowerCase().includes('movie') || query.toLowerCase().includes('film')) category = 'city';
    
    return Array.from({ length: 6 }, (_, index) => {
      const imageId = (page - 1) * 6 + index + 100; // Offset to avoid duplicates
      return {
        link: `https://picsum.photos/400/600?random=${imageId}`,
        title: `${query} - Demo Image ${index + 1}`,
        thumbnailLink: `https://picsum.photos/200/300?random=${imageId}`,
      };
    });
  };

  const handleSearch = () => {
    setStartIndex(1);
    setHasMore(true);
    searchImages(searchQuery, 1, false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      searchImages(searchQuery, startIndex + 6, true);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    Alert.alert(
      'Use This Image?',
      'Set this as your cover image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Image',
          onPress: () => {
            console.log('🔍 Selected image from search:', imageUrl);
            onImageSelected(imageUrl);
            onClose();
          },
        },
      ]
    );
  };

  const handleClose = () => {
    setImages([]);
    setSearchQuery(initialQuery);
    setStartIndex(1);
    setHasMore(true);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Search Images</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={`Search for ${itemType} images...`}
            placeholderTextColor="#999"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
          {images.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Enter a search term and tap "Search" to find images
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Using demo images. Add SerpApi key for real Google Images results.
              </Text>
            </View>
          )}

          <View style={styles.imageGrid}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={`${image.link}-${index}`}
                style={styles.imageItem}
                onPress={() => handleImageSelect(image.link)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: image.thumbnailLink }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Text style={styles.tapText}>Tap to use</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>
                {SERPAPI_KEY === 'ec01683685b82e0e8f0846e42bf32786b91f8f5fed82677af6a20d7873e34a99' 
                  ? 'Loading demo images...' 
                  : 'Searching Google Images...'}
              </Text>
            </View>
          )}

          {images.length > 0 && hasMore && !loading && (
            <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
              <Text style={styles.loadMoreText}>Load More Images</Text>
            </TouchableOpacity>
          )}

          {images.length > 0 && !hasMore && (
            <Text style={styles.endText}>No more results</Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#ccc',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  imageItem: {
    width: '31%',
    aspectRatio: 0.75, // Portrait aspect ratio
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
    marginBottom: 12,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  tapText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  loadMoreButton: {
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  endText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
    color: '#999',
  },
});