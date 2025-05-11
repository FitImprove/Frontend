import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import CoachCard from '@/src/components/search/CoachCard';
import { Theme, useTheme } from '@/src/contexts/ThemeContext';
import getGlobalStyle from '@/src/styles/Global';
import { api } from '@/src/utils/api';
import { search, GenderN, SearchCoachDTO } from '@/src/utils/user';
import {router, useRouter} from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";

const FindCoachScreen = () => {
    const {theme} = useTheme();
    const styles = getGlobalStyle(theme);
    const style = getFindCoachStyles(theme);
    const router = useRouter();

    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [fieldModalVisible, setFieldModalVisible] = useState(false);
    const [gender, setGender] = useState<GenderN>('None');
    const [selectedField, setSelectedField] = useState('');
    const [fieldQuery, setFieldQuery] = useState('');
    const [name, setName] = useState<string>('');
    const [coaches, setCoaches] = useState<SearchCoachDTO[]>([]);

    const filteredFields: string[] = ['Fitness', 'Skying', 'Mining'];

    async function handleSearch() {
        const cs = await search(gender, name, selectedField);
        console.log("Received coaches: ", cs);
        setCoaches(cs);
    };

    function handleBook(c: SearchCoachDTO) {
        router.push({
            pathname: '/search/book-training',
            params: { id: c.id },
        });
    };
    const handleGoBack = async () => {
        console.log('Going back');
        await AsyncStorage.setItem('/trainings/suggest/invited', JSON.stringify([]));
        router.back();
    };

    return <View style={style.container}>
        <TouchableOpacity onPress = {handleGoBack} style={style.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.accent} />
        </TouchableOpacity>

        <View style={style.searchBox}>
            <Text style={style.title}>Find Coach</Text>

            <View style={style.filters}>
            <TouchableOpacity style={style.filterButton} onPress={() => setGenderModalVisible(true)}>
                <Text style={style.filterText}>Gender</Text>
            </TouchableOpacity>
            <TouchableOpacity style={style.filterButton} onPress={() => setFieldModalVisible(true)}>
                <Text style={style.filterText}>Field</Text>
            </TouchableOpacity>
            </View>

            <Text style={style.label}>Name</Text>
            <TextInput
                style={style.input}
                placeholder="Search by name"
                placeholderTextColor={theme.inputText}
                value={name}
                onChangeText={setName}
            />

            <TouchableOpacity style={style.searchButton} onPress={handleSearch}>
                <Text style={style.searchButtonText}>Search</Text>
            </TouchableOpacity>
        </View>

        <ScrollView>
            {coaches.map((c: SearchCoachDTO, idx: number) => {
                return <CoachCard
                    key={idx}
                    coach={c}
                    onBook={handleBook} />
            })}
        </ScrollView>

        <Modal
            visible={genderModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setGenderModalVisible(false)}
        >
            <View style={style.modalContainer}>
                <View style={style.modalContent}>
                    <Text style={style.modalTitle}>Select Gender</Text>
                    {['FEMALE', 'MALE', 'None'].map((_gender: string) => (
                    <TouchableOpacity
                        key={_gender}
                        style={style.modalButton}
                        onPress={() => {
                            setGender(_gender as GenderN);
                            setGenderModalVisible(false);
                        }}
                    >
                        <Text style={style.modalButtonText}>{_gender}</Text>
                    </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>

        <Modal
            visible={fieldModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setFieldModalVisible(false)}
        >
        <View style={style.modalContainer}>
            <View style={style.modalContent}>
            <Text style={style.modalTitle}>Select Field</Text>

            <TextInput
                style={style.input}
                placeholder="Search field"
                placeholderTextColor={theme.inputText}
                value={fieldQuery}
                onChangeText={setFieldQuery}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={() => {
                    setSelectedField(fieldQuery);
                    setFieldModalVisible(false);
                }}
            >
                <Text style={style.modalButtonText}>Confirm</Text>
            </TouchableOpacity>
            <FlatList
                data={filteredFields.filter(field =>
                    field.toLowerCase().startsWith(fieldQuery.toLowerCase())
                )}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                <TouchableOpacity
                    style={style.modalButton}
                    onPress={() => setFieldQuery(item)}
                >
                    <Text style={style.modalButtonText}>{item}</Text>
                </TouchableOpacity>
                )}
            />
            </View>
        </View>
        </Modal>
    </View>
};

export default FindCoachScreen;

const getFindCoachStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 40,
    },
    backButton: {
        padding: 10,
        marginLeft: 10,
    },
        searchBox: {
        backgroundColor: theme.inputContainer,
        margin: 10,
        padding: 15,
        borderRadius: 15,
    },
    title: {
        color: theme.text,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    filters: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 10,
    },
    filterButton: {
        backgroundColor: theme.buttonBackground,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    filterText: {
        color: theme.buttonText,
    },
    label: {
        color: theme.text,
        marginBottom: 5,
    },
    input: {
        backgroundColor: theme.inputBackground,
        color: theme.inputText,
        padding: 10,
        borderRadius: 8,
        borderColor: theme.inputBorder,
        borderWidth: 1,
        marginBottom: 10,
    },
    searchButton: {
        backgroundColor: theme.buttonBackground,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    searchButtonText: {
        color: theme.buttonText,
        fontWeight: 'bold',
    }, modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    }, modalContent: {
        backgroundColor: theme.inputContainer,
        padding: 20,
        borderRadius: 15,
        width: '80%',
        maxHeight: '70%',
    }, modalTitle: {
        color: theme.text,
        fontSize: 20,
        marginBottom: 10,
        textAlign: 'center',
    }, modalButton: {
        padding: 10,
        borderBottomColor: theme.borderColor,
        borderBottomWidth: 1,
    }, modalButtonText: {
        color: theme.text,
        textAlign: 'center',
    },
});