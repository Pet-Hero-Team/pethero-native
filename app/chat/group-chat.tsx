import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";

function formatKoreanDate(date) {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function BirthdayModalPicker({ value, onChange }) {
    const [show, setShow] = useState(false);
    const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

    const open = () => {
        setTempDate(value ? new Date(value) : new Date());
        setShow(true);
    };

    const close = () => setShow(false);

    const handleDateChange = (_, selectedDate) => {
        if (selectedDate) setTempDate(selectedDate);
    };

    const handleApply = () => {
        onChange(tempDate);
        setShow(false);
    };

    return (
        <View>
            <TouchableOpacity
                className="w-full py-4 px-4 bg-neutral-100 rounded-xl mb-1"
                onPress={open}
            >
                <Text className={`text-lg text-neutral-900 ${value ? "" : "text-neutral-400"}`}>
                    {value ? formatKoreanDate(value) : "날짜를 선택해주세요"}
                </Text>
            </TouchableOpacity>
            <Modal
                visible={show}
                transparent
                animationType="slide"
                onRequestClose={close}
            >
                <View className="flex-1 justify-end bg-black/30">
                    <View className="bg-white p-4 rounded-t-2xl">
                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            locale="ko-KR"
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                        />
                        <View className="flex-row justify-between mt-4">
                            <TouchableOpacity
                                className="flex-1 py-3 rounded-xl bg-neutral-200 items-center mr-2"
                                onPress={close}
                            >
                                <Text className="text-base text-neutral-700">취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 py-3 rounded-xl bg-yellow-300 items-center ml-2"
                                onPress={handleApply}
                            >
                                <Text className="text-base font-bold text-neutral-900">적용</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
