'use client';

import { User } from '@prisma/client';
import { createContext, FC, ReactNode, useContext } from 'react';

type UserContextType = {
	user: User;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

type UserProviderProps = {
	user: User;
	children: ReactNode;
};

export const UserProvider: FC<UserProviderProps> = ({ user, children }) => {
	return (
		<UserContext.Provider value={{ user }}>
			{children}
		</UserContext.Provider>
	);
};

// useUser hook
export const useUser = (): User => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context.user;
};
