import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '../../app/sign-in';
import { ThemeProvider } from '../contexts/ThemeContext';
import { RoleProvider } from '../contexts/RoleContext';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../utils/api', () => ({
    publicApi: {
        post: jest.fn(() => Promise.resolve({ data: { token: 'fake-token', role: 'user', id: 123 } })),
    },
    setAuthToken: jest.fn(),
}));

jest.mock('expo-router', () => ({
    __esModule: true,
    useFocusEffect: (callback: () => any) => {
        callback();
        return;
    },
    useRouter: () => ({
        push: jest.fn(),
    }),
    Link: ({ children }: any) => children,
}));

jest.mock('../db/init', () => ({
    init: jest.fn(),
}));

describe('SignInScreen', () => {
    const renderWithProviders = () =>
        render(
            <ThemeProvider>
                <RoleProvider>
                    <SignInScreen />
                </RoleProvider>
            </ThemeProvider>
        );

    it('shows error for invalid email', async () => {
        const { getByTestId, getByPlaceholderText } = renderWithProviders();

        fireEvent.changeText(getByPlaceholderText('Enter your email'), 'bademail');
        fireEvent.changeText(getByPlaceholderText('Enter your password'), '123456');
        fireEvent.press(getByTestId('sign-in-button'));

        await waitFor(() => {
            expect(getByTestId('error-message')).toHaveTextContent('Please enter a valid email address');
        });
    });

    it('shows error for short password', async () => {
        const { getByTestId, getByPlaceholderText } = renderWithProviders();

        fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Enter your password'), '123');
        fireEvent.press(getByTestId('sign-in-button'));

        await waitFor(() => {
            expect(getByTestId('error-message')).toHaveTextContent('Password must be at least 6 characters long');
        });
    });

    it('calls sign in API on valid input', async () => {
        const { getByPlaceholderText, queryByText, getByTestId } = renderWithProviders();
        const { post } = require('../utils/api').publicApi;

        fireEvent.changeText(getByPlaceholderText('Enter your email'), 'test@gmail.com');
        fireEvent.changeText(getByPlaceholderText('Enter your password'), 'Test1234');
        fireEvent.press(getByTestId('sign-in-button'));

        await waitFor(() => {
            expect(post).toHaveBeenCalledWith('/users/signIn', {
                email: 'test@gmail.com',
                password: 'Test1234',
            });
            expect(queryByText('Please enter a valid email address')).toBeNull();
            expect(queryByText('Password must be at least 6 characters long')).toBeNull();
        });
    });
});