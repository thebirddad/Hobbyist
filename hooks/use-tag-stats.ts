import { useHobbyStorage } from '@/hooks/use-hobby-storage';
import { useMemo } from 'react';

export interface TagStat {
  tag: string;
  count: number;
}

export const useTagStats = () => {
  const { hobbies } = useHobbyStorage();

  const tagStats = useMemo(() => {
    const tagCounts = new Map<string, number>();
    
    // Define excluded tags (hobby enums and platform types)
    const excludedTags = new Set([
      // Hobby type enums
      'Game', 'Games', 'Gaming',
      'Book', 'Books', 'Reading',
      'TV', 'Film', 'Movie', 'Movies', 'TV/Film',
      'Custom',
      // Platform types
      'PC', 'PlayStation', 'PlayStation 5', 'PS5', 'PS4', 'PS3',
      'Xbox', 'Xbox One', 'Xbox Series X', 'Xbox Series S',
      'Nintendo Switch', 'Switch', 'Nintendo',
      'Mobile', 'iOS', 'Android',
      'Steam', 'Epic Games', 'Origin', 'Uplay',
      // Other common platform variations
      'Playstation', 'playstation', 'PLAYSTATION'
    ]);

    hobbies.forEach(hobby => {
      if (hobby.items && hobby.items.length > 0) {
        hobby.items.forEach((item: any) => {
          if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach((tag: string) => {
              if (tag && tag.trim()) {
                const cleanTag = tag.trim();
                // Only include tags that are not in the excluded list
                if (!excludedTags.has(cleanTag)) {
                  tagCounts.set(cleanTag, (tagCounts.get(cleanTag) || 0) + 1);
                }
              }
            });
          }
        });
      }
    });

    // Convert to array and sort by count (descending)
    const sortedTags: TagStat[] = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    return sortedTags;
  }, [hobbies]);

  const getTopTags = (limit: number = 5): TagStat[] => {
    return tagStats.slice(0, limit);
  };

  const getTotalTags = (): number => {
    return tagStats.length;
  };

  const getTotalTaggedItems = (): number => {
    return tagStats.reduce((sum, tagStat) => sum + tagStat.count, 0);
  };

  return {
    tagStats,
    getTopTags,
    getTotalTags,
    getTotalTaggedItems,
  };
};