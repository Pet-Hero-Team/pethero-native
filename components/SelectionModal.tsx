import ModalContainer from '@/components/ModalContainer';
import { FontAwesome6 } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface Option {
    value: string;
    label: string;
}

interface SelectionModalProps {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    options: Option[];
    selectedOption: string | null;
    onSelect: (value: string | null) => void;
}

export default function SelectionModal({ isVisible, onClose, title, options, selectedOption, onSelect }: SelectionModalProps) {
    return (
        <ModalContainer isVisible={isVisible} onClose={onClose}>
            <ScrollView className='px-8 pt-2 pb-10'>
                <Text className="text-xl font-bold text-neutral-800">{title}</Text>
                {options.map((option) => (
                    <Pressable
                        key={option.value}
                        onPress={() => onSelect(option.value)}
                        className={`flex-row items-center justify-between pt-10`}
                    >
                        <Text className={`text-lg font-semibold ${selectedOption === option.value ? 'text-orange-500' : 'text-neutral-800'}`}>{option.label}</Text>
                        <View>
                            <FontAwesome6 name={'check'}
                                size={20}
                                color={selectedOption === option.value ? '#f97316' : '#c8c8c8'} />
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </ModalContainer>
    );
}

