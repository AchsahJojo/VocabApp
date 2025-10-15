import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

interface VocabList {
  listID: number;
  userID: number;
  listName: string;
}

interface RouteParams {
  userID: number;
}

interface VocabListPageProps {
  route: {
    params: RouteParams;
  };
}

interface ItemProps {
  item: VocabList;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
}

const VocabListPage = ({ route }: VocabListPageProps) => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [vocabLists, setVocabLists] = useState<VocabList[]>([]);
  const { userID } = route.params;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const db = useSQLiteContext();

  useEffect(() => {
    let isMounted = true;

    if (db) {
      const loadVocabLists = async () => {
        try {
          const results = await db.getAllAsync<VocabList>(
            "SELECT * FROM vocabLists WHERE userID = ?", 
            [userID]
          );
          
          if (isMounted) {
            setVocabLists(results);
          }
        } catch (error) {
          console.error("Error loading vocab lists:", error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      loadVocabLists();
    }

    return () => { 
      isMounted = false; 
    };
  }, [db, userID]);

  const Item = ({ item, onPress, backgroundColor, textColor }: ItemProps) => (
    <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
      <Text style={[styles.listName, { color: textColor }]}>{item.listName}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: VocabList }) => {
    const backgroundColor = item.listID === selectedId ? "#aed6f1" : "#5dade2";
    const color = item.listID === selectedId ? "black" : "white";

    return (
      <Item
        item={item}
        onPress={() => {
          setSelectedId(item.listID);
          (navigation as any).navigate("WordListPage", { userID, listID: item.listID });
        }}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => (navigation as any).navigate("LandingPage", { userID })}
        >
          <Text style={styles.backButtonText}>&#8249;- Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Your Vocab Lists</Text>
        </View>
        <View style={styles.rightContent} />
      </View>

      <SafeAreaView style={styles.container}>
        {loading ? (
          <Text>Loading Vocab Lists...</Text>
        ) : vocabLists.length === 0 ? (
          <Text style={styles.noListsText}>No Created Vocab Lists Found</Text>
        ) : (
          <FlatList
            data={vocabLists}
            renderItem={renderItem}
            keyExtractor={(item) => item.listID.toString()}
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
  noListsText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
  item: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 5,
  },
  listName: {
    fontSize: 25,
    fontWeight: "bold",
  },
});

export default VocabListPage;