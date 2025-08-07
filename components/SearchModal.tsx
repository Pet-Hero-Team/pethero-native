import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import MedicalTab from './MedicalTab';
import ReportRescueTab from './ReportRescueTab';

export default function SearchModal({ isVisible, onClose }) {
    // 활성 탭 상태를 관리합니다. 초기값은 '제보/구조'입니다.
    const [activeTab, setActiveTab] = useState('제보/구조');

    // 검색 탭 목록입니다.
    const tabs = ['제보/구조', '의료'];

    // 추천 검색어 데이터입니다.
    const popularSearches = [
        '유기견',
        '길고양이',
        '동물병원',
        '입양',
        '구조요청',
        '응급실',
        '예방접종',
        '미용',
    ];

    // 추천 지역 데이터입니다. 이미지 대신 배경색을 사용합니다.
    const recommendedRegions = [
        { name: '서울', color: '#e0f2fe' },
        { name: '부천', color: '#ecfeff' },
        { name: '인천', color: '#eef2ff' },
        { name: '수원', color: '#f0f9ff' },
        { name: '광주', color: '#f0fdf4' },
    ];

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-white">
                {/* 모달 닫기 버튼 */}
                <View className="flex-row justify-end mt-4 px-6">
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#51555c" />
                    </TouchableOpacity>
                </View>
                {/* 탭 네비게이션 */}
                <View className="flex-row items-center justify-between px-6 pt-4 bg-white border-b border-neutral-200">
                    <View className="flex-row flex-1">
                        {tabs.map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`flex-1 items-center relative py-2 ${activeTab === tab ? 'font-bold' : ''}`}
                            >
                                <Text className={`text-base ${activeTab === tab ? 'text-black font-bold' : 'text-neutral-500'}`}>
                                    {tab}
                                </Text>
                                {/* 활성 탭 밑줄 */}
                                {activeTab === tab && (
                                    <View className="absolute bottom-[-2] h-0.5 w-full bg-black" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 활성 탭에 따라 다른 컴포넌트 렌더링 */}
                {activeTab === '제보/구조' ? (
                    <ReportRescueTab
                        popularSearches={popularSearches}
                        recommendedRegions={recommendedRegions}
                    />
                ) : (
                    <MedicalTab />
                )}
            </SafeAreaView>
        </Modal>
    );
}
