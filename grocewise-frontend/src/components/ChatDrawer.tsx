import React, { useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    GestureResponderEvent,
    Dimensions,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import ChatAssistant from './ChatAssistant';
import { colors } from '../styles/commonStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.85;

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
    const translateX = useSharedValue(DRAWER_WIDTH);
    const overlayOpacity = useSharedValue(0);

    useEffect(() => {
        if (isOpen) {
            translateX.value = withTiming(0, { duration: 300 });
            overlayOpacity.value = withTiming(1, { duration: 300 });
        } else {
            translateX.value = withTiming(DRAWER_WIDTH, { duration: 300 });
            overlayOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [isOpen]);

    const handleOverlayPress = () => {
        onClose();
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationX < 0) {
                translateX.value = Math.max(0, event.translationX);
            }
        })
        .onEnd((event) => {
            if (event.translationX > DRAWER_WIDTH * 0.3 || event.velocityX > 500) {
                translateX.value = withTiming(DRAWER_WIDTH, { duration: 200 });
                runOnJS(onClose)();
            } else {
                translateX.value = withTiming(0, { duration: 200 });
            }
        });

    const animatedDrawerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const animatedOverlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    return (
        <>
            <Animated.View
                style={[styles.overlay, animatedOverlayStyle]}
                pointerEvents={isOpen ? 'auto' : 'none'}
            >
                <TouchableOpacity
                    style={styles.overlayTouchable}
                    onPress={handleOverlayPress}
                    activeOpacity={1}
                />
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.drawer, animatedDrawerStyle]}>
                    <ChatAssistant onClose={onClose} />
                </Animated.View>
            </GestureDetector>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
        zIndex: 1000,
    },
    overlayTouchable: {
        flex: 1,
    },
    drawer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: colors.background,
        zIndex: 1001,
        shadowColor: '#000',
        shadowOffset: {
            width: -2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
});