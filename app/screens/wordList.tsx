import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { useNavigation } from "@react-navigation/native";

interface VocabList {
  listID: number;
  userID: number;
  listName: string;
}

interface WordInList {
  wordID: number;
  listID: number;
  userID: number;
  word: string;
  definition: string;
}

interface RouteParams {
  userID: number;
  listID: number;
}

interface WordListPageProps {
  route: {
    params: RouteParams;
  };
}

const WordListPage = ({ route }: WordListPageProps) => {
  const [loading, setLoading] = useState(true);
  const [listName, setListName] = useState<string | null>(null);
  const [wordList, setWordList] = useState<WordInList[]>([]);
  const navigation = useNavigation();
  const { userID, listID } = route.params;
  const db = useSQLiteContext();

  useEffect(() => {
    if (db && userID && listID) {
      loadWordList();
    }
  }, [db, userID, listID]);

  const loadWordList = async () => {
    try {
      const existingList = await db.getFirstAsync<VocabList>(
        "SELECT * FROM vocabLists WHERE userID = ? AND listID = ?", 
        [userID, listID]
      );
      
      setListName(existingList?.listName || null);

      const vocabWords = await db.getAllAsync<WordInList>(
        "SELECT * FROM wordInList WHERE userID = ? AND listID = ?", 
        [userID, listID]
      );
      
      setWordList(vocabWords);
    } catch (error) {
      console.error("Error loading vocab words:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => (navigation as any).navigate("VocabListPage", { userID })}
        >
          <Text style={styles.backButtonText}>&#8249;- Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{listName || "Vocab List"}</Text>
        </View>
        <View style={styles.rightContent} />
      </View>

      <SafeAreaView style={styles.container}>
        {loading ? (
          <Text>Loading words...</Text>
        ) : wordList.length === 0 ? (
          <Text style={styles.noWordsText}>No words added yet</Text>
        ) : (
          <FlatList
            data={wordList}
            renderItem={({ item }: { item: WordInList }) => (
              <View style={styles.wordItem}>
                <Text style={styles.word}>{item.word}</Text>
                <Text style={styles.definition}>{item.definition}</Text>
              </View>
            )}
            keyExtractor={(item) => item.wordID.toString()}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    backgroundColor: "white",
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "blue",
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightContent: {
    width: 50,
    alignItems: 'flex-end',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noWordsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 20,
  },
  wordItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#e8e8e8",
    borderRadius: 5,
  },
  word: {
    fontSize: 18,
    fontWeight: "bold",
  },
  definition: {
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 4,
  },
});

export default WordListPage;