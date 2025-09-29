import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Game, GameStatus } from '../data/hobby';
import { GameList } from './game-list';

interface GameAccordionProps {
  games: Game[];
  onDeleteGame: (id: string) => Promise<void>;
  onUpdateGame: (id: string, updates: Partial<Game>) => Promise<void>;
  onEditGame: (game: Game) => void;
  defaultExpanded?: string; // Default expanded section
}

interface AccordionSectionProps {
  title: string;
  games: Game[];
  isExpanded: boolean;
  onToggle: () => void;
  onDeleteGame: (id: string) => Promise<void>;
  onUpdateGame: (id: string, updates: Partial<Game>) => Promise<void>;
  onEditGame: (game: Game) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  games,
  isExpanded,
  onToggle,
  onDeleteGame,
  onUpdateGame,
  onEditGame,
  emptyTitle,
  emptySubtitle,
}) => {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.sectionMeta}>
          <Text style={styles.sectionCount}>{games.length}</Text>
          <Text style={[styles.arrow, isExpanded && styles.arrowExpanded]}>
            ▶
          </Text>
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.sectionContent}>
          <GameList
            games={games}
            onDeleteGame={onDeleteGame}
            onUpdateGame={onUpdateGame}
            onEditGame={onEditGame}
            emptyTitle={emptyTitle}
            emptySubtitle={emptySubtitle}
          />
        </View>
      )}
    </View>
  );
};

export const GameAccordion: React.FC<GameAccordionProps> = ({
  games,
  onDeleteGame,
  onUpdateGame,
  onEditGame,
  defaultExpanded = 'playing',
}) => {
  const [expandedSection, setExpandedSection] = useState<string>(defaultExpanded);

  // Filter games by status
  const playingGames = games.filter(game => game.status === GameStatus.PLAYING);
  const wishlistGames = games.filter(game => game.status === GameStatus.WANT_TO_PLAY);
  const completedGames = games.filter(game => game.status === GameStatus.COMPLETED);
  const droppedGames = games.filter(game => game.status === GameStatus.DROPPED);
  const allGames = games;

  const toggleSection = (sectionKey: string) => {
    setExpandedSection(expandedSection === sectionKey ? '' : sectionKey);
  };

  return (
    <View style={styles.container}>
      <AccordionSection
        title="Currently Playing"
        games={playingGames}
        isExpanded={expandedSection === 'playing'}
        onToggle={() => toggleSection('playing')}
        onDeleteGame={onDeleteGame}
        onUpdateGame={onUpdateGame}
        onEditGame={onEditGame}
        emptyTitle="No games currently playing"
        emptySubtitle="Add games you're actively playing!"
      />
      
      <AccordionSection
        title="Wishlist"
        games={wishlistGames}
        isExpanded={expandedSection === 'wishlist'}
        onToggle={() => toggleSection('wishlist')}
        onDeleteGame={onDeleteGame}
        onUpdateGame={onUpdateGame}
        onEditGame={onEditGame}
        emptyTitle="No games in your wishlist"
        emptySubtitle="Add games you want to play later!"
      />
      
      <AccordionSection
        title="Completed"
        games={completedGames}
        isExpanded={expandedSection === 'completed'}
        onToggle={() => toggleSection('completed')}
        onDeleteGame={onDeleteGame}
        onUpdateGame={onUpdateGame}
        onEditGame={onEditGame}
        emptyTitle="No completed games yet"
        emptySubtitle="Mark games as completed to see them here!"
      />
      
      <AccordionSection
        title="All Games"
        games={allGames}
        isExpanded={expandedSection === 'all'}
        onToggle={() => toggleSection('all')}
        onDeleteGame={onDeleteGame}
        onUpdateGame={onUpdateGame}
        onEditGame={onEditGame}
        emptyTitle="No games tracked yet"
        emptySubtitle="Start by adding your first game!"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
    transform: [{ rotate: '0deg' }],
  },
  arrowExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  sectionContent: {
    backgroundColor: '#f9f9f9',
    paddingTop: 8,
    paddingBottom: 8,
  },
});