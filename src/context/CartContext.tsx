import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Product } from '../types/database';

export interface CartItem {
    product: Product;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
}

interface CartState {
    items: CartItem[];
    isOpen: boolean;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: { product: Product; quantity?: number; color?: string; size?: string } }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' }
    | { type: 'OPEN_CART' }
    | { type: 'CLOSE_CART' };

const initialState: CartState = {
    items: [],
    isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                (item) => item.product.id === action.payload.product.id
            );
            if (existingIndex >= 0) {
                const newItems = [...state.items];
                const currentQty = newItems[existingIndex].quantity;
                const addedQty = action.payload.quantity || 1;
                const totalQty = currentQty + addedQty;

                // Cap at stock
                const cappedQty = Math.min(totalQty, action.payload.product.stock);

                newItems[existingIndex] = {
                    ...newItems[existingIndex],
                    quantity: cappedQty,
                };
                return { ...state, items: newItems, isOpen: true };
            }
            // New item, also cap at stock
            const initialQty = Math.min(action.payload.quantity || 1, action.payload.product.stock);
            return {
                ...state,
                items: [
                    ...state.items,
                    {
                        product: action.payload.product,
                        quantity: initialQty,
                        selectedColor: action.payload.color,
                        selectedSize: action.payload.size,
                    },
                ],
                isOpen: true,
            };
        }
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter((item) => item.product.id !== action.payload) };
        case 'UPDATE_QUANTITY': {
            if (action.payload.quantity <= 0) {
                return { ...state, items: state.items.filter((item) => item.product.id !== action.payload.productId) };
            }
            return {
                ...state,
                items: state.items.map((item) =>
                    item.product.id === action.payload.productId
                        ? { ...item, quantity: Math.min(action.payload.quantity, item.product.stock) }
                        : item
                ),
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        case 'TOGGLE_CART':
            return { ...state, isOpen: !state.isOpen };
        case 'OPEN_CART':
            return { ...state, isOpen: true };
        case 'CLOSE_CART':
            return { ...state, isOpen: false };
        default:
            return state;
    }
}

interface CartContextType {
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
