import React from 'react';
import { View } from 'react-native';

const DotPaginator = ({ total = 5, active = 0 }) => (
    <View className="flex-row justify-center items-center">
        {Array.from({ length: total }).map((_, idx) => (
            <View
                key={idx}
                className={`mx-1 rounded-full ${idx === active ? 'bg-orange-500 w-2 h-2' : 'bg-gray-300 w-2 h-2'}`}
                style={{ opacity: idx === active ? 1 : 0.5 }}
            />
        ))}
    </View>
);

export default DotPaginator;
